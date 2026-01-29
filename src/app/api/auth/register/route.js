import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db'; 
import User from '@/models/User';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    await connectDB();

    // 1. Cek email (gunakan lowercase agar sinkron)
    const normalizedEmail = email.toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    
    if (userExists) {
      return NextResponse.json({ message: 'Email sudah terdaftar' }, { status: 400 });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Tentukan role
    const userRole = normalizedEmail === 'admin@jitu.com' ? 'admin' : 'user';

    // 4. Simpan dengan .save() (lebih stabil di serverless)
    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
      credits: 500,
    });

    await newUser.save();

    return NextResponse.json({ message: 'Registrasi Berhasil' }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: 'Server Error: ' + error.message }, { status: 500 });
  }
}