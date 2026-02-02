import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(req) {
  try {
    await connectDB();
    const { email, otp } = await req.json();

    // 1. Cari User berdasarkan Email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan." }, { status: 404 });
    }

    // 2. Validasi Kode & Expired Time
    if (user.verificationCode !== otp) {
      return NextResponse.json({ message: "Kode verifikasi salah!" }, { status: 400 });
    }

    if (new Date() > user.verificationExpires) {
        return NextResponse.json({ message: "Kode kadaluarsa. Silakan daftar ulang." }, { status: 400 });
    }

    // 3. Aktifkan User
    user.isVerified = true;
    user.verificationCode = undefined;   // Hapus kode agar tidak bisa dipakai lagi
    user.verificationExpires = undefined;
    await user.save();

    return NextResponse.json({ success: true, message: "Akun berhasil diverifikasi!" });

  } catch (error) {
    return NextResponse.json({ message: "Gagal verifikasi." }, { status: 500 });
  }
}