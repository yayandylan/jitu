import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction'; 
import History from '@/models/History';
import ToolConfig from '@/models/ToolConfig';
import OpenAI from 'openai'; 

const TIMEOUT_SEC = 30; // Timeout scraping

// Helper: Ubah File ke Base64 Data URI
const fileToDataUri = async (file) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
};

// Helper: Scrape Teks LP (Simple Version)
const scrapeLandingPage = async (url) => {
  if (!url || !url.startsWith('http')) return ""; // Skip jika bukan URL valid
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_SEC * 1000);
    const res = await fetch(url, { 
        signal: controller.signal, 
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } 
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`Gagal akses URL (${res.status})`);
    
    const html = await res.text();
    // Bersihkan HTML tag agar hemat token
    const text = html
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 5000); // Batasi 5000 karakter
        
    return text || "Tidak ada teks yang bisa dibaca di LP.";
  } catch (err) { 
      return `Gagal membaca LP: ${err.message}. Analisis berdasarkan link saja.`; 
  }
};

export async function POST(req) {
  try {
    // 1. AUTH CHECK
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // 2. PARSE FORM DATA
    const formData = await req.formData();
    const file = formData.get('file');
    const lpLink = formData.get('lpLink'); // Bisa berupa URL (Ad Review) atau Text Context (Analisis Iklan)
    const requestType = formData.get('type'); 

    if (!file) return NextResponse.json({ message: 'File (Gambar/Video) wajib diupload.' }, { status: 400 });

    // 3. CONFIG CHECK
    // Mapping frontend type ke database slug
    let toolSlug = requestType;
    if (requestType === 'analisis-iklan-visual') toolSlug = 'analisis-iklan'; 
    else if (requestType === 'ad-review') toolSlug = 'ad-review';
    
    let toolConfig = await ToolConfig.findOne({ slug: toolSlug });
    
    // Fallback Config
    if (!toolConfig) {
        toolConfig = { 
            name: requestType === 'ad-review' ? 'Ad Review' : 'Analisis Iklan', 
            creditCost: 80, 
            aiModel: 'google/gemini-2.0-flash-exp:free' 
        };
    }

    if (user.credits < toolConfig.creditCost) return NextResponse.json({ message: 'Poin kurang. Topup dulu yuk!' }, { status: 402 });

    // 4. PREPARE DATA
    const fileDataUri = await fileToDataUri(file); 
    let systemPrompt = "";

    // ==========================================
    // SKENARIO 1: AUDIT DASHBOARD (Angka & Grafik)
    // ==========================================
    if (requestType === 'analisis-iklan-visual') {
        const userContext = lpLink || "Tidak ada info tambahan."; // Di tool ini, lpLink dipakai untuk kirim Context

        systemPrompt = `
        ROLE: Kamu adalah Senior Media Buyer & Data Analyst (Meta/TikTok/Google Ads Expert).
        
        TUGAS: Analisis screenshot dashboard iklan yang diberikan user.
        
        KONTEKS KAMPANYE DARI USER:
        "${userContext}"
        
        OUTPUT DIAGNOSA (Markdown):
        # 📊 ANALISA PERFORMA
        
        ## KONDISI: [BAGUS / SEDANG / BAHAYA]
        
        ### 1. 🔍 Temuan Utama (Metrics)
        (Baca angka di gambar: CTR, CPC, CPM, ROAS, dll. Komentari apakah mahal/murah berdasarkan standar industri dan konteks user)
        
        ### 2. ⚠️ Masalah Terdeteksi
        (Misal: CTR rendah = kreatif jelek, CPC mahal = audiens salah, dll)
        
        ### 3. 💡 Rekomendasi Tindakan
        (Scale up, Kill, atau Ganti Kreatif? Berikan saran spesifik)
        
        Gaya bahasa: Analitis, Data-driven, To the point.
        `;
    }
    
    // ==========================================
    // SKENARIO 2: AD REVIEW (Kreatif & LP)
    // ==========================================
    else {
        // Scrape LP content hanya untuk Ad Review
        let lpContent = await scrapeLandingPage(lpLink);

        systemPrompt = `
        ROLE: Kamu adalah "Jitu Funnel Doctor". Auditor Senior Digital Marketing.
        
        TUGAS:
        Analisis file kreatif iklan (Gambar/Video) dan konten Landing Page yang diberikan.
        
        INPUT DATA:
        1. **Creative:** File visual yang diupload user.
        2. **Landing Page Content:** "${lpContent}"
        3. **Link LP:** ${lpLink}
        
        OUTPUT DIAGNOSA (Markdown):
        
        # 🩺 LAPORAN DIAGNOSA
        
        ## SKOR KESEHATAN: [0-100]
        **Status:** [WINNING / POTENTIAL / BONCOS]
        
        ### 1. 📢 Review Kreatif Iklan
        * **Visual Hook:** (Komentari 3 detik pertama atau visual utama)
        * **Pesan/Copy:** (Apakah teks di gambar/video terbaca dan persuasif?)
        * **Relevansi:** (Apakah cocok untuk platform iklan?)
        
        ### 2. 🌐 Review Landing Page
        * **Message Match:** (Apakah janji di iklan SAMA dengan headline LP? Ini krusial!)
        * **Copywriting LP:** (Komentari struktur penawaran di LP berdasarkan teks yang dibaca)
        
        ### 3. ⚠️ PENYAKIT UTAMA
        (Sebutkan 1 hal fatal yang membuat iklan ini mungkin boncos)
        
        ### 4. 💊 RESEP PERBAIKAN
        1. (Saran konkret 1)
        2. (Saran konkret 2)
        3. (Saran konkret 3)
        
        Gaya bahasa: Tegas, to the point, seperti dokter spesialis.
        `;
    }

    // 6. CALL AI (OPENROUTER)
    const openai = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
            "HTTP-Referer": "https://jitudigital.com",
            "X-Title": "Jitu Digital AI",
        }
    });

    const completion = await openai.chat.completions.create({
        model: toolConfig.aiModel || "google/gemini-2.0-flash-exp:free",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: systemPrompt },
                    { 
                        type: "image_url", 
                        image_url: { 
                            url: fileDataUri 
                        } 
                    }
                ]
            }
        ]
    });

    const resultText = completion.choices[0].message.content;

    // 7. TRANSAKSI & HISTORY
    user.credits -= toolConfig.creditCost;
    await user.save();

    await Transaction.create({
      userId: user._id,
      type: 'out',
      amount: toolConfig.creditCost,
      description: `Vision AI: ${toolConfig.name}`,
      status: 'success'
    });

    await History.create({
      userId: user._id,
      toolType: requestType, // 'analisis-iklan-visual' atau 'ad-review'
      title: file.name, // Nama file sebagai judul history
      inputData: { lpLink: lpLink || '-', fileName: file.name },
      resultData: { text: resultText }
    });

    return NextResponse.json({ success: true, result: resultText, remainingCredits: user.credits });

  } catch (error) {
    console.error("Vision Error:", error);
    // Handle error file terlalu besar (biasanya limit vercel 4.5MB)
    if (error.message.includes("payload")) {
        return NextResponse.json({ message: "Ukuran file terlalu besar. Max 4MB untuk serverless." }, { status: 413 });
    }
    return NextResponse.json({ message: "Gagal memproses AI. Coba file yang lebih kecil." }, { status: 500 });
  }
}