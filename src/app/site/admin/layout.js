import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/db'; 
import User from '@/models/User';
import AdminShell from './AdminShell'; // Import UI Client

export default async function AdminLayout({ children }) {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();
    const user = await User.findById(decoded.userId).lean(); // Gunakan lean() agar ringan

    // SECURITY CHECK
    if (!user || user.role !== 'admin') redirect('/site/dashboard');

    // Serialisasi Data User (ubah _id object ke string agar bisa masuk Client Component)
    const serializedUser = {
        name: user.name,
        email: user.email,
        role: user.role
    };

    // Render UI Client
    return <AdminShell user={serializedUser}>{children}</AdminShell>;

  } catch (error) {
    redirect('/login');
  }
}