"use client";
import { useState, useEffect } from 'react';
import { 
  Zap, Search, Target, PenTool, ShieldCheck, 
  ImageIcon, Calculator, 
  ArrowRight, Flame, 
  Layers, Mail, Instagram, MessageSquare, 
  Plus, Minus, Globe, Cpu, AlertCircle, Smartphone, Layout, BarChart3
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
    "description": "Platform AI Marketing Intelligence no.1 di Indonesia untuk riset produk dan iklan.",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "IDR" }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white tracking-tight overflow-x-hidden relative">
      <JsonLd data={jsonLdData} />

      {/* --- TEXTURE NOISE --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      
      {/* GRADIENT BLURS */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* --- 1. NAVBAR --- */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200 py-3' : 'bg-transparent py-4 md:py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-lg md:text-xl font-black uppercase tracking-tighter italic text-slate-900">
              JITU <span className="text-blue-600 not-italic">DIGITAL</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.15em]">
            <Link href="#fitur" className="text-slate-500 hover:text-blue-600 transition-colors">Fitur Unggulan</Link>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <Link href="/login" className="text-slate-900 hover:text-blue-600 transition-colors">Masuk</Link>
            <Link href="/register" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-slate-900 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2">
              Daftar Gratis <ArrowRight size={14}/>
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-3">
            <Link href="/login" className="text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:text-blue-600 px-2">Masuk</Link>
            <Link href="/register" className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg shadow-md active:scale-95">Daftar</Link>
          </div>
        </div>
      </nav>

      {/* --- 2. HERO SECTION --- */}
      <section className="pt-36 md:pt-52 pb-20 px-6 text-center max-w-6xl mx-auto relative z-10">
        
        {/* Badge Boncos - Red Alert */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 shadow-sm mb-8 hover:border-red-200 transition-colors cursor-default animate-pulse">
          <AlertCircle size={14} className="text-red-600" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">MASIH MAU BONCOS TERUS?</span>
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-slate-900 leading-[0.9] mb-8 uppercase italic tracking-tighter">
          IKLAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 pr-4">JITU</span><br/>
          PASTI PROFIT.
        </h1>
        
        <p className="text-sm md:text-lg text-slate-500 mb-12 max-w-2xl mx-auto font-medium leading-relaxed px-4 text-pretty">
          Platform intelijen digital terlengkap. Mulai dari riset produk, bikin landing page, hingga <span className="text-blue-600 font-bold">buat konten sosmed otomatis</span> dalam satu dashboard.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
          <Link href="/register" className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group">
            <Zap size={18} className="text-yellow-400 fill-yellow-400 group-hover:scale-125 transition-transform"/> 
            MULAI RISET GRATIS
          </Link>
        </div>
      </section>

      {/* --- 3. TECH STACK & CAPABILITIES --- */}
      <div className="py-8 bg-white border-y border-slate-100 overflow-hidden relative z-20">
        <div className="max-w-7xl mx-auto px-6 text-center mb-6">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center justify-center gap-2">
                <Cpu size={12} className="text-blue-500"/> Teknologi AI Terbaru v2.0
            </p>
        </div>
        <div className="flex gap-12 animate-marquee whitespace-nowrap opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Riset Otomatis', 'Anti Boncos', 'Produk Viral', 'Copywriting Sakti', 'Landing Page Kilat', 'Jaminan Trafik', 'Analisa Kompetitor', 'Video Hook'].map((item, i) => (
                <span key={i} className="text-lg font-black text-slate-300 uppercase italic tracking-tighter flex items-center gap-2">
                   <Zap size={12} className="text-blue-400 fill-blue-400" /> {item}
                </span>
            ))}
             {/* Duplicate for smooth loop */}
             {['Riset Otomatis', 'Anti Boncos', 'Produk Viral', 'Copywriting Sakti', 'Landing Page Kilat', 'Jaminan Trafik', 'Analisa Kompetitor', 'Video Hook'].map((item, i) => (
                <span key={`dup-${i}`} className="text-lg font-black text-slate-300 uppercase italic tracking-tighter flex items-center gap-2">
                   <Zap size={12} className="text-blue-400 fill-blue-400" /> {item}
                </span>
            ))}
        </div>
      </div>

      {/* --- 4. TOOLS JITU (UPDATED) --- */}
      <section id="fitur" className="py-24 bg-slate-50/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase italic leading-none">SENJATA <span className="text-blue-600 not-italic">LENGKAP</span></h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Semua tools yang Anda butuhkan untuk jualan laris</p>
          </div>
          
          {/* BENTO GRID LAYOUT */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[280px]">
            
            {/* 1. MARKET VALIDATION (LARGE) */}
            <div className="md:col-span-2 row-span-1 bg-[#0F172A] rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl text-white flex flex-col justify-between border border-slate-800 hover:border-blue-900 transition-colors">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-125 transition-transform duration-700 pointer-events-none"><Target size={250} /></div>
                <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40 mb-6"><Target className="text-white" size={28} /></div>
                <div className="relative z-10">
                    <h3 className="text-2xl font-black uppercase italic mb-3 tracking-tighter">Validasi Market</h3>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                        Cek potensi produk sebelum keluar modal. AI akan membedah data pasar untuk melihat apakah barang tersebut layak dijual atau tidak.
                    </p>
                </div>
            </div>
            
            {/* 2. RISET PRODUK */}
            <BentoCard icon={<Search/>} title="Riset Produk" desc="Cari Winning Product yang sedang laku keras di marketplace." color="text-blue-600" bg="bg-blue-50" />
            
            {/* 3. COPYWRITING AI */}
            <BentoCard icon={<PenTool/>} title="Penulis Iklan" desc="Generate teks iklan yang membius calon pembeli." color="text-indigo-600" bg="bg-indigo-50" />
            
            {/* 4. VIRAL POST GENERATOR (NEW & LARGE) */}
            <div className="md:col-span-2 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl text-white flex flex-col justify-between border border-purple-800">
                 <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"></div>
                 <div className="space-y-4 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm text-[10px] font-bold uppercase tracking-widest border border-white/10 text-purple-200"><Smartphone size={12} className="text-purple-300" /> New Feature</div>
                    <div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Konten Sosmed <span className="text-purple-400">Otomatis</span></h3>
                        <p className="text-purple-200 text-sm font-medium leading-relaxed max-w-md">
                            Gak jago desain? Tenang. Masukkan topik, AI akan buatkan <span className="text-white font-bold">Gambar Carousel (Slide)</span>, Caption, dan Hashtag siap posting.
                        </p>
                    </div>
                 </div>
                 <div className="mt-6 flex gap-2">
                    <div className="w-16 h-16 bg-white/10 rounded-lg border border-white/10 backdrop-blur flex items-center justify-center"><ImageIcon size={24} className="text-purple-300"/></div>
                    <div className="w-16 h-16 bg-white/10 rounded-lg border border-white/10 backdrop-blur flex items-center justify-center opacity-50"><ImageIcon size={24} className="text-purple-300"/></div>
                    <div className="w-16 h-16 bg-white/10 rounded-lg border border-white/10 backdrop-blur flex items-center justify-center opacity-30"><ImageIcon size={24} className="text-purple-300"/></div>
                 </div>
            </div>

            {/* 5. LANDING PAGE BUILDER (LARGE) */}
            <div className="md:col-span-2 bg-white rounded-[2.5rem] p-10 relative overflow-hidden group shadow-xl border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between">
                 <div className="space-y-3 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-[10px] font-bold uppercase tracking-widest text-emerald-600"><Layout size={12} /> Tanpa Koding</div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Landing Page Kilat</h3>
                    <p className="text-slate-500 text-sm font-medium max-w-xs">Sekali klik, website jualan siap iklan langsung jadi. Template konversi tinggi.</p>
                 </div>
                 <div className="h-28 w-28 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform duration-500"><Layers size={48} className="text-blue-600"/></div>
            </div>
            
            {/* 6. AUDIT FUNNEL */}
            <BentoCard icon={<ShieldCheck/>} title="Audit Iklan" desc="Cek kesehatan iklan agar tidak boncos." color="text-emerald-600" bg="bg-emerald-50" />
            
            {/* 7. AD CALCULATOR */}
            <BentoCard icon={<Calculator/>} title="Hitung Cuan" desc="Kalkulator ROAS & BEP otomatis." color="text-rose-600" bg="bg-rose-50" />
            
            {/* 8. COMPETITOR SPY */}
            <BentoCard icon={<BarChart3/>} title="Intip Pesaing" desc="Lihat strategi marketing kompetitor." color="text-amber-600" bg="bg-amber-50" />

          </div>
        </div>
      </section>

      {/* --- 5. FAQ --- */}
      <section id="faq" className="py-24 bg-white relative border-t border-slate-100">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase italic">TANYA <span className="text-blue-600 not-italic">JAWAB</span></h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Yang sering ditanyakan pemula</p>
          </div>
          <div className="space-y-4">
            <FaqItem q="Saya gaptek, apakah bisa pakai ini?" a="Bisa banget! Kami merancang Jitu Digital khusus agar mudah dipakai siapa saja. Cukup ketik nama produk, dan AI akan mengerjakan sisanya untuk Anda." />
            <FaqItem q="Apa itu fitur Konten Sosmed Otomatis?" a="Ini adalah fitur baru kami dimana Anda bisa membuat konten Instagram/Facebook (Gambar + Caption) hanya dengan memasukkan topik. AI akan membuatkan desain carousel yang menarik secara instan." />
            <FaqItem q="Apakah harus punya produk sendiri?" a="Tidak harus. Anda bisa menggunakan fitur Riset Produk untuk mencari barang dropship atau affiliate yang sedang laku keras di pasaran." />
            <FaqItem q="Apakah ini gratis?" a="Anda bisa mendaftar dan mencoba fitur riset dasar secara GRATIS. Kami ingin Anda membuktikan sendiri kecanggihan alat ini sebelum memutuskan untuk scale-up." />
          </div>
        </div>
      </section>

      {/* --- 6. CTA FINAL --- */}
      <section className="py-20 bg-slate-900 relative overflow-hidden">
         {/* Background accent */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-blue-600/10 blur-3xl pointer-events-none"></div>
         
         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic mb-6">SIAP GANTI STATUS JADI <span className="text-blue-500">JURAGAN?</span></h2>
            <p className="text-slate-400 mb-10 max-w-xl mx-auto">Jangan tunda suksesmu. Kompetitor Anda mungkin sudah pakai alat ini sekarang.</p>
            <Link href="/register" className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-600/50 hover:bg-white hover:text-blue-900 transition-all hover:scale-105">
                <Zap size={18} className="fill-current" /> Daftar Sekarang (Gratis)
            </Link>
         </div>
      </section>

      {/* --- 7. FOOTER --- */}
      <footer className="bg-[#0F172A] text-white pt-20 pb-10 relative overflow-hidden border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl"><Zap className="w-5 h-5 text-white fill-white" /></div>
                <span className="text-xl font-black italic uppercase tracking-tighter">JITU <span className="text-blue-500">DIGITAL</span></span>
              </div>
              <p className="text-slate-400 text-xs font-medium leading-relaxed uppercase tracking-wide opacity-70">Platform Riset & Strategi Iklan No.1 untuk UMKM Indonesia.</p>
              <div className="flex gap-3"><SocialBtn icon={<Instagram size={16}/>} /><SocialBtn icon={<MessageSquare size={16}/>} /><SocialBtn icon={<Mail size={16}/>} /></div>
            </div>
            <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Menu</h4>
                <ul className="space-y-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <li><Link href="/register" className="hover:text-blue-500 transition-colors">Daftar Akun</Link></li>
                    <li><Link href="/login" className="hover:text-blue-500 transition-colors">Masuk Member</Link></li>
                    <li><Link href="#fitur" className="hover:text-blue-500 transition-colors">Fitur</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Bantuan</h4>
                <ul className="space-y-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <li><Link href="#" className="hover:text-blue-500 transition-colors">Tutorial Pemula</Link></li>
                    <li><Link href="#" className="hover:text-blue-500 transition-colors">Hubungi Admin</Link></li>
                    <li><Link href="#" className="hover:text-blue-500 transition-colors">Komunitas</Link></li>
                </ul>
            </div>
            <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Legal</h4>
                <ul className="space-y-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <li><Link href="#" className="hover:text-blue-500 transition-colors">Kebijakan Privasi</Link></li>
                    <li><Link href="#" className="hover:text-blue-500 transition-colors">Syarat & Ketentuan</Link></li>
                </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">&copy; 2026 PT Jitu Digital Indonesia.</p>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><Globe size={12} className="text-slate-500"/><span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Indonesia</span></div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Server Online</span></div>
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
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all group flex flex-col items-start justify-between relative overflow-hidden h-full">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${bg} ${color}`}>{icon}</div>
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
                <div className="px-6 pb-6 text-[11px] font-medium text-slate-500 leading-relaxed border-t border-slate-100 pt-4">{a}</div>
            </div>
        </div>
    )
}

function SocialBtn({ icon }) {
    return <button className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all active:scale-95 hover:border-transparent">{icon}</button>
}