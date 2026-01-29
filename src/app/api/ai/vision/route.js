import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';
import PointHistory from '@/models/PointHistory';
import History from '@/models/History';
import ToolConfig from '@/models/ToolConfig'; // Tambahkan ini untuk config dinamis

// --- CONFIG DEFAULT (Fallback jika DB error) ---
const TIMEOUT_SEC = 60; 

// Helper: Ubah File ke Base64
const fileToBase64 = async (file) => {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
};

// Helper: Scrape Teks
const scrapeLandingPage = async (url) => {
  if (!url) return "";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_SEC * 1000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Compatible; JituBot/1.0)' }
    });
    
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Gagal akses URL: ${res.status}`);
    const html = await res.text();
    
    return html
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 15000); // Limit karakter
  } catch (err) {
    return `Gagal ambil isi web (${url}): ${err.message}. Analisa berdasarkan URL saja.`;
  }
};

export async function POST(req) {
  try {
    // 1. CEK OTENTIKASI
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // 2. PARSE DATA & TENTUKAN TIPE TOOL
    const formData = await req.formData();
    const file = formData.get('file');
    const lpLink = formData.get('lpLink');
    const requestType = formData.get('type'); // 'audit-iklan-lp' ATAU 'analisis-iklan-visual'

    if (!file) return NextResponse.json({ message: 'File gambar wajib diupload.' }, { status: 400 });

    // Mapping requestType ke Slug di Database ToolConfig
    // Jika 'analisis-iklan-visual', kita pakai config milik 'analisis-iklan'
    const toolSlug = requestType === 'analisis-iklan-visual' ? 'analisis-iklan' : 'audit-iklan-lp';
    
    const toolConfig = await ToolConfig.findOne({ slug: toolSlug });
    
    // Validasi Tool Config
    if (!toolConfig) return NextResponse.json({ message: 'Tool tidak ditemukan di database.' }, { status: 404 });
    if (!toolConfig.isActive) return NextResponse.json({ message: 'Tool sedang maintenance.' }, { status: 503 });
    
    // Cek Saldo User vs Harga Tool
    if (user.credits < toolConfig.creditCost) {
      return NextResponse.json({ message: 'Saldo poin tidak cukup.' }, { status: 402 });
    }

    // 3. PROSES DATA (Convert Image & Scrape)
    let imageBase64 = await fileToBase64(file);
    let lpContent = "";
    
    // Hanya scrape jika tool-nya Audit LP
    if (requestType === 'audit-iklan-lp') {
        if(!lpLink) return NextResponse.json({ message: 'Link Landing Page wajib diisi.' }, { status: 400 });
        lpContent = await scrapeLandingPage(lpLink);
    }

    // 4. SIAPKAN PROMPT SUPER POWERFULL
    let systemPrompt = "";
    let userContent = [];

    if (requestType === 'audit-iklan-lp') {
        // --- MODE 1: AUDIT IKLAN VS LP (Message Match) ---
        systemPrompt = `
            BERTINDAKLAH SEBAGAI: "World-Class CRO (Conversion Rate Optimization) Expert".
            TUGAS: Lakukan audit forensik terhadap keselarasan (Message Match) antara GAMBAR IKLAN dan TEKS LANDING PAGE.

            FOKUS AUDIT:
            1. **Visual Continuity:** Apakah desain/warna iklan nyambung dengan LP? Atau user merasa 'salah kamar'?
            2. **Headline Sync:** Apakah janji di Iklan langsung dijawab di Headline LP?
            3. **Offer Consistency:** Apakah diskon/bonus di iklan benar-benar ada di LP?

            FORMAT OUTPUT (MARKDOWN):
            # 🕵️ Laporan Message Match Expert

            > **SKOR KESELARASAN: [0-100]** • **VERDICT: [SEAMLESS / DISCONNECT / SPAMMY]**

            ## 🩸 Diagnosa "Leaky Bucket" (Kebocoran Trafik)
            *Saya menemukan [Jumlah] ketidakcocokan fatal yang membuat user bounce (keluar):*
            1. **[Poin 1]:** [Jelaskan masalahnya dengan pedas]
            2. **[Poin 2]:** [Jelaskan masalahnya]

            ## 🧠 Psikologi User
            *Saat user klik iklan ini, mereka mengharapkan X, tapi di LP mereka menemukan Y. Ini menyebabkan "Cognitive Dissonance".*

            ## 🛠️ Rekomendasi Perbaikan (Actionable)
            | Elemen | Masalah | Solusi Konkret |
            | :--- | :--- | :--- |
            | **Visual** | [Analisa] | [Saran] |
            | **Copywriting** | [Analisa] | [Saran] |
            | **Offer** | [Analisa] | [Saran] |
        `;
        
        userContent = [
            { type: "text", text: `Ini konten teks Landing Page: ${lpContent}` },
            { type: "image_url", image_url: { url: imageBase64 } }
        ];

    } else {
        // --- MODE 2: ANALISA SCREENSHOT DASHBOARD (Media Buyer) ---
        systemPrompt = `
            BERTINDAKLAH SEBAGAI: "Senior Media Buyer & Growth Hacker" yang mengelola budget $1M/bulan.
            TUGAS: Baca screenshot dashboard iklan (Meta/TikTok/Google) yang diupload user.
            
            INSTRUKSI KHUSUS:
            1. Ekstrak angka penting (CTR, CPC, CPM, ROAS, Spend) dari gambar.
            2. Lakukan "Root Cause Analysis". Jangan cuma baca angka, tapi artikan maknanya.
            3. Berikan solusi teknis.

            FORMAT OUTPUT (MARKDOWN):
            # 🩺 Diagnosis Dashboard Iklan

            ## 📊 Data Terbaca
            *(Jika angka buram, saya estimasikan berdasarkan konteks)*
            - **CTR:** [Angka]% | **CPC:** [Angka] | **ROAS:** [Angka]x

            ---

            ## 🧠 Deep Diagnostic (Bedah Masalah)
            ### 1. Kesehatan Kreatif (CTR)
            [Analisa: Apakah iklan ini "Stop Scroll" atau membosankan?]

            ### 2. Kesehatan Kompetisi (CPM & CPC)
            [Analisa: Apakah audience ini terlalu mahal? Apakah auction overlap?]

            ### 3. Kesehatan Profit (ROAS)
            [Analisa: Apakah kampanye ini layak di-scale atau harus dimatikan?]

            ---

            ## 🚀 Rekomendasi Tindakan (Next Step)
            1. **Stop/Kill:** [Campaign/Adset mana yang harus dimatikan]
            2. **Optimize:** [Apa yang harus diubah? Bid? Audience?]
            3. **Scale:** [Jika ada yang bagus, bagaimana cara scale-nya?]
        `;

        userContent = [
            { type: "text", text: "Analisa screenshot dashboard iklan ini. Berikan insight tajam." },
            { type: "image_url", image_url: { url: imageBase64 } }
        ];
    }

    // 5. CALL AI (OPENROUTER)
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://jitudigital.com", 
      },
      body: JSON.stringify({
        // Gunakan model dari DB, atau fallback ke gpt-4o (Vision)
        model: toolConfig.aiModel || "openai/gpt-4o", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        temperature: 0.5, // Sedikit lebih rendah agar analisa lebih objektif/faktual
        max_tokens: 2000
      })
    });

    const aiData = await aiResponse.json();
    
    if (!aiResponse.ok || !aiData.choices) {
      console.error("AI Provider Error:", aiData);
      throw new Error(aiData.error?.message || "Gagal mendapatkan analisa dari AI.");
    }

    const analysisResult = aiData.choices[0].message.content;

    // 6. TRANSAKSI & PENYIMPANAN
    
    // A. Kurangi Saldo
    user.credits -= toolConfig.creditCost;
    await user.save();

    // B. Catat Point History
    await PointHistory.create({
      userId: user._id,
      type: 'out',
      amount: toolConfig.creditCost,
      description: `Vision AI: ${toolConfig.name}`
    });

    // C. Simpan Hasil ke History (Sesuai Tipe Tool)
    // Supaya di Frontend bisa difilter dengan benar
    const historyToolType = requestType === 'analisis-iklan-visual' ? 'analisis-iklan' : 'audit-iklan-lp';
    const historyTitle = requestType === 'analisis-iklan-visual' ? `Audit Dashboard: ${file.name}` : `Sync Check: ${file.name}`;

    await History.create({
      userId: user._id,
      toolType: historyToolType,
      title: historyTitle,
      inputData: { 
          lpLink: lpLink || '-', 
          fileName: file.name 
      },
      resultData: { text: analysisResult }
    });

    return NextResponse.json({ 
      success: true, 
      result: analysisResult,
      remainingCredits: user.credits 
    });

  } catch (error) {
    console.error("Vision API Error:", error);
    return NextResponse.json({ message: error.message || 'Server Error' }, { status: 500 });
  }
}