import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { sendAdminNotification } from '@/lib/mail'; // <--- Import Helper Email

export async function POST(req) {
  try {
    // 1. KONEKSI DB & VALIDASI AUTH
    await connectDB();
    
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    const user = await User.findById(decoded.userId);

    if (!user) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });

    // 2. TERIMA DATA DARI FRONTEND
    const { packageName, price, points, voucherCode } = await req.json();

    // 3. GENERATE KODE UNIK (1 - 999)
    // Contoh: Harga 100.000 + Kode 123 = Total 100.123
    const uniqueCode = Math.floor(Math.random() * 900) + 1; 
    const finalAmount = Number(price) + uniqueCode;

    // 4. SIMPAN TRANSAKSI KE DATABASE (Status: PENDING)
    const newTrx = await Transaction.create({
      userId: user._id,
      packageName,
      points: Number(points),
      price: finalAmount, // Harga sudah termasuk kode unik
      uniqueCode,
      status: 'pending',
      paymentMethod: 'bank_transfer',
      voucherCode: voucherCode || null,
      createdAt: new Date()
    });

    // 5. KIRIM EMAIL NOTIFIKASI KE ADMIN
    try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #3b82f6; border-radius: 10px; background-color: #eff6ff;">
            <h2 style="color: #1d4ed8;">🔔 Order Top Up Masuk!</h2>
            <p>Halo Admin, user <b>${user.name}</b> membuat pesanan baru.</p>
            
            <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin: 15px 0;">
                <p style="margin:0; font-size:12px; color:#666;">Total Harus Transfer (Unik):</p>
                <h1 style="color: #1d4ed8; margin: 5px 0;">Rp ${finalAmount.toLocaleString('id-ID')}</h1>
                <p style="margin: 5px 0 0 0; color: #666;">Paket: <b>${packageName}</b> (${points} Poin)</p>
                ${voucherCode ? `<p style="margin: 5px 0 0 0; color: green;">Voucher: <b>${voucherCode}</b></p>` : ''}
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 5px; color:#666;">User Email</td><td>${user.email}</td></tr>
              <tr><td style="padding: 5px; color:#666;">Kode Unik</td><td style="font-weight:bold;">${uniqueCode}</td></tr>
              <tr><td style="padding: 5px; color:#666;">Status</td><td style="color: orange; font-weight: bold;">MENUNGGU TRANSFER</td></tr>
            </table>
            
            <p style="font-size: 12px; color: #666; margin-top: 20px;">
               *User sedang diarahkan ke halaman pembayaran.
            </p>
          </div>
        `;

        // Kirim Email (Asynchronous agar tidak memperlambat response frontend)
        await sendAdminNotification(`Order: Rp ${finalAmount.toLocaleString('id-ID')} - ${user.name}`, emailHtml);
    } catch (mailError) {
        console.error("⚠️ Gagal kirim email admin:", mailError);
        // Jangan throw error, agar transaksi tetap berhasil di mata user
    }

    // 6. RESPONSE KE FRONTEND
    return NextResponse.json({ 
      success: true,
      message: 'Order berhasil dibuat!', 
      transactionId: newTrx._id, // WAJIB ADA untuk redirect frontend
      totalPayment: finalAmount 
    }, { status: 201 });

  } catch (error) {
    console.error("Topup API Error:", error);
    return NextResponse.json({ message: 'Gagal: ' + error.message }, { status: 500 });
  }
}