import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Link from 'next/link';
import connectDB from '../../../lib/db';
import User from '../../../models/User';
import { 
  LayoutDashboard, Users, Receipt, Settings, 
  Wrench, LogOut, ShieldCheck, Megaphone, Zap, ChevronRight,
  Ticket, Gift // TAMBAHKAN IKON GIFT
} from 'lucide-react';

export default async function AdminLayout({ children }) {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();
    const user = await User.findById(decoded.userId);

    if (!user || user.role !== 'admin') redirect('/dashboard');

    const adminMenus = [
      { name: 'Overview', href: '/admin', icon: <LayoutDashboard size={18} /> },
      { name: 'Kelola Transaksi', href: '/admin/transactions', icon: <Receipt size={18} /> },
      { name: 'Voucher Promo', href: '/admin/vouchers', icon: <Ticket size={18} /> },
      { name: 'Kelola Paket', href: '/admin/packages', icon: <Gift size={18} /> }, // MENU BARU
      { name: 'Global Setting', href: '/admin/settings', icon: <Settings size={18} /> },
      { name: 'Manage User', href: '/admin/users', icon: <Users size={18} /> },
      { name: 'Config Tools', href: '/admin/tools', icon: <Wrench size={18} /> },
      { name: 'Broadcast', href: '/admin/broadcast', icon: <Megaphone size={18} /> },
    ];

    return (
      <div className="flex min-h-screen bg-slate-50 tracking-tighter font-poppins antialiased">
        
        {/* --- SIDEBAR: PREMIUM DARK --- */}
        <aside className="w-64 bg-[#0F172A] text-slate-400 flex flex-col fixed h-full z-50 border-r border-slate-800">
          
          {/* 1. Header Branding */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <Zap className="w-5 h-5 text-white fill-white" /> 
              </div>
              <span className="font-black text-white text-xl uppercase tracking-tighter">
                JITU <span className="text-blue-500">DIGITAL</span>
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-bold text-[9px] text-rose-500 uppercase tracking-widest">Admin Control</span>
            </div>
          </div>

          <div className="px-4 mb-2">
             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] px-2 mb-4">Main Menu</p>
          </div>
          
          {/* 2. Navigasi & Tombol Keluar */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {adminMenus.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center justify-between px-4 py-3 rounded-xl transition-all hover:bg-white/5 hover:text-white group text-[11px] font-medium"
              >
                <div className="flex items-center gap-3">
                    <span className="text-slate-500 group-hover:text-blue-500 transition-colors">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                </div>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Link>
            ))}

            {/* TOMBOL KELUAR: Sekarang berada tepat di bawah daftar menu */}
            <div className="pt-4 mt-4 border-t border-slate-800/50">
                <Link 
                href="/dashboard" 
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-500 hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider group"
                >
                <LogOut size={18} className="text-slate-500 group-hover:text-white" />
                <span>Keluar Admin</span>
                </Link>
            </div>
          </nav>

          {/* 3. Footer Area (Hanya Status Server) */}
          <div className="p-4 border-t border-slate-800/50">
            <div className="bg-white/5 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Status Server</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[11px] text-white font-medium">Sistem Normal</span>
                </div>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 ml-64 min-h-screen bg-slate-50">
          <div className="max-w-7xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    );
  } catch (error) {
    redirect('/login');
  }
}