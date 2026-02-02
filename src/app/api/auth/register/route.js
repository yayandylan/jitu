import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db'; 
import User from '@/models/User';
import nodemailer from 'nodemailer'; // Kita pakai nodemailer langsung untuk OTP

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
      // Jika user ada tapi BELUM verified, kita bisa hapus yang lama (opsional), 
      // atau tolak saja biar dia lanjut verifikasi yang lama. 
      // Untuk keamanan, kita tolak saja.
      return NextResponse.json({ message: 'Email sudah terdaftar tapi belum diverifikasi.' }, { status: 400 });
    }

    // 2. Generate OTP & Expired Time (10 Menit)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); 

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Simpan User (STATUS: BELUM AKTIF / UNVERIFIED)
    // Note: Credits 0 dulu, bonus 500 diberikan nanti saat verifikasi berhasil.
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

    // 5. KIRIM EMAIL OTP
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true, // true untuk port 465
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: normalizedEmail,
        subject: '🔐 Kode Verifikasi Jitu Digital',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #2563EB;">Verifikasi Akun Anda</h2>
              <p>Halo <b>${name}</b>,</p>
              <p>Terima kasih telah mendaftar. Untuk mencegah penyalahgunaan, silakan masukkan kode berikut untuk mengaktifkan akun Anda:</p>
              
              <div style="background-color: #F3F4F6; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #1E293B;">${otp}</span>
              </div>
              
              <p>Kode ini berlaku selama 10 menit.</p>
              <p style="font-size: 12px; color: #999; margin-top: 30px;">Jika Anda tidak merasa mendaftar di Jitu Digital, abaikan email ini.</p>
          </div>
        `,
      });

    } catch (emailError) {
      console.error("⚠️ Gagal kirim OTP:", emailError);
      // Opsional: Hapus user jika email gagal terkirim agar bisa daftar ulang
      await User.findByIdAndDelete(newUser._id);
      return NextResponse.json({ message: 'Gagal mengirim email verifikasi. Cek koneksi SMTP.' }, { status: 500 });
    }

    // Return Success agar Frontend pindah ke Step 2 (Input OTP)
    return NextResponse.json({ success: true, message: 'Kode OTP dikirim' }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: 'Server Error: ' + error.message }, { status: 500 });
  }
}