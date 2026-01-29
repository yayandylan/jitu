import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';
// FIX: Ganti PointHistory ke Transaction
import Transaction from '@/models/Transaction'; 
import History from '@/models/History';
import ToolConfig from '@/models/ToolConfig';

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
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`Gagal akses URL`);
    const html = await res.text();
    return html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "").replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "").replace(/<[^>]+>/g, " ").slice(0, 15000);
  } catch (err) { return `Gagal scraping: ${err.message}`; }
};

export async function POST(req) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get('file');
    const lpLink = formData.get('lpLink');
    const requestType = formData.get('type');

    if (!file) return NextResponse.json({ message: 'File wajib diupload.' }, { status: 400 });

    const toolSlug = requestType === 'analisis-iklan-visual' ? 'analisis-iklan' : 'audit-iklan-lp';
    const toolConfig = await ToolConfig.findOne({ slug: toolSlug });
    
    if (!toolConfig) return NextResponse.json({ message: 'Tool config not found.' }, { status: 404 });
    if (user.credits < toolConfig.creditCost) return NextResponse.json({ message: 'Poin kurang.' }, { status: 402 });

    // PROSES DATA
    let imageBase64 = await fileToBase64(file);
    let lpContent = "";
    if (requestType === 'audit-iklan-lp' && lpLink) lpContent = await scrapeLandingPage(lpLink);

    // SYSTEM PROMPT
    let systemPrompt = requestType === 'audit-iklan-lp' 
        ? `Analisa keselarasan antara IKLAN (Gambar) dan LANDING PAGE (Teks). Berikan skor 0-100.` 
        : `Analisa screenshot dashboard iklan ini. Berikan insight performa.`;

    const userContent = requestType === 'audit-iklan-lp'
        ? [{ type: "text", text: `Isi LP: ${lpContent}` }, { type: "image_url", image_url: { url: imageBase64 } }]
        : [{ type: "text", text: "Analisa dashboard ini." }, { type: "image_url", image_url: { url: imageBase64 } }];

    // CALL AI
    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://jitudigital.com", 
      },
      body: JSON.stringify({
        model: toolConfig.aiModel || "openai/gpt-4o", 
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }]
      })
    });

    const aiData = await aiResponse.json();
    if (!aiResponse.ok) throw new Error(aiData.error?.message || "AI Error");
    const resultText = aiData.choices[0].message.content;

    // --- TRANSAKSI & PENYIMPANAN ---
    user.credits -= toolConfig.creditCost;
    await user.save();

    // FIX: Gunakan Transaction
    await Transaction.create({
      userId: user._id,
      type: 'out',
      amount: toolConfig.creditCost,
      description: `Vision AI: ${toolConfig.name}`,
      status: 'success'
    });

    await History.create({
      userId: user._id,
      toolType: requestType,
      title: file.name,
      inputData: { lpLink: lpLink || '-', fileName: file.name },
      resultData: { text: resultText }
    });

    return NextResponse.json({ success: true, result: resultText, remainingCredits: user.credits });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}