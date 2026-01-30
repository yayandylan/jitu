"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Search, Target, Wand2, 
  Layout, ScanEye, BarChart2, Calculator, 
  LogOut, Zap, Lock, Settings
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  // 1. AMBIL DATA USER
  useEffect(() => {
    fetch('/api/user/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch((err) => console.error("Sidebar Error:", err));
  }, []);

  // 2. DAFTAR MENU
  const mainMenus = [
    { name: 'Dashboard', href: '/site/dashboard', icon: LayoutDashboard, isFree: true },
    { name: 'Riset Produk', href: '/site/tools/riset-produk', icon: Search, isFree: true }, 
    { name: 'Validasi Market', href: '/site/tools/validasi-market', icon: Target, isFree: false }, 
    { name: 'Magic Ad Script', href: '/site/tools/magic-ad-script', icon: Wand2, isFree: false }, 
    { name: 'Landing Page', href: '/site/tools/landing-builder', icon: Layout, isFree: false }, 
    { name: 'Audit Funnel', href: '/site/tools/ad-review', icon: ScanEye, isFree: false },
    // Menu Coming Soon
    { name: 'Analisis Iklan', href: '#', icon: BarChart2, isFree: false, disabled: true }, 
    { name: 'Kalkulator Ads', href: '#', icon: Calculator, isFree: false, disabled: true }, 
  ];

  // 3. LOGIC KLIK
  const handleMenuClick = (e, menu) => {
    if (menu.disabled) {
        e.preventDefault();
        return;
    }
    // Cek Premium
    if (!menu.isFree && !user?.isPremium && user?.role !== 'admin') {
      e.preventDefault();
      alert("🔒 MENU PREMIUM TERKUNCI\n\nSilakan lakukan Top Up untuk membuka akses ke semua tools.");
      router.push('/site/topup');
    }
  };

  return (
    // ASIDE: Lebar 70px di HP, 256px di Laptop (md:w-64)
    <aside className="fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 z-50 transition-all duration-300 w-[70px] md:w-64 flex flex-col font-poppins">
      
      {/* HEADER LOGO */}
      <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-800">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20 shrink-0">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        {/* Teks Logo (Hidden di HP) */}
        <h1 className="hidden md:block ml-3 text-lg font-black text-white tracking-tighter uppercase">
          JITU <span className="text-blue-500">DIGITAL</span>
        </h1>
      </div>

      {/* NAVIGASI SCROLLABLE */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto custom-scrollbar mt-2">
        <p className="hidden md:block text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-2">
          Tools Utama
        </p>
        
        {mainMenus.map((menu) => {
          // Normalisasi path agar active state akurat
          const isActive = pathname.startsWith(menu.href) && menu.href !== '#';
          const isLocked = !menu.isFree && !user?.isPremium && user?.role !== 'admin';
          const isComingSoon = menu.disabled;

          return (
            <Link
              key={menu.name}
              href={menu.href}
              onClick={(e) => handleMenuClick(e, menu)}
              className={`
                flex items-center px-3 py-3 md:px-4 md:py-3 rounded-xl transition-all group relative
                justify-center md:justify-between 
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : isLocked || isComingSoon
                    ? 'text-slate-600 hover:bg-slate-800/50 cursor-not-allowed' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <menu.icon size={20} className={`shrink-0 ${isActive ? 'text-white' : isLocked ? 'text-slate-700' : ''}`} />
                
                {/* Teks Menu (Hidden di HP) */}
                <span className={`hidden md:block text-[11px] font-bold uppercase tracking-widest whitespace-nowrap`}>
                    {menu.name} {isComingSoon && <span className="text-[8px] bg-slate-800 px-1 py-0.5 rounded ml-1 text-slate-500">SOON</span>}
                </span>
              </div>

              {/* GEMBOK (Hidden di HP, Muncul di Laptop) */}
              {isLocked && (
                <Lock size={14} className="hidden md:block text-slate-700 group-hover:text-slate-500 transition-colors" />
              )}

              {/* Tooltip untuk HP (Muncul saat hover di layar kecil) */}
              <div className="md:hidden absolute left-14 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap border border-slate-700 font-bold tracking-wider uppercase">
                {menu.name} {isLocked ? '(Premium)' : ''}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER LOGOUT */}
      <div className="p-3 md:p-4 border-t border-slate-800">
        <button 
          onClick={() => {
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
            window.location.href = "/login";
          }}
          className="flex items-center justify-center md:justify-start gap-4 px-3 py-3 w-full rounded-xl transition-all text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut size={20} className="shrink-0" />
          <span className="hidden md:block text-[11px] font-bold uppercase tracking-widest">Keluar</span>
        </button>
      </div>
    </aside>
  );
}