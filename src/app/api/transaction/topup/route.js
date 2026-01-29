import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db'; 
import Transaction from '@/models/Transaction'; // FIX: Gunakan Transaction (sesuai model)
import GlobalSetting from '@/models/GlobalSetting';

export async function POST(req) {
  try {
    // 1. TERIMA DATA DARI FRONTEND
    // Frontend mengirim: packageName, price (harga setelah diskon), points, voucherCode
    const { points, price, packageName, voucherCode } = await req.json(); 
    
    // 2. VALIDASI AUTH
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();

    // 3. VALIDASI MINIMAL TOPUP (Security Check)
    let settings = await GlobalSetting.findById('config_utama');
    // Fallback jika setting belum ada
    if (!settings) settings = { minimumTopup: 10000 }; 

    // Cek apakah harga yang dikirim memenuhi minimum topup
    if (price < settings.minimumTopup) {
      return NextResponse.json(
        { message: `Minimal pembelian adalah Rp ${settings.minimumTopup.toLocaleString('id-ID')}` }, 
        { status: 400 }
      );
    }

    // 4. GENERATE KODE UNIK (Di Backend)
    // Random 3 digit (100 - 999)
    const uniqueCode = Math.floor(Math.random() * 900) + 100;
    
    // Hitung Total Akhir
    const totalPrice = Number(price) + uniqueCode;

    // 5. SIMPAN TRANSAKSI KE DATABASE
    const newTransaction = await Transaction.create({
      userId: decoded.userId,
      amount: Number(points), // Poin yang didapat
      
      // --- DATA KEUANGAN ---
      uniqueCode: uniqueCode,
      price: totalPrice, // Total yang harus ditransfer user
      voucherCode: voucherCode || null,
      packageName: packageName || 'Custom Topup',
      
      type: 'in', // Masuk
      description: `Top Up ${points} Poin`,
      status: 'pending' 
    });

    // 6. KIRIM ID KE FRONTEND (Untuk Redirect)
    return NextResponse.json({ 
      success: true,
      message: 'Order berhasil dibuat!', 
      transactionId: newTransaction._id,
      totalPayment: totalPrice
    });

  } catch (error) {
    console.error("Topup API Error:", error);
    return NextResponse.json({ message: 'Gagal: ' + error.message }, { status: 500 });
  }
}