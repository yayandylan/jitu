import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db'; 
import userModel from '@/models/User'; 
import ToolConfig from '@/models/ToolConfig';
import transactionModel from '@/models/Transaction'; 

// KITA HANYA BUTUH 1 INSTANCE OPENAI (TAPI CONNECT KE OPENROUTER)
const openRouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY, 
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req) {
  try {
    const { prompt, aspectRatio, productType } = await req.json();
    const token = cookies().get('token')?.value;

    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();
    const user = await userModel.findById(decoded.userId);
    
    // 1. AMBIL KONFIGURASI DARI DATABASE (ADMIN PANEL)
    const tool = await ToolConfig.findOne({ slug: 'generate-image' });

    if (!tool) return NextResponse.json({ message: 'Tool config not found' }, { status: 404 });
    if (user.credits < tool.creditCost) {
      return NextResponse.json({ message: 'Poin tidak cukup' }, { status: 402 });
    }

    // --- STEP 1: PROMPT ENHANCER (Teks ke Teks) ---
    // Kita pakai model murah & pintar (misal gpt-4o-mini atau llama-3) untuk mempercantik prompt
    // Bagian ini tidak perlu model mahal, default hardcode ke model efisien
    const enhancementRes = await openRouter.chat.completions.create({
      model: "openai/gpt-4o-mini", // Atau "meta-llama/llama-3-8b-instruct" (lebih murah)
      messages: [
        { 
          role: "system", 
          content: `You are a specialized Prompt Engineer for AI Image Generators (Flux/DALL-E).
          Convert user request into a detailed English prompt focusing on: Lighting, Texture, Camera Angle, and Realism.
          Context: Creating a 3D Mockup for "${productType}".
          Output: ONLY the prompt string.` 
        },
        { role: "user", content: `Description: ${prompt}. Aspect Ratio: ${aspectRatio}.` }
      ]
    });

    const enhancedPrompt = enhancementRes.choices[0].message.content;

    // --- STEP 2: IMAGE GENERATION (Via OpenRouter) ---
    // Disini kita gunakan model yang Bapak seting di Admin Panel (field: aiModel)
    // Contoh isi field aiModel di Admin: 'openai/dall-e-3' ATAU 'black-forest-labs/flux-1-schnell'
    
    let imageUrl = '';

    // OpenRouter handling untuk Image agak unik, kita pakai fetch standard agar fleksibel
    const modelToUse = tool.aiModel || 'black-forest-labs/flux-1-schnell'; // Default ke Flux (Murah & Bagus)

    const imageResponse = await fetch("https://openrouter.ai/api/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://jitudigital.com",
      },
      body: JSON.stringify({
        model: modelToUse, 
        prompt: enhancedPrompt,
        size: "1024x1024", // Standard size
        n: 1
      })
    });

    const imageJson = await imageResponse.json();

    if (!imageResponse.ok) {
        throw new Error(imageJson.error?.message || "Gagal generate gambar di OpenRouter");
    }

    // OpenRouter mengembalikan URL gambar
    imageUrl = imageJson.data[0].url;

    // --- STEP 3: POTONG SALDO & SAVE TRANSAKSI ---
    user.credits -= tool.creditCost;
    await user.save();

    await transactionModel.create({
      userId: user._id,
      amount: tool.creditCost,
      type: 'out',
      description: `Generate Image (${productType})`,
      status: 'success'
    });

    return NextResponse.json({ 
        success: true, 
        result: imageUrl,
        enhancedPrompt: enhancedPrompt 
    });

  } catch (error) {
    console.error("Image Gen Error:", error);
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}