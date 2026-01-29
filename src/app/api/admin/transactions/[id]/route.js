import { NextResponse } from 'next/server';
import mongoose from 'mongoose'; 
import connectDB from '@/lib/db'; 
import transactionModel from '@/models/Transaction'; 
import userModel from '@/models/User';
import Notification from '@/models/Notification'; 

export async function PATCH(req, { params }) {
  try {
    const { id } = params; 
    const { newStatus } = await req.json();
    
    await connectDB();

    console.log(`👮 [ADMIN] Update Transaksi ${id} ke status: ${newStatus}`);

    const transaction = await transactionModel.findById(id);
    if (!transaction) return NextResponse.json({ message: 'Tidak ditemukan' }, { status: 404 });

    // --- LOGIC UTAMA (SALDO + PREMIUM + NOTIFIKASI) ---
    // Hanya jalan jika status berubah jadi 'success'
    if (newStatus === 'success' && transaction.status !== 'success') {
      
      const user = await userModel.findById(transaction.userId);
      
      if (user) {
        // 1. Tambah Saldo User
        user.credits = (user.credits || 0) + transaction.amount; 
        
        // 2. UPGRADE JADI PREMIUM (Baru)
        // User otomatis bisa akses tools berbayar setelah top up
        user.isPremium = true; 

        await user.save();
        console.log(`💰 Saldo user bertambah & Status jadi PREMIUM`);
      }

      // 3. KIRIM NOTIFIKASI
      try {
        const userIdObject = new mongoose.Types.ObjectId(transaction.userId);

        await Notification.create({
            target: 'user',                 
            userId: userIdObject,           
            type: 'success',                
            title: 'Akun Premium Aktif! 💎', // Judul lebih menarik
            message: `Pembayaran diterima. Saldo ${transaction.amount} poin masuk & Fitur Premium Anda sudah terbuka!`,
            isRead: false,
            createdAt: new Date()
        });
        console.log("✅ Notifikasi Premium Terkirim ke User!");

      } catch (errNotif) {
        console.error("❌ Gagal kirim notif:", errNotif);
      }
    }
    // ----------------------------------------

    // Simpan perubahan status transaksi
    transaction.status = newStatus;
    await transaction.save();

    return NextResponse.json({ message: 'Berhasil diupdate, Saldo Masuk & User jadi Premium!' });

  } catch (error) {
    console.error("Error Admin PATCH:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// FUNGSI HAPUS (Biarkan tetap ada)
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await connectDB();
    await transactionModel.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}