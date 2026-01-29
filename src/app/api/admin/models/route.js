import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

// --- MIDDLEWARE INTERNAL: CEK ADMIN ---
async function isAdminAuthorized() {
  const token = cookies().get('token')?.value;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    // Cek Role di Token
    if (decoded.role === 'admin') return true;
    
    // Double Check Database
    await connectDB();
    const user = await User.findById(decoded.userId);
    return user && user.role === 'admin';
  } catch (error) {
    return false;
  }
}

export async function GET() {
  // 1. Cek Admin
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    // 2. Tarik Data Live dari OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Content-Type": "application/json",
        "Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Jitu Digital Admin", 
      }
    });
    
    const data = await response.json();
    
    if (!data.data) throw new Error("Gagal fetch data OpenRouter");

    // 3. Filter Hanya Model Bagus (Agar Dropdown tidak penuh sampah)
    // Kita hanya mau: GPT, Claude, Gemini, Llama 3, dan Flux (Gambar)
    const ALLOWED_KEYWORDS = ['gpt-4', 'claude-3.5', 'gemini', 'llama-3', 'flux', 'mistral-large'];
    
    const relevantModels = data.data.filter(model => 
        ALLOWED_KEYWORDS.some(keyword => model.id.toLowerCase().includes(keyword))
    );

    // 4. Setting Konstanta Ekonomi
    const KURS_DOLLAR = 16200; // Update Kurs
    const AVG_TOKENS_PER_GEN = 1500; // Estimasi 1 output standar

    // 5. Mapping Data untuk Frontend
    const formattedModels = relevantModels.map(model => {
      // Harga raw per 1 token (USD) - Kadang OpenRouter kasih -1 kalau gratis/beta
      const promptPriceUSD = Math.max(0, parseFloat(model.pricing.prompt));
      const completionPriceUSD = Math.max(0, parseFloat(model.pricing.completion));

      // Hitung HPP Rupiah per 1 Juta Token (Satuan standar industri)
      // Rumus: (Harga Prompt + Harga Completion) / 2 * 1Juta * Kurs
      const avgPriceUSD = (promptPriceUSD + completionPriceUSD); // Kita asumsikan rasio 1:1 input output biar aman
      const costPer1M_IDR = avgPriceUSD * 1000000 * KURS_DOLLAR;
      
      // Hitung Estimasi HPP per 1x Klik (Real Cost)
      // Gambar (Flux) biasanya dihitung per image, tapi OpenRouter menormalkan ke "per request"
      let estimatedHpp = 0;
      
      if (model.id.includes('flux') || model.id.includes('dall-e')) {
        // Khusus Image Gen, pricing.image biasanya ada, kalau tidak pakai prompt price
        const imagePrice = parseFloat(model.pricing.image) || 0.04; // Fallback $0.04
        estimatedHpp = imagePrice * KURS_DOLLAR;
      } else {
        // Teks Gen
        estimatedHpp = (avgPriceUSD * AVG_TOKENS_PER_GEN) * KURS_DOLLAR;
      }

      return {
        id: model.id,
        name: model.name,
        
        // Data untuk Display UI Dropdown
        priceLabel: `est. HPP: Rp ${Math.ceil(estimatedHpp).toLocaleString('id-ID')} / req`, 
        
        // Data Raw untuk Kalkulator Margin
        perTokenPrompt: promptPriceUSD,
        perTokenCompletion: completionPriceUSD,
      };
    });

    // 6. Sorting Pintar (GPT-4o & Claude 3.5 paling atas)
    formattedModels.sort((a, b) => {
        const priority = ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'black-forest-labs/flux-1-schnell'];
        const indexA = priority.findIndex(p => a.id.includes(p));
        const indexB = priority.findIndex(p => b.id.includes(p));
        
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        return a.name.localeCompare(b.name);
    });

    return NextResponse.json(formattedModels);

  } catch (error) {
    console.error("Gagal sinkron harga model:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}