"use client";
import { useState, useEffect } from 'react';
import { 
  Zap, ArrowUpRight, Sparkles, Wallet, LayoutGrid, TrendingUp, 
  Users2, Globe, BookOpen, History as HistoryIcon, Gift, 
  ArrowRight, Loader2, Copy, CheckCircle2, Flame, Clock, 
  Rocket, Compass, Bell, Crown, Star, Activity, MousePointer2, 
  ChevronRight, Lightbulb
} from 'lucide-react'; 
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  
  const [data, setData] = useState({
    user: { name: "Yayan", credits: 44832, rank: "Premium" },
    recentHistory: [],
    trendingTools: [
      { name: "Riset Produk", usage: 88, color: "from-blue-500 to-cyan-400" },
      { name: "Landing Page AI", usage: 72, color: "from-indigo-500 to-purple-500" },
      { name: "Magic Ad Script", usage: 45, color: "from-amber-400 to-orange-500" }
    ],
    winningNews: {
      title: "Micro-SaaS: E-Course Automation",
      reason: "Niche edukasi automasi sedang meledak. Margin profit digital mencapai 90%.",
    },
    articles: [
      { id: "1", title: "Strategi Scale-Up Iklan Meta 2026", read: "5 Min", tag: "HOT", cat: "Strategy" },
      { id: "2", title: "Psikologi Warna Landing Page", read: "4 Min", tag: "TRENDING", cat: "Design" },
      { id: "3", title: "5 Niche Micro-SaaS Paling Cuan", read: "7 Min", tag: "WINNING", cat: "Niche" }
    ]
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(prev => ({
        ...prev,
        recentHistory: [
          { name: "Riset: Smartwatch 2026", time: "Baru saja", cost: 50 },
          { name: "Script: E-Course AI", time: "12m lalu", cost: 150 },
          { name: "Validasi: Niche Kuliner", time: "1j lalu", cost: 30 },
          { name: "Landing Page: Skincare", time: "3j lalu", cost: 250 },
        ]
      }));
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("JITU10K");
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  return (
    <div className="max-w-[1280px] mx-auto space-y-6 pb-24 pt-4 font-sans antialiased text-slate-900 px-4 md:px-6">
      
      {/* 1. HEADER: Mini & Clean (Saldo Dihilangkan) */}
      <div className="flex justify-between items-center bg-white/70 backdrop-blur-md p-4 md:p-5 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Zap size={18} fill="currentColor" className="text-yellow-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-bold tracking-tight leading-none truncate">Hai, {data.user.name}! 🔥</h1>
            <p className="text-[9px] md:text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">Ready to win the market?</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2.5 bg-white border border-slate-100 rounded-2xl text-slate-300 hover:text-blue-600 shadow-sm transition-all"><Bell size={18}/></button>
        </div>
      </div>

      {/* 2. CORE BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-500/20 group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500"><Compass size={120} className="w-24 h-24 md:w-32 md:h-32" /></div>
          <div className="relative z-10 space-y-6">
            <span className="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">Winning Radar</span>
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-tight">{data.winningNews?.title}</h2>
              <p className="text-blue-100 text-xs font-normal leading-relaxed italic opacity-80">"{data.winningNews?.reason}"</p>
            </div>
            <Link href="/tools/riset-produk" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white text-blue-600 px-8 py-3 rounded-xl hover:bg-blue-50 transition-all shadow-lg">
              Eksekusi Sekarang <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-3 bg-[#0A0C10] rounded-[2.5rem] p-7 text-white border border-amber-500/20 relative overflow-hidden flex flex-col justify-between shadow-xl">
          <div className="absolute top-0 right-0 p-6 opacity-10"><Crown size={60} className="text-amber-400" /></div>
          <div className="space-y-1 relative z-10">
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5"><Star size={10} fill="currentColor"/> Gold Edition</span>
            <h4 className="text-xl font-black leading-tight uppercase tracking-tight">Top Up <span className="text-amber-400">50K</span> <br/> Get Extra <span className="text-amber-400">10K</span></h4>
          </div>
          <div className="mt-6 bg-white/5 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between backdrop-blur-sm">
            <div className="flex flex-col">
                <span className="text-[8px] font-bold text-amber-600 uppercase mb-1">Voucher</span>
                <span className="font-mono text-[11px] font-bold text-amber-400">JITU10K</span>
            </div>
            <button onClick={handleCopy} className="p-3 bg-amber-500 text-slate-900 rounded-xl hover:bg-amber-400 active:scale-90 transition-all">
              {copying ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Users2 size={14} /> Community Pulse</h3>
          <div className="space-y-6">
            {data.trendingTools?.map((tool, i) => (
              <div key={i} className="space-y-2.5">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                  <span className="text-slate-600">{tool.name}</span>
                  <span className="text-slate-900">{tool.usage}%</span>
                </div>
                <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-50">
                  <div className={`h-full bg-gradient-to-r ${tool.color} rounded-full transition-all duration-1000`} style={{ width: `${tool.usage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. LOWER BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><HistoryIcon size={14} /> My Activity</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="animate-spin text-blue-600" size={20}/></div>
            ) : data.recentHistory?.map((h, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shrink-0"><Rocket size={16} /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-800 truncate uppercase tracking-tighter leading-none">{h.name}</p>
                  <p className="text-[9px] text-slate-400 font-medium uppercase mt-1 tracking-tighter">{h.time}</p>
                </div>
                <span className="text-[11px] font-black text-rose-500 tabular-nums">-{h.cost}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-[2.5rem] p-7 border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><BookOpen size={14} /> Academy Feed</h3>
          <div className="grid grid-cols-1 gap-3">
            {data.articles?.map((art) => (
              <Link href={`/academy?id=${art.id}`} key={art.id} className="p-4 bg-slate-50 rounded-3xl border border-transparent hover:border-blue-100 hover:bg-white transition-all group flex items-center justify-between shadow-sm active:scale-95">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">{art.tag}</span>
                    <span className="text-[8px] font-bold text-slate-300 uppercase">{art.cat}</span>
                  </div>
                  <h4 className="text-[12px] font-bold text-slate-800 uppercase italic truncate tracking-tight">{art.title}</h4>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-600 transition-colors shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3 bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 text-emerald-100 group-hover:rotate-12 transition-transform duration-500"><Lightbulb size={70} fill="currentColor" /></div>
          <div className="space-y-4 relative z-10">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Digital Insights</span>
            <p className="text-[12px] font-medium text-emerald-800 leading-relaxed italic">"Riset market kian meluas. Fokus pada Micro-Course hari ini."</p>
          </div>
          <button className="w-full py-3.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest mt-8 hover:bg-slate-900 transition-all relative z-10 shadow-lg shadow-emerald-600/20 active:scale-95">Baca Strategi</button>
        </div>
      </div>
    </div>
  );
}