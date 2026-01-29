"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Search, Target, Clapperboard, 
  Layout, ScanEye, BarChart2, Calculator, 
  LogOut, Zap, Lock 
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  // 1. AMBIL STATUS USER (Premium/Free)
  useEffect(() => {
    fetch('/api/user/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch((err) => console.error("Sidebar Error:", err));
  }, []);

  // 2. DAFTAR MENU (Sesuai Screenshot Terbaru)
  const mainMenus = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, isFree: true },
    { name: 'Riset Produk', href: '/tools/riset-produk', icon: Search, isFree: true }, // GRATIS
    { name: 'Validasi Market', href: '/tools/validasi-market', icon: Target, isFree: false }, // PREMIUM
    { name: 'Magic Ad Script', href: '/tools/magic-ad-script', icon: Clapperboard, isFree: false }, // PREMIUM
    { name: 'Landing Page Builder', href: '/tools/landing-builder', icon: Layout, isFree: false }, // PREMIUM
    { name: 'Audit Funnel', href: '/tools/ad-review', icon: ScanEye, isFree: false }, // PREMIUM
    { name: 'Analisis Iklan', href: '#', icon: BarChart2, isFree: false }, // COMING SOON
    { name: 'Kalkulator Ads', href: '#', icon: Calculator, isFree: false }, // COMING SOON
  ];

  // 3. LOGIC KLIK
  const handleMenuClick = (e, menu) => {
    // Jika Menu Berbayar DAN User Belum Premium
    if (!menu.isFree && !user?.isPremium) {
      e.preventDefault();
      alert("🔒 MENU PREMIUM TERKUNCI\n\nSilakan lakukan Top Up untuk membuka akses ke semua tools.");
      router.push('/topup');
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 min-h-screen hidden md:flex flex-col font-poppins shrink-0">
      
      {/* Logo */}
      <div className="h-20 flex items-center px-6 gap-3">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
          <Zap className="w-5 h-5 text-white fill-white" />
        </div>
        <h1 className="text-xl font-black text-white tracking-tighter uppercase">
          JITU <span className="text-blue-600">DIGITAL</span>
        </h1>
      </div>

      {/* Navigasi */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 mb-2">Tools Utama</p>
        
        {mainMenus.map((menu) => {
          const isActive = pathname === menu.href;
          const isLocked = !menu.isFree && !user?.isPremium;

          return (
            <Link
              key={menu.name}
              href={menu.href}
              onClick={(e) => handleMenuClick(e, menu)}
              className={`
                flex items-center justify-between px-4 py-3 text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all group
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : isLocked 
                    ? 'text-slate-600 hover:bg-slate-800/50 cursor-not-allowed' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <div className="flex items-center gap-4">
                <menu.icon size={18} className={isLocked ? "text-slate-700" : ""} />
                <span>{menu.name}</span>
              </div>

              {/* TAMPILKAN GEMBOK */}
              {isLocked && (
                <Lock size={14} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => {
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
            window.location.href = "/login";
          }}
          className="flex items-center gap-4 px-4 py-3.5 w-full text-[11px] font-bold uppercase tracking-widest text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </aside>
  );
}