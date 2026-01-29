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
    // Cek Role di Token & Database (Double Check)
    if (decoded.role === 'admin') return true;
    
    await connectDB();
    const user = await User.findById(decoded.userId);
    return user && user.role === 'admin';
  } catch (error) {
    return false;
  }
}

export async function POST() { 
  // 1. CEK IZIN ADMIN
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ message: 'Akses ditolak. Hanya Admin yang boleh melakukan Seeding.' }, { status: 403 });
  }

  try {
    await connectDB();

    // DAFTAR MASTER TOOLS (Sesuai dengan Logic API yang sudah kita buat)
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
        aiModel: 'openai/gpt-4o', // Butuh model pintar untuk coding HTML
        isActive: true
      },
      {
        slug: 'audit-iklan-lp', // PENTING: Slug ini harus sama dengan logic di api/ai/vision
        name: 'Audit Funnel (LP vs Ads)',
        category: 'TOOLS VISION',
        creditCost: 75,
        aiModel: 'openai/gpt-4o', // Butuh Vision (Melihat Gambar)
        isActive: true
      },
      {
        slug: 'analisis-iklan',
        name: 'Analisis Dashboard Iklan',
        category: 'TOOLS VISION',
        creditCost: 75,
        aiModel: 'openai/gpt-4o', // Butuh Vision (Membaca Angka Screenshot)
        isActive: true
      },
      {
        slug: 'kalkulator-ads',
        name: 'Kalkulator Ads',
        category: 'UTILITY',
        creditCost: 20,
        aiModel: 'openai/gpt-3.5-turbo', // Cukup model murah
        isActive: true
      },
      {
        slug: 'generate-gambar',
        name: 'Generate Gambar AI',
        category: 'COMING SOON',
        creditCost: 100,
        aiModel: 'black-forest-labs/flux-1-schnell', // Model Gambar
        isActive: false // Masih Coming Soon
      },
    ];

    // LAKUKAN OPERASI UPSERT (Update jika ada, Insert jika belum)
    const operations = tools.map(tool => ({
      updateOne: {
        filter: { slug: tool.slug },
        update: { 
          $set: tool,
          $setOnInsert: { costPerToken: 0 } // Default HPP 0
        },
        upsert: true
      }
    }));

    const result = await ToolConfig.bulkWrite(operations);

    return NextResponse.json({ 
      success: true,
      message: `Database Tools berhasil disinkronkan!`,
      details: {
        totalDefinitions: tools.length,
        modified: result.modifiedCount,
        inserted: result.upsertedCount
      }
    });

  } catch (error) {
    console.error("Seed Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}