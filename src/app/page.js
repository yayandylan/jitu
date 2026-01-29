"use client";
import { useState, useEffect } from 'react';
import { 
  Zap, Search, Target, PenTool, ShieldCheck, 
  ImageIcon, BarChart3, Calculator, 
  CheckCircle2, ArrowRight, Menu, X, Flame, 
  Layers, Gift, Crown, Mail, Instagram, MessageSquare, PlayCircle
} from 'lucide-react';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd'; // Import komponen GEO

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // DATA UNTUK AI (GEO)
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Jitu Digital",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Platform AI Marketing Intelligence no.1 di Indonesia untuk Riset Produk, Copywriting, dan Audit Iklan.",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "IDR" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "1500" }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white tracking-tight overflow-x-hidden relative">
      <JsonLd data={jsonLdData} />

      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="bg-slate-900 p-2 rounded-xl shadow-lg shadow-slate-900/20 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <span className="text-xl font-black uppercase tracking-tighter italic text-slate-900">JITU <span className="text-blue-600 not-italic">DIGITAL</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.15em]">
            <Link href="#fitur" className="text-slate-500 hover:text-blue-600 transition-colors">Fitur</Link>
            <Link href="#harga" className="text-slate-500 hover:text-blue-600 transition-colors">Harga</Link>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <Link href="/login" className="text-slate-900 hover:text-blue-600 transition-colors">Masuk</Link>
            <Link href="/register" className="bg-blue-600 text-white px-7 py-3 rounded-xl hover:bg-slate-900 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2">
              Daftar Gratis <ArrowRight size={14}/>
            </Link>
          </div>
          <button className="md:hidden p-2 text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 space-y-4 animate-in slide-in-from-top-5 text-center shadow-2xl">
            <Link href="/login" className="block text-sm font-bold uppercase text-slate-600 py-2">Login Member</Link>
            <Link href="/register" className="block w-full text-center bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg">Buka Akses</Link>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="pt-40 md:pt-52 pb-24 px-6 text-center max-w-6xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-blue-100 shadow-xl shadow-blue-900/5 mb-10 hover:scale-105 transition-transform cursor-default">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">AI MarketingOS v2.0 Live</span>
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-slate-900 leading-[0.9] mb-10 uppercase italic tracking-tighter">
          IKLAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">PROFIT</span><br/>
          ADALAH JITU.
        </h1>
        
        <p className="text-base md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed px-4">
          Platform intelijen digital untuk memvalidasi market, riset produk, hingga audit funnel iklan secara otomatis. <span className="text-slate-900 font-bold underline decoration-blue-400 decoration-2 underline-offset-4">Berhenti menebak, mulai mendominasi.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 px-4">
          <Link href="/register" className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group">
            <Zap size={16} className="text-yellow-400 fill-yellow-400 group-hover:scale-125 transition-transform"/> 
            Ambil Akses Gratis
          </Link>
          <button className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 group">
            <PlayCircle size={16} className="text-slate-400 group-hover:text-slate-900 transition-colors"/> 
            Lihat Demo
          </button>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="py-10 bg-white border-y border-slate-100 overflow-hidden relative z-20">
        <div className="max-w-7xl mx-auto px-6 text-center mb-6">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Dipercaya oleh Advertiser dari</p>
        </div>
        <div className="flex gap-16 animate-marquee whitespace-nowrap opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {['Meta Ads', 'TikTok', 'Google', 'Shopee', 'Tokopedia', 'Shopify', 'WooCommerce', 'Lazada'].map((logo, i) => (
                <span key={i} className="text-xl font-black text-slate-300 uppercase italic tracking-tighter">{logo}</span>
            ))}
             {['Meta Ads', 'TikTok', 'Google', 'Shopee', 'Tokopedia', 'Shopify', 'WooCommerce', 'Lazada'].map((logo, i) => (
                <span key={`duplicate-${i}`} className="text-xl font-black text-slate-300 uppercase italic tracking-tighter">{logo}</span>
            ))}
        </div>
      </div>

      {/* BENTO GRID FEATURES */}
      <section id="fitur" className="py-32 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic leading-none">ARSENAL <span className="text-blue-600 not-italic">LENGKAP</span></h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em]">All-in-One Marketing Intelligence</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[280px]">
            {/* Big Card */}
            <div className="md:col-span-2 row-span-1 md:row-span-2 bg-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl text-white">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-700"><Target size={200} /></div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40"><Target className="text-white" size={28} /></div>
                    <div>
                        <h3 className="text-3xl font-black uppercase italic mb-2 tracking-tighter">Validasi Market</h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs">Jangan bakar uang untuk produk yang tidak diinginkan pasar. Biarkan AI membedah potensi cuan sebelum Anda mulai.</p>
                    </div>
                </div>
            </div>
            {/* Standard Cards */}
            <BentoCard icon={<Search/>} title="Riset Produk" desc="Blue Ocean Strategy Finder." color="text-blue-600" bg="bg-blue-50" />
            <BentoCard icon={<PenTool/>} title="Magic Script" desc="Hypnotic Copywriting Generator." color="text-indigo-600" bg="bg-indigo-50" />
            
            {/* Wide Card */}
            <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-xl text-white flex items-center justify-between">
                 <div className="space-y-2 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest border border-white/10"><Flame size={12} className="text-yellow-300 fill-yellow-300" /> Hot Feature</div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Landing Page Builder</h3>
                    <p className="text-blue-100 text-xs font-medium">Generate HTML sales page siap iklan dalam 10 detik.</p>
                 </div>
                 <div className="h-24 w-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:rotate-90 transition-transform duration-500"><Layers size={40} /></div>
            </div>

            <BentoCard icon={<ShieldCheck/>} title="Audit Funnel" desc="Temukan kebocoran trafik." color="text-emerald-600" bg="bg-emerald-50" />
            <BentoCard icon={<ImageIcon/>} title="Visual AI" desc="Generate mockup produk 3D." color="text-purple-600" bg="bg-purple-50" />
            <BentoCard icon={<Calculator/>} title="Ad Calculator" desc="Hitung ROAS & BEP presisi." color="text-rose-600" bg="bg-rose-50" />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="harga" className="py-32 bg-[#F8FAFC] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px] -z-10" />
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="mb-20 space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm mb-4">
                <Crown size={14} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Investasi Cerdas</span>
             </div>
             <h2 className="text-5xl md:text-7xl font-black text-slate-900 uppercase italic leading-none">PILIH <span className="text-blue-600 not-italic">AMUNISI</span></h2>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em]">Top Up Sekali, Pakai Selamanya. Tanpa Langganan.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            <PricePack title="Starter Pack" price="24.900" totalPoints="1.100" />
            <PricePack title="Pro Advertiser" price="99.000" totalPoints="6.000" bonus="Bonus +1.000 pts" highlight badge="Paling Laris"/>
            <PricePack title="Agency Scale" price="249.000" totalPoints="20.000" bonus="Bonus +5.000 pts" goldTheme />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#020617] text-white pt-24 pb-10 relative overflow-hidden border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2.5 rounded-xl"><Zap className="w-5 h-5 text-white fill-white" /></div>
                <span className="text-2xl font-black italic uppercase tracking-tighter">JITU <span className="text-blue-500">DIGITAL</span></span>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm uppercase tracking-tight opacity-70">
                AI Marketing Intelligence Platform. Membantu UMKM & Agency scaling tanpa boncos.
              </p>
              <div className="flex gap-4">
                 <SocialBtn icon={<Instagram size={18}/>} />
                 <SocialBtn icon={<MessageSquare size={18}/>} />
                 <SocialBtn icon={<Mail size={18}/>} />
              </div>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Akses</h4>
                    <ul className="space-y-3 text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                        <li><Link href="/login" className="hover:text-blue-500 transition-colors">Login</Link></li>
                        <li><Link href="/register" className="hover:text-blue-500 transition-colors">Daftar</Link></li>
                    </ul>
                </div>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex justify-between items-center gap-4">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">&copy; 2026 Jitu Digital.</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- SUB COMPONENTS ---
