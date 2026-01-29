import { NextResponse } from 'next/server';
// PERBAIKAN: Naik 5 tingkat untuk mencapai folder 'lib' dan 'models'
import connectDB from '@/lib/db'; 
import Transaction from '@/models/Transaction';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ message: 'User ID diperlukan' }, { status: 400 });
    }

    const history = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(history);
  } catch (error) {
    console.error("History API Error:", error);
    return NextResponse.json({ message: "Gagal mengambil riwayat transaksi" }, { status: 500 });
  }
}