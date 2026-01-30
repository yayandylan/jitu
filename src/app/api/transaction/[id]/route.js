import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db'; 
import Transaction from '@/models/Transaction'; 
import User from '@/models/User'; 
import Notification from '@/models/Notification'; 
import { sendEmail } from '@/lib/mail'; // <--- Wajib Import ini untuk Notif Email

export const dynamic = 'force-dynamic';

// =================================================================
// 1. GET: User Lihat Invoice & Admin Lihat Detail
// =================================================================
export async function GET(req, { params }) {
  try {
    const { id } = params;
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();

    // Populate userId agar Admin bisa lihat nama user
    const transaction = await Transaction.findById(id).populate('userId', 'name email');
    
    if (!transaction) return NextResponse.json({ message: 'Transaksi tidak ditemukan' }, { status: 404 });

    // SECURITY: Hanya Admin ATAU Pemilik Transaksi yang boleh lihat
    if (decoded.role !== 'admin' && transaction.userId._id.toString() !== decoded.userId) {
        return NextResponse.json({ message: 'Forbidden Access' }, { status: 403 });
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("GET Transaksi Error:", error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

// =================================================================
// 2. PUT: Admin Approve/Reject (Ubah Status)
// =================================================================
export async function PUT(req, { params }) {
  try {
    // 1. CEK AUTH & ROLE ADMIN (WAJIB ADA)
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    
    // Security Check: Hanya role 'admin' yang boleh akses
    if (decoded.role !== 'admin') {
        return NextResponse.json({ message: 'Hanya Admin yang bisa approve!' }, { status: 403 });
    }

    await connectDB();
    const { id } = params;
    const { status } = await req.json(); // 'success' atau 'failed'

    console.log(`🚀 [ADMIN] Update Transaksi ${id} -> ${status}`);

    const transaction = await Transaction.findById(id);
    if (!transaction) return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });

    // 2. IDEMPOTENCY CHECK (Cek biar saldo gak masuk double)
    if (transaction.status === 'success') {
        return NextResponse.json({ message: "Transaksi ini sudah sukses sebelumnya" }, { status: 400 });
    }

    // A. UPDATE STATUS TRANSAKSI DI DB
    transaction.status = status;
    await transaction.save();

    // B. JIKA STATUS DIUBAH JADI 'SUCCESS' (APPROVE)
    if (status === 'success') {
        
        const user = await User.findById(transaction.userId);
        
        if (user) {
            // [FIX LOGIKA SALDO]
            // Gunakan 'credits' (Poin), JANGAN 'amount' (Rupiah)
            user.credits = (user.credits || 0) + (transaction.credits || 0);
            
            // Auto Aktifkan Premium
            user.isPremium = true; 
            
            await user.save();
            console.log(`💰 Saldo User ${user.name} bertambah +${transaction.credits} poin.`);

            // [NEW] KIRIM EMAIL PEMBERITAHUAN KE USER
            try {
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #10b981; border-radius: 10px;">
                        <h2 style="color: #059669;">✅ Top Up Berhasil!</h2>
                        <p>Halo <b>${user.name}</b>,</p>
                        <p>Pembayaran sebesar <b>Rp ${transaction.amount.toLocaleString('id-ID')}</b> telah kami terima.</p>
                        
                        <div style="background: #ecfdf5; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                            <span style="display: block; font-size: 12px; color: #666;">Saldo Masuk</span>
                            <span style="font-size: 24px; font-weight: bold; color: #059669;">+${transaction.credits.toLocaleString()} Poin</span>
                        </div>

                        <p>Status Akun: <b style="color: #d97706;">PREMIUM AKTIF 👑</b></p>
                        
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/site/dashboard" style="display: inline-block; background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Buka Dashboard</a>
                    </div>
                `;

                await sendEmail({
                    to: user.email,
                    subject: 'Hore! Saldo Poin Masuk 💎',
                    html: emailHtml
                });
            } catch (errEmail) {
                console.error("Gagal kirim email user:", errEmail);
            }

            // [NEW] BUAT NOTIFIKASI DATABASE (Lonceng di Web)
            try {
                await Notification.create({
                    target: 'user',
                    userId: user._id,
                    transactionId: transaction._id, 
                    category: 'billing',            
                    type: 'success',
                    title: 'Top Up Berhasil! 💎',
                    message: `Saldo +${transaction.credits.toLocaleString()} poin masuk. Akun Premium Aktif!`,
                    isRead: false,
                });
            } catch (errNotif) {
                console.error("Gagal buat notif DB:", errNotif);
            }
        }
    }

    return NextResponse.json({ 
        success: true, 
        message: status === 'success' ? "User Berhasil Di-Approve & Email Terkirim" : "Status Diperbarui" 
    });

  } catch (error) {
    console.error("Admin PUT Error:", error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

// =================================================================
// 3. DELETE: Hapus Transaksi (Cleanup - Opsional tapi Penting)
// =================================================================
export async function DELETE(req, { params }) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    if (decoded.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const { id } = params;
    await connectDB();
    
    // Hapus Notifikasi terkait dulu (Biar bersih)
    await Notification.deleteMany({ transactionId: id });
    
    // Hapus Transaksi
    await Transaction.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Data transaksi berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}