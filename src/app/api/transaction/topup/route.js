import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
// Jalur impor disesuaikan dengan struktur folder Bapak
import connectDB from '@/lib/db'; 
import transactionModel from '@/models/Transaction'; 
import GlobalSetting from '@/models/GlobalSetting';

export async function POST(req) {
  try {
    // 1. TERIMA DATA DARI FRONTEND
    const { points, voucherCode, uniqueCode, totalPrice } = await req.json(); 
    
    // 2. VALIDASI AUTH
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();

    // 3. AMBIL SETTING HARGA & MINIMAL TOPUP
    let settings = await GlobalSetting.findById('config_utama');
    if (!settings) settings = { pricePerPoint: 100, minimumTopup: 10000 }; 

    // Validasi minimal topup berdasarkan harga paket (sebelum kode unik)
    const basePrice = Number(points) * settings.pricePerPoint;
    if (basePrice < settings.minimumTopup) {
      return NextResponse.json(
        { message: `Minimal pembelian adalah Rp ${settings.minimumTopup.toLocaleString('id-ID')}` }, 
        { status: 400 }
      );
    }

    // 4. SIMPAN TRANSAKSI KE DATABASE (SINKRON DENGAN PAYMENT PAGE)
    const newTransaction = await transactionModel.create({
      userId: decoded.userId,
      amount: Number(points),
      pricePerPoint: settings.pricePerPoint,
      
      // --- FIELD PENTING UNTUK SINKRONISASI ---
      uniqueCode: Number(uniqueCode), // Simpan kode unik pengenal
      totalPrice: Number(totalPrice), // Simpan total akhir (Harga - Diskon + Kode Unik)
      voucherCode: voucherCode || null,
      
      type: 'in', 
      description: `Isi Ulang ${points} Poin ${voucherCode ? '(Promo: ' + voucherCode + ')' : ''}`,
      status: 'pending' 
    });

    // 5. KIRIM RESPON KE FRONTEND
    return NextResponse.json({ 
      success: true,
      message: 'Order berhasil dibuat!', 
      transactionId: newTransaction._id,
      totalPayment: Number(totalPrice) // Mengirimkan total yang harus dibayar
    });

  } catch (error) {
    console.error("Topup API Error:", error);
    return NextResponse.json({ message: 'Gagal: ' + error.message }, { status: 500 });
  }
}