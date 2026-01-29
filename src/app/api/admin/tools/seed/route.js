import { NextResponse } from 'next/server';
import connectDB from '@/lib/db'; 
import ToolConfig from '@/models/ToolConfig';

export const dynamic = 'force-dynamic';

export async function POST() { 
  try {
    await connectDB();

    // DAFTAR MASTER TOOLS (Sumber Kebenaran Tunggal)
    const tools = [
      {
        slug: 'riset-produk',
        name: 'Riset Produk Winning',
        category: 'TOOLS UTAMA',
        badge: 'HOT',
        creditCost: 50,
        aiModel: 'openai/gpt-4o-mini',
        isActive: true
      },
      {
        slug: 'validasi-market',
        name: 'Validasi Market & CTWA',
        category: 'TOOLS UTAMA',
        badge: null,
        creditCost: 50,
        aiModel: 'openai/gpt-4o-mini',
        isActive: true
      },
      {
        slug: 'magic-ad-script', 
        name: 'Magic Ad Script',
        category: 'TOOLS UTAMA',
        badge: null,
        creditCost: 30,
        aiModel: 'openai/gpt-4o', 
        isActive: true
      },
      {
        slug: 'landing-page',
        name: 'Landing Page Builder',
        category: 'TOOLS UTAMA',
        badge: 'HOT',
        creditCost: 80,
        aiModel: 'openai/gpt-4o',
        isActive: true
      },
      {
        slug: 'ad-review', // Ini adalah "Audit Funnel Ads"
        name: 'Audit Funnel Ads',
        category: 'TOOLS UTAMA',
        badge: null,
        creditCost: 30,
        aiModel: 'openai/gpt-4o-mini',
        isActive: true
      },
      {
        slug: 'analisis-iklan',
        name: 'Analisis Iklan',
        category: 'TOOLS UTAMA',
        badge: null,
        creditCost: 40,
        aiModel: 'openai/gpt-4o-mini',
        isActive: true
      },
      {
        slug: 'kalkulator-ads',
        name: 'Kalkulator Ads',
        category: 'TOOLS UTAMA',
        badge: null,
        creditCost: 20,
        aiModel: 'openai/gpt-3.5-turbo',
        isActive: true
      },
      {
        slug: 'generate-gambar',
        name: 'Generate Gambar AI',
        category: 'COMING SOON',
        badge: 'SOON',
        creditCost: 100,
        aiModel: 'openai/dall-e-3',
        isActive: false 
      },
    ];

    // LAKUKAN OPERASI UPSERT SECARA MASSIF
    const operations = tools.map(tool => ({
      updateOne: {
        filter: { slug: tool.slug },
        update: { 
          $set: tool,
          $setOnInsert: { costPerToken: 0 } 
        },
        upsert: true
      }
    }));

    // Gunakan bulkWrite agar jauh lebih cepat dan hemat koneksi database
    const result = await ToolConfig.bulkWrite(operations);

    return NextResponse.json({ 
      success: true,
      message: `Database berhasil disinkronkan!`,
      details: {
        total: tools.length,
        updated: result.upsertedCount + result.modifiedCount
      }
    });

  } catch (error) {
    console.error("Seed Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}