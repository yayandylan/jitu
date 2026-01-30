"use client";
import { useState, useEffect } from 'react';
import { 
  Zap, Wallet, ArrowRight, Loader2, 
  Search, Target, Clapperboard, LayoutTemplate, 
  ScanEye, BarChart2, Calculator, Image as ImageIcon,
  LockKeyhole, Sparkles, TrendingUp, ChevronRight, Crown
} from 'lucide-react'; 
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // State Data User
  const [userData, setUserData] = useState({ name: "User", credits: 0, isPremium: false });
  const [history, setHistory] = useState([]);

  // --- DATABASE TOOLS ---
  const toolsList = [
    { 
      name: "Riset Produk", 
      desc: "Temukan winning product & blue ocean market.", 
      href: "/site/tools/riset-produk", 
      icon: <Search size={24} className="text-white" />, 
      gradient: "from-blue-500 to-cyan-500",
      shadow: "shadow-blue-500/30",
      status: "ACTIVE", 
      isFree: true 
    },
    { 
      name: "Validasi Market", 
      desc: "Cek kelayakan ide sebelum bakar uang.", 
      href: "/site/tools/validasi-market", 
      icon: <Target size={24} className="text-white" />, 
      gradient: "from-emerald-500 to-teal-400",
      shadow: "shadow-emerald-500/30",
      status: "PREMIUM",
      isFree: false 
    },
    { 
      name: "Magic Ad Script", 
      desc: "Generate video script & caption iklan.", 
      href: "/site/tools/magic-ad-script", 
      icon: <Clapperboard size={24} className="text-white" />, 
      gradient: "from-violet-500 to-fuchsia-500",
      shadow: "shadow-violet-500/30",
      status: "PREMIUM",
      isFree: false 
    },
    { 
      name: "Landing Page", 
      desc: "Buat sales page HTML siap pakai.", 
      href: "/site/tools/landing-page", 
      icon: <LayoutTemplate size={24} className="text-white" />, 
      gradient: "from-pink-500 to-rose-500",
      shadow: "shadow-pink-500/30",
      status: "PREMIUM",
      isFree: false 
    },
    { 
      name: "Audit Funnel", 
      desc: "Diagnosa kebocoran traffic website.", 
      href: "/site/tools/ad-review", 
      icon: <ScanEye size={24} className="text-white" />, 
      gradient: "from-orange-500 to-amber-500",
      shadow: "shadow-orange-500/30",
      status: "PREMIUM",
      isFree: false 
    },
    { 
      name: "Analisis Iklan", 
      desc: "Baca data ads & rekomendasi optimasi.", 
      href: "/site/tools/analisis-iklan", 
      icon: <BarChart2 size={24} className="text-white" />, 
      gradient: "from-slate-700 to-slate-500",
      shadow: "shadow-slate-500/30",
      status: "PREMIUM", 
      isFree: false 
    },
    { 
      name: "Kalkulator Ads", 
      desc: "Hitung ROAS & BEP bisnis.", 
      href: "/site/tools/kalkulator-ads", 
      icon: <Calculator size={24} className="text-white" />, 
      gradient: "from-indigo-500 to-blue-600",
      shadow: "shadow-indigo-500/30",
      status: "PREMIUM", 
      isFree: false 
    },
    { 
      name: "Generate Gambar", 
      desc: "Bikin aset visual iklan dengan AI.", 
      href: "#", 
      icon: <ImageIcon size={24} className="text-white" />, 
      gradient: "from-fuchsia-600 to-purple-600",
      shadow: "shadow-fuchsia-500/30",
      status: "SOON", 
      isFree: false
    },
  ];

  useEffect(() => {
    async function fetchData() {
        try {
            const userRes = await fetch('/api/user/me').catch(()=>null);
            if (userRes?.ok) {
                const data = await userRes.json();
                if (data.user) {
                    setUserData(data.user);
                    const histRes = await fetch(`/api/user/history?limit=3`).catch(()=>null); 
                    if (histRes?.ok) {
                        const histData = await histRes.json();
                        setHistory(Array.isArray(histData.data) ? histData.data : []);
                    }
                }
            }
        } catch (error) { console.error("Error load dashboard"); } 
        finally { setLoading(false); }
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memuat Dashboard...</p>
    </div>
  );

  return (
    <div className="max-w-[1280px] mx-auto space-y-8 pb-24 pt-2 font-sans antialiased text-slate-900 px-0 md:px-2">
      
      {/* 1. HEADER: PREMIUM GLASS */}
      <div className="flex justify-between items-center bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-20 md:top-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 relative overflow-hidden group">
            <Zap size={20} fill="currentColor" className="text-yellow-400 relative z-10 group-hover:scale-110 transition-transform" />
            {userData.isPremium && <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/30 to-transparent animate-pulse"></div>}
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-black tracking-tight leading-none truncate flex items-center gap-2 text-slate-800">
                Hi, {userData.name?.split(' ')[0]} {userData.isPremium && <Crown size={16} className="text-yellow-500 fill-yellow-500"/>}
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-wider">
                    {userData.isPremium ? 'Plan: Pro' : 'Plan: Basic'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                     • Saldo: {userData.credits?.toLocaleString()}
                </span>
            </div>
          </div>
        </div>

        <Link href="/site/topup" className="bg-[#0F172A] text-white px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-blue-600/20 active:scale-95">
             <Wallet size={16} /> <span className="hidden md:inline">Isi Saldo</span>
        </Link>
      </div>

      {/* 2. DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: TOOLS (8 Cols) --- */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* HERO BANNER (RE-DESIGNED "JITU STYLE")
               - Tema Dark Mode (Slate-900) untuk kesan Premium & Tech
               - Grid Pattern Background
               - Icon Rocket/Template 3D
            */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0B1121] border border-slate-800 p-8 md:p-10 shadow-2xl shadow-blue-900/10 group isolate">
                
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-600/20 blur-[100px] rounded-full pointer-events-none group-hover:bg-blue-500/30 transition-all duration-700"></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    
                    {/* Text Content */}
                    <div className="max-w-xl space-y-6">
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">New Feature</span>
                        </div>

                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                                Landing Page <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Express</span>
                            </h2>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                                Bikin sales page konversi tinggi dalam hitungan detik. Tanpa koding, instan jadi HTML siap pakai. <span className="text-white font-bold">Jitu banget!</span>
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                            <Link href="/site/tools/landing-page" className="group/btn relative overflow-hidden rounded-xl bg-blue-600 px-8 py-3.5 text-white shadow-lg transition-all hover:bg-blue-500 hover:shadow-blue-500/25 active:scale-95">
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                                <span className="relative text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                                    Buat Sekarang <ArrowRight size={14} />
                                </span>
                            </Link>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                                <Zap size={14} className="text-amber-400 fill-amber-400" />
                                <span>Powered by Jitu AI</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual Illustration (Right Side) */}
                    <div className="relative hidden md:block pr-6">
                        <div className="relative w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 rotate-6 group-hover:rotate-12 transition-all duration-500 border border-white/10">
                            <LayoutTemplate size={60} className="text-white drop-shadow-md" strokeWidth={1.5} />
                            
                            {/* Floating Elements */}
                            <div className="absolute -right-4 -top-4 bg-slate-800 p-2.5 rounded-xl border border-slate-700 shadow-xl animate-bounce">
                                <Zap size={18} className="text-yellow-400 fill-yellow-400" />
                            </div>
                            <div className="absolute -left-4 -bottom-4 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xl animate-pulse">
                                 <span className="text-[10px] font-black text-slate-900">HTML</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            {/* END HERO BANNER */}

            {/* ALL TOOLS GRID */}
            <div>
                <div className="flex items-center justify-between mb-5 px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap size={14} /> Power Tools
                    </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {toolsList.map((tool, index) => {
                        const isSoon = tool.status === 'SOON';
                        const isLocked = !tool.isFree && !userData.isPremium;
                        const destination = isSoon ? '#' : (isLocked ? '/site/topup' : tool.href);

                        return (
                            <Link 
                                key={index} 
                                href={destination}
                                className={`
                                    relative p-5 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all duration-300 group
                                    ${isSoon 
                                        ? 'opacity-80 grayscale-[0.5] cursor-not-allowed' 
                                        : 'hover:-translate-y-1 hover:shadow-xl hover:border-blue-100 cursor-pointer'
                                    }
                                `}
                                onClick={(e) => {
                                    if(isSoon) e.preventDefault();
                                }}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        {/* ICON BOX */}
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center ${tool.shadow} group-hover:scale-110 transition-transform duration-500`}>
                                            {tool.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                                {tool.name}
                                            </h4>
                                            
                                            {/* Badge Status */}
                                            {isSoon ? (
                                                <div className="inline-block bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider mt-1">
                                                    Coming Soon
                                                </div>
                                            ) : isLocked ? (
                                                <div className="flex items-center gap-1 text-[9px] font-bold text-amber-500 mt-1 uppercase tracking-wider">
                                                    <LockKeyhole size={10} /> Upgrade to Unlock
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 mt-1 uppercase tracking-wider">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Ready
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* ACTION ARROW */}
                                    {!isLocked && !isSoon && (
                                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <ArrowRight size={14} />
                                        </div>
                                    )}

                                    {/* GEMBOK */}
                                    {isLocked && !isSoon && (
                                        <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 transition-all">
                                            <LockKeyhole size={14} />
                                        </div>
                                    )}
                                </div>
                                
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-4 line-clamp-2">
                                    {tool.desc}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* --- RIGHT COLUMN: STATS & HISTORY (4 Cols) --- */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* HISTORY CARD */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col h-full min-h-[400px]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <TrendingUp size={14} /> Aktivitas Terakhir
                </h3>
                
                <div className="space-y-4 flex-1">
                    {history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <div className="bg-slate-100 p-4 rounded-full mb-3">
                                <Search size={24} className="text-slate-400"/>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Belum ada riset</p>
                        </div>
                    ) : (
                        history.map((h, i) => (
                            <div key={i} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                    <Sparkles size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight truncate">
                                        {h.toolType?.replace(/-/g, ' ')}
                                    </h5>
                                    <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
                                        {h.title || 'Tanpa Judul'}
                                    </p>
                                </div>
                                <span className="text-[9px] font-bold text-slate-300">
                                    {new Date(h.createdAt).toLocaleDateString([], {day:'numeric', month:'short'})}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* QUICK UPGRADE */}
            {!userData.isPremium && (
                <div className="bg-[#0A0C10] rounded-[2.5rem] p-6 text-white border border-yellow-500/20 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-amber-500"></div>
                    <div className="relative z-10">
                        <Crown size={32} className="text-yellow-400 mx-auto mb-3" />
                        <h4 className="text-lg font-black uppercase tracking-tight mb-1">Unlock Pro</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed mb-4 px-2">
                            Akses Validasi Market, Magic Script, dan fitur premium lainnya.
                        </p>
                        <Link href="/site/topup" className="block w-full py-3 bg-yellow-500 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all active:scale-95">
                            Upgrade Sekarang
                        </Link>
                    </div>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}