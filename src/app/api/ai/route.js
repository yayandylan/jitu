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

export async function POST(req) {
  try {
    const { type, data } = await req.json();
    const token = cookies().get('token')?.value;

    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    // Verifikasi Token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');

    await connectDB();
    const user = await userModel.findById(decoded.userId);
    const tool = await ToolConfig.findOne({ slug: type });

    // Cek Saldo & Ketersediaan Tool
    if (!tool) return NextResponse.json({ message: 'Tool tidak ditemukan' }, { status: 404 });
    if (!tool.isActive) return NextResponse.json({ message: 'Tool sedang maintenance' }, { status: 503 });
    if (user.credits < tool.creditCost) {
      return NextResponse.json({ message: 'Poin tidak cukup' }, { status: 402 }); // 402 Payment Required
    }

    // --- LOGIC PROMPT ---
    let messages = [];

    // 1. RISET PRODUK
    if (type === 'riset-produk') {
      const { skills, idea } = data;
      
      const systemPrompt = `
        Bertindaklah sebagai Pakar Strategi Produk Digital Kelas Dunia.
        Tugasmu adalah menganalisa Ide Produk dan Skill user, lalu merancang "Winning Product" yang menguntungkan.

        INSTRUKSI KHUSUS:
        1. Berikan Skor Potensi (0-100) yang realistis berdasarkan market demand & skill match.
        2. Tentukan apakah ini Red Ocean (Persaingan Ketat) atau Blue Ocean (Peluang Baru).
        3. Gunakan Framework: Fenomena (Tren) > Masalah (Pain Point) > Solusi (Produk).
        4. Buat Product Ladder (Low, Mid, High Ticket).
        
        FORMAT OUTPUT (WAJIB MARKDOWN):
        
        # [Nama Produk Yang Menjual & Catchy]

        > **SKOR POTENSI: [Angka]/100** • **[Blue/Red] Ocean**

        ## 🧠 Framework Jitu
        - **Fenomena:** [Jelaskan tren yang terjadi]
        - **Masalah:** [Jelaskan masalah spesifik yang menyakitkan market]
        - **Solusi:** [Jelaskan konsep produk solusi]

        ## 💰 Strategi Harga (Product Ladder)
        | Tipe | Rekomendasi Produk | Estimasi Harga |
        | :--- | :--- | :--- |
        | **Low Ticket** (Pancingan) | [Nama Produk Murah] | Rp [Angka] |
        | **Mid Ticket** (Utama) | [Nama Produk Utama] | Rp [Angka] |
        | **High Ticket** (Premium) | [Nama Jasa/Mentoring] | Rp [Angka] |

        ## 🚀 Kenapa Ini Winning?
        [Penjelasan singkat persuasif kenapa user harus jual ini sekarang]
      `;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `INPUT USER:\n- Skill/Aset: ${skills}\n- Ide Awal: ${idea}` }
      ];

    // 2. VALIDASI MARKET
    } else if (type === 'validasi-market') {
       const { idea } = data;
       
       const systemPrompt = `
        Bertindaklah sebagai Senior Market Intelligence & Meta Ads Strategist.
        Tugasmu adalah memvalidasi ide produk user dan merancang strategi tes pasar yang hemat tapi akurat menggunakan metode CTWA (Click-to-WhatsApp).

        INSTRUKSI KHUSUS:
        1. Berikan "Market Validation Score" (0-100) dan Status (GO / NO GO / PIVOT).
        2. Tentukan "Target Persona" secara tajam (Demografi & Psikografi).
        3. Analisa Kompetitor (Cari celah kelemahan mereka).
        4. WAJIB: Rancang strategi validasi menggunakan Iklan CTWA (Click-to-WhatsApp).
           - Fokus pada sampling lead: Bagaimana cara menggali feedback dari lead yang masuk (Interview singkat via chat) untuk menyempurnakan produk.
           - Tentukan indikator keberhasilan (Winning CPR).

        FORMAT OUTPUT (WAJIB MARKDOWN):

        # Validasi: [Nama Produk]

        > **VALIDATION SCORE: [Angka]/100** • **STATUS: [GO / NO GO / PIVOT]**

        ## 🎯 Target Persona (Siapa Pembeli Ideal?)
        - **Avatar:** [Nama, Umur, Pekerjaan]
        - **Pain Point:** [Masalah spesifik yang bikin frustasi]
        - **Trigger:** [Pemicu kenapa mereka butuh solusi ini SEKARANG]

        ## 🧪 Strategi Validasi (Metode CTWA)
        - **Kenapa CTWA:** Validasi langsung via chat untuk mendapatkan "Honest Feedback" sebelum scale-up.
        - **Angle Iklan:** [Saran kalimat hook/gambar untuk iklan WA]
        - **Budget Testing:** [Saran budget harian minim untuk tes]
        - **Indikator Lolos:** Jika Cost Per Result (CPR) di bawah Rp [Angka] -> LANJUT.

        ## 💬 Teknik Sampling Lead (Bahan Evaluasi)
        *Gunakan pertanyaan ini saat chatting dengan lead untuk menyempurnakan produk:*
        - **Pertanyaan 1:** [Contoh pertanyaan untuk gali masalah user]
        - **Pertanyaan 2:** [Contoh pertanyaan untuk cek harga wajar]
        - **Pertanyaan 3:** [Contoh pertanyaan untuk cek fitur yang paling diinginkan]

        ## ⚔️ Analisa Kompetitor
        | Kompetitor | Kelemahan | Celah Kita |
        | :--- | :--- | :--- |
        | **Pemain Besar** | [Kelemahan] | [Solusi Kita] |

        ## ⚠️ Verdict (Kesimpulan)
        [Saran akhir: Gaspol iklan atau perbaiki penawaran dulu?]
       `;

       messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analisa Market untuk Produk: ${idea}` }
       ];

    // 3. MAGIC AD SCRIPT
    } else if (type === 'magic-ad-script') {
       const { product, audience, benefit } = data;
       
       const systemPrompt = `
        Bertindaklah sebagai World-Class Direct Response Copywriter & Creative Strategist (Level Gary Halbert / Ogilvy).
        Tugasmu adalah menulis Naskah Iklan (Ad Copy) yang "Hypnotic" dan berkonversi tinggi untuk Meta Ads (FB/IG) & TikTok.

        INPUT USER:
        - Produk: ${product}
        - Target Audience: ${audience}
        - Keunggulan Utama (USP): ${benefit}

        INSTRUKSI KHUSUS:
        Buat 3 Variasi Script dengan pendekatan psikologi berbeda:
        1. VARIASI A: "The Pain Agitation" (Fokus masalah, Hard Sell).
        2. VARIASI B: "The Storytelling" (Cerita emosional, Soft Sell).
        3. VARIASI C: "The Educational" (Edukasi/Tips, Value First).

        DI SETIAP VARIASI WAJIB ADA:
        - **HOOK (3 Detik Pertama):** Kalimat pembuka yang menghentikan scroll (Stop Scroll).
        - **BODY:** Isi copywriting yang persuasif.
        - **CTA:** Call to Action yang tegas.
        - **VISUAL CUE:** Saran visual (Video/Gambar) apa yang cocok untuk script ini.

        FORMAT OUTPUT (WAJIB MARKDOWN):

        # ⚡ Magic Scripts: ${product}

        ## 🔥 Variasi A: Pain & Solution (Hard Sell)
        > **Visual Cue:** [Jelaskan saran visual. Contoh: Video split screen wajah kusam vs glowing]
        
        **Headline:** [Tulis Headline Disini]
        
        [Tulis Body Copy Disini]
        
        **👉 CTA:** [Tulis CTA Disini]

        ---

        ## 📖 Variasi B: Storytelling (Soft Sell)
        > **Visual Cue:** [Jelaskan saran visual. Contoh: Video testimoni user bercerita santai di sofa]
        
        **Headline:** [Tulis Headline Disini]
        
        [Tulis Body Copy Disini]
        
        **👉 CTA:** [Tulis CTA Disini]

        ---

        ## 💡 Variasi C: Educational (Value First)
        > **Visual Cue:** [Jelaskan saran visual. Contoh: Video Green Screen menunjuk artikel berita]
        
        **Headline:** [Tulis Headline Disini]
        
        [Tulis Body Copy Disini]
        
        **👉 CTA:** [Tulis CTA Disini]
       `;

       messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Buatkan Magic Script untuk produk: ${product}` }
       ];

    /// 4. LANDING PAGE BUILDER (FINAL: DENGAN DATA REAL)
    } else if (type === 'landing-page') {
       // UPDATE: Menambah input 'productKnowledge' dan 'testimoniData'
       const { product, target, offer, style, productKnowledge, testimoniData } = data;
       
       const systemPrompt = `
        Bertindaklah sebagai Expert Copywriter & Web Developer.
        Tugasmu adalah membuat LANDING PAGE HTML SINGLE-FILE yang High-Converting.

        INPUT USER:
        - Produk: ${product}
        - Target: ${target}
        - Penawaran: ${offer}
        - Gaya: ${style}
        
        DATA FAKTA (WAJIB DIPAKAI):
        - Product Knowledge: ${productKnowledge} (Gunakan fakta ini untuk menjelaskan fitur/manfaat. JANGAN NGARANG FITUR).
        - Testimoni Asli: ${testimoniData} (Gunakan kalimat asli ini untuk section testimoni).

        INSTRUKSI DESAIN (TAILWIND CSS):
        1. **Container:** 'max-w-xl mx-auto' (Mobile First).
        2. **Visual:** Gunakan placeholder image (https://placehold.co/600x400/e2e8f0/475569?text=Foto+Produk) tapi berikan instruksi di alt text.
        3. **Style:** ${style === 'Tegas & Hard Sell' ? 'Gunakan warna Merah/Kuning, Font Tebal' : 'Gunakan warna Biru/Emerald, Clean Look'}.

        STRUKTUR KONTEN:
        1. **Headline:** Harus nendang & menyentuh Pain Point target market.
        2. **Agitate Problem, buat orang merasa relate dengan masalah dan berikan informasi bahwa itu yang pernah saya alami dulu, dan akhirnya menemukan solusinya
        3. **Product Knowledge:** Jelaskan detail produk berdasarkan input user di atas.
        4. **Social Proof:** Masukkan testimoni asli yang diberikan user.
        5. **Bonus:** Bonus-bonus yang akan didapatkan dengan harga tinggi yang di coret
        6. **Offer:** Tampilkan harga setelah diskon/promo.
        7. **FAQ

        INSTRUKSI OUTPUT:
        - HANYA keluarkan kode HTML lengkap (<!DOCTYPE html> ...).
        - Sertakan Tailwind CDN.
        - Font 'Inter'.
        - JANGAN ada teks pengantar.
       `;

       messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Buat Sales Page untuk ${product}` }
       ];

    // --- 5. ANALISIS IKLAN EXPERT (AUDIT TOTAL) ---
    } else if (type === 'analisis-iklan') {
      const { spend, ctr, cpc, conversions, roas, adPlatform, targetAudience, campaignGoal } = data;
      
      const systemPrompt = `
        BERTINDAKLAH SEBAGAI: "Growth Architect & Master of Media Buying" kelas dunia dengan pengalaman mengelola budget iklan $100M+.
        TUGAS: Melakukan bedah total (Deep Diagnostic) pada data iklan user. Jangan berikan jawaban basa-basi. Berikan analisa "pedas", akurat, dan teknis.

        KONTEKS DATA:
        - Platform: ${adPlatform || 'Meta Ads'}
        - Campaign Goal: ${campaignGoal || 'Sales/Conversion'}
        - Target Audience: ${targetAudience || 'General'}
        - Spend: Rp ${spend} | CTR: ${ctr}% | CPC: Rp ${cpc} | Conversions: ${conversions} | ROAS: ${roas}x

        KPI DIAGNOSTIC FRAMEWORK (ANALISA 360 DERAJAT):
        1. THE HOOK ANALYSIS (CTR): 
           - Jika < 1%: Kreatif Bapak gagal menghentikan scroll. Masalah pada 3 detik pertama video atau visual utama.
           - Jika > 2%: Kreatif sangat bagus, tapi cek apakah kliknya 'junk' atau relevan.
        2. THE AUDIENCE FIT (CPC & CPM): 
           - Jika CPC tinggi: Audience terlalu sempit atau "Auction Overlap" (perang harga).
        3. THE CONVERSION LEAK (CR & ROAS):
           - Jika CTR tinggi tapi Konversi 0: Ada 'mismatch' antara janji di iklan dengan kenyataan di Landing Page.
        4. SCALING STRATEGY: 
           - Gunakan metode Horizontal Scaling (New Audience) atau Vertical Scaling (Add Budget 20%).

        FORMAT OUTPUT (WAJIB POINTER & MARKDOWN):

        # 🎖️ Expert Audit Report: Jitu Digital Analytics

        ## 📈 Overall Ad Strategy Score: [Angka]/100
        > **STATUS:** [SCALING / OPTIMIZE / KILL & PIVOT]

        ---

        ## 🧠 Deep Diagnostic (Bedah Masalah)
        ### 1. Performa Kreatif & Visual
        [Analisa mengapa CTR Bapak berada di angka ${ctr}%. Apakah audiens jenuh atau hook-nya kurang 'nonjok'?]

        ### 2. Analisa Biaya & Penargetan
        [Bedah CPC Rp ${cpc}. Apakah Bapak sedang membakar uang di kolam yang salah atau kompetisinya memang sedang berdarah-darah?]

        ### 3. Funnel & Profitability (ROAS)
        [Dengan ROAS ${roas}x, jelaskan apakah bisnis ini sustainable. Dimana kebocoran uang terbesar terjadi?]

        ---

        ## 🛠️ Tactical Solution (Langkah Teknis)
        | Level | Masalah Utama | Solusi 'Jitu' (Eksekusi Sekarang) |
        | :--- | :--- | :--- |
        | **Top of Funnel** | [Problem] | [Ganti Hook/Headline/Angle] |
        | **Middle/Bottom** | [Problem] | [Retargeting / Perbaiki Offer] |
        | **Technical** | [Problem] | [CBO vs ABO / Bid Strategy] |

        ---

        ## 🚀 Strategi Scale Up (Jika Layak)
        1. **Langkah 1:** [Instruksi spesifik, misal: Duplikasi Campaign ke Broad Audience]
        2. **Langkah 2:** [Instruksi spesifik, misal: Naikkan budget 20% setiap 3 hari]

        ## 📢 Kesimpulan Senior Advertiser
        [Berikan pesan penutup yang sangat strategis: "Jangan fokus di angka saja, tapi perbaiki [ASPEK UTAMA] Bapak karena..."]
      `;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analisa data iklan saya secara brutal dan profesional. Saya ingin profit, bukan sekadar angka.` }
      ];

    // --- 7. TOOL BARU: EXPERT AD REVIEW (MESSAGE MATCH) ---
    } else if (type === 'ad-review') {
      const { lpLink, adContext } = data;
      const systemPrompt = `
        BERTINDAKLAH SEBAGAI: "World-Class Creative Director & CRO Expert".
        TUGAS: Review keselarasan (Message Match) antara konten iklan dengan Landing Page di URL: ${lpLink}.

        POIN REVIEW:
        1. Visual Continuity: Apakah warna/style iklan nyambung dengan website?
        2. Promise Alignment: Apakah janji di iklan dijawab di Headline website?
        3. Hook Strength: Seberapa kuat iklan ini menarik perhatian (Stop-scroll).
        4. Berikan "Message Match Score" (0-100).

        FORMAT OUTPUT (WAJIB MARKDOWN):
        # 🎨 Expert Ad & LP Review
        > **MESSAGE MATCH SCORE: [Angka]/100**
        > **VERDICT: [GASPOL / PERBAIKI / BAHAYA]**

        ## 🧐 Analisa Keselarasan (Sync Check)
        [Jelaskan apakah iklan dan LP di ${lpLink} sudah 'satu irama' atau malah bikin user bingung.]

        ## 🛠️ Rekomendasi Perubahan (Langkah Jitu)
        - **Perbaikan Iklan:** [Saran visual/copy]
        - **Perbaikan LP:** [Saran headline/desain]

        ## 🏆 Kesimpulan Expert
        [Pesan pamungkas agar budget tidak terbuang percuma.]
      `;
      messages = [{ role: "system", content: systemPrompt }, { role: "user", content: `Review iklan saya dan hubungkan dengan link: ${lpLink}` }];

    // --- 8. KALKULATOR ADS STRATEGIS ---
    } else if (type === 'kalkulator-ads') {
      const { productPrice, cogs, adBudget, targetSales, expectedCpr } = data;
      
      const systemPrompt = `
        BERTINDAKLAH SEBAGAI: "Chief Financial Officer (CFO) & Ecommerce Growth Strategist".
        TUGAS: Menganalisa kelayakan finansial dari model bisnis user berdasarkan variabel harga dan budget iklan.

        DATA INPUT:
        - Harga Jual Produk: Rp ${productPrice}
        - HPP / Modal Produk: Rp ${cogs}
        - Budget Iklan: Rp ${adBudget}
        - Target Penjualan: ${targetSales} qty
        - Ekspektasi Biaya Per Closing (CPR): Rp ${expectedCpr}

        LOGIKA ANALISA (WAJIB ADA):
        1. MARGIN PER PRODUK: (Harga Jual - HPP).
        2. BREAK-EVEN ROAS: Harga Jual / Margin. (Ini adalah titik dimana user tidak untung dan tidak rugi).
        3. REAL PROFIT FORECAST: (Margin - CPR) * Target Sales.
        4. STATUS KELAYAKAN: 
           - Jika Margin < CPR: "High Risk / Burn Money" (Bapak rugi setiap kali ada penjualan).
           - Jika Margin > 3x CPR: "Healthy & Scalable".
        
        FORMAT OUTPUT (WAJIB MARKDOWN):

        # 💸 Business Forecasting Report

        ## 📊 Financial Health Score: [Angka]/100
        > **KESIMPULAN:** [GASPOL / OPTIMASI MARGIN / BAHAYA (RUGI)]

        ---

        ## 🔢 Bedah Angka (The Math)
        - **Margin Kotor per Produk:** Rp [Angka]
        - **Break-Even ROAS (Titik Aman):** [Angka]x
        - **Target Revenue:** Rp [Angka]
        - **Proyeksi Profit Bersih:** **Rp [Angka]**

        ## 🧠 Diagnosa Strategis
        ### 1. Ketahanan Margin
        [Analisa apakah selisih harga jual dan modal cukup kuat untuk menampung biaya iklan yang makin mahal.]

        ### 2. Analisa CPR & Efisiensi
        [Analisa apakah target CPR Rp ${expectedCpr} masuk akal untuk industri ini.]

        ---

        ## 🛠️ Rekomendasi Jitu (Langkah CFO)
        | Aspek | Masalah Ditemukan | Solusi Finansial |
        | :--- | :--- | :--- |
        | **Pricing** | [Misal: Harga terlalu rendah] | [Saran: Naikkan harga atau Bundle] |
        | **Ops/Sourcing** | [Misal: HPP terlalu tinggi] | [Saran: Cari supplier baru] |
        | **Ad Strategy** | [Misal: Target CPR tidak realistis] | [Saran: Tingkatkan Conversion Rate] |

        ---

        ## 🎯 Verdict Senior Strategist
        [Berikan 1 nasehat "mahal" tentang bagaimana mengelola cashflow agar bisnis ini tidak sekadar besar omzet tapi boncos profit.]
      `;

      messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Hitung dan analisa kelayakan bisnis saya dengan harga jual Rp ${productPrice}.` }
      ];

    } else {

    // ... Default fallback
       messages = [{ role: "user", content: `Analisa: ${data.idea || data.product}` }];
    }

    // --- REQUEST KE AI ---
    const completion = await openai.chat.completions.create({
      model: tool.aiModel || "openai/gpt-4o-mini", // Pastikan model support instruction bagus
      messages: messages,
      temperature: 0.7, // Kreatif tapi terarah
    });

    const result = completion.choices[0].message.content;

    // --- POTONG POIN & SIMPAN TRANSAKSI ---
    user.credits -= tool.creditCost;
    await user.save();

    await transactionModel.create({
      userId: user._id,
      amount: tool.creditCost,
      type: 'out',
      description: `Gunakan Tool: ${tool.name}`,
      status: 'success'
    });

    return NextResponse.json({ result, remainingCredits: user.credits });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ message: "Gagal memproses AI: " + error.message }, { status: 500 });
  }
}