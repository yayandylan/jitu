"use client";
import { useState, useEffect } from 'react';
import { 
  Zap, Search, Target, PenTool, ShieldCheck, 
  ImageIcon, BarChart3, Calculator, 
  CheckCircle2, ArrowRight, Flame, 
  Layers, Gift, Crown, Mail, Instagram, MessageSquare, 
  PlayCircle, Plus, Minus, Globe, Shield
} from 'lucide-react';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Jitu Digital",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "description": "Platform AI Marketing Intelligence no.1 di Indonesia.",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "IDR" }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white tracking-tight overflow-x-hidden relative">
      <JsonLd data={jsonLdData} />

      {/* --- TEXTURE NOISE (Premium Feel) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      
      {/* GRADIENT BLURS */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* --- 1. NAVBAR (Mobile Optimized) --- */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 py-3' : 'bg-transparent py-4 md:py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          
          {/* LOGO */}
          <div className="flex items-center gap-2.5 group cursor-pointer">
            {/* FIX: Logo Biru (Jitu Banget) */}
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-lg md:text-xl font-black uppercase tracking-tighter italic text-slate-900">
              JITU <span className="text-blue-600 not-italic">DIGITAL</span>
            </span>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.15em]">
            <Link href="#fitur" className="text-slate-500 hover:text-blue-600 transition-colors">Fitur</Link>
            <Link href="#harga" className="text-slate-500 hover:text-blue-600 transition-colors">Harga</Link>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <Link href="/login" className="text-slate-900 hover:text-blue-600 transition-colors">Masuk</Link>
            <Link href="/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-slate-900 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2">
              Daftar Gratis <ArrowRight size={14}/>
            </Link>
          </div>

          {/* MOBILE ACTIONS (Langsung Tampil) */}
          <div className="flex md:hidden items-center gap-3">
            <Link href="/login" className="text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 px-2">
              Masuk
            </Link>
            <Link href="/register" className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-md active:scale-95">
              Daftar
            </Link>
          </div>
        </div>
      </nav>

      {/* --- 2. HERO SECTION --- */}
      <section className="pt-32 md:pt-48 pb-20 px-6 text-center max-w-6xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8 hover:border-blue-300 transition-colors cursor-default">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">New Engine v2.0</span>
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-slate-900 leading-[0.9] mb-8 uppercase italic tracking-tighter">
          IKLAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">PROFIT</span><br/>
          ADALAH JITU.
        </h1>
        
        <p className="text-sm md:text-lg text-slate-500 mb-10 max-w-2xl mx-auto font-medium leading-relaxed px-4 text-pretty">
          Platform intelijen digital untuk memvalidasi market, riset produk, hingga audit funnel iklan secara otomatis.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
          <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group">
            <Zap size={16} className="text-yellow-400 fill-yellow-400 group-hover:scale-125 transition-transform"/> 
            Ambil Akses Gratis
          </Link>
          <button className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
            <PlayCircle size={16} className="text-slate-400"/> 
            Lihat Demo
          </button>
        </div>
      </section>

      {/* --- 3. SOCIAL PROOF (Marquee) --- */}
      <div className="py-8 bg-white border-y border-slate-100 overflow-hidden relative z-20">
        <div className="max-w-7xl mx-auto px-6 text-center mb-6">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Kompatibel dengan Platform</p>
        </div>
        <div className="flex gap-16 animate-marquee whitespace-nowrap opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {['Meta Ads', 'TikTok', 'Google Ads', 'Shopee', 'Tokopedia', 'Shopify', 'WooCommerce', 'Lazada'].map((logo, i) => (
                <span key={i} className="text-xl font-black text-slate-300 uppercase italic tracking-tighter">{logo}</span>
            ))}
             {['Meta Ads', 'TikTok', 'Google Ads', 'Shopee', 'Tokopedia', 'Shopify', 'WooCommerce', 'Lazada'].map((logo, i) => (
                <span key={`duplicate-${i}`} className="text-xl font-black text-slate-300 uppercase italic tracking-tighter">{logo}</span>
            ))}
        </div>
      </div>

      {/* --- 4. TOOLS JITU (Bento Grid Premium) --- */}
      <section id="fitur" className="py-24 bg-slate-50/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase italic leading-none">TOOLS <span className="text-blue-600 not-italic">JITU</span></h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">All-in-One Marketing Intelligence</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[260px]">
            {/* Big Card */}
            <div className="md:col-span-2 row-span-1 md:row-span-2 bg-[#0F172A] rounded-[2rem] p-10 relative overflow-hidden group shadow-2xl text-white flex flex-col justify-between border border-slate-800 hover:border-blue-900 transition-colors">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                    <Target size={250} />
                </div>
                <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40 mb-6">
                    <Target className="text-white" size={28} />
                </div>
                <div className="relative z-10">
                    <h3 className="text-3xl font-black uppercase italic mb-3 tracking-tighter">Validasi Market</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                        Jangan bakar uang untuk produk yang tidak diinginkan pasar. Biarkan AI membedah potensi cuan sebelum Anda mulai spend iklan sepeserpun.
                    </p>
                </div>
            </div>

            {/* Feature Cards */}
            <BentoCard icon={<Search/>} title="Riset Produk" desc="Cari Winning Product." color="text-blue-600" bg="bg-blue-50" />
            <BentoCard icon={<PenTool/>} title="Magic Script" desc="Copywriting Hypnotic." color="text-indigo-600" bg="bg-indigo-50" />
            
            {/* Wide Card */}
            <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-8 relative overflow-hidden group shadow-xl text-white flex items-center justify-between border border-blue-500/50">
                 <div className="space-y-3 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest border border-white/10">
                        <Flame size={12} className="text-yellow-300 fill-yellow-300" /> Hot Feature
                    </div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Landing Page Builder</h3>
                    <p className="text-blue-100 text-xs font-medium max-w-xs">Generate HTML sales page siap iklan dalam 10 detik. Tanpa koding, langsung convert.</p>
                 </div>
                 <div className="h-24 w-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:rotate-12 transition-transform duration-500 shadow-2xl">
                    <Layers size={40} />
                 </div>
            </div>

            <BentoCard icon={<ShieldCheck/>} title="Audit Funnel" desc="Cek kebocoran trafik." color="text-emerald-600" bg="bg-emerald-50" />
            <BentoCard icon={<ImageIcon/>} title="Visual AI" desc="Mockup produk 3D." color="text-purple-600" bg="bg-purple-50" />
            <BentoCard icon={<Calculator/>} title="Ad Calculator" desc="Hitung ROAS & BEP." color="text-rose-600" bg="bg-rose-50" />
          </div>
        </div>
      </section>

      {/* --- 5. PRICING (Premium Cards) --- */}
      <section id="harga" className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="mb-20 space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full shadow-sm mb-4">
                <Crown size={14} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Investasi Cerdas</span>
             </div>
             <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic leading-none">PILIH <span className="text-blue-600 not-italic">AMUNISI</span></h2>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.4em]">Top Up Sekali, Pakai Selamanya. Tanpa Langganan Bulanan.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            <PricePack title="Starter Pack" price="24.900" totalPoints="1.100" />
            <PricePack title="Pro Advertiser" price="99.000" totalPoints="6.000" bonus="Bonus +1.000 pts" highlight badge="Paling Laris"/>
            <PricePack title="Agency Scale" price="249.000" totalPoints="20.000" bonus="Bonus +5.000 pts" goldTheme />
          </div>
        </div>
      </section>

      {/* --- 6. FAQ (New Section) --- */}
      <section id="faq" className="py-24 bg-slate-50 relative border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase italic">TANYA <span className="text-blue-600 not-italic">JITU</span></h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Hapus Keraguan, Ambil Keputusan.</p>
          </div>
          <div className="space-y-4">
            <FaqItem q="Apakah poin saya bisa hangus?" a="TIDAK. Poin Jitu Digital adalah aset selamanya. Tidak ada masa aktif (expired). Bapak bisa beli sekarang dan dipakai setahun lagi." />
            <FaqItem q="Apakah ini cocok untuk pemula?" a="Sangat cocok. Kami merancang UI/UX yang intuitif. Cukup masukkan nama produk, AI yang akan bekerja keras memikirkan strategi, copywriting, hingga riset pasarnya." />
            <FaqItem q="Bisa dipakai untuk produk fisik & jasa?" a="Bisa. Algoritma kami dilatih dengan jutaan data case study produk fisik, digital, maupun jasa. Hasil output akan menyesuaikan kategori bisnis Bapak." />
            <FaqItem q="Bagaimana jika saldo habis?" a="Bapak bisa Top Up kapan saja melalui dashboard member. Pembayaran mendukung QRIS (Gopay/OVO/Dana), Virtual Account, dan Transfer Bank." />
          </div>
        </div>
      </section>

      {/* --- 7. FOOTER (Lengkap & Professional) --- */}
      <footer className="bg-[#0F172A] text-white pt-20 pb-10 relative overflow-hidden border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            
            {/* Brand Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl"><Zap className="w-5 h-5 text-white fill-white" /></div>
                <span className="text-xl font-black italic uppercase tracking-tighter">JITU <span className="text-blue-500">DIGITAL</span></span>
              </div>
              <p className="text-slate-400 text-xs font-medium leading-relaxed uppercase tracking-wide opacity-70">
                AI Marketing Intelligence Platform No.1 di Indonesia. Membantu UMKM & Agency scaling tanpa boncos.
              </p>
              <div className="flex gap-3">
                 <SocialBtn icon={<Instagram size={16}/>} />
                 <SocialBtn icon={<MessageSquare size={16}/>} />
                 <SocialBtn icon={<Mail size={16}/>} />
              </div>
            </div>

            {/* Links Column 1 */}
            <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Tools Utama</h4>
                <ul className="space-y-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <li><Link href="/login" className="hover:text-blue-500 transition-colors">Market Validation</Link></li>
                    <li><Link href="/login" className="hover:text-blue-500 transition-colors">Ad Audit Vision</Link></li>
                    <li><Link href="/login" className="hover:text-blue-500 transition-colors">Copywriting AI</Link></li>
                    <li><Link href="/login" className="hover:text-blue-500 transition-colors">Landing Page Builder</Link></li>
                </ul>
            </div>

            {/* Links Column 2 */}
            <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Perusahaan</h4>
                <ul className="space-y-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <li><Link href="#" className="hover:text-blue-500 transition-colors">Tentang Kami</Link></li>
                    <li><Link href="#" className="hover:text-blue-500 transition-colors">Karir</Link></li>
                    <li><Link href="#" className="hover:text-blue-500 transition-colors">Hubungi Support</Link></li>
                    <li><Link href="#" className="hover:text-blue-500 transition-colors">Status Server</Link></li>
                </ul>
            </div>

            {/* Legal Column */}
            <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Legal</h4>
                <ul className="space-y-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <li><Link href="#" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
                    <li><Link href="#" className="hover:text-blue-500 transition-colors">Terms of Service</Link></li>
                    <li><Link href="#" className="hover:text-blue-500 transition-colors">Refund Policy</Link></li>
                </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">&copy; 2026 PT Jitu Digital Indonesia. All Rights Reserved.</p>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Globe size={12} className="text-slate-500"/>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Indonesia (ID)</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Systems Normal</span>
                </div>
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
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group flex flex-col items-start justify-between relative overflow-hidden h-full">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${bg} ${color}`}>
                {icon}
            </div>
            <div className="relative z-10">
                <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">{title}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider leading-relaxed">{desc}</p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-500 -z-0" />
        </div>
    )
}

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`border rounded-2xl transition-all duration-300 overflow-hidden ${open ? 'bg-white border-blue-500 shadow-lg' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
            <button onClick={() => setOpen(!open)} className="w-full px-6 py-5 flex items-center justify-between text-left gap-4">
                <span className={`text-[11px] md:text-xs font-black uppercase tracking-widest ${open ? 'text-blue-600' : 'text-slate-800'}`}>{q}</span>
                {open ? <Minus size={16} className="text-blue-600 shrink-0"/> : <Plus size={16} className="text-slate-400 shrink-0"/>}
            </button>
            <div className={`transition-all duration-300 ease-in-out ${open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6 text-[11px] font-medium text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                    {a}
                </div>
            </div>
        </div>
    )
}

