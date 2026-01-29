export const dynamic = 'force-dynamic'; // Supaya data selalu update

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db'; 
import Transaction from '@/models/Transaction'; // Arahkan ke file Transaction.js (Huruf Besar)
import User from '@/models/User'; 

/**
 * GET: Mengambil data transaksi dengan filter tanggal
 */
export async function GET(req) {
  try {
    await connectDB();

    // 1. Ambil parameter filter dari URL
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = {};

    // 2. Logika Filter Tanggal (Jika admin memilih tanggal)
    if (startDate && endDate) {
      // Set jam ke 00:00:00 untuk awal hari dan 23:59:59 untuk akhir hari
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: start,
        $lte: end
      };
    }

    // 3. Tarik data dan hubungkan ke model User
    const transactions = await transactionModel.find(query)
      .populate({
        path: 'userId',
        model: userModel, // Pastikan menggunakan model userModel (huruf kecil)
        select: 'name email'
      })
      .sort({ createdAt: -1 }) // Urutkan dari yang terbaru
      .lean();

    // Log untuk pantau di terminal VS Code Bapak
    console.log(`[TRANSAKSI API] Mengirim ${transactions.length} data ke tabel.`);

    return NextResponse.json(transactions);

  } catch (error) {
    console.error("TRANSACTIONS_GET_ERROR:", error.message);
    // Kembalikan array kosong agar tabel di frontend tidak crash
    return NextResponse.json([], { status: 500 });
  }
}