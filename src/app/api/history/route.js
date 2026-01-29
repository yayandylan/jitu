import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import History from '@/models/History';

// Mencegah caching agar data selalu fresh
export const dynamic = 'force-dynamic';

// Helper: Verifikasi User
async function getUserId() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// 1. GET: AMBIL HISTORY
export async function GET(req) {
  try {
    await connectDB();
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const tool = searchParams.get('tool');

    // Filter query
    const query = { userId };
    if (tool) query.toolType = tool;

    // Ambil data, urutkan terbaru, limit 20 agar tidak berat
    const data = await History.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    // Return dengan key 'data' agar sesuai dengan frontend Bapak
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("GET History Error:", error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

// 2. POST: SIMPAN HISTORY MANUAL (Opsional)
// Biasanya history disimpan otomatis oleh API Tools (misal: /api/ai/vision), 
// tapi endpoint ini berguna jika ada tool yang process-nya di client-side.
export async function POST(req) {
  try {
    await connectDB();
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // Validasi input
    if (!body.toolType || !body.resultData) {
      return NextResponse.json({ message: 'Data tidak lengkap' }, { status: 400 });
    }

    const newHistory = await History.create({
      userId,
      toolType: body.toolType,
      title: body.title || 'Untitled',
      inputData: body.inputData || {},
      resultData: body.resultData
    });

    return NextResponse.json({ success: true, message: 'History saved', data: newHistory });

  } catch (error) {
    console.error("POST History Error:", error);
    return NextResponse.json({ message: 'Gagal menyimpan history' }, { status: 500 });
  }
}

// 3. DELETE: HAPUS HISTORY
export async function DELETE(req) {
  try {
    await connectDB();
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'ID required' }, { status: 400 });

    // Hapus hanya jika ID history milik user yang sedang login (Security)
    const deleted = await History.findOneAndDelete({ _id: id, userId });

    if (!deleted) {
      return NextResponse.json({ message: 'Data tidak ditemukan atau bukan milik Anda' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'History deleted' });

  } catch (error) {
    console.error("DELETE History Error:", error);
    return NextResponse.json({ message: 'Gagal menghapus history' }, { status: 500 });
  }
}