function SocialBtn({ icon }) {
    return <button className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all active:scale-95 hover:border-transparent">{icon}</button>
}

function PricePack({ title, price, totalPoints, highlight, bonus, goldTheme, badge }) {
  return (
    <div className={`p-8 rounded-[2.5rem] border transition-all text-left relative overflow-hidden h-fit flex flex-col group
      ${highlight ? 'bg-[#0F172A] border-slate-900 shadow-2xl md:scale-110 z-10 text-white' : 
        goldTheme ? 'bg-white border-amber-200 shadow-xl shadow-amber-500/10' : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-lg'}`}>
      
      {badge && <div className="absolute top-0 inset-x-0 bg-blue-600 text-white py-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-center">Most Popular</div>}
      
      <div className={`space-y-5 ${badge ? 'mt-4' : ''}`}>
        <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${highlight ? 'text-blue-400' : goldTheme ? 'text-amber-600' : 'text-slate-400'}`}>{title}</h3>
        
        <div className="flex items-baseline gap-1">
            <span className={`text-sm font-bold ${highlight ? 'text-slate-500' : 'text-slate-400'}`}>Rp</span>
            <span className={`text-4xl md:text-5xl font-black tracking-tighter italic ${highlight ? 'text-white' : 'text-slate-900'}`}>{price}</span>
        </div>

        <div className={`py-4 px-6 rounded-2xl font-black text-2xl uppercase tracking-tighter flex items-center justify-between border
          ${highlight ? 'bg-blue-600 border-blue-500 text-white' : goldTheme ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
          <span>{totalPoints}</span><span className="text-[9px] font-bold opacity-60 tracking-widest">POIN</span>
        </div>

        {bonus && <div className="flex items-center gap-2 mb-2"><Gift size={14} className={highlight ? "text-emerald-400" : "text-emerald-600"} /><span className={`text-[10px] font-black uppercase tracking-widest ${highlight ? 'text-emerald-400' : 'text-emerald-600'}`}>{bonus}</span></div>}
        
        <div className={`space-y-3 pt-6 border-t ${highlight ? 'border-slate-800' : 'border-slate-50'}`}>
            <div className="flex items-center gap-3"><CheckCircle2 size={14} className={highlight ? "text-blue-500" : "text-slate-400"} /><span className={`text-[10px] font-bold uppercase tracking-wider ${highlight ? 'text-slate-300' : 'text-slate-500'}`}>Akses Seluruh Tools</span></div>
            <div className="flex items-center gap-3"><CheckCircle2 size={14} className={highlight ? "text-blue-500" : "text-slate-400"} /><span className={`text-[10px] font-bold uppercase tracking-wider ${highlight ? 'text-slate-300' : 'text-slate-500'}`}>Masa Aktif Selamanya</span></div>
            {goldTheme && <div className="flex items-center gap-3"><Crown size={14} className="text-amber-500" /><span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Prioritas Server VIP</span></div>}
        </div>

        <Link href="/register" className={`mt-8 block w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] transition-all text-center active:scale-95 border hover:shadow-lg
          ${highlight ? 'bg-white text-slate-900 border-white hover:bg-blue-50' : goldTheme ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600' : 'bg-slate-900 text-white border-slate-900 hover:bg-blue-600 hover:border-blue-600'}`}>
          BELI SEKARANG
        </Link>
      </div>
    </div>
  );
}