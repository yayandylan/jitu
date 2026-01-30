import nodemailer from 'nodemailer';

// 1. Konfigurasi Transporter (Sesuai Vercel Bapak)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Otomatis set host smtp.gmail.com & port 465
  auth: {
    // PENTING: Variabel ini HARUS SAMA dengan yang di Vercel
    user: process.env.GMAIL_USER, 
    pass: process.env.GMAIL_APP_PASSWORD, 
  },
});

/**
 * Fungsi Utama: Kirim email ke siapa saja (User/Admin)
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"JITU DIGITAL System" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email terkirim ke:", to);
    return true;
  } catch (error) {
    console.error("Gagal kirim email:", error);
    return false;
  }
};

/**
 * Fungsi Pintas: Khusus Kirim Notifikasi ke Admin
 * (Otomatis kirim ke email pemilik akun)
 */
export const sendAdminNotification = async (subject, htmlContent) => {
  // Kirim ke diri sendiri (karena Admin Email = Gmail User)
  return await sendEmail({
    to: process.env.GMAIL_USER, 
    subject: `🔔 ${subject}`, // Tambah ikon lonceng biar eye-catching
    html: htmlContent,
  });
};