"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import NotificationBell from '@/components/NotificationBell'; 
import { 
  LayoutDashboard, Search, Target, Clapperboard, 
  ScanEye, Image as ImageIcon, BarChart2, Calculator, 
  LogOut, Zap, ShieldCheck, Wallet, Plus, Settings,
  Menu, X, LayoutTemplate, 
  Lock, Flame, Sparkles, Crown, Share2
} from 'lucide-react';

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700', '800', '900'] 
});

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUserData();
    setSidebarOpen(false); 
  }, [pathname]);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/me');
      const data = await res.json();
      if (data.user) setUserData(data.user);
    } catch (error) {}
  };

  // --- MENU CONFIG ---
  const rawMenuItems = [
    { name: 'Dashboard', href: '/site/dashboard', icon: <LayoutDashboard size={20} />, isFree: true },
    
    { section: 'RISET & IDE' },
    { name: 'Riset Produk', href: '/site/tools/riset-produk', icon: <Search size={20} />, badge: 'HOT', isFree: true },
    { name: 'Validasi Market', href: '/site/tools/validasi-market', icon: <Target size={20} />, isFree: true },
    { name: 'Magic Ad Script', href: '/site/tools/magic-ad-script', icon: <Clapperboard size={20} />, isFree: true },
    
    // --- UPDATE: MENAMBAHKAN FITUR SOSMED ---
    { section: 'SOCIAL MEDIA' },
    { 
        name: 'Generate Post', 
        href: '/site/tools/fb-autopilot', 
        icon: <Share2 size={20} />, // Icon Share agar relevan dengan sosmed
        badge: 'NEW', 
        isFree: false // false = Wajib Premium (Terkunci untuk free user)
    },
    // ----------------------------------------

    { section: 'VISUAL & AUDIT (AI)' },
    { name: 'Ad Reviewer', href: '/site/tools/ad-review', icon: <ScanEye size={20} />, badge: 'NEW', isFree: false },
    { name: 'Analisis Iklan', href: '/site/tools/analisis-iklan', icon: <BarChart2 size={20} />, isFree: false },
    { name: 'Landing Builder', href: '/site/tools/landing-page', icon: <LayoutTemplate size={20} />, badge: 'HOT', isFree: false },
    
    { section: 'FINANSIAL' },
    { name: 'Kalkulator Ads', href: '/site/tools/kalkulator-ads', icon: <Calculator size={20} />, isFree: true },
    
    { section: 'COMING SOON' },
    { name: 'Generate Gambar', href: '#', icon: <ImageIcon size={20} />, disabled: true, badge: 'SOON', isFree: false },
  ];

  if (userData?.role === 'admin') {
    rawMenuItems.push(
      { section: 'ADMINISTRATOR' },
      { name: 'Admin Panel', href: '/site/admin/tools', icon: <ShieldCheck size={20} />, adminOnly: true, isFree: true }
    );
  }

  const handleMenuClick = (e, item) => {
    if (item.disabled) { e.preventDefault(); return; }
    // Logic Lock: Redirect ke Topup jika belum premium
    if (!item.isFree && !userData?.isPremium && userData?.role !== 'admin') {
      e.preventDefault(); 
      router.push('/site/topup'); 
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    window.location.href = "/login";
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] flex ${poppins.className} tracking-tighter`}>
      
      {/* --- MOBILE HEADER --- */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-20 z-[60] px-5 flex items-center justify-between transition-all bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        
        {/* LOGO (Desain Lama - Simple) */}
        <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-sm font-[900] text-slate-900 uppercase">JITU <span className="text-blue-600">DIGITAL</span></span>
        </div>

        <div className="flex items-center gap-3">
            <NotificationBell /> 
            
            {/* TOMBOL MENU (Desain Baru - Pill Shape) */}
            <button 
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="flex items-center gap-2 pl-4 pr-2 py-2 bg-slate-900 text-white rounded-full shadow-lg shadow-slate-900/20 active:scale-95 transition-all group border border-slate-800"
            >
                <span className="text-[10px] font-black tracking-widest group-hover:text-blue-200 transition-colors">MENU</span>
                <div className="bg-white/20 p-1 rounded-full">
                    {isSidebarOpen ? <X size={14} /> : <Menu size={14} />}
                </div>
            </button>
        </div>
      </header>

      {/* BACKDROP */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[45] md:hidden animate-in fade-in duration-300"
            onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        w-72 bg-white border-r border-slate-100 fixed h-full z-50 flex flex-col transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) shadow-2xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        
        {/* LOGO DESKTOP (Desain Lama - Simple) */}
        <div className="h-20 hidden md:flex items-center justify-between px-5 border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-md">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-[900] text-slate-900 uppercase">JITU <span className="text-blue-600">DIGITAL</span></span>
          </div>
          <NotificationBell />
        </div>

        {/* MOBILE HEADER INSIDE SIDEBAR */}
        <div className="md:hidden h-20 flex items-center justify-between px-6 border-b border-slate-50 shrink-0 bg-slate-50/50">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Navigation</span>
            <button onClick={() => setSidebarOpen(false)} className="p-2 bg-white rounded-full shadow-sm text-rose-500 hover:bg-rose-50"><X size={18}/></button>
        </div>

        {/* WIDGET SALDO (Desain Lama - Dark Card) */}
        <div className="px-4 pt-6 pb-2 shrink-0">
          <div className={`rounded-2xl p-5 md:p-4 relative overflow-hidden group shadow-lg border transition-all duration-500 
            ${userData?.isPremium 
                ? 'bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-900 border-blue-400/30 ring-1 ring-blue-500/20' 
                : 'bg-[#0F172A] border-slate-800'}`
          }>
            <Zap className={`absolute -right-5 -bottom-6 opacity-10 rotate-12 pointer-events-none w-28 h-28 ${userData?.isPremium ? 'text-yellow-400 fill-yellow-400' : 'text-blue-500 fill-blue-500'}`} />
            
            <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
              <div className="flex justify-between items-start">
                <p className="text-[10px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {userData?.isPremium ? '💎 Premium Member' : 'Total Saldo Poin'}
                </p>
                <div className="bg-white/10 p-1.5 rounded-lg text-white/80">
                    <Wallet size={14} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl md:text-xl font-bold text-white tracking-tighter leading-none">
                    {userData?.credits?.toLocaleString('id-ID') || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">pts</span>
                </div>
                <Link href="/site/topup" className="bg-blue-600 hover:bg-blue-500 w-8 h-8 md:w-7 md:h-7 flex items-center justify-center rounded-xl text-white shadow-lg hover:scale-110 active:scale-95 transition-all">
                  <Plus size={16} strokeWidth={3} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* LIST MENU */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1 mt-4 pb-10 custom-scrollbar">
          {rawMenuItems.map((item, index) => {
            if (item.section) {
              return (
                <div key={index} className="px-3 pt-5 pb-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      {item.section} <span className="h-[1px] flex-1 bg-slate-100"></span>
                  </p>
                </div>
              );
            }

            const isActive = pathname.startsWith(item.href);
            const isLocked = !item.isFree && !userData?.isPremium && userData?.role !== 'admin' && !item.disabled;

            return (
              <Link
                key={index}
                href={item.href} 
                onClick={(e) => handleMenuClick(e, item)}
                className={`
                  flex items-center justify-between px-4 py-3 md:px-3 md:py-2.5 rounded-xl text-sm font-semibold transition-all group select-none relative
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 shadow-sm' 
                    : item.disabled 
                      ? 'text-slate-400 cursor-not-allowed opacity-60' 
                      : isLocked
                        ? 'text-slate-500 hover:bg-slate-50 cursor-pointer' 
                        : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-blue-600' : (item.disabled || isLocked ? 'text-slate-400' : 'text-slate-400 group-hover:text-blue-600')}>
                    {item.icon}
                  </span>
                  <span className="flex-1 tracking-tight text-[13px]">{item.name}</span>
                </div>

                {/* --- BADGES KEREN --- */}
                {isLocked ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-sm shadow-fuchsia-200 group-hover:shadow-fuchsia-400/40 transition-all border border-white/20">
                        <Lock size={10} className="text-white" strokeWidth={2.5} />
                        <span className="text-[9px] font-[900] text-white uppercase tracking-wider">UNLOCK</span>
                    </div>
                ) : (
                    <>
                        {item.badge === 'HOT' && (
                            <div className="relative flex items-center justify-center mr-1" title="Lagi Rame!">
                                <div className="absolute inset-0 bg-orange-500/20 blur-[6px] rounded-full animate-pulse"></div>
                                <Flame size={18} className="text-orange-500 fill-orange-500 relative z-10 animate-[bounce_2s_infinite]" />
                            </div>
                        )}
                        {item.badge === 'NEW' && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm">
                                <Sparkles size={10} fill="currentColor" />
                                <span className="text-[8px] font-black uppercase tracking-wider">NEW</span>
                            </div>
                        )}
                        {item.badge === 'SOON' && (
                            <div className="px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-wider">
                                SOON
                            </div>
                        )}
                    </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 shrink-0 bg-white space-y-2">
           <Link href="/site/profile" className={`flex items-center gap-3 w-full px-4 py-3 md:px-3 md:py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${pathname === '/site/profile' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Settings size={18} className="text-slate-400" /> Profil Saya
           </Link>
           
           <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 md:px-3 md:py-2.5 text-xs font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
              <LogOut size={18} /> Keluar
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className={`flex-1 w-full transition-all duration-500 md:ml-72`}>
        <main className="pt-24 md:pt-8 p-4 md:p-8 max-w-7xl mx-auto leading-tight min-h-screen">
            {children}
        </main>
      </div>

    </div>
  );
}