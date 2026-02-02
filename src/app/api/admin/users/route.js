import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import Notification from '@/models/Notification'; 
import { sendEmail } from '@/lib/mail'; 

export const dynamic = 'force-dynamic';

// 1. [GET] AMBIL SEMUA USER
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ users }); 
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 2. [PUT] KHUSUS UPDATE SALDO (ADJUST CREDIT)
export async function PUT(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { userId, action, amount } = body;

    // --- VALIDASI AWAL ---
    const adjustment = Number(amount);
    
    if (!userId) return NextResponse.json({ message: 'User ID wajib diisi' }, { status: 400 });
    if (isNaN(adjustment) || amount === null) return NextResponse.json({ message: 'Jumlah poin harus angka' }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });

    if (action === 'adjust_credit') {
        const isAddition = adjustment > 0;
        const formattedAmount = Math.abs(adjustment).toLocaleString('id-ID');
        
        // ==========================================================
        // LANGKAH 1: UPDATE SALDO (CRITICAL - WAJIB SUKSES)
        // ==========================================================
        const currentCredits = typeof user.credits === 'number' ? user.credits : 0;
        user.credits = currentCredits + adjustment;
        if (user.credits < 0) user.credits = 0; 
        
        await user.save(); // Jika ini gagal, dia akan lari ke catch paling bawah (500)

        // ==========================================================
        // LANGKAH 2: PROSES PENDUKUNG (SAFE MODE)
        // Kita bungkus try-catch terpisah agar jika history/email gagal,
        // admin tetap mendapat pesan SUKSES karena saldo sudah masuk.
        // ==========================================================

        // A. CATAT TRANSAKSI (Gunakan tipe 'in'/'out' yang lebih umum)
        try {
            await Transaction.create({
                userId: user._id,
                amount: Math.abs(adjustment),
                // UBAH KE 'in' (Masuk) atau 'out' (Keluar) agar aman dari validasi Schema
                type: isAddition ? 'in' : 'out', 
                status: 'success',
                description: isAddition 
                    ? 'Bonus / Penambahan poin oleh Admin' 
                    : 'Penyesuaian / Pengurangan poin oleh Admin'
            });
        } catch (err) { console.error("Gagal catat history:", err.message); }

        // B. BUAT NOTIFIKASI
        try {
            await Notification.create({
                target: 'user',
                userId: user._id,
                title: isAddition ? 'Bonus Poin Admin 💎' : 'Penyesuaian Poin ⚠️',
                message: isAddition 
                    ? `Selamat! Admin menambahkan ${formattedAmount} poin ke akun Anda.`
                    : `Admin mengurangi saldo Anda sebesar ${formattedAmount} poin.`,
                category: 'billing',
                type: isAddition ? 'success' : 'warning',
                link: '/site/dashboard',
                isRead: false
            });
        } catch (err) { console.error("Gagal buat notif:", err.message); }

        // C. KIRIM EMAIL
        try {
            const emailColor = isAddition ? '#10b981' : '#f59e0b'; 
            const emailTitle = isAddition ? 'Yeay! Tambahan Poin Masuk 💎' : 'Informasi Penyesuaian Saldo';
            
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid ${emailColor}; border-radius: 10px;">
                    <h2 style="color: ${emailColor};">${emailTitle}</h2>
                    <p>Halo <b>${user.name}</b>,</p>
                    <p>${isAddition ? 'Admin baru saja memberikan tambahan poin untuk Anda.' : 'Telah dilakukan penyesuaian saldo pada akun Anda.'}</p>
                    <div style="background: ${isAddition ? '#ecfdf5' : '#fffbeb'}; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="display:block; font-size:12px; color:#666;">Nominal</span>
                        <span style="font-size: 24px; font-weight: bold; color: ${emailColor};">
                            ${isAddition ? '+' : '-'}${formattedAmount} Poin
                        </span>
                    </div>
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/site/dashboard" style="background-color: #334155; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Buka Dashboard</a>
                </div>
            `;
            // Kita await tapi di dalam try-catch, jadi kalau gagal tidak membatalkan response
            await sendEmail({ to: user.email, subject: emailTitle, html: emailHtml });
        } catch (emailErr) {
            console.error("Gagal kirim email (tapi saldo aman):", emailErr.message);
        }

        // D. RETURN SUKSES (Meskipun email/notif mungkin error, saldo sudah aman)
        return NextResponse.json({ success: true, message: 'Saldo Berhasil Diupdate!' });
    }

    return NextResponse.json({ message: 'Aksi tidak valid' }, { status: 400 });

  } catch (error) {
    console.error("Critical Error:", error);
    return NextResponse.json({ message: error.message || 'Server Error' }, { status: 500 });
  }
}

// 3. [PATCH] UPDATE PROFIL
export async function PATCH(req) {
  try {
    await connectDB();
    const { id, name, role, isPremium } = await req.json();
    const updatedUser = await User.findByIdAndUpdate(id, { name, role, isPremium }, { new: true });
    if (!updatedUser) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Data user berhasil diupdate' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 4. [DELETE] HAPUS USER
export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ message: 'ID diperlukan' }, { status: 400 });

        const user = await User.findById(id);
        if (!user) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });

        await User.findByIdAndDelete(id);
        await Transaction.deleteMany({ userId: id });
        await Notification.deleteMany({ userId: id });

        return NextResponse.json({ success: true, message: 'User dihapus' });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}