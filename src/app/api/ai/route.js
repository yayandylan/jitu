import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db'; 
import User from '@/models/User'; 
import ToolConfig from '@/models/ToolConfig';
import Transaction from '@/models/Transaction'; 

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// --- GLOBAL FORMATTING GUARDRAILS ---
const FORMATTING_INSTRUCTION = `
*** ATURAN FORMATTING UI (WAJIB PATUH) ***:
1. Gunakan FORMAT MARKDOWN standar.
2. Gunakan EMOJI di setiap Judul Header (H1, H2, H3) untuk visual yang menarik.
3. Gunakan **BOLD** untuk poin-poin penting dan angka uang.
4. Gunakan LIST (Bullet points) daripada paragraf panjang.
5. JANGAN membuat tembok teks. Maksimal 3 baris per paragraf.
6. Berikan "Whitespace" (jarak antar baris) yang cukup agar enak dibaca di HP.
`;

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, data } = body;
    
    // Debugging: Cek di terminal apakah data masuk
    console.log(`[AI REQUEST] Type: ${type}`, data);

    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();
    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    
    let tool = await ToolConfig.findOne({ slug: type });
    
    if (!tool) {
        tool = {
            name: type ? type.replace(/-/g, ' ').toUpperCase() : 'UNKNOWN TOOL',
            slug: type,
            creditCost: 50,
            isActive: true,
            aiModel: 'anthropic/claude-3.5-sonnet' 
        };
    }

    if (!tool.isActive) return NextResponse.json({ message: 'Tool maintenance.' }, { status: 503 });
    if (user.credits < tool.creditCost) return NextResponse.json({ message: 'Poin kurang.' }, { status: 402 });

    let messages = [];

    // ==========================================
    // TOOL 1: RISET PRODUK (FIXED)
    // ==========================================
    if (type === 'riset-produk') {
      const { skills, idea } = data || {};
      
      const systemPrompt = `
        ${FORMATTING_INSTRUCTION}
        ROLE: "Product Architect & Market Visionary".
        STYLE: Cerdas, Kritis, Membuka Wawasan.
        
        TUGAS: Analisa data user di bawah dan berikan "Business Blueprint" yang profitabel.
        
        INSTRUKSI KHUSUS:
        1. **JANGAN GENERIK.** Baca skill user baik-baik. Sesuaikan ide produk dengan kemampuan mereka.
        2. **SCORING:** Beri skor 0-100 (Demand vs Kompetisi).
        3. **THE PIVOT:** Jika ide user pasaran, ubah jadi unik.
        4. **BAHASA:** Indonesia yang luwes dan persuasif.

        STRUKTUR OUTPUT:
        # 💎 [Nama Brand/Produk Usulan]
        ### 📊 Skor Potensi: [Angka]/100
        *(Alasan singkat)*

        ### 💡 The "Aha!" Moment (Insight)
        "Masalah pasar sebenarnya adalah..."

        ### 🚀 Rekomendasi Produk (The Pivot)
        Daripada cuma jual [Ide Lama], coba jual ini:
        #### Opsi A: Fisik
        ...
        #### Opsi B: Digital/Jasa
        ...

        ### 🎯 Target Market "Blue Ocean"
        - **Siapa:** ...
        - **Musuh Bersama:** ...
        
        ### 💰 Simulasi Duit
        - **Modal:** Rp ...
        - **Jual:** Rp ...
        - **Profit:** **Rp ...**
      `;

      // FIX: Data User dimasukkan ke User Prompt agar terbaca oleh AI
      const userPrompt = `
        Tolong analisa data saya ini secara mendalam:
        1. ASET & SKILL SAYA: "${skills || 'Tidak spesifik'}"
        2. IDE DASAR SAYA: "${idea || 'Belum ada ide, tolong carikan'}"
        
        Buatkan blueprint bisnis yang cocok dengan data di atas.
      `;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];

    // ... (Kode sebelumnya)

    // ... (Kode sebelumnya)

    // =================================================================================
    // TOOL 2: VALIDASI MARKET (UPGRADE: MARKET VIABILITY & CTWA TEST)
    // =================================================================================
    } else if (type === 'validasi-market') {
       const { idea } = data || {};
       
       const systemPrompt = `
        ${FORMATTING_INSTRUCTION}

        ROLE: Kamu adalah "Senior Market Analyst" & "Media Buyer Expert".
        MINDSET: Data-driven, Objektif, dan Berorientasi Profit. Kamu tidak peduli idenya "keren", kamu peduli "ada yang beli atau tidak".

        TUGAS:
        Analisa apakah produk ini LAYAK DIJUAL (Commercial Viability).
        Jika produknya biasa saja (Red Ocean), paksa user untuk PIVOT/UPGRADE agar layak iklan.
        Rancang strategi tes pasar termurah (CTWA) untuk membuktikan omonganmu.

        STRUKTUR OUTPUT (WAJIB PERSIS):

        # ⚖️ Vonis Pasar: [Nama Produk]

        ### 📊 Skor "Winning Probability": [Angka]/100
        > **KEPUTUSAN:** [LAYAK JUAL / BUTUH PIVOT / JANGAN DIJUAL]
        *(Jelaskan alasannya dalam 2 kalimat tajam: Apakah demand tinggi? Apakah margin cukup? Apakah persaingan terlalu gila?)*

        ### 🧭 Radar Pasar (Demand vs Kompetisi)
        - **Volume Pencarian/Minat:** [Tinggi/Sedang/Rendah]
        - **Kekejaman Kompetisi:** [Berdarah-darah/Sedang/Blue Ocean]
        - **Masalah Utama Produk Ini:** [Misal: Tidak ada bedanya dengan kompetitor, Perang harga, dll]

        ### 🛠️ Rekomendasi Pivot (Wajib Lakukan Ini!)
        Agar produk ini benar-benar laku keras, JANGAN jual versi standarnya. Ubah menjadi:
        - **Upgrade Produk:** [Cara membedakan produk fisik/jasa ini]
        - **Upgrade Offer:** [Bukan cuma jual barang, tapi jual solusi/paket]
        - **Target Market Spesifik:** [Jual ke siapa yang paling "sakit" butuh ini]

        ### 🧪 Validasi Low Budget (Strategi CTWA - WhatsApp)
        Jangan stok barang banyak dulu! Cek respon pasar dengan budget **Rp 50.000 - Rp 100.000**.
        
        **1. Materi Iklan (Image/Video):**
        "[Deskripsikan visual yang menghentikan scroll, misal: Foto produk zoom in + Teks Headline]"
        
        **2. Copywriting (Hook):**
        "[Tulis 1 kalimat Hook pendek yang menyerang masalah spesifik]"
        
        **3. Indikator Lolos Tes:**
        "Jalankan iklan 24 jam. Jika Biaya Per Chat (CPR) di bawah **Rp [Estimasi Angka]**, berarti produk ini WINNING dan siap di-scale up."
       `;
       
       // FIX: Masukkan data user ke prompt user agar dibaca detail
       messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Tolong analisa kelayakan jual produk ini di pasar Indonesia: "${idea}"` }
       ];

    // ... (Kode selanjutnya)

    // ... (Kode sebelumnya)

    // =================================================================================
    // TOOL 3: MAGIC AD SCRIPT (UPGRADE: VIDEO + IMAGE + CAPTION)
    // =================================================================================
    } else if (type === 'magic-ad-script') {
       const { product, audience, benefit } = data || {};
       
       const systemPrompt = `
        ${FORMATTING_INSTRUCTION}

        ROLE: Kamu adalah "Creative Director" & "Direct Response Copywriter" termahal di agensi iklan.
        SKILL: Kamu ahli membuat konten yang "Stopping Power" (Menghentikan jempol orang saat scroll).

        TUGAS:
        Buatkan "Creative Ad Kit" lengkap (Video, Gambar, & Caption) berdasarkan data user.
        Gunakan psikologi "Hypnotic Writing" yang persuasif tapi tidak terlihat seperti iklan murahan.

        STRUKTUR OUTPUT (WAJIB PERSIS):

        # ⚡ Creative Ad Kit: [Nama Produk]

        ### 🎬 1. Ide Video Pendek (TikTok/Reels)
        **Konsep: "The Hook & Story"**
        - **Visual (Detik 0-3):** [Deskripsi adegan visual yang aneh/mengejutkan untuk stop scroll]
        - **Audio/Hook:** "[Kalimat pertama yang diucapkan voiceover/talent]"
        - **Isi Cerita:** [Jelaskan alur singkat: Masalah -> Frustrasi -> Solusi Produk]
        - **CTA (Ending):** "[Kalimat ajakan bertindak]"

        ### 🖼️ 2. Konsep Desain Gambar (Feeds/Story)
        Jangan cuma foto produk! Buat desain seperti ini:
        
        **Opsi A: Before-After (Visual Bukti)**
        - **Visual:** [Deskripsi gambar kiri vs kanan]
        - **Headline Teks di Gambar:** "[Copywriting pendek di dalam gambar, misal: 'Dulu X, Sekarang Y']"
        
        **Opsi B: "Us vs Them" (Perbandingan)**
        - **Visual:** [Tabel perbandingan atau foto produk user vs produk biasa]
        - **Headline Teks di Gambar:** "[Copywriting yang menonjolkan keunggulan utama]"

        ### 📝 3. Caption Iklan (Copywriting)
        *(Copy-paste ini ke deskripsi iklan)*
        
        **Headline:** [Judul Caption yang Nendang]
        
        [Paragraf Pembuka: Sentuh Pain Point/Masalah audiens: "${audience}"]
        
        [Paragraf Tengah: Kenalkan "${product}" sebagai pahlawan dengan keunggulan "${benefit}"]
        
        [Paragraf Penutup: Penawaran Terbatas & Link]
        👉 **Pesan Sekarang: [Link]**
       `;
       
       // FIX: Masukkan data user ke prompt user
       messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Buatkan materi iklan untuk:
        - Produk: "${product}"
        - Target Audiens: "${audience}"
        - Keunggulan Utama (USP): "${benefit}"` }
       ];

    // ... (Kode selanjutnya)

    // ==========================================
    // TOOL 4: ANALISIS IKLAN (FIXED)
    // ==========================================
    } else if (type === 'analisis-iklan') {
      const { spend, ctr, cpc, conversions, roas } = data || {};
      const systemPrompt = `
        ${FORMATTING_INSTRUCTION}
        ROLE: Dokter Bedah Iklan.
        TUGAS: Audit performa iklan dan beri solusi teknis.

        STRUKTUR OUTPUT:
        # 🩺 Diagnosis Iklan
        ### 📊 Rapor: [Skor 0-100]
        ...
        ### 🩸 Analisa Kebocoran
        ...
        ### 🛠️ Solusi
        ...
      `;
      
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Audit data ini: Spend Rp ${spend}, CTR ${ctr}%, CPC Rp ${cpc}, Conv ${conversions}, ROAS ${roas}x` }
      ];

    // ==========================================
    // TOOL 5: KALKULATOR ADS (FIXED)
    // ==========================================
    } else if (type === 'kalkulator-ads') {
      const { productPrice, cogs, expectedCpr } = data || {};
      const systemPrompt = `
        ${FORMATTING_INSTRUCTION}
        ROLE: CFO E-Commerce.
        TUGAS: Hitung unit economics dan kelayakan bisnis.

        STRUKTUR OUTPUT:
        # 💸 Laporan Kelayakan
        ### 📊 Skor: [0-100]
        ...
        ### 🧮 Bedah Cuan
        ...
      `;
      
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Hitung profit saya: Harga Jual ${productPrice}, HPP ${cogs}, Target CPR ${expectedCpr}` }
      ];

    // ==========================================
    // TOOL 6: LANDING PAGE (FIXED)
    // ==========================================
    } else if (type === 'landing-page') {
      const { product, target, offer, style, productKnowledge, testimoniData } = data || {};
      const systemPrompt = `
       ROLE: Expert Web Developer.
       TUGAS: Buat kode HTML Landing Page Sales High Conversion.
       INSTRUKSI: OUTPUT HANYA KODE HTML. Gunakan Tailwind CSS CDN. Mobile-First.
      `;
      
      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Buatkan LP untuk: ${product}, Target: ${target}, Offer: ${offer}, Style: ${style}, Info: ${productKnowledge}, Testi: ${testimoniData}` }
      ];
    
    } else {
       // Fallback
       messages = [
           { role: "system", content: FORMATTING_INSTRUCTION },
           { role: "user", content: `Analisa data ini: ${JSON.stringify(data)}` }
       ];
    }

    // 6. Eksekusi AI
    const completion = await openai.chat.completions.create({
      model: tool.aiModel || "anthropic/claude-3.5-sonnet",
      messages: messages,
      temperature: 0.7,
      max_tokens: 3500,
    });

    const result = completion.choices[0].message.content;

    // 7. Potong Poin & Simpan Transaksi
    user.credits -= tool.creditCost;
    await user.save();

    await Transaction.create({
      userId: user._id,
      amount: tool.creditCost,
      type: 'out',
      description: `Tool: ${tool.name}`,
      status: 'success',
      actualCost: 100 
    });

    return NextResponse.json({ 
        success: true,
        result, 
        remainingCredits: user.credits 
    });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ message: "AI Busy: " + error.message }, { status: 500 });
  }
}