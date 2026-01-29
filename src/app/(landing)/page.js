"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Target, 
  Clapperboard, 
  ScanEye, 
  Image as ImageIcon, 
  BarChart2, 
  Calculator, 
  ArrowRight,
  Sparkles,
  Lock,      
  Loader2    
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. AMBIL DATA USER & CEK STATUS PREMIUM
  useEffect(() => {
    fetch('/api/user/me')
      .then(res => res.json())
      .then(data => {
        // Log ini untuk memastikan status isPremium sudah sinkron dengan DB
        console.log("🔍 [DEBUG] Data User:", data.user);
        console.log("💎 [DEBUG] Status Premium:", data.user?.isPremium);

        if(data.user) setUser(data.user);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal load user:", err);
        setLoading(false);
      });
  }, []);

  // KONFIGURASI TOOLS
  const tools = [
    {
      title: "Riset Produk Winning",
      desc: "Analisa potensi ide bisnis & strategi blue ocean.",
      icon: <Search className="w-8 h-8 text-blue-600" />,
      href: "/tools/riset-produk",
      color: "bg-blue-50 border-blue-100 hover:border-blue-300",
      status: "Ready",
      isFree: true // AKSES GRATIS
    },
    {
      title: "Validasi Market & CTWA",
      desc: "Blueprint targeting FB Ads & copywriting WA.",
      icon: <Target className="w-8 h-8 text-indigo-600" />,
      href: "/tools/validasi-market",
      color: "bg-indigo-50 border-indigo-100 hover:border-indigo-300",
      status: "Ready",
      isFree: false // PREMIUM ONLY
    },
    {
      title: "Magic Ad Script",
      desc: "Generate caption iklan & naskah video TikTok.",
      icon: <Clapperboard className="w-8 h-8 text-pink-600" />,
      href: "/tools/magic-ad-script",
      color: "bg-pink-50 border-pink-100 hover:border-pink-300",
      status: "New",
      isFree: false // PREMIUM ONLY
    },
    {
      title: "Audit Iklan & Funnel",
      desc: "Cek 'message match' iklan vs landing page.",
      icon: <ScanEye className="w-8 h-8 text-teal-600" />,
      href: "/tools/ad-review",
      color: "bg-teal-50 border-teal-100 hover:border-teal-300",
      status: "New",
      isFree: false // PREMIUM ONLY
    },
    {
      title: "Generate Gambar Iklan",
      desc: "Buat visual iklan AI tanpa fotografer.",
      icon: <ImageIcon className="w-8 h-8 text-purple-600" />,
      href: "#", 
      color: "bg-purple-50 border-purple-100 hover:border-purple-300",
      status: "Coming Soon",
      isFree: false
    },
    {
      title: "Analisis Performa",
      desc: "Diagnosa data iklan (CPM, CTR, ROAS).",
      icon: <BarChart2 className="w-8 h-8 text-orange-600" />,
      href: "#",
      color: "bg-orange-50 border-orange-100 hover:border-orange-300",
      status: "Coming Soon",
      isFree: false
    },
    {
      title: "Kalkulator Budget",
      desc: "Hitung estimasi profit & budget harian.",
      icon: <Calculator className="w-8 h-8 text-green-600" />,
      href: "#",
      color: "bg-green-50 border-green-100 hover:border-green-300",
      status: "Coming Soon",
      isFree: false
    },
  ];

  // 2. PROTEKSI KLIK UNTUK USER FREE
  const handleToolClick = (e, tool) => {
    if (tool.status === "Coming Soon") {
      e.preventDefault();
      return;
    }

    if (!tool.isFree && !user?.isPremium) {
      e.preventDefault(); 
      const confirmTopup = confirm("🔒 Fitur Terkunci!\n\nFitur ini khusus Member Premium. Top Up saldo minimal sekali untuk membuka semua akses.\n\nMau Top Up sekarang?");
      if(confirmTopup) {
        router.push('/topup');
      }
    }
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center">
      <Loader2 className="animate-spin text-blue-600 mb-2"/> 
      <p className="text-sm text-gray-500 font-medium">Menyiapkan Dashboard...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
      {/* Header & Status Card */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Advertiser</h1>
          <p className="text-gray-500 mt-1">Pilih senjata AI Anda hari ini.</p>
        </div>
        
        {user?.isPremium ? (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 border border-blue-400/20">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>MEMBER PREMIUM</span>
          </div>
        ) : (
          <div className="bg-white text-slate-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-slate-200 shadow-sm">
            <div className="w-2 h-2 bg-slate-300 rounded-full" />
            <span>FREE MEMBER</span>
            <Link href="/topup" className="text-blue-600 hover:text-blue-700 text-xs font-extrabold ml-1 underline decoration-2 underline-offset-4">UPGRADE ↗</Link>
          </div>
        )}
      </div>

      {/* Grid Menu Tools */}
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
                    relative group block p-6 rounded-2xl border transition-all duration-300 
                    ${isLocked 
                        ? "bg-slate-50 border-slate-200 cursor-not-allowed" 
                        : `${tool.color} hover:shadow-md hover:-translate-y-1` 
                    }
                    ${isComingSoon ? "opacity-75 cursor-not-allowed" : ""}
                `}
              >
                {/* Visual Gembok */}
                {isLocked && (
                    <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-full z-10 shadow-sm border border-slate-100">
                        <Lock size={16} className="text-slate-400" />
                    </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl shadow-sm transition-transform ${isLocked ? 'bg-slate-100 grayscale' : 'bg-white group-hover:scale-110'}`}>
                    {tool.icon}
                  </div>
                  
                  {!isLocked && tool.status === "New" && (
                    <span className="bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-full tracking-tighter shadow-sm animate-pulse">
                      NEW TOOL
                    </span>
                  )}
                  {isComingSoon && (
                    <span className="bg-slate-200 text-slate-500 text-[9px] font-black px-2 py-1 rounded-full tracking-tighter">
                      COMING SOON
                    </span>
                  )}
                </div>
                
                <h3 className={`text-xl font-bold mb-2 transition-colors ${isLocked ? 'text-slate-500' : 'text-gray-900 group-hover:text-blue-700'}`}>
                  {tool.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {tool.desc}
                </p>
                
                <div className={`flex items-center text-sm font-bold ${isComingSoon || isLocked ? "text-gray-400" : "text-blue-600 group-hover:translate-x-2 transition-transform"}`}>
                  {isComingSoon ? "Dalam Pengembangan" : isLocked ? "Terkunci (Upgrade)" : "Gunakan Sekarang"} 
                  {!isComingSoon && !isLocked && <ArrowRight className="w-4 h-4 ml-1" />}
                </div>
              </Link>
            );
        })}
      </div>
    </div>
  );
}