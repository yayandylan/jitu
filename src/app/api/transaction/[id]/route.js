import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import Notification from '@/models/Notification'; 
import { sendEmail } from '@/lib/mail';

export const dynamic = 'force-dynamic';

// 1. GET DETAIL
export async function GET(req, { params }) {
  try {
    await connectDB();
    const transaction = await Transaction.findById(params.id).populate('userId', 'name email');
    
    if (!transaction) return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });

    return NextResponse.json({ success: true, transaction });
  } catch (error) {
    return NextResponse.json({ message: "Error: " + error.message }, { status: 500 });
  }
}

// 2. PUT (UPDATE STATUS: APPROVE/REJECT)
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { status } = await req.json(); 
    
    // Ambil Data Transaksi & Populate User
    const trx = await Transaction.findById(params.id).populate('userId');
    
    if (!trx) return NextResponse.json({ message: "Transaksi hilang" }, { status: 404 });

    // [SAFETY CHECK] Pastikan User masih ada
    if (!trx.userId) {
        trx.status = status;
        await trx.save();
        return NextResponse.json({ success: true, message: "Status update (User tidak ditemukan, skip notif)" });
    }

    const user = trx.userId;
    const isTopup = trx.type === 'in' || trx.type === 'topup';

    // --- LOGIKA PERBAIKAN "UNDEFINED CREDITS" ---
    // Jika field 'credits' kosong (data lama), ambil dari 'amount'
    // Jika keduanya kosong, default ke 0 agar tidak error
    const pointsToAdd = trx.credits || trx.amount || 0;

    // --- A. SKENARIO APPROVE (TOP UP SUKSES) ---
    if (status === 'success' && trx.status !== 'success') {
        
        if (isTopup) {
            // 1. Tambah Saldo & Aktifkan Premium
            await User.findByIdAndUpdate(user._id, { 
                $inc: { credits: pointsToAdd }, // Gunakan variabel aman ini
                isPremium: true 
            });

            // 2. Buat Notifikasi
            try {
                await Notification.create({
                    target: 'user', 
                    userId: user._id,
                    transactionId: trx._id,
                    title: "Top Up Berhasil! 💎",
                    message: `Saldo +${pointsToAdd.toLocaleString()} Poin masuk. Premium Aktif!`,
                    link: '/site/dashboard',
                    category: 'billing',  
                    type: 'success',     
                    isRead: false
                });
            } catch (errNotif) { console.error("Gagal DB Notif:", errNotif.message); }

            // 3. Kirim Email
            try {
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #10b981; border-radius: 10px;">
                        <h2 style="color: #059669;">✅ Pembayaran Diterima!</h2>
                        <p>Halo <b>${user.name}</b>,</p>
                        <p>Top Up Anda sukses. Akun Anda kini <b>PREMIUM</b>.</p>
                        
                        <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                            <span style="display:block; font-size:12px; color:#666;">Saldo Masuk</span>
                            <span style="font-size: 24px; font-weight: bold; color: #059669;">+${pointsToAdd.toLocaleString()} Poin</span>
                        </div>
                        
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/site/dashboard" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Buka Dashboard</a>
                    </div>
                `;
                await sendEmail({ to: user.email, subject: 'Top Up Berhasil - Jitu Digital', html: emailHtml });
            } catch (e) { console.log("Email error skip"); }
        }
    }

    // --- B. SKENARIO REJECT (TOP UP GAGAL) ---
    if (status === 'failed' && trx.status !== 'failed') {
        try {
            await Notification.create({
                target: 'user',
                userId: user._id,
                transactionId: trx._id,
                title: "Top Up Gagal ❌",
                message: `Top Up ID #${trx._id.toString().slice(-6).toUpperCase()} dibatalkan.`,
                link: '/site/topup',
                category: 'billing',
                type: 'danger', 
                isRead: false
            });

             const failHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ef4444; border-radius: 10px;">
                    <h2 style="color: #ef4444;">❌ Transaksi Dibatalkan</h2>
                    <p>Halo <b>${user.name}</b>,</p>
                    <p>Mohon maaf, Top Up Anda ID #${trx._id.toString().slice(-6).toUpperCase()} tidak dapat diproses.</p>
                </div>
            `;
            await sendEmail({ to: user.email, subject: 'Top Up Gagal', html: failHtml });
        } catch (e) { console.log("Notif/Email fail skip"); }
    }

    // UPDATE STATUS & SAVE
    trx.status = status;
    // Update juga field credits biar data jadi rapi untuk kedepannya
    if (!trx.credits) trx.credits = pointsToAdd;
    
    await trx.save();

    return NextResponse.json({ success: true, message: "Status updated & Notification sent" });

  } catch (error) {
    console.error("Transaction Update Error:", error);
    return NextResponse.json({ message: "Update Gagal: " + error.message }, { status: 500 });
  }
}

// 3. DELETE
export async function DELETE(req, { params }) {
    try {
        await connectDB();
        await Transaction.findByIdAndDelete(params.id);
        await Notification.deleteMany({ transactionId: params.id });
        return NextResponse.json({ success: true, message: "Deleted" });
    } catch (error) {
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}