import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // Pastikan sudah install: npm install bcryptjs
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function PUT(req) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Login dulu' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    const { newPassword } = await req.json();

    await connectDB();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword });

    return NextResponse.json({ message: "✅ Password Berhasil Diganti!" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal ganti password" }, { status: 500 });
  }
}