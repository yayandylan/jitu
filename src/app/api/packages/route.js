import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
// FIX: Import model PromoPackage yang baru dibuat
import PromoPackage from '@/models/PromoPackage'; 

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    
    // Ambil paket aktif, urutkan berdasarkan harga termurah
    const packages = await PromoPackage.find({ isActive: true }).sort({ price: 1 });
    
    // Jika kosong (belum disetting admin), return array kosong (frontend akan pakai default)
    return NextResponse.json({ success: true, packages });

  } catch (error) {
    console.error("Package API Error:", error);
    return NextResponse.json({ success: false, packages: [] });
  }
}