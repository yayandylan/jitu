import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import GlobalSetting from '@/models/GlobalSetting';

export const dynamic = 'force-dynamic';

// GET: Ambil Settingan
export async function GET(req) {
  try {
    await connectDB();
    
    // Cari dokumen dengan ID 'config_utama'
    let settings = await GlobalSetting.findById('config_utama');
    
    // Jika database kosong/belum ada setting, buat default baru
    if (!settings) {
      settings = await GlobalSetting.create({ 
        _id: 'config_utama', 
        pricePerPoint: 100,
        minimumTopup: 10000
      });
    }

    // Return format yang konsisten untuk frontend
    return NextResponse.json({ 
      success: true,
      settings,
      pricePerPoint: settings.pricePerPoint // Shortcut untuk frontend
    });

  } catch (error) {
    console.error("Setting API Error:", error);
    // Fallback agar frontend tidak crash
    return NextResponse.json({ success: false, pricePerPoint: 100 });
  }
}

// POST: Update Settingan
export async function POST(req) {
  try {
    const { pricePerPoint, minimumTopup, maintenanceMode } = await req.json();
    await connectDB();

    const settings = await GlobalSetting.findByIdAndUpdate(
      'config_utama',
      { 
        pricePerPoint, 
        minimumTopup,
        maintenanceMode,
        updatedAt: Date.now() 
      },
      { new: true, upsert: true } // Upsert = Buat baru jika ID tidak ditemukan
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Pengaturan berhasil disimpan!', 
      settings 
    });

  } catch (error) {
    return NextResponse.json({ message: 'Gagal update setting' }, { status: 500 });
  }
}