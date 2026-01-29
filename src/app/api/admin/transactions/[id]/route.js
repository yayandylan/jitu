import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose'; 
import connectDB from '@/lib/db'; 
import Transaction from '@/models/Transaction'; 
import User from '@/models/User';
import Notification from '@/models/Notification'; 

// --- MIDDLEWARE INTERNAL: CEK ADMIN ---
async function isAdminAuthorized() {
  const token = cookies().get('token')?.value;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    if (decoded.role === 'admin') return true;
    
    await connectDB();
    const user = await User.findById(decoded.userId);
    return user && user.role === 'admin';
  } catch (error) {
    return false;
  }
}

// 1. UPDATE STATUS TRANSAKSI (APPROVE/REJECT)
export async function PATCH(req, { params }) {
  // Security Check
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = params; 
    const { newStatus } = await req.json();
    
    await connectDB();

    console.log(`👮 [ADMIN] Update Transaksi ${id} ke status: ${newStatus}`);

    const transaction = await Transaction.findById(id);
    if (!transaction) return NextResponse.json({ message: 'Transaksi tidak ditemukan' }, { status: 404 });

    // --- LOGIC UTAMA: JIKA STATUS BERUBAH JADI 'SUCCESS' ---
    if (newStatus === 'success' && transaction.status !== 'success') {
      
      const user = await User.findById(transaction.userId);
      
      if (user) {
        // A. Tambah Saldo User
        user.credits = (user.credits || 0) + transaction.amount; 
        
        // B. UPGRADE JADI PREMIUM (PENTING!)
        // User otomatis bisa akses tools berbayar setelah top up sukses
        user.isPremium = true; 

        await user.save();
        console.log(`💰 Saldo user ${user.email} bertambah & Status jadi PREMIUM`);

        // C. KIRIM NOTIFIKASI
        try {
          await Notification.create({
              target: 'user',                 
              userId: user._id,           
              type: 'success',                
              title: 'Pembayaran Diterima! 💎', 
              message: `Selamat! Saldo ${transaction.amount.toLocaleString()} poin telah masuk. Akun Anda sekarang PREMIUM.`,
              isRead: false,
              createdAt: new Date()
          });
        } catch (errNotif) {
          console.error("❌ Gagal kirim notif:", errNotif);
        }
      }
    }
    // ----------------------------------------

    // Simpan perubahan status transaksi
    transaction.status = newStatus;
    await transaction.save();

    return NextResponse.json({ message: 'Berhasil diupdate: Saldo Masuk & User jadi Premium!' });

  } catch (error) {
    console.error("Error Admin PATCH:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 2. HAPUS TRANSAKSI
export async function DELETE(req, { params }) {
  // Security Check
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = params;
    await connectDB();
    await Transaction.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}