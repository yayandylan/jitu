import { NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer'; // Panggil Tukang Pos
import connectDB from '@/lib/db'; 
import User from '@/models/User';

export async function POST(req) {
  try {
    const { email } = await req.json();
    await connectDB();

    // 1. Cek Email User
    // Gunakan lowercase agar pencarian akurat
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      // Demi keamanan, jangan kasih tahu kalau email gak ada (biar gak ditebak hacker)
      // Tetap bilang "Email terkirim" walau aslinya tidak.
      return NextResponse.json({ message: 'Jika email terdaftar, instruksi reset akan dikirim.' });
    }

    // 2. Buat Token Random
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 3. Hash token dan simpan ke DB
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 3600000; // Expired dalam 1 Jam

    await user.save();

    // 4. Buat Link Reset
    // Pastikan NEXTAUTH_URL sudah di-set di Vercel (https://jitudigital.com)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;
    
    // 5. KIRIM EMAIL (PENTING!)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Sesuai settingan Vercel Bapak
        pass: process.env.GMAIL_APP_PASSWORD, 
      },
    });

    const mailOptions = {
      from: `"Jitu Security Team" <${process.env.GMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'Reset Password - Jitu Digital 🔒',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #DC2626;">Permintaan Reset Password</h2>
          <p>Seseorang (semoga Anda) telah meminta reset password untuk akun Jitu Digital.</p>
          <p>Klik tombol di bawah ini untuk membuat password baru (Link berlaku 1 jam):</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password Saya</a>
          </div>

          <p style="font-size: 12px; color: #666;">Jika Anda tidak meminta ini, abaikan saja email ini. Akun Anda tetap aman.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #888;">Link manual: <a href="${resetUrl}">${resetUrl}</a></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("📨 Email reset password terkirim ke:", normalizedEmail);

    return NextResponse.json({ message: 'Instruksi reset sudah dikirim ke email' });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ message: 'Gagal memproses permintaan' }, { status: 500 });
  }
}