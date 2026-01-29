import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import mongoose from 'mongoose'; 

// --- IMPORT MODELS ---
import connectDB from '@/lib/db'; 
import Transaction from '@/models/Transaction'; 
import User from '@/models/User'; 
import Notification from '@/models/Notification'; 

export const dynamic = 'force-dynamic';

// =================================================================
// 1. GET METHOD: User Melihat Invoice / Tagihan
// =================================================================
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    
    // Cari transaksi berdasarkan ID
    // Kita hapus filter userId agar Admin juga bisa melihat detail transaksi ini jika perlu
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return NextResponse.json({ message: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    // Security tambahan: Jika bukan admin DAN bukan pemilik transaksi, tolak.
    if (decoded.role !== 'admin' && transaction.userId.toString() !== decoded.userId) {
        return NextResponse.json({ message: 'Forbidden Access' }, { status: 403 });
    }

    // Mengembalikan data transaksi lengkap
    return NextResponse.json({ transaction });

  } catch (error) {
    console.error("GET Transaction Error:", error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

// =================================================================
// 2. PUT METHOD: Admin Approve Transaksi & Kirim Notif
// =================================================================
export async function PUT(req, { params }) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // 1. CEK APAKAH ADMIN? (Sangat Penting!)
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    if (decoded.role !== 'admin') {
        return NextResponse.json({ message: 'Hanya Admin yang bisa approve!' }, { status: 403 });
    }

    await connectDB();
    const { id } = params;
    const { status } = await req.json(); // status: 'success' atau 'failed'

    console.log(`🚀 [ADMIN] Processing Transaksi: ${id} -> ${status}`);

    const transaction = await Transaction.findById(id);
    if (!transaction) return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });

    // 2. IDEMPOTENCY CHECK (Cek biar gak double saldo)
    if (transaction.status === 'success') {
        return NextResponse.json({ message: "Transaksi ini sudah sukses sebelumnya" }, { status: 400 });
    }

    // A. UPDATE STATUS
    transaction.status = status;
    await transaction.save();

    // B. JIKA STATUS BERUBAH JADI SUCCESS (APPROVE)
    if (status === 'success') {
        
        const user = await User.findById(transaction.userId);
        
        if (user) {
            // 1. UPDATE SALDO USER
            user.credits = (user.credits || 0) + transaction.amount; 
            
            // 2. UPGRADE KE PREMIUM (Otomatis)
            user.isPremium = true; 
            
            await user.save();
            console.log(`💰 Saldo User ${user.name} bertambah +${transaction.amount}. Status Premium: ON`);

            // 3. KIRIM NOTIFIKASI PERSONAL KE USER
            try {
                // Pastikan transaction.price ada (field di DB bernama 'price', bukan 'totalPrice')
                const displayPrice = transaction.price || transaction.totalPrice || 0;

                await Notification.create({
                    target: 'user',
                    userId: user._id,
                    transactionId: transaction._id, 
                    category: 'billing',            
                    type: 'success',
                    title: 'Top Up Berhasil! 💎',
                    message: `Pembayaran Rp ${displayPrice.toLocaleString('id-ID')} diterima. Saldo ${transaction.amount.toLocaleString('id-ID')} poin masuk & Akun Premium Aktif!`,
                    isRead: false,
                    createdAt: new Date()
                });

                console.log("🔔 Notifikasi sukses dikirim ke user.");
            } catch (errNotif) {
                console.error("❌ Gagal membuat notifikasi:", errNotif);
            }
        }
    }

    return NextResponse.json({ 
        success: true, 
        message: status === 'success' ? "Transaksi Berhasil Di-Approve & Saldo Masuk" : "Status Diperbarui" 
    });

  } catch (error) {
    console.error("💥 Admin PUT Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}