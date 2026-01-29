import { NextResponse } from 'next/server';
// Pakai jalur manual agar aman
import connectDB from '@/lib/db'; 
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();

    // 1. Hapus Index 'username' yang bikin error
    try {
      await User.collection.dropIndex('username_1');
      console.log("Index username berhasil dihapus");
    } catch (e) {
      console.log("Index username tidak ditemukan (aman)");
    }

    // 2. Hapus SEMUA User (Reset Total) agar bisa daftar ulang yang bersih
    await User.deleteMany({});

    return NextResponse.json({ 
      message: 'Database berhasil di-reset! Silakan daftar ulang.' 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update fix