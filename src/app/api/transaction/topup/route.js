import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db'; 
import Transaction from '@/models/Transaction'; 
import User from '@/models/User';
import { sendAdminNotification } from '@/lib/mail'; // <--- Import Helper Email

export async function POST(req) {
  try {
    // 1. TERIMA DATA DARI FRONTEND
    const { points, price, packageName } = await req.json(); 
    
    // 2. VALIDASI AUTH
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();
    const user = await User.findById(decoded.userId);

    // 3. GENERATE KODE UNIK (1 - 999)
    // Supaya Admin mudah cek mutasi (Contoh: Rp 99.123)
    const uniqueCode = Math.floor(Math.random() * 900) + 1; 
    const totalTransfer = Number(price) + uniqueCode;

    // 4. SIMPAN TRANSAKSI KE DATABASE (Status: PENDING)
    const newTransaction = await Transaction.create({
      userId: user._id,
      
      // PENTING: Konsistensi Field
      amount: totalTransfer, // Total Rupiah (Harga + Kode Unik)
      credits: Number(points), // Jumlah Poin yang didapat
      
      type: 'topup',
      paymentMethod: 'manual_transfer',
      status: 'pending', // Belum dibayar/belum diapprove
      description: `Order: ${packageName} (Kode: ${uniqueCode})`,
    });

    // 5. KIRIM EMAIL NOTIFIKASI KE ADMIN
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #3b82f6; border-radius: 10px; background-color: #eff6ff;">
        <h2 style="color: #1d4ed8;">🔔 Order Top Up Masuk!</h2>
        <p>Admin, user <b>${user.name}</b> membuat pesanan baru.</p>
        
        <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin: 15px 0;">
            <p style="margin:0; font-size:12px; color:#666;">Total Harus Transfer (Unik):</p>
            <h1 style="color: #1d4ed8; margin: 5px 0;">Rp ${totalTransfer.toLocaleString('id-ID')}</h1>
            <p style="margin: 5px 0 0 0; color: #666;">Paket: ${packageName}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 5px;">User Email</td><td>${user.email}</td></tr>
          <tr><td style="padding: 5px;">Kode Unik</td><td style="font-weight:bold;">${uniqueCode}</td></tr>
          <tr><td style="padding: 5px;">Status</td><td style="color: orange; font-weight: bold;">MENUNGGU TRANSFER</td></tr>
        </table>
        
        <p style="font-size: 12px; color: #666; margin-top: 20px;">
           *User sedang diarahkan ke halaman pembayaran.
        </p>
      </div>
    `;

    // Kirim Email ke Admin
    await sendAdminNotification(`Order Masuk: Rp ${totalTransfer.toLocaleString('id-ID')}`, emailHtml);

    // 6. RESPONSE KE FRONTEND
    return NextResponse.json({ 
      success: true,
      message: 'Order berhasil dibuat!', 
      transactionId: newTransaction._id,
      // Kirim total transfer (termasuk kode unik) ke frontend buat ditampilkan di halaman Payment
      totalPayment: totalTransfer 
    });

  } catch (error) {
    console.error("Topup API Error:", error);
    return NextResponse.json({ message: 'Gagal: ' + error.message }, { status: 500 });
  }
}