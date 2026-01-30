import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db'; 
import User from '@/models/User';
// Import helper email yang baru kita buat
import { sendEmail, sendAdminNotification } from '@/lib/mail'; 

export async function POST(req) {
  try {
    const { name, email, password, whatsapp } = await req.json();

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
    // Jika email admin, otomatis jadi role admin (Opsional)
    const userRole = normalizedEmail === process.env.GMAIL_USER ? 'admin' : 'user';

    const newUser = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      whatsapp: whatsapp || '-',
      role: userRole,
      credits: 500, // Bonus awal
      isPremium: false
    });

    await newUser.save();

    // --- BAGIAN PENGIRIMAN EMAIL (USER & ADMIN) ---
    try {
      // 1. KIRIM EMAIL WELCOME KE USER (Pakai design HTML Bapak yang bagus tadi)
      const userHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #2563EB;">Halo, ${name}! 👋</h2>
            <p>Terima kasih telah mendaftar di <strong>Jitu Digital</strong>.</p>
            <p>Akun Anda telah aktif dan Anda mendapatkan bonus saldo awal:</p>
            <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
              <span style="font-size: 24px; font-weight: bold; color: #059669;">500 Credits</span>
            </div>
            <p>Silakan login untuk mulai menggunakan tools riset kami.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Sekarang</a>
            </div>
        </div>
      `;
      
      // Kirim ke User
      await sendEmail({
        to: normalizedEmail,
        subject: 'Selamat Datang di Jitu Digital! 🚀',
        html: userHtml
      });

      // 2. KIRIM NOTIFIKASI KE ADMIN (Fitur Request Bapak)
      const adminHtml = `
        <p>Halo Admin, ada user baru mendaftar:</p>
        <ul>
            <li>Nama: <b>${name}</b></li>
            <li>Email: ${normalizedEmail}</li>
            <li>WA: ${whatsapp || '-'}</li>
        </ul>
      `;
      
      // Kirim ke Admin
      await sendAdminNotification(`User Baru: ${name}`, adminHtml);

    } catch (emailError) {
      // Kita log error tapi TIDAK menggagalkan registrasi
      console.error("⚠️ Gagal kirim email:", emailError.message);
    }
    // ----------------------------------------------------

    return NextResponse.json({ message: 'Registrasi Berhasil' }, { status: 201 });

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ message: 'Server Error: ' + error.message }, { status: 500 });
  }
}