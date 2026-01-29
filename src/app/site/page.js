"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, Target, Clapperboard, ScanEye, 
  Image as ImageIcon, BarChart2, Calculator, 
  ArrowRight, Sparkles, Lock, Loader2,
  LayoutTemplate, Flame, Crown
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. AMBIL DATA USER
  useEffect(() => {
    fetch('/api/user/me')
      .then(res => res.json())
      .then(data => {
        if(data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal load user:", err);
        setLoading(false);
      });
  }, []);

  // 2. DAFTAR TOOLS (SINKRON DENGAN SIDEBAR)
  const tools = [
    {
      title: "Riset Produk Winning",
      desc: "Cari ide produk laris manis (Blue Ocean Strategy).",
      icon: <Search className="w-8 h-8 text-blue-600" />,
      href: "/site/tools/riset-produk", 
      color: "bg-blue-50 border-blue-100 hover:border-blue-300",
      status: "Ready",
      isFree: true 
    },
    {
      title: "Landing Page Builder",
      desc: "Bikin sales page HTML siap iklan dalam 10 detik.",
      icon: <LayoutTemplate className="w-8 h-8 text-orange-600" />,
      href: "/site/tools/landing-page", 
      color: "bg-orange-50 border-orange-100 hover:border-orange-300",
      status: "Hot", // New Feature
      isFree: false 
    },
    {
      title: "Validasi Market",
      desc: "Blueprint targeting FB Ads & copywriting WA.",
      icon: <Target className="w-8 h-8 text-indigo-600" />,
      href: "/site/tools/validasi-market",
      color: "bg-indigo-50 border-indigo-100 hover:border-indigo-300",
      status: "Ready",
      isFree: false 
    },
    {
      title: "Magic Ad Script",
      desc: "Generate caption iklan & naskah video TikTok.",
      icon: <Clapperboard className="w-8 h-8 text-pink-600" />,
      href: "/site/tools/magic-ad-script",
      color: "bg-pink-50 border-pink-100 hover:border-pink-300",
      status: "New",
      isFree: false 
    },
    {
      title: "Audit Funnel & LP",
      desc: "Cek 'message match' iklan vs landing page.",
      icon: <ScanEye className="w-8 h-8 text-teal-600" />,
      href: "/site/tools/ad-review",
      color: "bg-teal-50 border-teal-100 hover:border-teal-300",
      status: "New",
      isFree: false 
    },
    {
      title: "Analisis Iklan Dashboard",
      desc: "Upload screenshot ads, AI diagnosa performanya.",
      icon: <BarChart2 className="w-8 h-8 text-violet-600" />,
      href: "/site/tools/analisis-iklan", // Sudah Aktif
      color: "bg-violet-50 border-violet-100 hover:border-violet-300",
      status: "Ready",
      isFree: false
    },
    {
      title: "Kalkulator Profit Ads",
      desc: "Hitung ROAS, BEP, dan estimasi profit harian.",
      icon: <Calculator className="w-8 h-8 text-emerald-600" />,
      href: "/site/tools/kalkulator-ads", // Sudah Aktif
      color: "bg-emerald-50 border-emerald-100 hover:border-emerald-300",
      status: "Ready",
      isFree: false
    },
    {
      title: "Generate Gambar Iklan",
      desc: "Buat visual mockup 3D produk digital.",
      icon: <ImageIcon className="w-8 h-8 text-purple-600" />,
      href: "#", 
      color: "bg-purple-50 border-purple-100 hover:border-purple-300",
      status: "Coming Soon", // Belum dibuat codingannya di frontend (opsional)
      isFree: false
    },
  ];

  // 3. LOGIKA PROTEKSI (REDIRECT KE TOPUP)
  const handleToolClick = (e, tool) => {
    // Jika Coming Soon -> Do nothing
    if (tool.status === "Coming Soon") {
      e.preventDefault();
      return;
    }

    // Jika Berbayar & User Belum Premium -> Redirect Topup
    if (!tool.isFree && !user?.isPremium) {
      e.preventDefault(); 
      router.push('/site/topup');
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-blue-600 w-10 h-10 mb-4"/> 
      <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Memuat Markas...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* HEADER & STATUS CARD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
            Dashboard <span className="text-blue-600">Advertiser</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Pilih amunisi perang Anda hari ini.</p>
        </div>
        
        {user?.isPremium ? (
          <div className="bg-[#0F172A] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl border border-slate-800">
            <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
            <span>Member Premium</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
             <div className="bg-white text-slate-500 px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-2">
                <div className="w-2 h-2 bg-slate-300 rounded-full" />
                <span>FREE MEMBER</span>
             </div>
             <Link href="/site/topup" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95">
                <Crown size={14} className="fill-white"/> Upgrade
             </Link>
          </div>
        )}
      </div>

      {/* GRID MENU TOOLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => {
            const isLocked = !tool.isFree && !user?.isPremium && tool.status !== "Coming Soon";
            const isComingSoon = tool.status === "Coming Soon";

            return (
              <Link 
                key={index} 
                href={isComingSoon ? "#" : tool.href}
                onClick={(e) => handleToolClick(e, tool)}
                className={`
                    relative group block p-7 rounded-[2rem] border transition-all duration-300 h-full flex flex-col justify-between
                    ${isLocked 
                        ? "bg-slate-50/50 border-slate-200 cursor-pointer" 
                        : `${tool.color} bg-white shadow-sm hover:shadow-xl hover:-translate-y-1` 
                    }
                    ${isComingSoon ? "opacity-60 cursor-not-allowed grayscale" : ""}
                `}
              >
                {/* ICON & BADGE */}
                <div>
                    <div className="flex justify-between items-start mb-6">
                    <div className={`p-3.5 rounded-2xl shadow-sm transition-transform ${isLocked ? 'bg-slate-100 grayscale opacity-50' : 'bg-white group-hover:scale-110 shadow-md'}`}>
                        {tool.icon}
                    </div>
                    
                    {/* Status Badges */}
                    {!isLocked && tool.status === "Hot" && (
                        <div className="bg-orange-50 text-orange-600 border border-orange-100 text-[9px] font-black px-2.5 py-1 rounded-lg tracking-wider flex items-center gap-1">
                        <Flame size={10} className="fill-orange-500 animate-pulse"/> HOT
                        </div>
                    )}
                    {!isLocked && tool.status === "New" && (
                        <div className="bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black px-2.5 py-1 rounded-lg tracking-wider">
                        NEW
                        </div>
                    )}
                    {isLocked && (
                        <div className="bg-slate-200 text-slate-500 text-[9px] font-black px-2.5 py-1 rounded-lg tracking-wider flex items-center gap-1">
                            <Lock size={10} /> LOCKED
                        </div>
                    )}
                    </div>
                    
                    <h3 className={`text-lg font-black mb-2 uppercase tracking-tight transition-colors ${isLocked ? 'text-slate-400' : 'text-slate-900 group-hover:text-blue-700'}`}>
                    {tool.title}
                    </h3>
                    <p className={`text-xs font-medium leading-relaxed mb-6 ${isLocked ? 'text-slate-400' : 'text-slate-500'}`}>
                    {tool.desc}
                    </p>
                </div>
                
                {/* FOOTER LINK */}
                <div className={`flex items-center text-[10px] font-black uppercase tracking-widest mt-auto pt-4 border-t ${isLocked ? 'border-slate-200 text-slate-400' : 'border-black/5 text-blue-600 group-hover:gap-2 transition-all'}`}>
                  {isComingSoon ? "Segera Hadir" : isLocked ? "Perlu Akses Premium" : "Buka Tool"} 
                  {!isComingSoon && !isLocked && <ArrowRight className="w-3.5 h-3.5 ml-1" />}
                </div>
              </Link>
            );
        })}
      </div>
    </div>
  );
}