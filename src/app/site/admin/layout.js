import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Link from 'next/link';
import connectDB from '@/lib/db'; 
import User from '@/models/User';
import { 
  LayoutDashboard, Users, Receipt, Settings, 
  LogOut, ShieldCheck, Megaphone, Zap, ChevronRight,
  Ticket, Gift, Cpu, Database
} from 'lucide-react';

export default async function AdminLayout({ children }) {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'rahasia_jitu');
    await connectDB();
    const user = await User.findById(decoded.userId);

    // SECURITY CHECK: Tendang jika bukan admin
    if (!user || user.role !== 'admin') redirect('/site/dashboard');

    const adminMenus = [
      // KITA GANTI "Overview" JADI "AI Tools Manager" (Sesuai page yang baru dibuat)
      { name: 'AI Tools Manager', href: '/site/admin', icon: <Cpu size={18} /> },
      
      { name: 'Data Transaksi', href: '/site/admin/transactions', icon: <Receipt size={18} /> },
      { name: 'Management User', href: '/site/admin/users', icon: <Users size={18} /> },
      { name: 'Voucher Promo', href: '/site/admin/vouchers', icon: <Ticket size={18} /> },
      { name: 'Kelola Paket', href: '/site/admin/packages', icon: <Gift size={18} /> },
      { name: 'Broadcast', href: '/site/admin/broadcast', icon: <Megaphone size={18} /> },
      { name: 'Global Setting', href: '/site/admin/settings', icon: <Settings size={18} /> },
    ];

    return (
      <div className="flex min-h-screen bg-slate-50 tracking-tight font-poppins antialiased">
        
        {/* --- SIDEBAR: PREMIUM DARK --- */}
        <aside className="w-64 bg-[#0F172A] text-slate-400 flex flex-col fixed h-full z-50 border-r border-slate-800 shadow-2xl">
          
          {/* 1. Header Branding */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <Zap className="w-5 h-5 text-white fill-white" /> 
              </div>
              <span className="font-black text-white text-xl uppercase tracking-tighter italic">
                JITU <span className="text-blue-500 not-italic">ADMIN</span>
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg w-full">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              <span className="font-bold text-[9px] text-rose-500 uppercase tracking-widest">Super User Access</span>
            </div>
          </div>

          <div className="px-6 mb-2 mt-2">
             <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Control Panel</p>
          </div>
          
          {/* 2. Navigasi */}
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
            {adminMenus.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl transition-all hover:bg-white/5 hover:text-white group text-[11px] font-bold uppercase tracking-wide border border-transparent hover:border-slate-700/50"
              >
                <div className="flex items-center gap-3">
                    <span className="text-slate-500 group-hover:text-blue-500 transition-colors">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                </div>
                <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-blue-500" />
              </Link>
            ))}
          </nav>

          {/* 3. Footer Area */}
          <div className="p-4 border-t border-slate-800/50 bg-[#0b1121]">
            <Link 
                href="/site/dashboard" 
                className="flex items-center justify-center gap-3 w-full py-3 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-lg group mb-4 active:scale-95"
            >
                <LogOut size={14} />
                <span>Exit Admin</span>
            </Link>
            
            <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold border-2 border-slate-900">
                    {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[9px] text-emerald-500 font-medium truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                    </p>
                </div>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 ml-64 min-h-screen bg-slate-50/50">
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