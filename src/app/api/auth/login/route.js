import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
// FIX IMPORT: Pakai jalur manual (mundur 4 langkah)
import connectDB from '@/lib/db'; 
import User from '@/models/User';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // 1. Validasi Input
    if (!email || !password) {
      return NextResponse.json({ message: 'Email dan Password wajib diisi' }, { status: 400 });
    }

    await connectDB();

    // 2. Cari User di Database (Termasuk Password-nya)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return NextResponse.json({ message: 'Email tidak ditemukan' }, { status: 401 });
    }

    // 3. Cek Password Cocok Gak?
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Password salah' }, { status: 401 });
    }

    // 4. Buat Token Rahasia (Kartu Akses)
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.NEXTAUTH_SECRET || 'rahasia_jitu', // Pastikan ini aman nanti
      { expiresIn: '7d' }
    );

    // 5. Simpan Token di Cookies
    cookies().set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 Hari
    });

    return NextResponse.json({ 
      message: 'Login Berhasil',
      user: { name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 });
  }
}