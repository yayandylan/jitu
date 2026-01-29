import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// --- IMPORT ---
import connectDB from '@/lib/db'; 
import User from '@/models/User'; // Pastikan path & nama file sesuai (user.js)
// --------------

// PENTING: Agar data selalu fresh (tidak nyangkut di cache)
export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    // 1. Cek Token
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Decode Token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    
    // 3. Koneksi Database
    await connectDB();
    
    // 4. Cari User Terbaru
    // select('-password') artinya ambil semua field (termasuk isPremium) KECUALI password
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Kembalikan data user lengkap ke Frontend
    return NextResponse.json({ user });

  } catch (error) {
    console.error("Profile Error:", error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}