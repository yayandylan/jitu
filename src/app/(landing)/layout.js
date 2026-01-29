"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { deleteCookie } from 'cookies-next'; 
import { Poppins } from 'next/font/google';
import NotificationBell from '../../components/NotificationBell'; 
import { 
  LayoutDashboard, User, Search, Target, Clapperboard, 
  ScanEye, Image as ImageIcon, BarChart2, Calculator, 
  LogOut, Zap, ShieldCheck, Wallet, Plus, Settings,
  Menu, X, LayoutTemplate, 
  LockKeyhole, Flame, Rocket 
} from 'lucide-react';

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700', '800', '900'] 
});

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
    // Tutup sidebar otomatis saat pindah halaman di mobile
    setSidebarOpen(false);
  }, [pathname]);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/me');
      const data = await res.json();
      if (data.user) {
        setUserData(data.user);
        setIsAdmin(data.user.role === 'admin');
      }
    } catch (error) {
      console.error("Gagal sinkron data");
    }
  };

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} />, isFree: true },
    { section: 'TOOLS UTAMA' },
    { name: 'Riset Produk', href: '/tools/riset-produk', icon: <Search size={20} />, badge: 'HOT', isFree: true },
    { name: 'Validasi Market', href: '/tools/validasi-market', icon: <Target size={20} />, isFree: false },
    { name: 'Magic Ad Script', href: '/tools/magic-ad-script', icon: <Clapperboard size={20} />, isFree: false },
    { name: 'Landing Page Builder', href: '/tools/landing-page', icon: <LayoutTemplate size={20} />, badge: 'HOT', isFree: false },
    { name: 'Audit Funnel', href: '/tools/ad-review', icon: <ScanEye size={20} />, isFree: false },
    { name: 'Analisis Iklan', href: '/tools/analisis-iklan', icon: <BarChart2 size={20} />, isFree: false },
    { name: 'Kalkulator Ads', href: '/tools/kalkulator-ads', icon: <Calculator size={20} />, isFree: false },
    { section: 'COMING SOON' },
    { name: 'Generate Gambar', href: '#', icon: <ImageIcon size={20} />, disabled: true, badge: 'SOON', isFree: false },
  ];

  if (isAdmin) {
    menuItems.push(
      { section: 'ADMINISTRATOR' },
      { name: 'Admin Panel', href: '/admin', icon: <ShieldCheck size={20} />, adminOnly: true, isFree: true }
    );
  }

  const handleMenuClick = (e, item) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }
    if (!item.isFree && !userData?.isPremium) {
      e.preventDefault();
      router.push('/topup');
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex ${poppins.className} tracking-tighter`}>
      
      {/* --- MOBILE TOP HEADER (Hanya muncul di HP) --- */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 z-[60] flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-sm font-[900] text-slate-900 uppercase">JITU <span className="text-blue-600">DIGITAL</span></span>
        </div>
        <div className="flex items-center gap-2">
            <NotificationBell />
            <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="p-2 bg-slate-50 rounded-xl text-slate-600 active:scale-90 transition-all"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </header>

      {/* --- BACKDROP OVERLAY (Mobile Only) --- */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] md:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        w-72 md:w-64 bg-white border-r border-slate-100 fixed h-full z-50 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        
        {/* LOGO AREA (Hidden on Mobile Header is enough, but kept for desktop) */}
        <div className="h-16 hidden md:flex items-center justify-between px-5 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1 rounded-lg shadow-md">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-lg font-[900] text-slate-900 uppercase">JITU <span className="text-blue-600">DIGITAL</span></span>
          </div>
          <NotificationBell />
        </div>

        {/* LOGO AREA FOR MOBILE (Inside Sidebar) */}
        <div className="md:hidden h-16 flex items-center justify-between px-6 border-b border-slate-50 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Navigation Menu</span>
            <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400"><X size={20}/></button>
        </div>

        {/* WIDGET SALDO */}
        <div className="px-4 md:px-3 pt-6 md:pt-3 pb-2 shrink-0">
          <div className={`rounded-2xl p-5 md:p-4 relative overflow-hidden group shadow-xl border transition-all duration-500 ${userData?.isPremium ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-900 border-blue-400/30' : 'bg-[#0F172A] border-slate-800'}`}>
            <Zap className={`absolute -right-5 -bottom-6 opacity-10 rotate-12 pointer-events-none w-28 h-28 ${userData?.isPremium ? 'text-yellow-400 fill-yellow-400' : 'text-blue-500 fill-blue-500'}`} />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {userData?.isPremium ? '💎 Premium Account' : 'Total Saldo Poin'}
                </p>
                <div className="bg-blue-500/20 p-1.5 rounded-lg text-blue-400">
                    <Wallet size={14} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl md:text-xl font-semibold text-white tracking-tighter leading-none">
                    {userData?.credits?.toLocaleString('id-ID') || 0}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">pts</span>
                </div>
                <Link href="/topup" className="bg-blue-600 w-8 h-8 md:w-7 md:h-7 flex items-center justify-center rounded-xl text-white shadow-lg hover:scale-105 active:scale-95 transition-all">
                  <Plus size={16} strokeWidth={3} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION TOOLS */}
        <nav className="flex-1 overflow-y-auto px-3 md:px-2 space-y-1 mt-2 custom-scrollbar">
          {menuItems.map((item, index) => {
            if (item.section) {
              return (
                <div key={index} className="px-3 pt-5 pb-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{item.section}</p>
                </div>
              );
            }

            const isActive = pathname === item.href;
            const isLocked = !item.isFree && !userData?.isPremium && !item.disabled;

            return (
              <Link
                key={index}
                href={item.href}
                className={`
                  flex items-center justify-between px-4 py-3 md:px-3 md:py-2.5 rounded-xl text-sm font-semibold transition-all group
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : item.disabled 
                      ? 'text-slate-400 cursor-not-allowed opacity-60' 
                      : isLocked
                        ? 'text-slate-500 hover:bg-slate-50 cursor-pointer' 
                        : 'text-slate-900 hover:bg-slate-50 hover:text-blue-600'
                  }
                `}
                onClick={(e) => handleMenuClick(e, item)}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-blue-600' : (item.disabled || isLocked ? 'text-slate-400' : 'text-slate-400 group-hover:text-blue-600')}>
                    {item.icon}
                  </span>
                  <span className="flex-1 tracking-tight">{item.name}</span>
                </div>

                {isLocked ? (
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 px-2 py-1 rounded-lg shadow-sm">
                        <LockKeyhole size={10} className="text-white" strokeWidth={3} />
                        <span className="text-[9px] font-black text-white uppercase tracking-tighter">Unlock</span>
                    </div>
                ) : (
                    <>
                        {item.badge === 'HOT' && (
                            <div className="relative flex items-center justify-center w-5 h-5">
                                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-md animate-pulse"></div>
                                <Flame size={14} className="text-orange-500 fill-orange-500 animate-bounce" />
                            </div>
                        )}
                        {item.badge === 'SOON' && (
                            <div className="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                <span className="text-[8px] font-black text-emerald-600 uppercase">SOON</span>
                            </div>
                        )}
                    </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 shrink-0 space-y-1 bg-white">
           <Link href="/profile" className={`flex items-center gap-3 w-full px-4 py-3 md:px-3 md:py-2.5 text-sm font-semibold rounded-xl transition-all ${pathname === '/profile' ? 'bg-blue-50 text-blue-600' : 'text-slate-900 hover:bg-slate-50'}`}>
              <Settings size={20} className="text-slate-400" /> Profil & Setting
           </Link>
           <button onClick={() => { deleteCookie('token'); window.location.href = "/login"; }} className="flex items-center gap-3 w-full px-4 py-3 md:px-3 md:py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
              <LogOut size={20} /> Keluar Aplikasi
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className={`flex-1 w-full transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-64'}`}>
        {/* Padding Top hanya di Mobile karena ada Fixed Header */}
        <main className="pt-20 md:pt-8 p-4 md:p-8 max-w-7xl mx-auto leading-tight min-h-screen">
            {children}
        </main>
      </div>

    </div>
  );
}