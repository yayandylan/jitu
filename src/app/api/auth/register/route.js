import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
// FIX: Gunakan jalur manual (mundur 4 langkah)
import connectDB from '@/lib/db'; 
import User from '@/models/User';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    // 1. Validasi Input
    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Mohon isi semua data' }, { status: 400 });
    }

    await connectDB();

    // 2. Cek apakah email sudah ada
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ message: 'Email sudah terdaftar' }, { status: 400 });
    }

    // 3. Enkripsi Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Cek Admin (Logic Tambahan)
    const userRole = email === 'admin@jitu.com' ? 'admin' : 'user';

    // 5. Simpan User
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: userRole,
      credits: 500, // Bonus 500 Poin untuk pengguna baru!
    });

    return NextResponse.json({ message: 'Registrasi Berhasil' }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan server: ' + error.message }, { status: 500 });
  }
}