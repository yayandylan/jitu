import { NextResponse } from 'next/server';
// FIX: Path relatif naik 4 tingkat untuk folder validate
import connectDB from '@/lib/db'; 
import Voucher from '@/models/Voucher';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code')?.toUpperCase();

    if (!code) return NextResponse.json({ success: false, message: "Kode wajib diisi" }, { status: 400 });

    const voucher = await Voucher.findOne({ code, status: 'Active' });

    if (!voucher) {
      return NextResponse.json({ success: false, message: "Voucher tidak ditemukan atau sudah tidak aktif" }, { status: 404 });
    }

    // Cek Limit Penggunaan
    if (voucher.limit > 0 && voucher.used >= voucher.limit) {
      return NextResponse.json({ success: false, message: "Kuota voucher sudah habis" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      voucher: {
        code: voucher.code,
        type: voucher.type,
        value: voucher.value
      }
    });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Gagal memvalidasi" }, { status: 500 });
  }
}