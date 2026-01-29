import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db'; 
import User from '@/models/User';

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    await connectDB();

    // 1. Hash token dari URL untuk dicocokkan dengan yang di Database
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Cari User yang punya token ini DAN belum expired ($gt = greater than now)
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ message: 'Token tidak valid atau sudah kadaluarsa' }, { status: 400 });
    }

    // 3. Update Password Baru
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 4. Hapus Token (supaya tidak bisa dipakai lagi)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return NextResponse.json({ message: 'Password berhasil diubah' });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}