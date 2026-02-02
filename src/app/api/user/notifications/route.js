import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import mongoose from 'mongoose'; 
import connectDB from '@/lib/db'; 
import Notification from '@/models/Notification';
import User from '@/models/User'; 

export const dynamic = 'force-dynamic';

export async function GET(req) {
  // --- BLOK ANTI-CRASH UTAMA ---
  try {
    // 1. Coba Koneksi DB
    try {
        await connectDB();
    } catch (dbError) {
        console.error("Database Error:", dbError);
        // JIKA DB ERROR, JANGAN 500. Return kosong saja biar loading berhenti.
        return NextResponse.json({ notifications: [], unreadCount: 0 });
    }
    
    // 2. Cek Token
    const token = cookies().get('token')?.value;
    if (!token) {
        return NextResponse.json({ notifications: [], unreadCount: 0 }); 
    }
    
    // 3. Decode Token (Dengan Try-Catch agar tidak crash jika token rusak)
    let userId;
    try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
        userId = decoded.userId;
    } catch (err) {
        return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    if (!userId) return NextResponse.json({ notifications: [], unreadCount: 0 });

    // 4. Cek User
    // Kita gunakan lean() agar lebih ringan dan menghindari error validasi Mongoose
    const user = await User.findById(userId).select('isPremium').lean();
    if (!user) return NextResponse.json({ notifications: [], unreadCount: 0 });
    
    const statusUser = user.isPremium ? 'premium' : 'free';
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 5. Query Notifikasi
    // Kita sederhanakan query untuk memastikan data bisa ditarik
    const matchCondition = {
      $or: [
        // A. Personal
        { userId: userObjectId },
        // B. Broadcast
        { 
          target: 'all', 
          targetGroup: { $in: ['all', statusUser] } 
        }
      ]
    };

    // Ambil data
    const notifications = await Notification.find(matchCondition)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(); // PENTING: .lean() mengubah hasil jadi JSON murni, mencegah error circular structure

    // Hitung unread (Opsional, jika error kita anggap 0)
    let unreadCount = 0;
    try {
        unreadCount = await Notification.countDocuments({
            ...matchCondition,
            isRead: false
        });
    } catch (e) { unreadCount = 0; }

    return NextResponse.json({
        success: true,
        notifications: notifications || [], // Pastikan selalu array
        unreadCount: unreadCount || 0
    });

  } catch (criticalError) {
    console.error("CRITICAL ERROR NOTIF:", criticalError);
    // SOLUSI LOADING TERUS: 
    // Jika terjadi error parah, KITA PAKSA return array kosong dengan status 200 (OK).
    // Ini akan membuat Frontend berhenti loading dan menampilkan "Tidak ada notifikasi".
    return NextResponse.json({ 
        success: true, 
        notifications: [], 
        unreadCount: 0 
    }, { status: 200 }); 
  }
}

// Handler untuk Mark as Read (PUT)
export async function PUT(req) {
    try {
        await connectDB();
        const token = cookies().get('token')?.value;
        if (!token) return NextResponse.json({ success: false });

        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
        
        await Notification.updateMany(
            { userId: decoded.userId, isRead: false },
            { $set: { isRead: true } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false });
    }
}