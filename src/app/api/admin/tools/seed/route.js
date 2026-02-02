import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db'; 
import ToolConfig from '@/models/ToolConfig';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

// --- MIDDLEWARE INTERNAL: CEK ADMIN ---
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

// --- LOGIKA UTAMA SEEDING ---
async function runSeed() {
  // 1. CEK IZIN ADMIN
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ message: 'Akses ditolak. Login sebagai Admin.' }, { status: 403 });
  }

  try {
    await connectDB();

    // DAFTAR MASTER TOOLS (UPDATED SLUGS & MODELS)
    const tools = [
      {
        slug: 'riset-produk',
        name: 'Riset Produk Winning',
        category: 'TOOLS UTAMA',
        creditCost: 50,
        aiModel: 'google/gemini-2.0-flash-exp:free', // Hemat biaya
        isActive: true
      },
      {
        slug: 'validasi-market',
        name: 'Validasi Market',
        category: 'TOOLS UTAMA',
        creditCost: 50,
        aiModel: 'google/gemini-2.0-flash-exp:free',
        isActive: true
      },
      {
        slug: 'magic-ad-script', 
        name: 'Magic Ad Script',
        category: 'TOOLS UTAMA',
        creditCost: 30,
        aiModel: 'google/gemini-2.0-flash-exp:free', 
        isActive: true
      },
      {
        slug: 'landing-page',
        name: 'Landing Page Builder',
        category: 'TOOLS UTAMA',
        creditCost: 80,
        aiModel: 'openai/gpt-4o', // Tetap GPT-4o untuk kualitas copy LP
        isActive: true
      },
      // --- UPDATE: AD REVIEW (SLUG BARU) ---
      {
        slug: 'ad-review', // Dulu audit-iklan-lp
        name: 'Ad & LP Reviewer',
        category: 'TOOLS VISION',
        creditCost: 80,
        aiModel: 'google/gemini-2.0-flash-exp:free', 
        isActive: true
      },
      {
        slug: 'analisis-iklan',
        name: 'Analisis Dashboard Iklan',
        category: 'TOOLS VISION',
        creditCost: 75,
        aiModel: 'google/gemini-2.0-flash-exp:free', 
        isActive: true
      },
      {
        slug: 'kalkulator-ads',
        name: 'Kalkulator Ads',
        category: 'UTILITY',
        creditCost: 20,
        aiModel: 'openai/gpt-3.5-turbo',
        isActive: true
      },
      {
        slug: 'generate-image', 
        name: 'AI Image Generator',
        category: 'TOOLS VISUAL',
        creditCost: 50,
        aiModel: 'black-forest-labs/flux-1-schnell',
        isActive: true 
      },
      // --- UPDATE: GENERATE POST (SLUG BARU) ---
      {
        slug: 'generate-post', // Dulu fb-autopilot
        name: 'Generate Post (Sosmed)',
        category: 'AGENCY TOOLS',
        creditCost: 50, 
        aiModel: 'google/gemini-2.0-flash-exp:free', 
        isActive: true
      },
    ];

    // LAKUKAN OPERASI BULK WRITE
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

    const result = await ToolConfig.bulkWrite(operations);

    return NextResponse.json({ 
      success: true,
      message: `Database Tools berhasil di-refresh!`,
      details: {
        total: tools.length,
        modified: result.modifiedCount,
        inserted: result.upsertedCount,
        matched: result.matchedCount
      }
    });

  } catch (error) {
    console.error("Seed Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- EXPORT METHOD GET & POST ---
export async function GET() {
  return runSeed();
}

export async function POST() {
  return runSeed();
}