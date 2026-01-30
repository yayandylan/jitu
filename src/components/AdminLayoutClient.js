"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, Receipt, Settings, LogOut, ShieldCheck, 
  Megaphone, Zap, ChevronRight, Ticket, Gift, Cpu, 
  Menu, X 
} from 'lucide-react';

export default function AdminLayoutClient({ children, user }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const adminMenus = [
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
      
      {/* --- MOBILE HEADER (Hanya muncul di HP) --- */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0F172A] border-b border-slate-800 z-[60] flex items-center justify-between px-4 shadow-lg">
         <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
                <Zap className="w-4 h-4 text-white fill-white" /> 
            </div>
            <span className="font-black text-white text-sm uppercase tracking-tighter italic">
                JITU <span className="text-blue-500 not-italic">ADMIN</span>
            </span>
         </div>
         <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-lg active:scale-95 transition-all"
         >
            {isSidebarOpen ? <X size={24}/> : <Menu size={24}/>}
         </button>
      </header>

      {/* --- BACKDROP MOBILE --- */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR: PREMIUM DARK (Responsive) --- */}
      <aside className={`
        fixed md:fixed left-0 top-0 h-full w-64 bg-[#0F172A] text-slate-400 flex flex-col z-50 border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        
        {/* 1. Header Branding (Desktop) */}
        <div className="p-6 pt-8 md:pt-6">
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
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pb-20">
          {adminMenus.map((item, index) => {
            const isActive = pathname === item.href;
            return (
                <Link
                    key={index}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)} // Tutup sidebar saat klik menu (Mobile)
                    className={`
                        flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group text-[11px] font-bold uppercase tracking-wide border 
                        ${isActive 
                            ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/50' 
                            : 'hover:bg-white/5 hover:text-white border-transparent hover:border-slate-700/50'
                        }
                    `}
                >
                    <div className="flex items-center gap-3">
                        <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-500'} transition-colors`}>
                        {item.icon}
                        </span>
                        <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight size={12} className="text-white" />}
                </Link>
            );
          })}
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
                  {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin'}</p>
                  <p className="text-[9px] text-emerald-500 font-medium truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                  </p>
              </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      {/* md:ml-64 : Margin kiri hanya di Desktop */}
      {/* pt-16 : Padding atas untuk Mobile Header */}
      <main className="flex-1 md:ml-64 min-h-screen bg-slate-50 transition-all duration-300">
        <div className="p-4 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}