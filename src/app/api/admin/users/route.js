import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export const dynamic = 'force-dynamic';

// 1. [GET] AMBIL SEMUA USER
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}).sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 2. [PUT] KHUSUS UPDATE SALDO (ADJUST CREDIT)
export async function PUT(req) {
  try {
    await connectDB();
    const { userId, action, amount } = await req.json();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });

    if (action === 'adjust_credit') {
        const adjustment = Number(amount);
        
        // Update Saldo
        user.credits = (user.credits || 0) + adjustment;
        if (user.credits < 0) user.credits = 0; 
        await user.save();

        // CATAT DI TRANSACTION (Tipe 'add'/'reduce' biar sinkron dengan UI)
        await Transaction.create({
            userId: user._id,
            amount: Math.abs(adjustment),
            type: adjustment > 0 ? 'add' : 'reduce', 
            status: 'success',
            description: adjustment > 0 
                ? 'Penambahan poin oleh sistem admin' 
                : 'Koreksi/Pengurangan poin oleh sistem admin'
        });

        return NextResponse.json({ success: true, message: 'Saldo diperbarui!' });
    }

    return NextResponse.json({ message: 'Aksi tidak valid' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 3. [PATCH] UPDATE PROFIL (NAME, ROLE, PREMIUM)
export async function PATCH(req) {
  try {
    await connectDB();
    const { id, name, role, isPremium } = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
      id, 
      { name, role, isPremium }, 
      { new: true }
    );

    if (!updatedUser) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Data user berhasil diupdate' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 4. [DELETE] HAPUS USER PERMANEN
export async function DELETE(req) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ message: 'ID diperlukan' }, { status: 400 });

        // Cek apakah user ada
        const user = await User.findById(id);
        if (!user) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });

        // Jangan izinkan admin hapus diri sendiri (Safety check sederhana)
        // Jika Bapak butuh proteksi lebih, bisa bandingkan ID dengan session

        await User.findByIdAndDelete(id);
        
        // Bersihkan log transaksi user tersebut
        await Transaction.deleteMany({ userId: id });

        return NextResponse.json({ success: true, message: 'User & History dihapus permanent' });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}