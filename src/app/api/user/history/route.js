import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import History from '@/models/History'; 

export const dynamic = 'force-dynamic';

// --- HELPER: Auth Check (Biar gak duplikat code) ---
const getUserId = () => {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

// =================================================================
// 1. GET: Ambil Riwayat (Untuk Sidebar / Halaman History)
// =================================================================
export async function GET(req) {
  try {
    await connectDB();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    // Ambil parameter filter
    const { searchParams } = new URL(req.url);
    const toolType = searchParams.get('tool'); // misal: 'riset-produk'
    const limit = Number(searchParams.get('limit')) || 20;

    let query = { userId };
    
    // Filter by tool jika ada
    if (toolType) {
        query.toolType = toolType;
    }

    const history = await History.find(query)
      .sort({ createdAt: -1 }) // Terbaru di atas
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

// =================================================================
// 2. POST: Simpan Riwayat Baru (INI YANG KEMARIN HILANG)
// =================================================================
export async function POST(req) {
  try {
    await connectDB();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { toolType, title, inputData, resultData } = body;

    // Validasi sederhana
    if (!toolType || !resultData) {
        return NextResponse.json({ message: 'Data history tidak lengkap' }, { status: 400 });
    }

    // Simpan ke MongoDB
    const newHistory = await History.create({
        userId,
        toolType,
        title: title || 'Generate AI',
        inputData: inputData || {},
        resultData
    });

    return NextResponse.json({ 
        success: true, 
        data: newHistory 
    });

  } catch (error) {
    console.error("History POST Error:", error);
    return NextResponse.json({ message: 'Gagal menyimpan riwayat' }, { status: 500 });
  }
}

// =================================================================
// 3. DELETE: Hapus Riwayat
// =================================================================
export async function DELETE(req) {
  try {
    await connectDB();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'ID diperlukan' }, { status: 400 });

    // Hapus data (Pastikan milik user yang login)
    const deleted = await History.findOneAndDelete({ 
        _id: id, 
        userId 
    });

    if (!deleted) {
        return NextResponse.json({ message: 'Data tidak ditemukan / Akses ditolak' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Riwayat berhasil dihapus' });

  } catch (error) {
    console.error("History DELETE Error:", error);
    return NextResponse.json({ message: 'Gagal menghapus riwayat' }, { status: 500 });
  }
}