"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, Receipt, Settings, LogOut, ShieldCheck, 
  Megaphone, Zap, ChevronRight, Ticket, Gift, Cpu, 
  Menu, X, LayoutGrid, ChevronLeft
} from 'lucide-react';

export default function AdminShell({ user, children }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile Drawer
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop Minimize
  const pathname = usePathname();

  const adminMenus = [
    { name: 'AI Tools Manager', href: '/site/admin/tools', icon: <Cpu size={18} /> },
    { name: 'Data Transaksi', href: '/site/admin/transactions', icon: <Receipt size={18} /> },
    { name: 'Management User', href: '/site/admin/users', icon: <Users size={18} /> },
    { name: 'Voucher Promo', href: '/site/admin/vouchers', icon: <Ticket size={18} /> },
    { name: 'Kelola Paket', href: '/site/admin/packages', icon: <Gift size={18} /> },
    { name: 'Broadcast', href: '/site/admin/broadcast', icon: <Megaphone size={18} /> },
    { name: 'Global Setting', href: '/site/admin/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-poppins antialiased text-slate-900">
      
      {/* --- MOBILE OVERLAY --- */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-300"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] bg-[#0F172A] text-slate-400 flex flex-col border-r border-slate-800 shadow-2xl transition-all duration-300 ease-in-out
        md:translate-x-0 md:static md:h-screen md:shrink-0
        ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72'}
        ${isCollapsed ? 'md:w-20' : 'md:w-72'}
      `}>
        
        {/* Header Sidebar */}
        <div className={`p-6 flex items-center transition-all ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 shrink-0">
              <Zap className="w-5 h-5 text-white fill-white" /> 
            </div>
            {!isCollapsed && (
              <span className="font-black text-white text-xl uppercase tracking-tighter italic animate-in slide-in-from-left-2">
                JITU <span className="text-blue-500 not-italic text-sm">ADMIN</span>
              </span>
            )}
          </div>
          {/* Close button mobile */}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar mt-4">
          {adminMenus.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={index}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all group border whitespace-nowrap
                    ${isActive 
                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/50' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'
                    }
                    ${isCollapsed ? 'justify-center px-0' : ''}
                `}
                title={isCollapsed ? item.name : ''}
              >
                <span className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}>
                  {item.icon}
                </span>
                {!isCollapsed && <span className="text-[11px] font-bold uppercase tracking-wide">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Mini */}
        <div className={`p-4 border-t border-slate-800/50 bg-[#0b1121] transition-all ${isCollapsed ? 'items-center px-2' : ''}`}>
           <div className={`flex items-center gap-3 p-2 rounded-2xl bg-slate-800/30 border border-slate-800 mb-4 ${isCollapsed ? 'justify-center px-0 border-none bg-transparent' : ''}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold border-2 border-slate-900 shadow-lg shrink-0">
                  {user?.name?.charAt(0)}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden animate-in fade-in">
                    <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[9px] text-emerald-500 font-medium truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Admin Mode
                    </p>
                </div>
              )}
           </div>

           <Link href="/site/dashboard" className={`flex items-center gap-3 w-full py-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest active:scale-95 border border-rose-500/20 ${isCollapsed ? 'justify-center' : 'px-4'}`}>
              <LogOut size={16} />
              {!isCollapsed && <span>Exit Admin</span>}
           </Link>
        </div>
      </aside>

      {/* --- MAIN PAGE WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* --- NAVBAR TOP --- */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
           <div className="flex items-center gap-4">
              {/* Toggle Sidebar Button */}
              <button 
                onClick={() => {
                  if (window.innerWidth < 768) setSidebarOpen(true);
                  else setIsCollapsed(!isCollapsed);
                }}
                className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90 shadow-sm border border-slate-100"
              >
                {isCollapsed ? <LayoutGrid size={20}/> : <Menu size={20} />}
              </button>
              
              <div className="hidden sm:block">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                     <ShieldCheck size={16} className="text-blue-600"/> Dashboard Administrator
                  </h2>
              </div>
           </div>

           <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Server Status</span>
                  <span className="text-[11px] font-black text-emerald-500 uppercase tracking-tighter">System Online</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                  <Settings size={18} />
              </div>
           </div>
        </header>

        {/* --- PAGE CONTENT --- */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
             {children}
          </div>
        </main>
      </div>

    </div>
  );
}