import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Import Manual
import connectDB from '@/lib/db'; 
import User from '@/models/User';
import ToolConfig from '@/models/ToolConfig';

async function getUser() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();
    return await User.findById(decoded.userId);
  } catch (error) { return null; }
}

// KITA NAIKKAN BATAS WAKTU JADI 5 MENIT (Supaya Gemini Pro puas menggambar)
export const maxDuration = 300; 
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const { prompt, aspectRatio, productType } = await req.json();

    const user = await getUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const toolConfig = await ToolConfig.findOne({ slug: 'generate-image' });
    const cost = toolConfig ? toolConfig.creditCost : 100; 
    
    if (user.credits < cost) {
      return NextResponse.json({ message: `Poin Kurang! Butuh ${cost} poin.` }, { status: 402 });
    }

    // Setting Ukuran
    let width = 1024, height = 1024;
    if (aspectRatio === 'portrait') { width = 768; height = 1344; }
    if (aspectRatio === 'landscape') { width = 1344; height = 768; }

    // Prompt Engineering
    let systemEnhancer = "";
    if (productType === 'ebook') systemEnhancer = "3D Book Cover Mockup, standing on table, cinematic lighting";
    else if (productType === 'course') systemEnhancer = "Online Course Mockup on MacBook and iPad screen, studio background";
    else if (productType === 'software') systemEnhancer = "SaaS Dashboard Interface on glass screen, futuristic neon";
    else systemEnhancer = "Commercial product photography";

    // Prompt Asli (Panjang)
    const finalPrompt = `${systemEnhancer}, ${prompt}, 8k resolution, photorealistic`;
    
    let imageUrl = "";

    // --- PERCOBAAN 1: GOOGLE GEMINI 3 PRO (Yang Jago Gambar) ---
    try {
      console.log("1. Mengontak Google Gemini 3 Pro...");
      
      const controller = new AbortController();
      // Timeout 120 detik (2 Menit)
      const timeoutId = setTimeout(() => controller.abort(), 120000); 

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "Jitu Digital",
        },
        body: JSON.stringify({
          // KITA PAKAI MODEL PRO (Karena Flash sering gagal gambar)
          model: "google/gemini-3-pro-image-preview", 
          messages: [
            {
              role: "user",
              content: `Generate image: ${finalPrompt}. RETURN ONLY THE IMAGE URL.`
            }
          ]
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      // Cari URL
      const urlRegex = /(https?:\/\/[^\s)]+)/g;
      const match = content.match(urlRegex);

      if (match && match.length > 0) {
        // Ambil URL yang valid (biasanya dari googleusercontent)
        imageUrl = match.find(url => url.includes('googleusercontent') || url.includes('http')) || match[0];
        console.log("   ✅ Sukses Google Gemini!");
      } else {
        throw new Error("Google tidak kasih link gambar.");
      }

    } catch (googleError) {
      // --- PERCOBAAN 2: POLLINATIONS (Ban Serep) ---
      console.warn("⚠️ Google Gagal/Lama. Switch ke Pollinations...");
      
      // TRIK RAHASIA: Pangkas prompt jadi pendek agar URL tidak broken
      // Kita ambil intinya saja (maksimal 150 karakter)
      const safePrompt = finalPrompt.substring(0, 150).replace(/[^\w\s,]/gi, '');
      const randomSeed = Math.floor(Math.random() * 1000);
      
      // URL yang lebih 'ramah' browser
      imageUrl = `https://pollinations.ai/p/${encodeURIComponent(safePrompt)}?width=${width}&height=${height}&seed=${randomSeed}&model=flux&nologo=true`;
      
      console.log("   ✅ Sukses Pollinations (Backup Mode)!");
    }

    if (imageUrl) {
      user.credits -= cost;
      await user.save();
      
      return NextResponse.json({ 
        result: imageUrl, 
        remainingCredits: user.credits 
      });
    } else {
      throw new Error("Gagal total generate gambar.");
    }

  } catch (error) {
    console.error("SERVER ERROR:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}