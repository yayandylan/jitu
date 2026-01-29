import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

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
  // 1. Cek Admin
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    // 2. Fetch Data
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Content-Type": "application/json",
        "Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Jitu Digital Admin", 
      }
    });
    
    // SAFEGUARD: Jika OpenRouter Error, return array kosong (jangan throw error)
    if (!response.ok) {
      console.error("OpenRouter Error:", response.status);
      return NextResponse.json([]); 
    }

    const data = await response.json();
    
    // SAFEGUARD: Jika format data aneh
    if (!data || !data.data || !Array.isArray(data.data)) {
      return NextResponse.json([]);
    }

    // 3. Filter & Map Data
    const relevantModels = data.data.filter(model => {
       if(!model || !model.id) return false;
       const id = model.id.toLowerCase();
       return ['gpt-4', 'claude-3.5', 'gemini', 'llama-3', 'flux', 'mistral'].some(k => id.includes(k));
    });

    const KURS_DOLLAR = 16200; 
    const AVG_TOKENS_PER_GEN = 1500; 

    const formattedModels = relevantModels.map(model => {
      const pricing = model.pricing || {};
      const promptPriceUSD = Math.max(0, parseFloat(pricing.prompt) || 0);
      const completionPriceUSD = Math.max(0, parseFloat(pricing.completion) || 0);

      const avgPriceUSD = (promptPriceUSD + completionPriceUSD); 
      let estimatedHpp = (avgPriceUSD * AVG_TOKENS_PER_GEN) * KURS_DOLLAR;
      
      if (model.id.includes('flux') || model.id.includes('dall-e')) {
        const imagePrice = parseFloat(pricing.image) || 0.04; 
        estimatedHpp = imagePrice * KURS_DOLLAR;
      }

      return {
        id: model.id,
        name: model.name || model.id,
        priceLabel: `est. HPP: Rp ${Math.ceil(estimatedHpp).toLocaleString('id-ID')} / req`, 
        perTokenPrompt: promptPriceUSD,
        perTokenCompletion: completionPriceUSD,
      };
    });

    formattedModels.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(formattedModels);

  } catch (error) {
    console.error("API Models Error:", error);
    return NextResponse.json([], { status: 200 }); // Return array kosong biar aman
  }
}