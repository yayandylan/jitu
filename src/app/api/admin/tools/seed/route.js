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
    // Cek Role di Token
    if (decoded.role === 'admin') return true;
    
    // Cek Role di DB (Double Check)
    await connectDB();
    const user = await User.findById(decoded.userId);
    return user && user.role === 'admin';
  } catch (error) {
    return false;
  }
}

// --- LOGIKA UTAMA SEEDING (DIPISAH AGAR BISA DIPANGGIL GET & POST) ---
async function runSeed() {
  // 1. CEK IZIN ADMIN
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ message: 'Akses ditolak. Login sebagai Admin.' }, { status: 403 });
  }

  try {
    await connectDB();

    // DAFTAR MASTER TOOLS LENGKAP
    const tools = [
      {
        slug: 'riset-produk',
        name: 'Riset Produk Winning',
        category: 'TOOLS UTAMA',
        creditCost: 50,
        aiModel: 'openai/gpt-4o-mini',
        isActive: true
      },
      {
        slug: 'validasi-market',
        name: 'Validasi Market',
        category: 'TOOLS UTAMA',
        creditCost: 50,
        aiModel: 'openai/gpt-4o-mini',
        isActive: true
      },
      {
        slug: 'magic-ad-script', 
        name: 'Magic Ad Script',
        category: 'TOOLS UTAMA',
        creditCost: 30,
        aiModel: 'openai/gpt-4o-mini', 
        isActive: true
      },
      {
        slug: 'landing-page',
        name: 'Landing Page Builder',
        category: 'TOOLS UTAMA',
        creditCost: 80,
        aiModel: 'openai/gpt-4o', 
        isActive: true
      },
      {
        slug: 'audit-iklan-lp',
        name: 'Audit Funnel (LP vs Ads)',
        category: 'TOOLS VISION',
        creditCost: 75,
        aiModel: 'openai/gpt-4o', 
        isActive: true
      },
      {
        slug: 'analisis-iklan',
        name: 'Analisis Dashboard Iklan',
        category: 'TOOLS VISION',
        creditCost: 75,
        aiModel: 'openai/gpt-4o', 
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
      // --- TOOL PENTING UNTUK GAMBAR ---
      {
        slug: 'generate-image', 
        name: 'AI Image Generator',
        category: 'TOOLS VISUAL',
        creditCost: 50,
        aiModel: 'black-forest-labs/flux-1-schnell',
        isActive: true 
      },
      // --- TOOL PENTING UNTUK FB AUTOPILOT ---
      {
        slug: 'fb-autopilot', 
        name: 'FB Autopilot Creator',
        category: 'AGENCY TOOLS',
        creditCost: 150, 
        aiModel: 'openai/gpt-4o-mini', 
        isActive: true
      },
    ];

    // LAKUKAN OPERASI BULK WRITE (Update jika ada, Insert jika baru)
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
      message: `Database berhasil di-update!`,
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
// Agar Bapak bisa membukanya lewat Browser (GET) atau Postman (POST)
export async function GET() {
  return runSeed();
}

export async function POST() {
  return runSeed();
}