import { NextResponse } from 'next/server';
// FIX: Menggunakan path relatif sesuai struktur folder Bapak
import connectDB from '@/lib/db'; 
import Voucher from '@/models/Voucher';

export async function GET() {
  try {
    await connectDB();
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, vouchers });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const newVoucher = await Voucher.create(body);
    return NextResponse.json({ success: true, voucher: newVoucher });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal menyimpan voucher." }, { status: 400 });
  }
}