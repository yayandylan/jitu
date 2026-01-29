import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import mongoose from 'mongoose'; 
import connectDB from '@/lib/db'; 
import Notification from '@/models/Notification';
import User from '@/models/User'; // Wajib import model User (Huruf Besar)

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    
    // 1. Cek Token (Wajib Login)
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json([]); 
    
    // 2. Decode Token
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    const userId = decoded.userId;

    // 3. Ambil Status User (Free/Premium) untuk Filter Broadcast
    const user = await User.findById(userId).select('isPremium');
    
    // Jika user tidak ditemukan di DB (mungkin terhapus), return kosong
    if (!user) return NextResponse.json([]);
    
    const statusUser = user.isPremium ? 'premium' : 'free';
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 4. Query Cerdas: Gabungkan Broadcast + Personal
    const notifications = await Notification.find({
      $or: [
        // A. Broadcast (Target Semua)
        { 
          target: 'all', 
          // Ambil jika targetGroup-nya 'all' ATAU sesuai status user (free/premium)
          targetGroup: { $in: ['all', statusUser] } 
        },                      
        // B. Personal (Target Khusus User Ini)
        { 
          target: 'user', 
          userId: userObjectId 
        } 
      ]
    })
      .sort({ createdAt: -1 }) // Urutkan dari yang terbaru
      .limit(30); // Batasi 30 notifikasi terakhir agar ringan

    return NextResponse.json(notifications);

  } catch (error) {
    console.error("Error Fetch Notif:", error);
    // Return array kosong agar UI tidak error jika backend bermasalah
    return NextResponse.json([], { status: 500 });
  }
}