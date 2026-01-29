import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import mongoose from 'mongoose'; 
import connectDB from '@/lib/db'; 
import Notification from '@/models/Notification';
import User from '@/models/User'; // Wajib import model User

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

    // 3. Ambil Status User (Free/Premium)
    const user = await User.findById(userId).select('isPremium');
    if (!user) return NextResponse.json([]);
    
    const statusUser = user.isPremium ? 'premium' : 'free';
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 4. Query Segmentasi (Filter Berdasarkan Group)
    const notifications = await Notification.find({
      $or: [
        { 
          target: 'all', 
          targetGroup: { $in: ['all', statusUser] } // Hanya ambil pesan 'all' atau yang cocok dengan status user
        },                      
        { 
          target: 'user', 
          userId: userObjectId 
        } // Pesan pribadi tetap muncul
      ]
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json(notifications);

  } catch (error) {
    console.error("Error Fetch Notif:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}