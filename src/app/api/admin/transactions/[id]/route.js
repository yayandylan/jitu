import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose'; 
import connectDB from '@/lib/db'; 
import Transaction from '@/models/Transaction'; 
import User from '@/models/User';
import Notification from '@/models/Notification'; 

export const dynamic = 'force-dynamic';

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

// =================================================================
// 1. PATCH: Update Status (Approve/Reject Manual)
// =================================================================
export async function PATCH(req, { params }) {
  // 1. Security Check
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ message: 'Unauthorized: Admin Only' }, { status: 403 });
  }

  try {
    const { id } = params; 
    const { newStatus } = await req.json(); // 'success' | 'failed'
    
    await connectDB();

    console.log(`👮 [ADMIN] Memproses Transaksi ${id} -> ${newStatus}`);

    const transaction = await Transaction.findById(id);
    if (!transaction) return NextResponse.json({ message: 'Transaksi tidak ditemukan' }, { status: 404 });

    // 2. IDEMPOTENCY CHECK (Cek biar saldo gak masuk 2x)
    if (transaction.status === 'success') {
      return NextResponse.json({ message: 'Transaksi ini sudah disetujui sebelumnya.' }, { status: 400 });
    }

    // --- LOGIC UTAMA: JIKA DI-APPROVE (SUCCESS) ---
    if (newStatus === 'success') {
      
      const user = await User.findById(transaction.userId);
      
      if (user) {
        // A. Tambah Saldo User
        user.credits = (user.credits || 0) + transaction.amount; 
        
        // B. UPGRADE JADI PREMIUM (Otomatis Aktif)
        user.isPremium = true; 

        await user.save();
        console.log(`💰 User ${user.name} menerima ${transaction.amount} poin. Premium: ON`);

        // C. KIRIM NOTIFIKASI
        try {
          // Ambil harga yang benar (field 'price' di model baru, fallback ke 'totalPrice')
          const displayPrice = transaction.price || transaction.totalPrice || 0;

          await Notification.create({
              target: 'user',                 
              userId: user._id,
              
              // Link ke Transaksi (Fitur Baru)
              transactionId: transaction._id,
              category: 'billing',
           
              type: 'success',                
              title: 'Pembayaran Diterima! 💎', 
              message: `Selamat! Pembayaran Rp ${displayPrice.toLocaleString('id-ID')} terverifikasi. Saldo ${transaction.amount.toLocaleString('id-ID')} poin masuk & Akun Premium Aktif.`,
              isRead: false
          });
          console.log("✅ Notifikasi terkirim.");
        } catch (errNotif) {
          console.error("❌ Gagal kirim notif:", errNotif);
        }
      }
    }
    // ----------------------------------------

    // 3. Simpan Perubahan Status
    transaction.status = newStatus;
    await transaction.save();

    return NextResponse.json({ message: `Berhasil! Status diubah menjadi ${newStatus}` });

  } catch (error) {
    console.error("Error Admin PATCH:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// =================================================================
// 2. DELETE: Hapus Transaksi (Cleanup)
// =================================================================
export async function DELETE(req, { params }) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { id } = params;
    await connectDB();
    
    // Hapus Notifikasi terkait dulu (Biar bersih)
    await Notification.deleteMany({ transactionId: id });
    
    // Hapus Transaksi
    await Transaction.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Data transaksi berhasil dihapus permanen' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}