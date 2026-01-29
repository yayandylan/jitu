import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/db'; 
import userModel from '@/models/User';

export async function POST(req) {
  try {
    const { email } = await req.json();
    await connectDB();

    const user = await userModel.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Email tidak terdaftar' }, { status: 404 });
    }

    // 1. Buat Token Random
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hash token dan simpan ke DB (berlaku 1 jam)
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000; // 1 Jam

    await user.save();

    // 3. Link Reset (Kirim ini ke email user nanti)
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${resetToken}`;
    
    console.log("Link Reset Password:", resetUrl); // Cek di terminal VS Code

    return NextResponse.json({ message: 'Instruksi reset sudah dikirim ke email' });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memproses permintaan' }, { status: 500 });
  }
}