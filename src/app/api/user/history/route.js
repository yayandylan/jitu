import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import History from '@/models/History'; 

export const dynamic = 'force-dynamic';

// --- HELPER: Auth Check ---
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
// 1. GET: Ambil Riwayat
// =================================================================
export async function GET(req) {
  try {
    await connectDB();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    
    const { searchParams } = new URL(req.url);
    const toolType = searchParams.get('tool');
    const limit = Number(searchParams.get('limit')) || 20;

    let query = { userId };
    if (toolType) query.toolType = toolType;

    const history = await History.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({ success: true, data: history });

  } catch (error) {
    console.error("History GET Error:", error);
    return NextResponse.json({ message: 'Gagal mengambil riwayat' }, { status: 500 });
  }
}

// =================================================================
// 2. POST: Simpan Riwayat Baru (Awal Chat)
// =================================================================
export async function POST(req) {
  try {
    await connectDB();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { toolType, title, inputData, resultData } = body;

    const newHistory = await History.create({
        userId,
        toolType,
        title: title || 'Generate AI',
        inputData: inputData || {}, // Menyimpan array chat awal
        resultData
    });

    return NextResponse.json({ success: true, data: newHistory });

  } catch (error) {
    console.error("History POST Error:", error);
    return NextResponse.json({ message: 'Gagal menyimpan riwayat' }, { status: 500 });
  }
}

// =================================================================
// 3. PUT: Update Riwayat (KHUSUS CHAT LANJUTAN) [PENTING!]
// =================================================================
export async function PUT(req) {
  try {
    await connectDB();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, inputData, resultData } = body;

    if (!id) return NextResponse.json({ message: 'History ID wajib ada' }, { status: 400 });

    // Cari history milik user ini dan update datanya (timpa chat lama dengan chat baru yang lebih panjang)
    const updatedHistory = await History.findOneAndUpdate(
      { _id: id, userId }, // Security: Pastikan punya user yang login
      { 
        inputData,  // Update array chat
        resultData, // Update jawaban terakhir
        updatedAt: new Date() 
      },
      { new: true } // Return data terbaru setelah update
    );

    if (!updatedHistory) {
        return NextResponse.json({ message: 'Riwayat tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedHistory });

  } catch (error) {
    console.error("History PUT Error:", error);
    return NextResponse.json({ message: 'Gagal update riwayat' }, { status: 500 });
  }
}

// =================================================================
// 4. DELETE: Hapus Riwayat
// =================================================================
export async function DELETE(req) {
  try {
    await connectDB();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'ID diperlukan' }, { status: 400 });

    const deleted = await History.findOneAndDelete({ _id: id, userId });

    if (!deleted) return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Riwayat berhasil dihapus' });

  } catch (error) {
    console.error("History DELETE Error:", error);
    return NextResponse.json({ message: 'Gagal menghapus riwayat' }, { status: 500 });
  }
}