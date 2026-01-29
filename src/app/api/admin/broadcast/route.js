import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import userModel from '@/models/User';
import notificationModel from '@/models/Notification';
import { sendEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

// 1. [GET] AMBIL RIWAYAT BROADCAST
export async function GET() {
  try {
    await connectDB();
    
    // Ambil siaran massal (target: all)
    const history = await notificationModel.find({ target: 'all' })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. [POST] KIRIM BROADCAST DENGAN SEGMENTASI (FREE / PREMIUM)
export async function POST(req) {
  try {
    await connectDB();
    const { title, message, type, sendEmailToAll, targetGroup } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ message: "Judul dan pesan wajib diisi!" }, { status: 400 });
    }

    // --- LOGIKA FILTER AUDIENS ---
    // TargetGroup: 'all', 'free', atau 'premium'
    let userFilter = { role: 'user' };
    if (targetGroup === 'premium') userFilter.isPremium = true;
    if (targetGroup === 'free') userFilter.isPremium = false;

    // A. SIMPAN NOTIFIKASI KE DATABASE
    // Kita simpan targetGroup-nya agar di sisi Dashboard User bisa difilter
    const newNotification = await notificationModel.create({ 
      title, 
      message, 
      type: type || 'info',
      target: 'all', // Tetap 'all' untuk menandakan siaran massal
      targetGroup: targetGroup || 'all', // Field baru untuk filter Free/Premium
      userId: null
    });

    // B. KIRIM EMAIL SESUAI SEGMENTASI
    if (sendEmailToAll) {
      const users = await userModel.find(userFilter).select('email');
      
      if (users.length > 0) {
        const emailPromises = users.map(user => 
          sendEmail({
            to: user.email,
            subject: `[JITU ${targetGroup.toUpperCase()}] ${title}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2563eb; margin-bottom: 10px;">Jitu Digital Update</h2>
                <hr style="border: 0; border-top: 1px solid #eee; margin-bottom: 20px;">
                <h3 style="color: #333;">${title}</h3>
                <p style="color: #555; line-height: 1.6;">${message}</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
                  <p>Anda menerima email ini sebagai member ${targetGroup === 'all' ? 'Jitu Digital' : targetGroup.toUpperCase()}.</p>
                  <p>Login ke <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #2563eb;">Dashboard</a> untuk info selengkapnya.</p>
                </div>
              </div>
            `
          }).catch(err => console.error(`Gagal kirim ke ${user.email}`))
        );
        await Promise.allSettled(emailPromises);
      }
    }

    return NextResponse.json({ 
        success: true, 
        message: `Broadcast berhasil dikirim ke ${targetGroup} member!` 
    });

  } catch (error) {
    console.error("Broadcast Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 3. [DELETE] TARIK / HAPUS BROADCAST
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: "ID tidak valid" }, { status: 400 });
    }

    await notificationModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Pesan berhasil ditarik" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}