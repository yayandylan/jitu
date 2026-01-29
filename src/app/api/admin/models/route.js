import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic'; // Wajib agar selalu fetch data baru

async function isAdminAuthorized() {
  const token = cookies().get('token')?.value;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    if (decoded.role === 'admin') return true;
    await connectDB();
    const user = await User.findById(decoded.userId);
    return user && user.role === 'admin';
  } catch (error) {
    return false;
  }
}

export async function GET() {
  // 1. Security Check
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    // 2. Fetch LIVE data dari OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Content-Type": "application/json",
        "Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Jitu Digital Admin", 
      }
    });
    
    if (!response.ok) return NextResponse.json([]); // Fail safe

    const data = await response.json();
    
    // Validasi data
    if (!data || !data.data || !Array.isArray(data.data)) {
      return NextResponse.json([]);
    }

    // 3. Konstanta Ekonomi
    const KURS_DOLLAR = 16200; 
    const AVG_TOKENS_PER_GEN = 1500; // Asumsi rata-rata pemakaian token per request

    // 4. Mapping Data (TANPA FILTER)
    const allModels = data.data.map(model => {
      // Ambil pricing (fallback ke 0 jika gratis/error)
      const pricing = model.pricing || {};
      const promptPriceUSD = Math.max(0, parseFloat(pricing.prompt) || 0);
      const completionPriceUSD = Math.max(0, parseFloat(pricing.completion) || 0);
      
      // Cek apakah ini model gambar (biasanya punya harga per image)
      const isImageModel = model.architecture?.modality?.includes('text->image') || 
                           model.id.includes('flux') || 
                           model.id.includes('dall-e') ||
                           model.id.includes('midjourney');

      // Hitung Estimasi Modal (HPP) dalam Rupiah
      let estimatedHpp = 0;

      if (isImageModel) {
         // HPP per Gambar
         const imagePrice = parseFloat(pricing.image) || 0.04; // Fallback $0.04
         estimatedHpp = imagePrice * KURS_DOLLAR;
      } else {
         // HPP per Chat (Teks)
         const avgPriceUSD = (promptPriceUSD + completionPriceUSD); 
         estimatedHpp = (avgPriceUSD * AVG_TOKENS_PER_GEN) * KURS_DOLLAR;
      }

      return {
        id: model.id,
        name: model.name || model.id,
        contextLength: model.context_length || 4096,
        priceLabel: `HPP: ±Rp ${Math.ceil(estimatedHpp).toLocaleString('id-ID')} / req`,
        
        // Data Raw untuk Kalkulator Margin Frontend
        perTokenPrompt: promptPriceUSD,
        perTokenCompletion: completionPriceUSD,
        isImageModel: isImageModel
      };
    });

    // 5. Sorting: Taruh model populer di atas, sisanya A-Z
    allModels.sort((a, b) => {
        const priority = ['openai/gpt-4o', 'anthropic/claude-3.5', 'google/gemini', 'meta-llama', 'deepseek'];
        
        // Cek prioritas
        const indexA = priority.findIndex(p => a.id.includes(p));
        const indexB = priority.findIndex(p => b.id.includes(p));

        // Jika keduanya prioritas, urutkan berdasarkan urutan prioritas
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        // Jika salah satu prioritas, dia menang
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;

        // Sisanya urut nama
        return a.name.localeCompare(b.name);
    });

    return NextResponse.json(allModels);

  } catch (error) {
    console.error("OpenRouter Sync Error:", error);
    return NextResponse.json([], { status: 200 });
  }
}