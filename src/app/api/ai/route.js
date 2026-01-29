import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db'; 
import userModel from '@/models/User'; 
import ToolConfig from '@/models/ToolConfig';
import transactionModel from '@/models/Transaction'; 

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

// --- HELPER: FORMATTING GUARDRAILS ---
// Instruksi ini akan ditempelkan ke setiap prompt agar output konsisten rapi.
const FORMATTING_INSTRUCTION = `
*** ATURAN FORMATTING KETAT (WAJIB PATUH) ***:
1. Gunakan FORMAT MARKDOWN yang rapi.
2. Gunakan EMOJI di setiap Judul Utama (Header 1 & 2) untuk visual hierarchy.
3. JANGAN membuat paragraf panjang. Pecah menjadi paragraf pendek (maksimal 3 baris).
4. Gunakan BULLET POINTS atau LIST untuk rincian. Jangan koma berderet.
5. Gunakan **BOLD** untuk kata kunci penting atau angka statistik.
6. Jika membandingkan data, WAJIB gunakan TABEL Markdown.
7. Berikan jarak antar seksi agar enak dibaca (Whitespace).
`;

export async function POST(req) {
  try {
    const { type, data } = await req.json();
    const token = cookies().get('token')?.value;

    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    // 1. Verifikasi Token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');

    await connectDB();
    const user = await userModel.findById(decoded.userId);
    
    const tool = await ToolConfig.findOne({ slug: type });

    // 2. Cek Saldo & Status
    if (!tool) return NextResponse.json({ message: 'Tool tidak ditemukan.' }, { status: 404 });
    if (!tool.isActive) return NextResponse.json({ message: 'Tool sedang maintenance.' }, { status: 503 });
    if (user.credits < tool.creditCost) {
      return NextResponse.json({ message: 'Poin Anda tidak mencukupi.' }, { status: 402 }); 
    }

    let messages = [];

    // ==========================================
    // TOOL 1: RISET PRODUK
    // ==========================================
    if (type === 'riset-produk') {
      const { skills, idea } = data;
      
      const systemPrompt = `
        ${FORMATTING_INSTRUCTION}
        
        BERTINDAKLAH SEBAGAI: "Elite Product Strategist & Trend Forecaster".
        TUGAS: Bedah ide user dan aset skill mereka untuk menemukan "Winning Product" di pasar Blue Ocean.
        
        INPUT USER:
        - Skill/Aset: ${skills}
        - Ide Dasar: ${idea}

        INSTRUKSI KHUSUS:
        1. Jangan berikan ide pasaran. Cari "Unique Angle" atau "Sub-Niche".
        2. Gunakan Framework "Pain-Dream-Fix".
        3. Wajib buat Product Ladder.
        
        FORMAT OUTPUT:
        
        # 💎 Blueprint Produk Winning

        > **POTENTIAL SCORE: [0-100]** • **STATUS: [Blue/Red Ocean]**

        ## 🧠 The Golden Angle (Konsep Pembeda)
        *Jelaskan kenapa produk ini unik.*

        ## 🎯 Psikologi Market
        - **The Pain (Neraka):** [Masalah spesifik]
        - **The Dream (Surga):** [Keinginan spesifik]
        - **The Bridge (Solusi):** [Produk Anda]

        ## 💰 Product Ecosystem
        | Level | Nama Produk & Konsep | Harga |
        | :--- | :--- | :--- |
        | **Tripwire** | ... | ... |
        | **Core Offer** | ... | ... |
        | **Profit Max** | ... | ... |

        ## 🚀 Go-To-Market Strategy
        [Strategi peluncuran singkat & padat]
      `;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Berikan saya blueprint produk yang susah ditolak market." }
      ];

    // ==========================================
    // TOOL 2: VALIDASI MARKET
    // ==========================================
    } else if (type === 'validasi-market') {
       const { idea } = data;
       
       const systemPrompt = `
        ${FORMATTING_INSTRUCTION}

        BERTINDAKLAH SEBAGAI: "Ruthless Business Validator".
        TUGAS: Validasi ide user sekeras mungkin. Jangan asal setuju. Cari celah kegagalannya.

        IDE USER: ${idea}

        FORMAT OUTPUT:

        # 🛡️ Laporan Validasi Ide

        > **SKOR KELAYAKAN: [0-100]** • **VERDICT: [GASPOL / PIVOT / KILL]**

        ## 💀 Pre-Mortem Analysis (Risiko Gagal)
        1. [Risiko 1]
        2. [Risiko 2]
        3. [Risiko 3]

        ## 🎯 Laser-Targeted Persona
        - **Siapa:** [Demografi]
        - **Musuh Bersama:** [Apa yang mereka benci?]
        - **Secret Desire:** [Keinginan terpendam]

        ## 🧪 Strategi "Smoke Test" (Validasi Hemat)
        1. **Metode:** ...
        2. **Angle Iklan:** ...
        3. **Budget Tes:** ...
        4. **KPI Lolos:** ...
       `;

       messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Validasi ide saya. Jujur saja." }
       ];

    // ==========================================
    // TOOL 3: MAGIC AD SCRIPT
    // ==========================================
    } else if (type === 'magic-ad-script') {
       const { product, audience, benefit } = data;
       
       const systemPrompt = `
        ${FORMATTING_INSTRUCTION}

        BERTINDAKLAH SEBAGAI: "Legendary Direct Response Copywriter".
        TUGAS: Menulis naskah iklan yang memanipulasi psikologi (etis) untuk konversi.

        DATA:
        - Produk: ${product}
        - Target: ${audience}
        - USP: ${benefit}

        INSTRUKSI:
        Buat 3 Variasi Script (Pain, Story, Logic).

        FORMAT OUTPUT:

        # ⚡ Hypnotic Ad Scripts: ${product}

        ## 🔥 Variasi A: The "Agitate Pain"
        > **Visual Cue:** [Adegan visual]
        
        **Headline:** [Teks di Layar]
        
        **Body Copy:**
        [Paragraf pembuka]
        [Paragraf solusi]
        [Penawaran]
        
        **👉 CTA:** [Action]

        ---

        ## 📖 Variasi B: The "Relatable Story"
        ... (Format sama)

        ---

        ## 💡 Variasi C: The "No-Brainer Logic"
        ... (Format sama)
       `;

       messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Buatkan naskah iklan konversi tinggi." }
       ];

    // ==========================================
    // TOOL 4: ANALISIS IKLAN
    // ==========================================
    } else if (type === 'analisis-iklan') {
      const { spend, ctr, cpc, conversions, roas } = data;
      
      const systemPrompt = `
        ${FORMATTING_INSTRUCTION}

        BERTINDAKLAH SEBAGAI: "Senior Media Buyer".
        TUGAS: Audit data iklan user. Temukan kebocoran budget.

        DATA:
        - Spend: Rp ${spend} | ROAS: ${roas}x
        - CTR: ${ctr}% | CPC: Rp ${cpc}
        - Conversions: ${conversions}

        FORMAT OUTPUT:

        # 🩺 Diagnosis Iklan: Deep Dive

        ## 📊 Rapor Performa: [SKOR 0-100]
        > **STATUS:** [SCALING / OPTIMIZE / KILL]

        ## 🩸 Root Cause Analysis (Kenapa Bocor?)
        ### 1. Bedah Kreatif (CTR: ${ctr}%)
        [Analisa...]

        ### 2. Bedah Trafik (CPC: Rp ${cpc})
        [Analisa...]

        ### 3. Bedah Cuan (ROAS: ${roas}x)
        [Analisa...]

        ## 🛠️ Tactical Fix (Action Plan)
        | Masalah | Solusi Teknis |
        | :--- | :--- |
        | **Iklan** | ... |
        | **Landing Page** | ... |
      `;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Audit data iklan saya." }
      ];

    // ==========================================
    // TOOL 5: KALKULATOR ADS
    // ==========================================
    } else if (type === 'kalkulator-ads') {
      const { productPrice, cogs, expectedCpr } = data;
      
      const systemPrompt = `
        ${FORMATTING_INSTRUCTION}

        BERTINDAKLAH SEBAGAI: "CFO E-Commerce".
        TUGAS: Hitung unit economics bisnis user.

        DATA:
        - Jual: ${productPrice} | HPP: ${cogs} | CPR Target: ${expectedCpr}

        FORMAT OUTPUT:

        # 💸 Laporan Kelayakan Finansial

        ## 📊 Skor Kesehatan: [0-100]
        > **VONIS:** [SEHAT / RISKAN / BONCOS]

        ## 🧮 Bedah Unit Economics
        - **Gross Margin:** Rp [Hitung]
        - **Max CPR (Batas Rugi):** Rp [Hitung]
        - **Break-Even ROAS:** [Hitung]x

        ## ⚠️ Simulasi Profit
        - **Optimis:** Profit Rp ...
        - **Realistis:** Profit Rp ...
        - **Pessimis:** Rugi Rp ...

        ## 💡 Rekomendasi
        [Saran strategis singkat]
      `;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Hitung profitabilitas bisnis saya." }
      ];

    // ==========================================
    // TOOL 6: LANDING PAGE (HTML ONLY)
    // ==========================================
    } else if (type === 'landing-page') {
      const { product, target, offer, style, productKnowledge, testimoniData } = data;
      
      const systemPrompt = `
       BERTINDAKLAH SEBAGAI: "Expert CRO Developer".
       TUGAS: Buat kode HTML Landing Page Sales High Conversion.
       
       DATA:
       - Produk: ${product} | Target: ${target}
       - Offer: ${offer} | Style: ${style}
       - Knowledge: ${productKnowledge}
       - Testimoni: ${testimoniData}

       INSTRUKSI:
       1. OUTPUT HANYA KODE HTML (Tanpa Markdown, Tanpa Penjelasan).
       2. Gunakan Tailwind CSS (CDN).
       3. Mobile-First Design.
       4. Structure: Navbar -> Hero -> Pain -> Solution -> Benefit -> Proof -> Pricing -> FAQ -> Footer.
       5. Gunakan Font 'Inter'.
      `;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Buatkan kode landing page." }
      ];
    
    } else {
       // Fallback untuk tool lain
       messages = [
           { role: "system", content: FORMATTING_INSTRUCTION },
           { role: "user", content: `Analisa data ini: ${JSON.stringify(data)}` }
       ];
    }

    // --- 4. EKSEKUSI AI ---
    const completion = await openai.chat.completions.create({
      model: tool.aiModel || "openai/gpt-4o-mini", 
      messages: messages,
      temperature: 0.7,
      max_tokens: 3000, 
    });

    const result = completion.choices[0].message.content;

    // --- 5. POTONG POIN & SIMPAN ---
    user.credits -= tool.creditCost;
    await user.save();

    await transactionModel.create({
      userId: user._id,
      amount: tool.creditCost,
      type: 'out',
      description: `Tool: ${tool.name}`,
      status: 'success',
      // Simpan estimasi modal API (Contoh: $0.01 per request * 16000 IDR)
      actualCost: 160 
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