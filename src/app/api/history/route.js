import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import History from '@/models/History';

export const dynamic = 'force-dynamic';

// 1. FUNGSI UNTUK MENGAMBIL HISTORY (GET)
export async function GET(req) {
  try {
    await connectDB();
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Sesi habis' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    const { searchParams } = new URL(req.url);
    const tool = searchParams.get('tool');

    // Filter berdasarkan ID user yang login
    const filter = { userId: decoded.userId }; 
    if (tool) filter.toolType = tool;

    const data = await History.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil riwayat' }, { status: 500 });
  }
}

// 2. FUNGSI UNTUK MENYIMPAN HISTORY BARU (POST) - TAMBAHKAN INI PAK
export async function POST(req) {
  try {
    await connectDB();
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    const body = await req.json();

    // Simpan ke MongoDB dengan userId pemiliknya
    const newHistory = await History.create({
      userId: decoded.userId, // Link-kan ke user yang sedang login
      toolType: body.toolType,
      title: body.title,
      inputData: body.inputData,
      resultData: body.resultData
    });

    return NextResponse.json({ message: 'Berhasil disimpan', data: newHistory });
  } catch (error) {
    console.error("Gagal simpan history:", error);
    return NextResponse.json({ message: 'Gagal menyimpan riwayat' }, { status: 500 });
  }
}

// 3. FUNGSI UNTUK MENGHAPUS (DELETE)
export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const token = cookies().get('token')?.value;
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');

    // Hanya hapus jika ID riwayat DAN userId cocok
    const deletedHistory = await History.findOneAndDelete({ 
      _id: id, 
      userId: decoded.userId 
    });

    if (!deletedHistory) {
      return NextResponse.json({ message: 'Data tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Riwayat berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}