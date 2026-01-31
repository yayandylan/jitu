"use client";
import { useState, useEffect } from 'react';
// PERBAIKAN: Menambahkan 'ChevronRight' ke dalam import
import { 
  Zap, Wallet, ArrowRight, Loader2, 
  Search, Target, Clapperboard, LayoutTemplate, 
  ScanEye, BarChart2, Calculator, Image as ImageIcon,
  LockKeyhole, Sparkles, TrendingUp, Crown, Flame, CheckCircle, ChevronRight
} from 'lucide-react'; 
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // State Data User & History
  const [userData, setUserData] = useState({ name: "Juragan", credits: 0, isPremium: false });
  const [history, setHistory] = useState([]);

  // --- DATABASE TOOLS (Disamakan dengan Sidebar) ---
  const toolsList = [
    { 
      name: "Riset Produk", 
      desc: "Temukan winning product & analisa kompetitor.", 
      href: "/site/tools/riset-produk", 
      icon: <Search size={22} className="text-white" />, 
      gradient: "from-blue-500 to-indigo-500",
      shadow: "shadow-blue-500/30",
      badge: "HOT",
      isFree: true 
    },
    { 
      name: "Validasi Market", 
      desc: "Cek potensi ide bisnis sebelum boncos.", 
      href: "/site/tools/validasi-market", 
      icon: <Target size={22} className="text-white" />, 
      gradient: "from-emerald-500 to-teal-500",
      shadow: "shadow-emerald-500/30",
      badge: null,
      isFree: true 
    },
    { 
      name: "Landing Builder", 
      desc: "Bikin Landing Page copywriting hipnotik.", 
      href: "/site/tools/landing-page", 
      icon: <LayoutTemplate size={22} className="text-white" />, 
      gradient: "from-purple-500 to-fuchsia-500",
      shadow: "shadow-purple-500/30",
      badge: "HOT",
      isFree: false 
    },
    { 
      name: "Magic Ad Script", 
      desc: "Generate video script & caption iklan.", 
      href: "/site/tools/magic-ad-script", 
      icon: <Clapperboard size={22} className="text-white" />, 
      gradient: "from-rose-500 to-pink-500",
      shadow: "shadow-rose-500/30",
      badge: null,
      isFree: true 
    },
    { 
      name: "Ad Reviewer", 
      desc: "Audit kreatif iklan & landing page.", 
      href: "/site/tools/ad-review", 
      icon: <ScanEye size={22} className="text-white" />, 
      gradient: "from-indigo-500 to-violet-600",
      shadow: "shadow-indigo-500/30",
      badge: "NEW",
      isFree: false 
    },
    { 
      name: "Analisis Iklan", 
      desc: "Baca data ads & rekomendasi optimasi.", 
      href: "/site/tools/analisis-iklan", 
      icon: <BarChart2 size={22} className="text-white" />, 
      gradient: "from-cyan-500 to-sky-500",
      shadow: "shadow-cyan-500/30",
      badge: null, 
      isFree: false 
    },
    { 
      name: "Kalkulator Ads", 
      desc: "Hitung ROAS, Margin & BEP bisnis.", 
      href: "/site/tools/kalkulator-ads", 
      icon: <Calculator size={22} className="text-white" />, 
      gradient: "from-amber-500 to-orange-500",
      shadow: "shadow-amber-500/30",
      badge: null, 
      isFree: true 
    },
    { 
      name: "Generate Gambar", 
      desc: "Bikin aset visual iklan dengan AI.", 
      href: "#", 
      icon: <ImageIcon size={22} className="text-white" />, 
      gradient: "from-slate-600 to-slate-800",
      shadow: "shadow-slate-500/30",
      badge: "SOON",
      isFree: false
    },
  ];

  useEffect(() => {
    async function loadDashboardData() {
        setLoading(true);
        try {
            const [userRes, histRes] = await Promise.all([
                fetch('/api/user/me').catch(() => null),
                fetch('/api/user/history?limit=3').catch(() => null)
            ]);

            if (userRes && userRes.ok) {
                const userData = await userRes.json();
                if (userData.user) setUserData(userData.user);
            }

            if (histRes && histRes.ok) {
                const histData = await histRes.json();
                setHistory(Array.isArray(histData.data) ? histData.data : []);
            }
        } catch (error) {
            console.error("Dashboard Load Error:", error);
        } finally {
            setLoading(false);
        }
    }
    loadDashboardData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
            <Loader2 className="animate-spin text-blue-600 mb-4 relative z-10" size={48} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Memuat Dashboard...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. WELCOME HEADER (GLASS EFFECT) */}
      <div className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group">
        
        {/* Dekorasi Background Header */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-1000"></div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-slate-900/20 shrink-0 border border-slate-700">
            {userData.isPremium ? (
                <Crown size={28} className="text-yellow-400 fill-yellow-400 animate-pulse" />
            ) : (
                <Zap size={28} fill="currentColor" className="text-blue-400" />
            )}
          </div>
          
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                Halo, {userData.name?.split(' ')[0]}! 👋
            </h1>
            <div className="flex items-center gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${userData.isPremium ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                    {userData.isPremium ? '💎 PRO MEMBER' : 'STARTER'}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    Saldo: <span className="text-emerald-600 font-black">{userData.credits?.toLocaleString()}</span> pts
                </span>
            </div>
          </div>
        </div>

        {/* Tombol Topup Desktop */}
        <Link href="/site/topup" className="hidden md:flex relative z-10 bg-slate-900 text-white pl-6 pr-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all items-center gap-3 shadow-lg hover:shadow-blue-600/30 active:scale-95 group/btn overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
             <div className="bg-white/20 p-1.5 rounded-full"><Wallet size={14} /></div> 
             Isi Saldo Poin
        </Link>
        
        {/* Tombol Topup Mobile */}
        <Link href="/site/topup" className="md:hidden mt-6 w-full bg-slate-900 text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95">
             <Wallet size={16} /> Topup Poin
        </Link>
      </div>

      {/* 2. LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: TOOLS (8 Cols) --- */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* HERO BANNER: RISET PRODUK */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0F172A] p-8 md:p-10 shadow-2xl shadow-blue-900/20 group cursor-pointer" onClick={() => router.push('/site/tools/riset-produk')}>
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/30 blur-[100px] rounded-full group-hover:bg-blue-500/40 transition-all duration-700"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
                    <div className="space-y-4 max-w-lg">
                        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 backdrop-blur-md">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Tools Paling Laris</span>
                        </div>

                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                                Riset Produk <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Winning</span>
                            </h2>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">
                                Temukan produk yang sedang tren dan memiliki potensi profit tinggi dengan bantuan AI Research Engine.
                            </p>
                        </div>

                        <div className="pt-2">
                            <button className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 group-hover:translate-x-1">
                                Mulai Riset Sekarang <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <div className="relative w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-6 group-hover:rotate-12 transition-all duration-500 border border-white/10">
                            <Search size={56} className="text-white drop-shadow-md" strokeWidth={1.5} />
                        </div>
                    </div>
                </div>
            </div>

            {/* TOOLS GRID */}
            <div>
                <div className="flex items-center justify-between mb-5 px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap size={14} className="text-blue-500 fill-blue-500" /> Semua Tools
                    </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {toolsList.map((tool, index) => {
                        const isSoon = tool.badge === 'SOON';
                        const isLocked = !tool.isFree && !userData.isPremium;
                        const destination = isSoon ? '#' : (isLocked ? '/site/topup' : tool.href);

                        return (
                            <Link 
                                key={index} 
                                href={destination}
                                onClick={(e) => { if(isSoon) e.preventDefault(); }}
                                className={`
                                    relative p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm transition-all duration-300 group overflow-hidden
                                    ${isSoon ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-100 cursor-pointer active:scale-95'}
                                `}
                            >
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className={`
                                            w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center 
                                            ${tool.shadow} shadow-lg group-hover:scale-110 transition-transform duration-500 relative ring-4 ring-slate-50 group-hover:ring-white
                                        `}>
                                            {tool.icon}
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors mb-1">
                                                {tool.name}
                                            </h4>
                                            
                                            {/* BADGES */}
                                            {tool.badge === 'HOT' && (
                                                <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border border-orange-100">
                                                    <Flame size={10} fill="currentColor"/> HOT
                                                </span>
                                            )}
                                            {tool.badge === 'NEW' && (
                                                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border border-indigo-100">
                                                    <Sparkles size={10} fill="currentColor"/> NEW
                                                </span>
                                            )}
                                            {isLocked && !isSoon && (
                                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border border-amber-100">
                                                    <LockKeyhole size={10} /> PRO
                                                </span>
                                            )}
                                            {!isLocked && !isSoon && !tool.badge && (
                                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                                                    READY
                                                </span>
                                            )}
                                            {isSoon && (
                                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border border-slate-200">
                                                    SOON
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Icon */}
                                    {!isLocked && !isSoon && (
                                        <div className="p-2 rounded-full bg-slate-50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <ChevronRight size={18} />
                                        </div>
                                    )}
                                    {isLocked && !isSoon && (
                                        <div className="p-2 rounded-full bg-amber-50 text-amber-500">
                                            <LockKeyhole size={18} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-5 opacity-80 group-hover:opacity-100 transition-opacity pl-1">
                                    {tool.desc}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* --- RIGHT COLUMN (History & Upgrade) --- */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* HISTORY CARD */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col h-full min-h-[300px]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <TrendingUp size={14} /> Riwayat Aktivitas
                </h3>
                <div className="space-y-4 flex-1">
                    {history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
                            <div className="bg-slate-50 p-4 rounded-2xl mb-3">
                                <Search size={24} className="text-slate-400"/>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Belum ada riset</p>
                        </div>
                    ) : (
                        history.map((h, i) => (
                            <div key={i} className="group flex items-start gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-default">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <Sparkles size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight truncate">
                                        {h.toolType?.replace(/-/g, ' ')}
                                    </h5>
                                    <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                                        {h.title || 'Tanpa Judul'}
                                    </p>
                                    <span className="text-[9px] font-bold text-slate-300 mt-1 block">
                                        {new Date(h.createdAt).toLocaleDateString([], {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* PREMIUM UPGRADE CARD (Show only if not premium) */}
            {!userData.isPremium && (
                <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[2.5rem] p-8 text-white relative overflow-hidden text-center group border border-slate-800 shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500"></div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-500/10 blur-[60px] rounded-full group-hover:bg-yellow-500/20 transition-all duration-700"></div>
                    
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl border border-slate-700 mx-auto mb-5 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                             <Crown size={32} className="text-yellow-400 fill-yellow-400 drop-shadow-md" />
                        </div>
                        <h4 className="text-xl font-black uppercase tracking-tight mb-2">Unlock Pro Tools</h4>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6 px-2 font-medium">
                            Akses Landing Page Builder, Audit Funnel, dan Analisis Iklan tanpa batas.
                        </p>
                        <Link href="/site/topup" className="block w-full py-4 bg-yellow-500 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-yellow-500/20">
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