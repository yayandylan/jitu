import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { getRealTimeNews } from '@/lib/newsScraper'; // <--- Import Scraper Baru

// --- KONFIGURASI BIAYA ---
const CREDIT_COST = 50;

// --- HELPER: GET USER ID ---
const getUserId = () => {
    const token = cookies().get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
        return decoded.userId;
    } catch (error) { return null; }
};

// --- BAGIAN UMUM: VISUAL & SAFETY RULES ---
const COMMON_RULES = `
🎨 VISUAL IDENTITY (DESIGN CONTEXT):
- **themeColor**: Pilih kode HEX warna yang mewakili emosi topik.
  - *Breaking News/Bahaya* -> Merah (#D62828) atau Kuning (#FFD700)
  - *Teknologi/Bisnis* -> Biru Neon (#00E5FF) atau Silver (#E0E0E0)
  - *Kesehatan/Alam* -> Hijau (#00C853)
  - *Misteri/Duka* -> Ungu Gelap (#6A1B9A) atau Hitam (#111111)
- **artStyle**: Tentukan gaya gambar (English). Contoh: "dark cinematic high contrast", "bright minimalist clean", "vintage grainy".

⚠️ SAFETY & SENSITIVITY PROTOCOL (WAJIB):
- Jika topik mengandung KONFLIK/PERANG/KEKERASAN, **UBAH BAHASA MENJADI "AMAN"** (Family Friendly).
- **LARANGAN:** Jangan gunakan kata sadis seperti "Pembunuhan", "Darah", "Mutilasi".
- **GANTI DENGAN:** "Tragedi Kemanusiaan", "Hilangnya Nyawa", "Insiden Fatal".
`;

// --- PERSONA 1: CAROUSEL MODE (Banyak Slide) ---
const CAROUSEL_PERSONA = `
PERAN: Creative Director Carousel Viral (Storytelling Visual).
TUGAS: Pecah topik menjadi alur cerita 5 slide.

${COMMON_RULES}

STRUKTUR OUTPUT JSON (CAROUSEL):
{
   "headline": "JUDUL HOOK (Max 10 Kata)",
   "caption": "Caption storytelling lengkap.",
   "themeColor": "#HEXCODE",
   "artStyle": "Deskripsi style visual (English)",
   "imagePrompt": "Deskripsi visual Cover Slide 1 (English)",
   "slidesContent": [
       { "title": "Sub-Judul Slide 2", "body": "Isi ringkas.", "visual": "Visual prompt slide 2 (English)." },
       { "title": "Sub-Judul Slide 3", "body": "Isi ringkas.", "visual": "Visual prompt slide 3 (English)." },
       { "title": "Sub-Judul Slide 4", "body": "Isi ringkas.", "visual": "Visual prompt slide 4 (English)." },
       { "title": "Sub-Judul Slide 5", "body": "Kesimpulan.", "visual": "Visual prompt slide 5 (English)." }
   ]
}
`;

// --- PERSONA 2: SINGLE POST MODE (Satu Gambar) ---
const SINGLE_POST_PERSONA = `
PERAN: Creative Director Single Post Instagram (Visual Impact).
TUGAS: Buat 1 Judul Nendang dan 1 Visual Key Visual yang sangat kuat/detail.

${COMMON_RULES}

STRUKTUR OUTPUT JSON (SINGLE POST):
{
   "headline": "JUDUL HOOK (Max 8 Kata, Clickbait)",
   "caption": "Caption storytelling lengkap, gunakan paragraf pendek dan emoji.",
   "themeColor": "#HEXCODE",
   "artStyle": "Deskripsi style visual (English)",
   "imagePrompt": "Deskripsi visual yang SANGAT DETAIL, DRAMATIS, dan MENCOLOK untuk satu-satunya gambar ini (English). Fokus pada ekspresi atau objek utama.",
   "slidesContent": [] 
}
`;

export async function POST(req) {
  try {
    // 1. CEK AUTH & SALDO
    await connectDB();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const user = await User.findById(userId);
    if (!user || user.credits < CREDIT_COST) {
        return NextResponse.json({ success: false, message: "Saldo Poin Habis. Silakan Top Up." }, { status: 402 });
    }

    const body = await req.json();
    const { prompt, mode = 'carousel' } = body; 

    if (!process.env.OPENROUTER_API_KEY) return NextResponse.json({ success: false, message: "API Key Error" }, { status: 500 });

    // 2. AMBIL BERITA (Menggunakan Lib External)
    let newsContext = "";
    try { 
        console.log(`🔍 Searching news for: ${prompt}`);
        const fetchedNews = await getRealTimeNews(prompt);
        if (fetchedNews) newsContext = fetchedNews;
        else console.log("⚠️ No specific news found.");
    } catch(e) { console.log("News Scraper Error Ignored"); }

    // 3. TENTUKAN SYSTEM PROMPT BERDASARKAN MODE
    const SELECTED_SYSTEM_PROMPT = mode === 'single' ? SINGLE_POST_PERSONA : CAROUSEL_PERSONA;
    const USER_INSTRUCTION = `Topik: "${prompt}".\nFakta Berita Terkini (Gunakan sebagai dasar fakta): \n${newsContext}\n\nInstruksi: Buat konten ${mode === 'single' ? 'SINGLE POST (1 Gambar)' : 'CAROUSEL (Banyak Slide)'} yang viral!`;

    const models = ["google/gemini-1.5-flash", "openai/gpt-4o-mini"];
    let successResult = null;
    let lastError = null;

    // 4. GENERATE AI LOOP
    for (const modelId of models) {
        try {
            console.log(`💎 [AI Text] Generating (${mode}) with ${modelId}...`);
            
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://jitudigital.com",
                    "X-Title": "Jitu Viral",
                },
                body: JSON.stringify({
                    model: modelId, 
                    messages: [
                        { role: "system", content: SELECTED_SYSTEM_PROMPT },
                        { role: "user", content: USER_INSTRUCTION }
                    ],
                    temperature: 0.85, 
                    response_format: { type: "json_object" } 
                })
            });

            if (!response.ok) throw new Error("Provider Error");
            const data = await response.json();
            let content = data.choices?.[0]?.message?.content;
            
            try { JSON.parse(content); successResult = content; break; } 
            catch (jsonErr) { continue; }

        } catch (e) { lastError = e.message; }
    }

    if (successResult) {
        // 5. POTONG POIN SETELAH SUKSES
        await User.findByIdAndUpdate(userId, { $inc: { credits: -CREDIT_COST } });
        return NextResponse.json({ success: true, result: successResult });
    } else {
        const fallbackJSON = JSON.stringify({
            headline: "Topik Sedang Trending",
            caption: "Maaf, sistem mendeteksi topik ini sedang hangat atau sensitif. Silakan coba lagi nanti.",
            themeColor: "#FFD700",
            artStyle: "cinematic dark",
            slidesContent: []
        });
        return NextResponse.json({ success: true, result: fallbackJSON }); 
    }

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}