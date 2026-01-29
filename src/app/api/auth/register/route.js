import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer'; 
import connectDB from '@/lib/db'; 
import User from '@/models/User';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    await connectDB();

    const normalizedEmail = email.toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return NextResponse.json({ message: 'Email sudah terdaftar' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userRole = normalizedEmail === 'admin@jitu.com' ? 'admin' : 'user';

    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: userRole,
      credits: 500,
    });

    await newUser.save();

    // --- BAGIAN INI YANG DIPERBAIKI ---
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          // FIX: Sesuaikan dengan nama di Screenshot Vercel Bapak
          user: process.env.GMAIL_USER, 
          pass: process.env.GMAIL_APP_PASSWORD, 
        },
      });

      const mailOptions = {
        // From juga harus pakai GMAIL_USER
        from: `"Jitu Digital Team" <${process.env.GMAIL_USER}>`, 
        to: normalizedEmail, 
        subject: 'Selamat Datang di Jitu Digital! 🚀',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563EB;">Halo, ${name}! 👋</h2>
            <p>Terima kasih telah mendaftar di <strong>Jitu Digital</strong>.</p>
            <p>Akun Anda telah aktif dan Anda mendapatkan bonus saldo awal:</p>
            <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #059669;">500 Credits</span>
            </div>
            <p>Silakan login untuk mulai menggunakan tools riset kami.</p>
            <a href="https://jitudigital.com/login" style="display: inline-block; background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Sekarang</a>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("📧 Email welcome berhasil dikirim ke:", normalizedEmail);

    } catch (emailError) {
      console.error("⚠️ Gagal kirim email:", emailError.message);
    }
    // ---------------------------------------

    return NextResponse.json({ message: 'Registrasi Berhasil' }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: 'Server Error: ' + error.message }, { status: 500 });
  }
}