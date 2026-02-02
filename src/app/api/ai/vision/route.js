import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction'; 
import History from '@/models/History';
import ToolConfig from '@/models/ToolConfig';
import OpenAI from 'openai'; 

export const dynamic = 'force-dynamic'; // Wajib untuk App Router

const TIMEOUT_SEC = 30; // Timeout scraping LP

// Helper: Ubah File ke Base64 Data URI
const fileToDataUri = async (file) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
};

// Helper: Scrape Teks LP (Simple Version - Hemat Token)
const scrapeLandingPage = async (url) => {
  if (!url || !url.startsWith('http')) return ""; 
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
    // Bersihkan HTML tag agar hemat token & hanya ambil teks konten
    const text = html
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 5000); // Batasi 5000 karakter agar tidak over-context
        
    return text || "Tidak ada teks yang bisa dibaca di LP.";
  } catch (err) { 
      return `(Gagal membaca isi LP: ${err.message}. Analisis akan dilakukan berdasarkan link & visual saja.)`; 
  }
};

export async function POST(req) {
  try {
    // 1. AUTH CHECK
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    } catch(e) { return NextResponse.json({ message: 'Token Invalid' }, { status: 401 }); }

    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // 2. PARSE FORM DATA
    const formData = await req.formData();
    const file = formData.get('file');
    const lpLink = formData.get('lpLink'); // Bisa URL (Ad Review) atau Context Text (Analisis Iklan)
    const requestType = formData.get('type'); 

    if (!file) return NextResponse.json({ message: 'File (Gambar/Video) wajib diupload.' }, { status: 400 });

    // 3. CONFIG CHECK (DB vs Hardcode Fallback)
    // Mapping frontend type ke database slug
    let toolSlug = requestType;
    if (requestType === 'analisis-iklan-visual') toolSlug = 'analisis-iklan'; 
    else if (requestType === 'ad-review') toolSlug = 'ad-review';
    
    let toolConfig = await ToolConfig.findOne({ slug: toolSlug });
    
    // Fallback Config jika DB belum disetting
    if (!toolConfig) {
        toolConfig = { 
            name: requestType === 'ad-review' ? 'Ad Review' : 'Analisis Iklan', 
            creditCost: 80, 
            aiModel: 'google/gemini-2.0-flash-exp:free' 
        };
    }

    // Admin Gratis, User Bayar
    if (user.role !== 'admin' && user.credits < toolConfig.creditCost) {
        return NextResponse.json({ message: 'Poin kurang. Topup dulu yuk!' }, { status: 402 });
    }

    // 4. PREPARE DATA
    const fileDataUri = await fileToDataUri(file); 
    let systemPrompt = "";

    // ==========================================
    // SKENARIO 1: AUDIT DASHBOARD (Angka & Grafik)
    // ==========================================
    if (requestType === 'analisis-iklan-visual') {
        const userContext = lpLink || "Tidak ada info tambahan."; 

        systemPrompt = `
        ROLE: Kamu adalah Senior Media Buyer & Data Analyst (Meta/TikTok/Google Ads Expert).
        
        TUGAS: Analisis screenshot dashboard iklan yang diberikan user.
        
        KONTEKS DARI USER:
        "${userContext}"
        
        OUTPUT DIAGNOSA (Markdown):
        # 📊 ANALISA PERFORMA
        
        ## STATUS: [🟢 SEHAT / 🟡 WARNING / 🔴 KRITIS]
        
        ### 1. 🔍 Temuan Utama (Metrics Reading)
        (Baca angka di gambar: CTR, CPC, CPM, ROAS, dll. Komentari apakah mahal/murah berdasarkan standar industri)
        
        ### 2. ⚠️ Masalah Terdeteksi
        (Misal: CTR rendah = kreatif jelek, CPM mahal = audiens sempit, dll)
        
        ### 3. 💡 Rekomendasi Tindakan (Action Plan)
        * **Short Term:** (Apa yang harus dilakukan hari ini? Kill/Scale?)
        * **Long Term:** (Strategi perbaikan ke depan)
        
        Gaya bahasa: Analitis, Data-driven, To the point.
        `;
    }
    
    // ==========================================
    // SKENARIO 2: AD REVIEW (Kreatif & LP)
    // ==========================================
    else {
        // Scrape LP content untuk Ad Review
        let lpContent = await scrapeLandingPage(lpLink);

        systemPrompt = `
        ROLE: Kamu adalah "Jitu Funnel Doctor". Auditor Senior Digital Marketing.
        
        TUGAS:
        Analisis file kreatif iklan (Gambar/Frame Video) dan konten Landing Page yang diberikan.
        
        INPUT DATA:
        1. **Creative:** File visual yang diupload user.
        2. **Landing Page Content:** "${lpContent}"
        3. **Link LP:** ${lpLink}
        
        OUTPUT DIAGNOSA (Markdown):
        
        # 🩺 LAPORAN DIAGNOSA IKLAN
        
        ## SKOR KESEHATAN: [0-100]
        **Status:** [WINNING / POTENTIAL / BONCOS]
        
        ### 1. 📢 Review Kreatif Iklan
        * **Visual Hook:** (Apakah visualnya 'Scroll-Stopping'? Beri nilai 1-10)
        * **Clarity:** (Apakah pesan produk tersampaikan dalam 3 detik?)
        * **Pain/Pleasure:** (Apakah menyentuh emosi audiens?)
        
        ### 2. 🌐 Review Landing Page (Sinkronisasi)
        * **Message Match:** (Apakah janji di iklan SAMA dengan headline LP? Ini krusial!)
        * **Flow & Copy:** (Apakah struktur LP meyakinkan? Baca konten LP yang dilampirkan)
        
        ### 3. ⚠️ DIAGNOSA PENYAKIT
        (Sebutkan 1 hal paling fatal yang membuat iklan ini berpotensi gagal)
        
        ### 4. 💊 RESEP PERBAIKAN
        1. (Saran konkret perbaikan visual)
        2. (Saran konkret perbaikan copy/LP)
        3. (Ide angle baru untuk ditest)
        
        Gaya bahasa: Tegas, solutif, seperti dokter spesialis bedah iklan.
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
        model: toolConfig.aiModel || "google/gemini-2.0-flash-exp:free", // Default Model
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

    const resultText = completion.choices?.[0]?.message?.content || "Gagal menganalisa. Coba lagi.";

    // 7. TRANSAKSI & HISTORY (Hanya potong jika bukan admin)
    if (user.role !== 'admin') {
        user.credits -= toolConfig.creditCost;
        await user.save();

        await Transaction.create({
            userId: user._id,
            type: 'out',
            amount: toolConfig.creditCost,
            description: `Vision AI: ${toolConfig.name}`,
            status: 'success'
        });
    }

    // Save History
    await History.create({
      userId: user._id,
      toolType: requestType, // 'analisis-iklan-visual' atau 'ad-review'
      title: file.name, 
      inputData: { lpLink: lpLink || '-', fileName: file.name },
      resultData: { text: resultText }
    });

    return NextResponse.json({ success: true, result: resultText, remainingCredits: user.credits });

  } catch (error) {
    console.error("Vision Error:", error);
    
    // Handle error payload too large (Vercel limit 4.5MB)
    if (error.message && error.message.includes("payload")) {
        return NextResponse.json({ message: "Ukuran file terlalu besar. Harap kompres file Anda (Max 4MB)." }, { status: 413 });
    }
    
    return NextResponse.json({ message: error.message || "Gagal memproses AI." }, { status: 500 });
  }
}