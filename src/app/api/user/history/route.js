import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
// FIX: Pastikan pakai model History (untuk simpan hasil generate AI)
import History from '@/models/History'; 

export const dynamic = 'force-dynamic';

// 1. GET: Ambil Riwayat Generate AI
export async function GET(req) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();
    
    // Ambil query params
    const { searchParams } = new URL(req.url);
    const toolType = searchParams.get('tool'); // misal: 'magic-ad-script'
    const limit = Number(searchParams.get('limit')) || 20;

    let query = { userId: decoded.userId };
    
    // Jika ada filter tool tertentu
    if (toolType) {
        query.toolType = toolType;
    }

    const history = await History.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ 
        success: true,
        data: history 
    });

  } catch (error) {
    console.error("History GET Error:", error);
    return NextResponse.json({ message: 'Gagal mengambil riwayat' }, { status: 500 });
  }
}

// 2. DELETE: Hapus Riwayat Tertentu
export async function DELETE(req) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ message: 'ID diperlukan' }, { status: 400 });
    }

    // Hapus hanya jika milik user tersebut
    const deleted = await History.findOneAndDelete({ 
        _id: id, 
        userId: decoded.userId 
    });

    if (!deleted) {
        return NextResponse.json({ message: 'Data tidak ditemukan atau bukan milik Anda' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Riwayat berhasil dihapus' });

  } catch (error) {
    console.error("History DELETE Error:", error);
    return NextResponse.json({ message: 'Gagal menghapus riwayat' }, { status: 500 });
  }
}