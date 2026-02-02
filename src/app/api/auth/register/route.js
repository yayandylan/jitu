import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db'; 
import User from '@/models/User';
import nodemailer from 'nodemailer'; 

export async function POST(req) {
  try {
    const { name, email, password, whatsapp } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase();
    
    // 1. Cek User Lama
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      // Jika user ada & sudah verified -> Tolak
      if (userExists.isVerified) {
          return NextResponse.json({ message: 'Email sudah terdaftar. Silakan login.' }, { status: 400 });
      } 
      // Jika user ada tapi BELUM verified, tolak agar user tidak bingung (atau bisa diarahkan untuk resend OTP di frontend nanti)
      return NextResponse.json({ message: 'Email sudah terdaftar tapi belum diverifikasi.' }, { status: 400 });
    }

    // 2. Generate OTP & Expired Time (10 Menit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Simpan User (STATUS: BELUM AKTIF / UNVERIFIED)
    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      whatsapp: whatsapp || '-',
      role: 'user',
      credits: 0, 
      isVerified: false,       // <--- PENTING: Belum aktif
      verificationCode: otp,   // <--- Simpan OTP
      verificationExpires: otpExpires
    });

    await newUser.save();

    // 5. KIRIM EMAIL OTP (CONFIG GMAIL)
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail', // Menggunakan preset layanan Gmail
        auth: {
          user: process.env.GMAIL_USER,        // Email Gmail Anda
          pass: process.env.GMAIL_APP_PASSWORD // App Password Gmail Anda
        },
      });

      await transporter.sendMail({
        from: `"Jitu Digital Team" <${process.env.GMAIL_USER}>`, // Nama pengirim terlihat profesional
        to: normalizedEmail,
        subject: '🔐 Kode Verifikasi Jitu Digital',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #2563EB; text-align: center;">Verifikasi Akun Anda</h2>
              <p>Halo <b>${name}</b>,</p>
              <p>Terima kasih telah mendaftar. Untuk mengaktifkan akun Anda, silakan masukkan kode verifikasi berikut:</p>
              
              <div style="background-color: #F3F4F6; padding: 20px; border-radius: 10px; text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #1E293B;">${otp}</span>
              </div>
              
              <p style="text-align: center; color: #64748B;">Kode ini berlaku selama 10 menit.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #999; text-align: center;">Jitu Digital Automation Team</p>
          </div>
        `,
      });

    } catch (emailError) {
      console.error("⚠️ Gagal kirim OTP:", emailError);
      // Hapus user jika email gagal terkirim agar user bisa mencoba daftar ulang
      await User.findByIdAndDelete(newUser._id);
      return NextResponse.json({ message: 'Gagal mengirim email verifikasi. Pastikan email Anda benar.' }, { status: 500 });
    }

    // Return Success
    return NextResponse.json({ success: true, message: 'Kode OTP dikirim' }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: 'Server Error: ' + error.message }, { status: 500 });
  }
}