function BentoCard({ icon, title, desc, color, bg }) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group flex flex-col items-start justify-between relative overflow-hidden">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${bg} ${color}`}>{icon}</div>
            <div className="relative z-10">
                <h3 className="text-lg font-black text-slate-900 mb-1 uppercase tracking-tight">{title}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{desc}</p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-0" />
        </div>
    )
}

function SocialBtn({ icon }) {
    return <button className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-all active:scale-95 hover:border-transparent">{icon}</button>
}

function PricePack({ title, price, totalPoints, highlight, bonus, goldTheme, badge }) {
  return (
    <div className={`p-8 md:p-10 rounded-[3rem] border transition-all text-left relative overflow-hidden h-fit flex flex-col
      ${highlight ? 'bg-[#0F172A] border-slate-900 shadow-2xl md:scale-110 z-10 text-white' : 
        goldTheme ? 'bg-white border-amber-200 shadow-xl shadow-amber-500/10' : 'bg-white border-slate-100'}`}>
      
      {badge && <div className="absolute top-0 inset-x-0 bg-blue-600 text-white py-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-center">Most Popular</div>}
      
      <div className={`space-y-4 ${badge ? 'mt-4' : ''}`}>
        <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${highlight ? 'text-blue-400' : goldTheme ? 'text-amber-600' : 'text-slate-400'}`}>{title}</h3>
        <div className="flex items-baseline gap-1">
            <span className={`text-sm font-bold ${highlight ? 'text-slate-500' : 'text-slate-400'}`}>Rp</span>
            <span className={`text-4xl md:text-5xl font-black tracking-tighter italic ${highlight ? 'text-white' : 'text-slate-900'}`}>{price}</span>
        </div>
        <div className={`py-4 px-6 rounded-2xl font-black text-2xl mb-4 uppercase tracking-tighter flex items-center justify-between border
          ${highlight ? 'bg-blue-600 border-blue-500 text-white' : goldTheme ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
          <span>{totalPoints}</span><span className="text-[9px] font-bold opacity-60 tracking-widest">POIN</span>
        </div>
        {bonus && <div className="flex items-center gap-2 mb-6"><Gift size={14} className={highlight ? "text-emerald-400" : "text-emerald-600"} /><span className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-emerald-400' : 'text-emerald-600'}`}>{bonus}</span></div>}
        
        <div className={`space-y-3 pt-6 border-t ${highlight ? 'border-slate-800' : 'border-slate-50'}`}>
            <div className="flex items-center gap-3"><CheckCircle2 size={14} className={highlight ? "text-blue-500" : "text-slate-400"} /><span className={`text-[10px] font-bold uppercase tracking-wider ${highlight ? 'text-slate-300' : 'text-slate-500'}`}>Akses Seluruh Tools</span></div>
            <div className="flex items-center gap-3"><CheckCircle2 size={14} className={highlight ? "text-blue-500" : "text-slate-400"} /><span className={`text-[10px] font-bold uppercase tracking-wider ${highlight ? 'text-slate-300' : 'text-slate-500'}`}>Masa Aktif Selamanya</span></div>
        </div>

        <Link href="/register" className={`mt-8 block w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all text-center active:scale-95 border hover:shadow-lg
          ${highlight ? 'bg-white text-slate-900 border-white hover:bg-blue-50' : goldTheme ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600' : 'bg-slate-900 text-white border-slate-900 hover:bg-blue-600 hover:border-blue-600'}`}>
          BELI SEKARANG
        </Link>
      </div>
    </div>
  );
}