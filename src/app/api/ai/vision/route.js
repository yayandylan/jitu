import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';
// FIX: Hapus PointHistory, ganti ke Transaction
import Transaction from '@/models/Transaction';
import History from '@/models/History';
import ToolConfig from '@/models/ToolConfig';

// --- CONFIG DEFAULT ---
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

    // 2. PARSE DATA
    const formData = await req.formData();
    const file = formData.get('file');
    const lpLink = formData.get('lpLink');
    const requestType = formData.get('type'); // 'audit-iklan-lp' ATAU 'analisis-iklan-visual'

    if (!file) return NextResponse.json({ message: 'File gambar wajib diupload.' }, { status: 400 });

    // Mapping requestType ke Slug Config
    const toolSlug = requestType === 'analisis-iklan-visual' ? 'analisis-iklan' : 'audit-iklan-lp';
    const toolConfig = await ToolConfig.findOne({ slug: toolSlug });
    
    if (!toolConfig) return NextResponse.json({ message: 'Tool config not found.' }, { status: 404 });
    if (!toolConfig.isActive) return NextResponse.json({ message: 'Tool sedang maintenance.' }, { status: 503 });
    
    // Cek Saldo
    if (user.credits < toolConfig.creditCost) {
      return NextResponse.json({ message: 'Saldo poin tidak cukup.' }, { status: 402 });
    }

    // 3. PROSES INPUT
    let imageBase64 = await fileToBase64(file);
    let lpContent = "";
    
    if (requestType === 'audit-iklan-lp') {
        if(!lpLink) return NextResponse.json({ message: 'Link Landing Page wajib diisi.' }, { status: 400 });
        lpContent = await scrapeLandingPage(lpLink);
    }

    // 4. SIAPKAN PROMPT (SESUAI TIPE REQUEST)
    let systemPrompt = "";
    let userContent = [];

    if (requestType === 'audit-iklan-lp') {
        // --- MODE 1: AUDIT IKLAN VS LP ---
        systemPrompt = `
            BERTINDAKLAH SEBAGAI: "World-Class CRO Expert".
            TUGAS: Lakukan audit keselarasan (Message Match) antara GAMBAR IKLAN dan TEKS LANDING PAGE.

            FOKUS:
            1. Visual Continuity (Warna/Desain nyambung?).
            2. Headline Sync (Janji iklan dijawab di LP?).
            3. Offer Consistency (Promo sesuai?).

            OUTPUT MARKDOWN:
            # 🕵️ Laporan Message Match
            > **SKOR: [0-100]**
            ## 🩸 Diagnosa Masalah
            ## 🛠️ Rekomendasi Perbaikan
        `;
        
        userContent = [
            { type: "text", text: `Konten Teks LP: ${lpContent}` },
            { type: "image_url", image_url: { url: imageBase64 } }
        ];

    } else {
        // --- MODE 2: ANALISA DASHBOARD ---
        systemPrompt = `
            BERTINDAKLAH SEBAGAI: "Senior Media Buyer Expert".
            TUGAS: Baca screenshot dashboard iklan ini.
            
            INSTRUKSI:
            1. Ekstrak angka (CTR, CPC, ROAS, Spend).
            2. Lakukan "Root Cause Analysis".
            3. Berikan solusi teknis.

            OUTPUT MARKDOWN:
            # 🩺 Diagnosis Dashboard
            ## 📊 Data Terbaca
            ## 🧠 Bedah Masalah (Deep Dive)
            ## 🚀 Rekomendasi Tindakan (Stop/Scale/Optimize)
        `;

        userContent = [
            { type: "text", text: "Analisa dashboard ini secara detail." },
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
        model: toolConfig.aiModel || "openai/gpt-4o", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
        temperature: 0.5,
        max_tokens: 2000
      })
    });

    const aiData = await aiResponse.json();
    
    if (!aiResponse.ok || !aiData.choices) {
      console.error("AI Error:", aiData);
      throw new Error(aiData.error?.message || "Gagal analisa AI.");
    }

    const analysisResult = aiData.choices[0].message.content;

    // 6. TRANSAKSI & PENYIMPANAN
    
    // A. Kurangi Saldo
    user.credits -= toolConfig.creditCost;
    await user.save();

    // B. FIX: Catat Transaksi (Pengganti PointHistory)
    await Transaction.create({
      userId: user._id,
      type: 'out',
      amount: toolConfig.creditCost,
      description: `Vision AI: ${toolConfig.name}`,
      status: 'success'
    });

    // C. Simpan History
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