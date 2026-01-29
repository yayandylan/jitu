import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db'; 
import userModel from '@/models/User'; 
import ToolConfig from '@/models/ToolConfig';
import transactionModel from '@/models/Transaction'; 
// Pastikan model History ada jika ingin simpan otomatis di sini (opsional, krn di frontend sdh ada logic save)

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req) {
  try {
    const { type, data } = await req.json();
    const token = cookies().get('token')?.value;

    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    // 1. Verifikasi Token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');

    await connectDB();
    const user = await userModel.findById(decoded.userId);
    
    // Cari config tool berdasarkan slug
    const tool = await ToolConfig.findOne({ slug: type });

    // 2. Cek Saldo & Status Tool
    if (!tool) return NextResponse.json({ message: 'Tool tidak ditemukan dalam database.' }, { status: 404 });
    if (!tool.isActive) return NextResponse.json({ message: 'Tool sedang maintenance.' }, { status: 503 });
    if (user.credits < tool.creditCost) {
      return NextResponse.json({ message: 'Poin Anda tidak mencukupi. Silakan Top Up.' }, { status: 402 }); 
    }

    // --- 3. HIGH-LEVEL PROMPT ENGINEERING ---
    let messages = [];

    // ==========================================
    // TOOL 1: RISET PRODUK (BLUE OCEAN STRATEGY)
    // ==========================================
    if (type === 'riset-produk') {
      const { skills, idea } = data;
      
      const systemPrompt = `
        BERTINDAKLAH SEBAGAI: "Elite Product Strategist & Trend Forecaster" dengan pengalaman membangun brand 7-figure.
        
        TUGAS: Bedah ide user dan aset skill mereka untuk menemukan "Winning Product" di pasar yang belum jenuh (Blue Ocean).
        
        INPUT USER:
        - Skill/Aset: ${skills}
        - Ide Dasar: ${idea}

        INSTRUKSI KHUSUS (JANGAN GENERIK):
        1. Jangan berikan ide pasaran. Cari "Unique Angle" atau "Sub-Niche" yang spesifik.
        2. Gunakan Framework "Pain-Dream-Fix".
        3. Wajib buat Product Ladder (Pancingan murah -> Produk Utama -> High Ticket).
        
        FORMAT OUTPUT (MARKDOWN):
        
        # 💎 Blueprint Produk Winning

        > **POTENTIAL SCORE: [0-100]** • **STATUS: [Blue/Red Ocean]**

        ## 🧠 The Golden Angle (Konsep Pembeda)
        *Jelaskan kenapa produk ini akan laku keras dan berbeda dari kompetitor pasaran.*

        ## 🎯 Psikologi Market (Why They Buy?)
        - **The Pain (Neraka Market):** [Masalah spesifik yang bikin mereka stres/malu/takut]
        - **The Dream (Surga Market):** [Apa yang mereka idamkan setelah pakai produk ini]
        - **The Bridge (Solusi Anda):** [Bagaimana produk ini mengantar mereka dari Pain ke Dream]

        ## 💰 Product Ecosystem (Strategi Cuan Maksimal)
        | Level | Nama Produk & Konsep | Rekomendasi Harga |
        | :--- | :--- | :--- |
        | **Tripwire (Pancingan)** | [Produk murah/gratis tapi value tinggi untuk dapat leads] | Rp [Angka] |
        | **Core Offer (Utama)** | [Produk utama yang Anda jual] | Rp [Angka] |
        | **Profit Maximizer** | [Upsell/Cross-sell/Mentoring/Service] | Rp [Angka] |

        ## 🚀 Go-To-Market Strategy
        [Satu paragraf strategi peluncuran: Siapa yang harus diserang duluan?]
      `;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Berikan saya blueprint produk yang susah ditolak market." }
      ];

    // ==========================================
    // TOOL 2: VALIDASI MARKET (INTELIJEN BISNIS)
    // ==========================================
    } else if (type === 'validasi-market') {
       const { idea } = data;
       
       const systemPrompt = `
        BERTINDAKLAH SEBAGAI: "Ruthless Business Validator & Market Researcher".
        TUGAS: Validasi ide user sekeras mungkin. Jangan asal setuju. Cari celah kegagalannya sebelum user buang uang. Lalu berikan solusi tes pasar termurah.

        IDE USER: ${idea}

        INSTRUKSI KHUSUS:
        1. Tentukan "Validation Score". Jika idenya buruk, katakan buruk.
        2. Buat "Customer Avatar" yang sangat spesifik (bukan 'semua orang').
        3. Rancang strategi "Smoke Test" (Tes pasar modal minim).

        FORMAT OUTPUT (MARKDOWN):

        # 🛡️ Laporan Validasi Ide

        > **SKOR KELAYAKAN: [0-100]** • **VERDICT: [GASPOL / PIVOT / KILL]**

        ## 💀 Pre-Mortem Analysis (Kenapa Ini Bisa Gagal?)
        *Saya memprediksi ide ini bisa gagal karena 3 hal ini:*
        1. [Risiko 1]
        2. [Risiko 2]
        3. [Risiko 3]

        ## 🎯 Laser-Targeted Persona
        Jangan jual ke "Semua Orang". Jual ke orang ini:
        - **Siapa:** [Demografi spesifik]
        - **Musuh Bersama:** [Apa/Siapa yang mereka benci/takuti?]
        - **Secret Desire:** [Keinginan terpendam yang malu mereka akui]

        ## 🧪 Strategi "Smoke Test" (Validasi Hemat)
        Jangan stok barang/bikin produk dulu! Lakukan ini:
        1. **Metode:** [Misal: Pre-Order / Iklan ke WA / Landing Page Sederhana]
        2. **Angle Iklan:** [Hook kalimat untuk tes respon pasar]
        3. **Budget Tes:** [Nominal hemat]
        4. **KPI Lolos:** [Misal: Jika ada 5 orang transfer dalam 2 hari, maka Valid]

        ## ⚔️ Celah Kompetitor
        [Satu kelemahan fatal kompetitor besar yang bisa Anda manfaatkan]
       `;

       messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Validasi ide saya. Jujur saja, jangan 'asal bapak senang'." }
       ];

    // ==========================================
    // TOOL 3: MAGIC AD SCRIPT (HYPNOTIC COPY)
    // ==========================================
    } else if (type === 'magic-ad-script') {
       const { product, audience, benefit } = data;
       
       const systemPrompt = `
        BERTINDAKLAH SEBAGAI: "Legendary Direct Response Copywriter" (Gabungan gaya Gary Halbert & David Ogilvy).
        TUGAS: Menulis naskah iklan (Ad Copy) yang mampu memanipulasi psikologi (secara etis) untuk memaksa orang berhenti scroll dan membeli.

        DATA PRODUK:
        - Produk: ${product}
        - Target: ${audience}
        - USP: ${benefit}

        INSTRUKSI KHUSUS:
        Buat 3 Variasi Script untuk Meta Ads/TikTok Ads dengan struktur:
        1. **VARIASI A (Fear/Pain):** Tekan rasa sakit/takut audiens.
        2. **VARIASI B (Story/Relatable):** Cerita yang "gue banget".
        3. **VARIASI C (Logic/Authority):** Fakta, data, dan logika tak terbantahkan.

        WAJIB ADA DI SETIAP SCRIPT:
        - **Visual Cue:** Instruksi untuk video editor (apa yang harus tampil di layar).
        - **The Hook (Detik 0-3):** Kalimat pembuka yang kontroversial/mengejutkan.

        FORMAT OUTPUT (MARKDOWN):

        # ⚡ Hypnotic Ad Scripts: ${product}

        ## 🔥 Variasi A: The "Agitate Pain" (Hard Sell)
        > **Visual Cue:** [Adegan visual yang dramatis/menunjukkan masalah]
        
        **Headline (Teks di Video):** [Headline Menohok]
        
        **Body Copy:**
        [Paragraf pembuka yang menekan luka]
        [Paragraf solusi yang melegakan]
        [Penawaran yang tak masuk akal (Irresistible Offer)]
        
        **👉 CTA Tegas:** [Kalimat perintah klik]

        ---

        ## 📖 Variasi B: The "Relatable Story" (Soft Sell)
        > **Visual Cue:** [User Generated Content / Testimoni natural]
        
        **Headline:** [Headline yang memancing rasa ingin tahu]
        
        **Body Copy:**
        "Dulu saya pikir [Masalah] itu biasa, sampai akhirnya..."
        [Ceritakan transformasi]
        [Kenalkan produk sebagai pahlawan]
        
        **👉 CTA:** [Kalimat ajakan bersahabat]

        ---

        ## 💡 Variasi C: The "No-Brainer Logic"
        > **Visual Cue:** [Unboxing / Demo Produk / Green Screen]
        
        **Headline:** [Fakta mengejutkan / Pertanyaan Retoris]
        
        **Body Copy:**
        [3 Alasan logis kenapa produk ini wajib dibeli]
        [Hancurkan keraguan (Objection Handling)]
        [Garansi/Rasa Aman]
        
        **👉 CTA:** [Kalimat urgensi]
       `;

       messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Buatkan naskah iklan yang konversinya tinggi." }
       ];

    // ==========================================
    // TOOL 4: ANALISIS IKLAN (DEEP DIAGNOSTIC)
    // ==========================================
    } else if (type === 'analisis-iklan') {
      const { spend, ctr, cpc, conversions, roas, adPlatform, targetAudience, campaignGoal } = data;
      
      const systemPrompt = `
        BERTINDAKLAH SEBAGAI: "Senior Media Buyer & Growth Hacker" yang mengelola budget $1M/bulan.
        TUGAS: Audit data iklan user secara brutal. Temukan kebocoran budget dan berikan solusi teknis yang presisi.

        DATA IKLAN:
        - Spend: Rp ${spend} | ROAS: ${roas}x
        - CTR: ${ctr}% (Indikator Kreatif)
        - CPC: Rp ${cpc} (Indikator Kompetisi/Audience)
        - Conversions: ${conversions}

        LOGIKA ANALISA EXPERT:
        1. **CTR Rendah (<1%):** Masalah di KREATIF (Gambar/Video/Thumbnail membosankan).
        2. **CTR Tinggi, tapi Konversi 0:** Masalah di OFFER atau LANDING PAGE (Loading lambat, harga kemahalan, tidak percaya).
        3. **CPC Mahal:** Masalah di AUDIENCE (Terlalu sempit) atau KREATIF (Relevansi rendah).
        4. **ROAS Rendah:** Masalah di MARGIN atau Average Order Value (AOV).

        FORMAT OUTPUT (MARKDOWN):

        # 🩺 Diagnosis Iklan: Deep Dive

        ## 📊 Rapor Performa: [SKOR 0-100]
        > **STATUS:** [SCALING / OPTIMIZE / KILL NOW]

        ---

        ## 🩸 Dimana Uang Anda Bocor? (Root Cause Analysis)
        
        ### 1. Bedah Kreatif (CTR: ${ctr}%)
        [Analisa mendalam: Apakah iklan ini 'Stopping Power'-nya lemah? Atau salah angle?]

        ### 2. Bedah Trafik (CPC: Rp ${cpc})
        [Analisa kompetisi: Apakah audience ini terlalu mahal? Apakah saatnya ganti audience?]

        ### 3. Bedah Cuan (ROAS: ${roas}x)
        [Analisa profitabilitas: Apakah kampanye ini sebenarnya rugi kalau dihitung operasional?]

        ---

        ## 🛠️ Tactical Fix (Lakukan Ini Sekarang!)
        | Masalah | Solusi Teknis (Actionable) |
        | :--- | :--- |
        | **Iklan** | [Misal: Ganti Thumbnail 3 detik pertama] |
        | **Landing Page** | [Misal: Perbaiki Headline agar sesuai janji iklan] |
        | **Setting Ads** | [Misal: Matikan Audience A, Duplicate ke Broad] |

        ## 🚀 Scaling Plan (Jika Layak)
        Jika ROAS stabil di atas 3x, lakukan strategi ini:
        1. [Strategi Scaling Horizontal]
        2. [Strategi Scaling Vertical]
      `;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Audit data saya. Jangan berikan saran generik." }
      ];

    // ==========================================
    // TOOL 5: KALKULATOR ADS (FINANCIAL FORECAST)
    // ==========================================
    } else if (type === 'kalkulator-ads') {
      const { productPrice, cogs, adBudget, targetSales, expectedCpr } = data;
      
      const systemPrompt = `
        BERTINDAKLAH SEBAGAI: "CFO (Chief Financial Officer) E-Commerce".
        TUGAS: Hitung kelayakan bisnis user. Peringatkan jika model bisnisnya "Burn Money" (Rugi).

        DATA KEUANGAN:
        - Harga Jual: Rp ${productPrice}
        - HPP (Modal): Rp ${cogs}
        - Target CPR (Biaya Iklan per Sale): Rp ${expectedCpr}

        RUMUS EXPERT:
        1. Margin Kotor = Harga Jual - HPP
        2. Break-Even ROAS (BEP) = Harga Jual / Margin Kotor
        3. Net Profit = (Margin Kotor - CPR) * Target Sales

        FORMAT OUTPUT (MARKDOWN):

        # 💸 Laporan Kelayakan Finansial

        ## 📊 Skor Kesehatan Bisnis: [0-100]
        > **VONIS:** [SEHAT / RISKAN / BONCOS]

        ---

        ## 🧮 Bedah Unit Economics (Per 1 Produk)
        - **Anda Pegang Uang (Gross Margin):** Rp [Hitung]
        - **Biaya Iklan Maksimal (Max CPR):** Rp [Hitung] *(Jika biaya iklan lewat angka ini, Anda rugi)*
        - **Titik Aman (Break-Even ROAS):** [Hitung]x

        ## ⚠️ Simulasi Skenario (Reality Check)
        - **Skenario Optimis (CPR Murah):** Profit Rp [Hitung]
        - **Skenario Realistis (CPR Pasar):** Profit Rp [Hitung]
        - **Skenario Buruk (Iklan Boncos):** Rugi Rp [Hitung]

        ## 💡 Rekomendasi CFO
        [Saran strategis: Apakah harus menaikkan harga? Menurunkan HPP? Atau model bisnis ini memang tidak layak di-iklan-kan?]
      `;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Hitung apakah bisnis saya bakal untung atau buntung." }
      ];

    // ==========================================
    // TOOL 6: LANDING PAGE BUILDER (HTML CODE)
    // ==========================================
    } else if (type === 'landing-page') {
      const { product, target, offer, style, productKnowledge, testimoniData } = data;
      
      const systemPrompt = `
       BERTINDAKLAH SEBAGAI: "Expert Conversion Rate Optimizer (CRO) & Frontend Developer".
       TUGAS: Buat kode HTML Single-File untuk Landing Page yang fokus konversi (Sales Page).
       
       DATA:
       - Produk: ${product}
       - Target: ${target}
       - Offer: ${offer}
       - Style: ${style}
       - Knowledge: ${productKnowledge}
       - Testimoni: ${testimoniData}

       INSTRUKSI KODING:
       1. Gunakan **Tailwind CSS (CDN)**.
       2. Desain **Mobile-First** (tampilan HP wajib rapi).
       3. Gunakan Font 'Inter' atau 'Poppins'.
       4. **Structure:** Sticky Navbar (CTA) -> Hero Section (Headline Nendang + Gambar) -> Problem Agitation -> Solution -> Benefit Stacking -> Social Proof -> Pricing Table -> FAQ -> Sticky Footer CTA.
       5. Gunakan placeholder image dari 'placehold.co'.
       
       OUTPUT: HANYA KODE HTML (Tanpa penjelasan teks).
      `;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Buatkan kode landing page siap pakai." }
      ];
    
    // Fallback Default
    } else {
       messages = [{ role: "user", content: `Bantu saya menganalisa: ${JSON.stringify(data)}` }];
    }

    // --- 4. EKSEKUSI AI ---
    // Gunakan model GPT-4o-mini (Cepat & Cerdas) atau GPT-4o (Lebih mahal tapi expert)
    // Jika budget terbatas, gpt-4o-mini sudah sangat powerful untuk instruksi di atas.
    const completion = await openai.chat.completions.create({
      model: tool.aiModel || "openai/gpt-4o-mini", 
      messages: messages,
      temperature: 0.7, // Kreatif tapi tetap ikut instruksi
      max_tokens: 2500, // Jawaban panjang & lengkap
    });

    const result = completion.choices[0].message.content;

    // --- 5. POTONG POIN & CATAT TRANSAKSI ---
    user.credits -= tool.creditCost;
    await user.save();

    await transactionModel.create({
      userId: user._id,
      amount: tool.creditCost,
      type: 'out',
      description: `Gunakan Tool: ${tool.name}`,
      status: 'success'
    });

    return NextResponse.json({ 
        success: true,
        result, 
        remainingCredits: user.credits 
    });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ message: "AI sedang sibuk/error: " + error.message }, { status: 500 });
  }
}