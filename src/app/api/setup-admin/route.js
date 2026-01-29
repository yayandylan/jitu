import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db'; 
import User from '@/models/User';

export async function GET(req) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Login dulu!' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();

    // Ubah user yang sedang login menjadi ADMIN
    const user = await User.findByIdAndUpdate(
      decoded.userId, 
      { role: 'admin' }, // <--- INI KUNCINYA
      { new: true }
    );

    return NextResponse.json({ 
      message: `🎉 Selamat! Akun ${user.email} sekarang sudah jadi ADMIN!`,
      user 
    });

  } catch (error) {
    return NextResponse.json({ message: 'Gagal' }, { status: 500 });
  }
}