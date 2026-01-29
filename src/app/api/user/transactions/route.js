import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import transactionModel from '@/models/Transaction';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();
    
    const logs = await transactionModel.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}