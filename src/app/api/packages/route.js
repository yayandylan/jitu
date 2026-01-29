import { NextResponse } from 'next/server';
import connectDB from '@/lib/db'; // Di sini cukup 3 tingkat
import PromoPackage from '@/models/PromoPackage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    // Ambil paket yang akan ditampilkan ke user
    const packages = await PromoPackage.find().sort({ basePoints: 1 });
    return NextResponse.json({ success: true, packages });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}