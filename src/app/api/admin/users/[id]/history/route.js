import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params; // ID User
    // Ambil 10 transaksi terakhir user ini
    const history = await Transaction.find({ userId: id }).sort({ createdAt: -1 }).limit(10);
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}