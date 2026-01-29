import { NextResponse } from 'next/server';
import connectDB from '@/lib/db'; // Jalur manual (aman)
import GlobalSetting from '@/models/GlobalSetting'; // Jalur manual (aman)

export async function GET(req) {
  try {
    await connectDB();
    
    // Ambil settingan, kalau belum ada kita buat baru (upsert)
    let settings = await GlobalSetting.findById('config_utama');
    
    if (!settings) {
      settings = await GlobalSetting.create({ _id: 'config_utama', pricePerPoint: 100 });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ message: 'Error mengambil setting' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { pricePerPoint, minimumTopup } = await req.json();
    await connectDB();

    const settings = await GlobalSetting.findByIdAndUpdate(
      'config_utama',
      { 
        pricePerPoint, 
        minimumTopup,
        updatedAt: Date.now() 
      },
      { new: true, upsert: true } // Buat baru jika tidak ada
    );

    return NextResponse.json({ message: 'Harga berhasil diupdate!', settings });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal update setting' }, { status: 500 });
  }
}