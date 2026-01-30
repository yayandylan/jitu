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
  
  // State Data User & History
  const [userData, setUserData] = useState({ name: "User", credits: 0, isPremium: false });
  const [history, setHistory] = useState([]);

  // --- DATABASE TOOLS ---
  const toolsList = [
    { 
      name: "Riset Produk", 
      desc: "Temukan winning product & blue ocean market.", 
      href: "/site/tools/riset-produk", 
      icon: <Search size={22} className="text-white" />, 
      gradient: "from-blue-500 to-cyan-400",
      shadow: "shadow-blue-500/40",
      status: "ACTIVE", 
      isFree: true 
    },
    { 
      name: "Validasi Market", 
      desc: "Cek kelayakan ide sebelum bakar uang.", 
      href: "/site/tools/validasi-market", 
      icon: <Target size={22} className="text-white" />, 
      gradient: "from-emerald-500 to-teal-400",
      shadow: "shadow-emerald-500/40",
      status: "PREMIUM",
      isFree: false 
    },
    { 
      name: "Magic Ad Script", 
      desc: "Generate video script & caption iklan.", 
      href: "/site/tools/magic-ad-script", 
      icon: <Clapperboard size={22} className="text-white" />, 
      gradient: "from-violet-500 to-fuchsia-500",
      shadow: "shadow-violet-500/40",
      status: "PREMIUM",
      isFree: false 
    },
    { 
      name: "Landing Page", 
      desc: "Buat sales page HTML siap pakai.", 
      href: "/site/tools/landing-page", 
      icon: <LayoutTemplate size={22} className="text-white" />, 
      gradient: "from-pink-500 to-rose-500",
      shadow: "shadow-pink-500/40",
      status: "PREMIUM",
      isFree: false 
    },
    { 
      name: "Audit Funnel", 
      desc: "Diagnosa kebocoran traffic website.", 
      href: "/site/tools/ad-review", 
      icon: <ScanEye size={22} className="text-white" />, 
      gradient: "from-orange-500 to-amber-500",
      shadow: "shadow-orange-500/40",
      status: "PREMIUM",
      isFree: false 
    },
    { 
      name: "Analisis Iklan", 
      desc: "Baca data ads & rekomendasi optimasi.", 
      href: "/site/tools/analisis-iklan", 
      icon: <BarChart2 size={22} className="text-white" />, 
      gradient: "from-slate-700 to-slate-600",
      shadow: "shadow-slate-500/40",
      status: "PREMIUM", 
      isFree: false 
    },
    { 
      name: "Kalkulator Ads", 
      desc: "Hitung ROAS & BEP bisnis.", 
      href: "/site/tools/kalkulator-ads", 
      icon: <Calculator size={22} className="text-white" />, 
      gradient: "from-indigo-500 to-blue-600",
      shadow: "shadow-indigo-500/40",
      status: "PREMIUM", 
      isFree: false 
    },
    { 
      name: "Generate Gambar", 
      desc: "Bikin aset visual iklan dengan AI.", 
      href: "#", 
      icon: <ImageIcon size={22} className="text-white" />, 
      gradient: "from-fuchsia-600 to-purple-600",
      shadow: "shadow-fuchsia-500/40",
      status: "SOON", 
      isFree: false
    },
  ];

  // --- OPTIMIZED DATA FETCHING (PARALLEL) ---
  useEffect(() => {
    async function loadDashboardData() {
        setLoading(true);
        try {
            // Jalankan kedua request secara BERSAMAAN (Parallel), bukan antrian (Waterfall)
            const [userRes, histRes] = await Promise.all([
                fetch('/api/user/me').catch(() => null),
                fetch('/api/user/history?limit=3').catch(() => null)
            ]);

            // Process User Data
            if (userRes && userRes.ok) {
                const userData = await userRes.json();
                if (userData.user) setUserData(userData.user);
            }

            // Process History Data
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
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Memuat Dashboard...</p>
    </div>
  );

  return (
    <div className="max-w-[1280px] mx-auto space-y-6 md:space-y-8 pb-24 pt-2 font-sans antialiased text-slate-900 px-4 md:px-2 relative">
      
      {/* 0. AMBIENT BACKGROUND GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-40 bg-blue-500/10 blur-[100px] pointer-events-none rounded-full z-0"></div>

      {/* 1. HEADER: ULTRA GLASSMORPHISM */}
      <div className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-center bg-white/70 backdrop-blur-2xl p-5 rounded-[2rem] border border-white/50 shadow-xl shadow-slate-200/40 sticky top-20 md:top-4 transition-all gap-4 md:gap-0">
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Avatar Premium */}
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-[1.2rem] flex items-center justify-center text-white shadow-lg shrink-0 relative overflow-hidden group border border-slate-700">
            <Zap size={24} fill="currentColor" className="text-yellow-400 relative z-10 group-hover:scale-110 transition-transform duration-500" />
            {userData.isPremium && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/20 to-transparent animate-pulse"></div>
                    <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-yellow-400 blur-xl opacity-40"></div>
                </>
            )}
          </div>
          
          <div className="min-w-0 space-y-1">
            <h1 className="text-lg md:text-xl font-black tracking-tight leading-none truncate flex items-center gap-2 text-slate-800">
                Hi, {userData.name?.split(' ')[0]} 
                {userData.isPremium && <Crown size={16} className="text-yellow-500 fill-yellow-500 drop-shadow-sm"/>}
            </h1>
            <div className="flex items-center gap-3">
                <div className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${userData.isPremium ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                    {userData.isPremium ? 'Pro Plan' : 'Basic Plan'}
                </div>
                <div className="h-3 w-[1px] bg-slate-300"></div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    Saldo: <span className="text-blue-600 text-xs">{userData.credits?.toLocaleString()}</span>
                </p>
            </div>
          </div>
        </div>

        {/* Top Up Button (Desktop) */}
        <Link href="/site/topup" className="hidden md:flex bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-blue-600 transition-all items-center gap-2.5 shadow-xl hover:shadow-blue-600/25 active:scale-95 group">
             <div className="bg-white/10 p-1 rounded-full group-hover:bg-white/20 transition-colors"><Wallet size={14} /></div> 
             Isi Saldo
        </Link>
        {/* Top Up Button (Mobile - Full Width) */}
        <Link href="/site/topup" className="md:hidden w-full bg-slate-900 text-white py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95">
             <Wallet size={16} /> Isi Saldo Poin
        </Link>
      </div>

      {/* 2. DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* --- LEFT COLUMN: TOOLS (8 Cols) --- */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* HERO BANNER (Responsive Adjustments) */}
            <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-[#0B1121] border border-slate-800 p-6 md:p-10 shadow-2xl shadow-blue-900/10 group isolate">
                {/* Background FX */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:30px_30px] opacity-20"></div>
                <div className="absolute -top-20 -right-20 w-64 md:w-96 h-64 md:h-96 bg-blue-600/20 blur-[80px] md:blur-[120px] rounded-full pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-8">
                    {/* Text */}
                    <div className="max-w-xl space-y-4 md:space-y-5">
                        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            <span className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest">New Tool</span>
                        </div>

                        <div>
                            <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                                Landing Page <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Express</span>
                            </h2>
                            <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed max-w-sm">
                                Bikin sales page konversi tinggi dalam hitungan detik. Tanpa koding, instan jadi HTML siap pakai.
                            </p>
                        </div>

                        <Link href="/site/tools/landing-page" className="inline-flex items-center gap-3 bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95 group/btn w-full md:w-auto justify-center">
                            Buat Sekarang <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Visual 3D Icon (Hidden on small mobile, visible on desktop) */}
                    <div className="hidden md:block pr-6">
                        <div className="relative w-36 h-36 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/30 rotate-6 group-hover:rotate-12 transition-all duration-700 border border-white/10">
                            <LayoutTemplate size={64} className="text-white drop-shadow-md" strokeWidth={1.5} />
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-[2rem] pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ALL TOOLS GRID */}
            <div>
                <div className="flex items-center justify-between mb-4 md:mb-6 px-1">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Zap size={14} className="text-blue-500" /> Power Tools
                    </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    {toolsList.map((tool, index) => {
                        const isSoon = tool.status === 'SOON';
                        const isLocked = !tool.isFree && !userData.isPremium;
                        const destination = isSoon ? '#' : (isLocked ? '/site/topup' : tool.href);

                        return (
                            <Link 
                                key={index} 
                                href={destination}
                                onClick={(e) => { if(isSoon) e.preventDefault(); }}
                                className={`
                                    relative p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] bg-white border border-slate-100 shadow-sm transition-all duration-300 group overflow-hidden
                                    ${isSoon ? 'opacity-70 grayscale cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/50 hover:border-blue-100 cursor-pointer active:scale-95'}
                                `}
                            >
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex items-center gap-4 md:gap-5">
                                        
                                        {/* ICON BOX */}
                                        <div className={`
                                            w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center 
                                            ${tool.shadow} shadow-lg group-hover:scale-110 transition-transform duration-500 relative ring-4 ring-white
                                        `}>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>
                                            {tool.icon}
                                        </div>

                                        <div className="space-y-1">
                                            <h4 className="text-xs md:text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                                {tool.name}
                                            </h4>
                                            
                                            {/* Status Badges */}
                                            {isSoon ? (
                                                <div className="inline-block bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-bold uppercase tracking-wider">
                                                    Coming Soon
                                                </div>
                                            ) : isLocked ? (
                                                <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-bold text-amber-500 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-md w-fit">
                                                    <LockKeyhole size={10} /> Locked
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md w-fit">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Ready
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Action Button */}
                                    {!isLocked && !isSoon && (
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                            <ArrowRight size={16} />
                                        </div>
                                    )}
                                    {isLocked && !isSoon && (
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                                            <LockKeyhole size={16} />
                                        </div>
                                    )}
                                </div>
                                
                                <p className="text-[10px] md:text-[11px] text-slate-500 font-medium leading-relaxed mt-4 md:mt-5 pl-1 opacity-80 group-hover:opacity-100 transition-opacity">
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
            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col h-full min-h-[400px]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <TrendingUp size={14} /> Aktivitas Terakhir
                </h3>
                
                <div className="space-y-4 flex-1">
                    {history.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <div className="bg-slate-50 p-5 rounded-3xl mb-3">
                                <Search size={24} className="text-slate-400"/>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Belum ada riset</p>
                        </div>
                    ) : (
                        history.map((h, i) => (
                            <div key={i} className="group flex items-center gap-4 p-3 rounded-2xl md:rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-default">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0 shadow-sm">
                                    <Sparkles size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-[10px] md:text-[11px] font-bold text-slate-800 uppercase tracking-tight truncate">
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

            {/* UPGRADE PROMO (Jika Free) */}
            {!userData.isPremium && (
                <div className="bg-[#0A0C10] rounded-[2rem] md:rounded-[2.5rem] p-8 text-white border border-yellow-500/20 relative overflow-hidden text-center group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-amber-500"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-500/20 blur-[50px] rounded-full"></div>
                    
                    <div className="relative z-10">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl border border-slate-700 mx-auto mb-4 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                             <Crown size={28} className="text-yellow-400 fill-yellow-400" />
                        </div>
                        <h4 className="text-lg md:text-xl font-black uppercase tracking-tight mb-2">Unlock Pro</h4>
                        <p className="text-[10px] md:text-[11px] text-slate-400 leading-relaxed mb-6 px-2">
                            Akses semua tools premium tanpa batas & dapatkan prioritas support.
                        </p>
                        <Link href="/site/topup" className="block w-full py-3 md:py-4 bg-yellow-500 text-slate-900 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-yellow-500/20">
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