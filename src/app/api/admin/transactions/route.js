import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db'; 
import Transaction from '@/models/Transaction'; 
import User from '@/models/User'; 

export const dynamic = 'force-dynamic'; // Supaya data selalu update

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

/**
 * GET: Mengambil data transaksi dengan filter tanggal
 */
export async function GET(req) {
  // 1. Cek Admin Dulu
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    await connectDB();

    // 2. Ambil parameter filter dari URL
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = {};

    // 3. Logika Filter Tanggal
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0); // Awal hari
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Akhir hari

      query.createdAt = {
        $gte: start,
        $lte: end
      };
    }

    // 4. Tarik data dan hubungkan ke model User
    // FIX: Gunakan variabel 'Transaction' dan 'User' yang sudah di-import di atas
    const transactions = await Transaction.find(query)
      .populate({
        path: 'userId',
        model: User, // FIX: Pakai 'User', bukan 'userModel'
        select: 'name email' // Ambil nama & email saja
      })
      .sort({ createdAt: -1 }) // Urutkan dari yang terbaru
      .lean(); // Optimasi performa (return plain JSON object)

    return NextResponse.json(transactions);

  } catch (error) {
    console.error("TRANSACTIONS_GET_ERROR:", error.message);
    return NextResponse.json([], { status: 500 });
  }
}