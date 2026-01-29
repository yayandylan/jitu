import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import PointHistory from '@/models/PointHistory';
import Transaction from '@/models/Transaction'; // Jika ada model Topup/Transaction

export async function GET(req) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();

    const limit = Number(new URL(req.url).searchParams.get('limit')) || 10;

    // 1. Ambil History Poin (Penggunaan Tools & Bonus)
    const pointLogs = await PointHistory.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // 2. Ambil History Topup (Pending/Success)
    // Jika Bapak punya model Transaction terpisah untuk Topup
    const topupLogs = await Transaction.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // 3. Gabungkan & Format Data
    const combinedLogs = [
      ...pointLogs.map(log => ({
        _id: log._id,
        type: log.type, // 'in' (bonus) atau 'out' (usage)
        amount: log.amount,
        description: log.description,
        status: 'success', // History poin pasti sukses
        createdAt: log.createdAt
      })),
      ...topupLogs.map(log => ({
        _id: log._id,
        type: 'in', // Topup itu masuk
        amount: log.amount, // Poin yang didapat
        description: `Top Up Saldo (${log.status})`,
        status: log.status, // pending, success, failed
        createdAt: log.createdAt
      }))
    ];

    // Urutkan lagi setelah digabung (Terbaru diatas)
    const sortedLogs = combinedLogs
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    return NextResponse.json({ transactions: sortedLogs });

  } catch (error) {
    console.error("Transaction Error:", error);
    return NextResponse.json({ message: 'Error fetching transactions' }, { status: 500 });
  }
}