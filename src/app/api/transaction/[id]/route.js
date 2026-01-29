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
// 1. GET METHOD: Untuk User melihat Invoice (Sinkron Kode Unik)
// =================================================================
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;

    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    const userId = decoded.userId;

    // Cari transaksi yang benar-benar milik user tersebut
    const transaction = await Transaction.findOne({
      _id: id,
      userId: userId
    });

    if (!transaction) {
      return NextResponse.json({ message: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    // Mengembalikan data transaksi lengkap (termasuk uniqueCode & totalPrice)
    return NextResponse.json({ transaction });

  } catch (error) {
    console.error("GET Transaction Error:", error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

// =================================================================
// 2. PUT METHOD: Untuk Admin Approve & Kirim Notif Otomatis
// =================================================================
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const { status } = await req.json();

    console.log(`🚀 [START] Approval Transaksi: ${id}`);

    const transaction = await Transaction.findById(id);
    if (!transaction) return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });

    // Cek agar tidak terjadi double-topup jika status sudah success
    if (transaction.status === 'success') {
        return NextResponse.json({ message: "Transaksi ini sudah sukses sebelumnya" }, { status: 400 });
    }

    // A. UPDATE STATUS TRANSAKSI
    transaction.status = status;
    await transaction.save();

    // B. JIKA STATUS BERUBAH JADI SUCCESS (APPROVE)
    if (status === 'success') {
        
        // 1. UPDATE SALDO USER
        const user = await User.findById(transaction.userId);
        if (user) {
            user.credits = (user.credits || 0) + transaction.amount; 
            await user.save();
            console.log(`💰 Saldo User ${user.name} bertambah. Total: ${user.credits}`);
        }

        // 2. KIRIM NOTIFIKASI PERSONAL KE USER
        try {
            const userIdObject = new mongoose.Types.ObjectId(transaction.userId);

            await Notification.create({
                target: 'user',
                userId: userIdObject,
                transactionId: transaction._id, // Hubungkan ke transaksi
                category: 'billing',            // Kategori pembayaran
                type: 'success',
                title: 'Top Up Berhasil! 💎',
                message: `Hore! Pembayaran Rp ${transaction.totalPrice.toLocaleString('id-ID')} telah dikonfirmasi. Saldo ${transaction.amount.toLocaleString('id-ID')} poin sudah aktif.`,
                isRead: false,
                createdAt: new Date()
            });

            console.log("🔔 Notifikasi sukses dikirim ke user.");
        } catch (errNotif) {
            console.error("❌ Gagal membuat notifikasi:", errNotif);
        }
    }

    return NextResponse.json({ 
        success: true, 
        message: status === 'success' ? "Transaksi Berhasil Di-Approve" : "Status Diperbarui" 
    });

  } catch (error) {
    console.error("💥 Admin PUT Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}