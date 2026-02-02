import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db';
import PostHistory from '@/models/PostHistory';

// Helper: Get User ID from Token
const getUserId = () => {
    const token = cookies().get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
        return decoded.userId;
    } catch (error) { return null; }
};

// 1. GET: Ambil Semua History User Ini
export async function GET(req) {
    await connectDB();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const history = await PostHistory.find({ userId }).sort({ createdAt: -1 }).limit(20);
        return NextResponse.json({ success: true, history });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// 2. POST: Simpan History Baru
export async function POST(req) {
    await connectDB();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const newPost = await PostHistory.create({
            userId,
            topic: body.topic,
            headline: body.headline,
            caption: body.caption,
            imageUrl: body.imageUrl,
            theme: body.theme
        });

        return NextResponse.json({ success: true, data: newPost });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// 3. DELETE: Hapus History
export async function DELETE(req) {
    await connectDB();
    const userId = getUserId();
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        
        await PostHistory.findOneAndDelete({ _id: id, userId });
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}