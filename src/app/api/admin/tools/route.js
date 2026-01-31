import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import ToolConfig from '@/models/ToolConfig';
import User from '@/models/User';

// Mencegah Next.js melakukan caching statis pada API Admin
export const dynamic = 'force-dynamic'; 

// --- MIDDLEWARE INTERNAL: CEK ADMIN ---
async function isAdminAuthorized() {
  const token = cookies().get('token')?.value;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    
    // 1. Cek dari Token (Cepat)
    if (decoded.role === 'admin') return true;

    // 2. Cek ke Database (Aman - jika role baru diupdate via database langsung)
    await connectDB();
    const user = await User.findById(decoded.userId);
    return user && user.role === 'admin';

  } catch (error) {
    return false;
  }
}

// 1. [GET] AMBIL SEMUA TOOLS
export async function GET() {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ message: 'Akses ditolak' }, { status: 403 });
  }

  try {
    await connectDB();
    // Sort agar urutan tool rapi (A-Z)
    const tools = await ToolConfig.find({}).sort({ category: 1, name: 1 });
    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json({ message: 'Gagal fetch database' }, { status: 500 });
  }
}

// 2. [PUT] UPDATE KONFIGURASI (SAVE BUTTON)
export async function PUT(req) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    // Ambil data yang dikirim frontend
    const { id, creditCost, aiModel, isActive, costPerToken } = await req.json();
    
    await connectDB();

    // Validasi Data
    const finalCreditCost = Math.max(0, parseInt(creditCost) || 0); // Cegah minus
    const finalIsActive = Boolean(isActive); // Pastikan Boolean

    const updatedTool = await ToolConfig.findByIdAndUpdate(
      id, 
      {
        creditCost: finalCreditCost,
        aiModel: aiModel,
        isActive: finalIsActive, // <-- INI KUNCI TOMBOL POWER
        costPerToken: parseFloat(costPerToken) || 0 
      },
      { new: true, runValidators: true }
    );

    if (!updatedTool) {
      return NextResponse.json({ message: 'Tool tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: `Konfigurasi ${updatedTool.name} berhasil disimpan!`,
      data: updatedTool
    });

  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 3. [DELETE] HAPUS TOOL (JIKA ADA DUPLIKAT)
export async function DELETE(req) {
  if (!(await isAdminAuthorized())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID diperlukan' }, { status: 400 });
    }

    await connectDB();
    const deletedTool = await ToolConfig.findByIdAndDelete(id);

    if (!deletedTool) {
      return NextResponse.json({ message: 'Data sudah tidak ada' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Tool ${deletedTool.name} berhasil dihapus permanen.` 
    });

  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}