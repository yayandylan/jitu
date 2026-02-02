"use client";
import { useState, useEffect } from 'react';
import { 
  Zap, Wallet, ArrowRight, Loader2, 
  Search, Target, Clapperboard, LayoutTemplate, 
  ScanEye, BarChart2, Calculator, Image as ImageIcon,
  Sparkles, TrendingUp, Crown, Flame, 
  ChevronRight, Share2, Gem, Rocket
} from 'lucide-react'; 
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // State Data
  const [userData, setUserData] = useState({ name: "Juragan", credits: 0, isPremium: false });
  const [history, setHistory] = useState([]);

  // --- DATABASE TOOLS ---
  const toolsList = [
    { 
      name: "Riset Produk", 
      desc: "Temukan winning product & analisa kompetitor.", 
      href: "/site/tools/riset-produk", 
      icon: <Search size={24} className="text-white" />, 
      gradient: "from-blue-500 to-indigo-600",
      bgSoft: "bg-blue-50 hover:bg-blue-100",
      textCol: "text-blue-600",
      badge: "HOT",
      isFree: true 
    },
    { 
      name: "Validasi Market", 
      desc: "Cek potensi ide bisnis sebelum boncos.", 
      href: "/site/tools/validasi-market", 
      icon: <Target size={24} className="text-white" />, 
      gradient: "from-emerald-500 to-teal-600",
      bgSoft: "bg-emerald-50 hover:bg-emerald-100",
      textCol: "text-emerald-600",
      isFree: true 
    },
    { 
      name: "Generate Post", // NAMA DIGANTI
      desc: "Generate konten & caption sosmed otomatis.", 
      href: "/site/tools/fb-autopilot", 
      icon: <Share2 size={24} className="text-white" />, 
      gradient: "from-violet-500 to-purple-600",
      bgSoft: "bg-violet-50 hover:bg-violet-100",
      textCol: "text-violet-600",
      badge: "NEW",
      isFree: false // Premium Only
    },
    { 
      name: "Landing Builder", 
      desc: "Bikin Landing Page copywriting hipnotik.", 
      href: "/site/tools/landing-page", 
      icon: <LayoutTemplate size={24} className="text-white" />, 
      gradient: "from-fuchsia-500 to-pink-600",
      bgSoft: "bg-fuchsia-50 hover:bg-fuchsia-100",
      textCol: "text-fuchsia-600",
      badge: "HOT",
      isFree: false 
    },
    { 
      name: "Magic Ad Script", 
      desc: "Generate video script & caption iklan.", 
      href: "/site/tools/magic-ad-script", 
      icon: <Clapperboard size={24} className="text-white" />, 
      gradient: "from-rose-500 to-red-600",
      bgSoft: "bg-rose-50 hover:bg-rose-100",
      textCol: "text-rose-600",
      isFree: true 
    },
    { 
      name: "Ad Reviewer", 
      desc: "Audit kreatif iklan & landing page.", 
      href: "/site/tools/ad-review", 
      icon: <ScanEye size={24} className="text-white" />, 
      gradient: "from-orange-500 to-amber-600",
      bgSoft: "bg-orange-50 hover:bg-orange-100",
      textCol: "text-orange-600",
      isFree: false 
    },
    { 
      name: "Analisis Iklan", 
      desc: "Baca data ads & rekomendasi optimasi.", 
      href: "/site/tools/analisis-iklan", 
      icon: <BarChart2 size={24} className="text-white" />, 
      gradient: "from-cyan-500 to-sky-600",
      bgSoft: "bg-cyan-50 hover:bg-cyan-100",
      textCol: "text-cyan-600",
      isFree: false 
    },
    { 
      name: "Kalkulator Ads", 
      desc: "Hitung ROAS, Margin & BEP bisnis.", 
      href: "/site/tools/kalkulator-ads", 
      icon: <Calculator size={24} className="text-white" />, 
      gradient: "from-lime-500 to-green-600",
      bgSoft: "bg-lime-50 hover:bg-lime-100",
      textCol: "text-lime-600",
      isFree: true 
    },
    { 
      name: "Generate Gambar", 
      desc: "Bikin aset visual iklan dengan AI.", 
      href: "#", 
      icon: <ImageIcon size={24} className="text-white" />, 
      gradient: "from-slate-500 to-slate-600",
      bgSoft: "bg-slate-50",
      textCol: "text-slate-500",
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
        } catch (error) { console.error(error); } finally { setLoading(false); }
    }
    loadDashboardData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Memuat Dashboard...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 font-poppins">
      
      {/* 1. HEADER WELCOME */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/50 p-8 md:p-10 group">
         {/* Background Decoration */}
         <div className="absolute -top-24 -right-24 w-80 h-80 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
         
         <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                {/* Avatar / Icon Rank */}
                <div className={`
                    w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center shadow-2xl shrink-0 border-[3px] border-white
                    ${userData.isPremium 
                        ? 'bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 shadow-orange-500/30' 
                        : 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-slate-500/20'}
                `}>
                    {userData.isPremium ? (
                        <Crown size={32} className="text-white drop-shadow-md animate-pulse" fill="currentColor" />
                    ) : (
                        <Zap size={32} className="text-blue-400" fill="currentColor" />
                    )}
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            Halo, {userData.name?.split(' ')[0]}! 👋
                        </h1>
                        {userData.isPremium && (
                           <div className="hidden md:flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-amber-100 border border-amber-200 px-3 py-1 rounded-full">
                              <Gem size={12} className="text-amber-600 fill-amber-600" />
                              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">VIP Access</span>
                           </div>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* BADGE MEMBERSHIP */}
                        <div className={`
                            px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-2
                            ${userData.isPremium 
                                ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-yellow-400 border-slate-700' 
                                : 'bg-slate-100 text-slate-500 border-slate-200'}
                        `}>
                            {userData.isPremium ? '👑 PREMIUM MEMBER' : 'STARTER MEMBER'}
                        </div>

                        <div className="w-[1px] h-4 bg-slate-300 mx-1 hidden md:block"></div>
                        
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
                            <Wallet size={14} className="text-emerald-500 mb-0.5" /> Saldo Poin:
                            <span className="text-emerald-600 font-black text-sm bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                {userData.credits?.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA BUTTON */}
            <Link href="/site/topup" className="hidden md:flex group/btn relative overflow-hidden rounded-2xl bg-slate-900 px-8 py-4 text-white shadow-lg shadow-slate-900/20 transition-all hover:scale-105 active:scale-95">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                 <span className="relative z-10 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em]">
                    <Wallet size={16} /> Isi Saldo Poin
                 </span>
            </Link>
         </div>
      </div>

      {/* 2. GRID UTAMA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT: TOOLS AREA (8 Cols) --- */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* ALERT KHUSUS FREE MEMBER (Banner Promo Premium) */}
            {!userData.isPremium && (
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 p-6 md:p-8 text-white shadow-2xl shadow-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6 group cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => router.push('/site/topup')}>
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/20 blur-[50px] rounded-full animate-pulse"></div>
                    
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
                            <Rocket size={28} className="text-white animate-bounce" />
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/20 mb-2">
                                <Sparkles size={10} className="text-yellow-300" fill="currentColor"/>
                                <span className="text-[9px] font-bold text-yellow-200 uppercase tracking-widest">Penawaran Spesial</span>
                            </div>
                            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none">
                                Unlock Premium Member
                            </h3>
                            <p className="text-white/80 text-xs mt-1 font-medium max-w-sm">
                                Hanya dengan Top Up minimal <span className="bg-white text-purple-700 px-1 rounded font-black">Rp 10.000</span>, Anda otomatis jadi Premium! Buka semua tools terkunci.
                            </p>
                        </div>
                    </div>
                    
                    <button className="whitespace-nowrap bg-white text-purple-700 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-300 hover:text-purple-900 transition-all shadow-lg flex items-center gap-2">
                        Top Up Sekarang <ArrowRight size={14}/>
                    </button>
                </div>
            )}

            {/* TOOLS GRID COLORFUL */}
            <div>
                <div className="flex items-center justify-between mb-5 px-1">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap size={14} className="text-amber-500 fill-amber-500" /> Semua Tools AI
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
                                    relative p-6 rounded-[2rem] border border-transparent shadow-sm transition-all duration-300 group overflow-hidden bg-white
                                    ${isSoon ? 'opacity-60 grayscale cursor-not-allowed border-slate-100' : 'hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 cursor-pointer active:scale-95 hover:border-slate-100'}
                                `}
                            >
                                {/* Background Hover Soft Color */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${tool.bgSoft}`}></div>

                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`
                                            w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center 
                                            shadow-lg group-hover:scale-110 transition-transform duration-500 relative ring-4 ring-white
                                        `}>
                                            {tool.icon}
                                        </div>

                                        <div className="flex flex-col">
                                            <h4 className={`text-sm font-black uppercase tracking-tight mb-1 transition-colors ${isSoon ? 'text-slate-500' : 'text-slate-800 group-hover:text-slate-900'}`}>
                                                {tool.name}
                                            </h4>
                                            
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {tool.badge === 'HOT' && (
                                                    <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                                                        <Flame size={8} fill="currentColor"/> HOT
                                                    </span>
                                                )}
                                                {tool.badge === 'NEW' && (
                                                    <span className="bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                                                        <Sparkles size={8} fill="currentColor"/> NEW
                                                    </span>
                                                )}
                                                {/* GANTI GEMBOK JADI LOGO PREMIUM */}
                                                {isLocked && !isSoon && (
                                                    <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                                                        <Crown size={10} className="fill-amber-600" /> PREMIUM
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Icon: Premium (Crown) or Open (Chevron) */}
                                    <div className={`p-2 rounded-full transition-all ${isLocked ? 'bg-amber-50 text-amber-500' : 'bg-white text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 shadow-sm'}`}>
                                        {isLocked ? <Crown size={18} className="fill-amber-500" /> : <ChevronRight size={18}/>}
                                    </div>
                                </div>
                                
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-5 pl-1 relative z-10 group-hover:text-slate-600">
                                    {tool.desc}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* --- RIGHT: SIDEBAR WIDGETS (4 Cols) --- */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* WIDGET RIWAYAT AKTIVITAS */}
            <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col h-full min-h-[300px]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <TrendingUp size={14} /> Riwayat Terakhir
                </h3>
                <div className="space-y-3 flex-1">
                    {history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10">
                            <div className="bg-slate-50 p-4 rounded-2xl mb-3">
                                <Search size={24} className="text-slate-400"/>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Belum ada riset</p>
                        </div>
                    ) : (
                        history.map((h, i) => (
                            <div key={i} className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-default">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-blue-500 group-hover:shadow-sm transition-all shrink-0">
                                    <Sparkles size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-tight truncate group-hover:text-blue-600">
                                        {h.toolType?.replace(/-/g, ' ')}
                                    </h5>
                                    <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
                                        {h.title || 'Tanpa Judul'}
                                    </p>
                                </div>
                                <span className="text-[8px] font-bold text-slate-300 uppercase">
                                    {new Date(h.createdAt).toLocaleDateString([], {day:'numeric', month:'short'})}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}