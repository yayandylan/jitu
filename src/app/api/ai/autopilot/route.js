import { NextResponse } from 'next/server';
import { getLatestNews } from '@/lib/newsScraper';

export async function POST(req) {
  try {
    const { topic } = await req.json();

    // 1. CARI BERITA
    const news = await getLatestNews(topic);
    if (!news) {
      return NextResponse.json({ message: "Tidak ada berita ditemukan untuk topik ini." }, { status: 404 });
    }

    // 2. RACIK DENGAN AI (OPENROUTER)
    const prompt = `
      Saya adalah konten kreator Facebook. 
      Tolong buatkan konten berdasarkan berita ini:
      JUDUL: ${news.title}
      CUPLIKAN: ${news.snippet}

      TUGASMU:
      1. Buat CAPTION Facebook yang interaktif, gaya bahasa santai/bercerita, gunakan emoji, dan akhiri dengan pertanyaan (Call to Comment). Jangan terlalu kaku seperti wartawan.
      2. Buat IMAGE PROMPT (Bahasa Inggris) untuk men-generate gambar yang sangat menarik (Hyper-realistic atau 3D Illustration) yang menggambarkan inti berita tersebut.

      FORMAT JSON (Wajib JSON murni):
      {
        "caption": "Isi caption disini...",
        "imagePrompt": "A highly detailed hyper-realistic photo of..."
      }
    `;

    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://jitu.digital", 
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // Atau model lain yang Bapak set di admin
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" } // Memaksa output JSON rapi
      })
    });

    const aiData = await aiRes.json();
    const content = JSON.parse(aiData.choices[0].message.content);

    return NextResponse.json({
      success: true,
      source: news,
      result: content
    });

  } catch (error) {
    console.error("Autopilot Error:", error);
    return NextResponse.json({ message: "Gagal memproses autopilot" }, { status: 500 });
  }
}