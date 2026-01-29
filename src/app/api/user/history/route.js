import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import PointHistory from '@/models/PointHistory';

export async function GET(req) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();

    const limit = Number(new URL(req.url).searchParams.get('limit')) || 10;

    // Ambil history tipe 'out' (penggunaan) atau 'reduce' (dikurangi admin)
    const history = await PointHistory.find({ 
        userId: decoded.userId,
        type: { $in: ['out', 'reduce'] } // Hanya tampilkan pengeluaran
    })
    .sort({ createdAt: -1 })
    .limit(limit);

    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching history' }, { status: 500 });
  }
}