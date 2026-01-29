import { NextResponse } from 'next/server';
import connectDB from '@/lib/db'; // WAJIB 4 TINGKAT
import User from '@/models/User'; // WAJIB 'U' BESAR
import PromoPackage from '@/models/PromoPackage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const packages = await PromoPackage.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, packages });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    await connectDB();
    
    // Konversi angka agar masuk ke DB dengan benar
    const cleanData = {
      name: data.name,
      basePoints: Number(data.basePoints),
      bonusPoints: Number(data.bonusPoints || 0),
      price: Number(data.price),
    };

    const newPackage = await PromoPackage.create(cleanData);
    return NextResponse.json({ success: true, package: newPackage });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}