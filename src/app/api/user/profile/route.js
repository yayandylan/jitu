import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function PUT(req) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Login dulu' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    const { name, phone } = await req.json();

    await connectDB();
    await User.findByIdAndUpdate(decoded.userId, { name, phone });

    return NextResponse.json({ message: "✅ Profil berhasil diperbarui!" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal update profil" }, { status: 500 });
  }
}