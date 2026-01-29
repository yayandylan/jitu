import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
// FIX: Kita hapus PointHistory, sekarang semua terpusat di Transaction
import Transaction from '@/models/Transaction'; 

export const dynamic = 'force-dynamic'; // Agar data selalu fresh

export async function GET(req) {
  try {
    // 1. Cek Auth
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();

    // 2. Ambil parameter limit (opsional, default 20)
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 20;

    // 3. Ambil data Transaction milik User
    // Ini akan menampilkan:
    // - Type 'in': Top Up (Status pending/success)
    // - Type 'out': Penggunaan Tools (Status success)
    const transactions = await Transaction.find({ userId: decoded.userId })
      .sort({ createdAt: -1 }) // Urutkan dari yang terbaru
      .limit(limit);

    return NextResponse.json({ 
      success: true,
      transactions 
    });

  } catch (error) {
    console.error("User Transaction API Error:", error);
    return NextResponse.json({ message: 'Gagal mengambil data transaksi' }, { status: 500 });
  }
}