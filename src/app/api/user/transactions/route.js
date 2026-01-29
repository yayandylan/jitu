import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
// FIX: Hapus PointHistory, pakai Transaction saja
import Transaction from '@/models/Transaction'; 

export async function GET(req) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();

    const limit = Number(new URL(req.url).searchParams.get('limit')) || 20;

    // Ambil semua transaksi (Topup & Usage)
    const transactions = await Transaction.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ transactions });

  } catch (error) {
    console.error("Transaction Error:", error);
    return NextResponse.json({ message: 'Error fetching transactions' }, { status: 500 });
  }
}