import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Broadcast from '@/models/Broadcast'; // Pastikan model Broadcast ada

// --- CONFIG EMAIL ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// GET: Ambil History Broadcast
export async function GET() {
  try {
    await connectDB();
    // Urutkan dari yang terbaru
    const history = await Broadcast.find({}).sort({ createdAt: -1 }).limit(20);
    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching history' }, { status: 500 });
  }
}

// POST: Kirim Broadcast Baru
export async function POST(req) {
  try {
    const { title, message, type, sendEmailToAll, sendViaInApp, targetGroup } = await req.json();

    await connectDB();

    // 1. FILTER USER BERDASARKAN TARGET GROUP
    let query = {}; // Default: Semua User
    
    if (targetGroup === 'premium') {
        query = { isPremium: true };
    } else if (targetGroup === 'free') {
        query = { isPremium: { $ne: true } }; // isPremium != true
    }
    
    // Ambil list user yang sesuai kriteria
    const users = await User.find(query).select('email name');

    if (users.length === 0) {
        return NextResponse.json({ message: 'Tidak ada user dalam kategori ini.' }, { status: 400 });
    }

    // 2. SIMPAN LOG BROADCAST KE DATABASE
    const newBroadcast = new Broadcast({
      title,
      message,
      type,
      targetGroup: targetGroup || 'all',
      sentToCount: users.length,
      createdAt: new Date()
    });
    await newBroadcast.save();

    // 3. KIRIM NOTIFIKASI IN-APP (Disimpan di User Model)
    // Fitur ini opsional, tergantung apakah User Model punya field 'notifications'
    if (sendViaInApp) {
        // Update banyak dokumen sekaligus (Bulk Write lebih efisien)
        await User.updateMany(query, {
            $push: {
                notifications: {
                    title,
                    message,
                    type,
                    date: new Date(),
                    isRead: false
                }
            }
        });
    }

    // 4. KIRIM EMAIL BLAST (Jika dipilih)
    if (sendEmailToAll) {
      // Kirim paralel (Hati-hati limit Gmail, untuk ribuan user butuh layanan SMTP pro seperti SendGrid/Resend)
      const emailPromises = users.map(user => {
        return transporter.sendMail({
          from: `"Jitu Digital Team" <${process.env.GMAIL_USER}>`,
          to: user.email,
          subject: `📢 ${title}`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #2563EB;">Halo, ${user.name}! 👋</h2>
              <div style="background: #F8FAFC; padding: 15px; border-left: 4px solid #2563EB; margin: 20px 0;">
                <h3 style="margin: 0 0 10px;">${title}</h3>
                <p style="margin: 0; color: #475569; line-height: 1.6;">${message}</p>
              </div>
              <p style="font-size: 12px; color: #94a3b8; margin-top: 30px;">
                Anda menerima email ini karena terdaftar sebagai member <strong>${targetGroup === 'all' ? 'Jitu Digital' : targetGroup === 'premium' ? 'Premium' : 'Free'}</strong>.
              </p>
            </div>
          `
        }).catch(err => console.error(`Gagal kirim ke ${user.email}:`, err));
      });

      // Jalankan tanpa menunggu semua selesai agar respon cepat (Fire & Forget)
      Promise.allSettled(emailPromises);
    }

    return NextResponse.json({ 
        message: `Broadcast berhasil dikirim ke ${users.length} user (${targetGroup}).` 
    });

  } catch (error) {
    console.error("Broadcast Error:", error);
    return NextResponse.json({ message: 'Server Error: ' + error.message }, { status: 500 });
  }
}

// DELETE: Hapus Log Broadcast
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await connectDB();
    await Broadcast.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}