import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db'; 
import Transaction from '@/models/Transaction'; 
import User from '@/models/User'; 

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    // 1. CEK AUTH & ADMIN ROLE
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    
    // Security Check: Pastikan yang request adalah Admin
    if (decoded.role !== 'admin') {
        return NextResponse.json({ message: 'Forbidden Access' }, { status: 403 });
    }

    await connectDB();

    // 2. Logic Filter Tanggal (Disiapkan jika nanti Frontend butuh filter)
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    let query = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); 
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); 

      query.createdAt = { $gte: start, $lte: end };
    }

    // 3. AMBIL DATA TRANSAKSI
    const transactions = await Transaction.find(query)
      .populate('userId', 'name email') // Ambil Nama & Email User
      .sort({ createdAt: -1 }); // Urutkan dari yang terbaru (Newest First)

    // 4. RETURN RESPONSE (FORMAT HARUS { data: ... })
    // Agar sinkron dengan frontend: setTransactions(data.data)
    return NextResponse.json({ 
        success: true,
        data: transactions 
    });

  } catch (error) {
    console.error("ADMIN TRANSACTIONS ERROR:", error);
    // Return data array kosong agar Frontend tidak crash
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}