import nodemailer from 'nodemailer';

// 1. Konfigurasi Transporter (Sesuai Vercel & Gmail App Password)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Otomatis set host smtp.gmail.com & port 465
  auth: {
    // Pastikan variabel ini ada di .env.local dan Environment Variables Vercel
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_APP_PASSWORD, 
  },
});

/**
 * Fungsi Utama: Kirim email ke siapa saja (User/Admin)
 * Digunakan untuk: OTP, Notif Sukses Topup, Notif Gagal
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    // Cek apakah env variable sudah ada
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error("❌ GMAIL_USER atau GMAIL_APP_PASSWORD belum disetting di .env");
        return false;
    }

    const info = await transporter.sendMail({
      from: `"Jitu Digital Team" <${process.env.GMAIL_USER}>`, // Nama Pengirim Profesional
      to,
      subject,
      html,
    });
    
    console.log(`✅ Email terkirim ke: ${to}`);
    return true;
  } catch (error) {
    console.error("❌ Gagal kirim email:", error);
    return false;
  }
};

/**
 * Fungsi Pintas: Khusus Kirim Notifikasi ke Admin
 * Digunakan untuk: Laporan Order Baru Masuk
 */
export const sendAdminNotification = async (subject, htmlContent) => {
  // Kirim ke email pemilik akun (Diri Sendiri)
  return await sendEmail({
    to: process.env.GMAIL_USER, 
    subject: `🔔 [ADMIN] ${subject}`, // Tambah prefix biar admin notice
    html: htmlContent,
  });
};