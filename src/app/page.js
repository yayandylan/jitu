"use client";
import { useState } from 'react';
import { 
  Zap, Search, Target, PenTool, ShieldCheck, 
  ImageIcon, BarChart3, Calculator, 
  CheckCircle2, ArrowRight, Menu, X, Flame, 
  Unlock, Layers, Gift, Star, TrendingUp, Crown,
  ChevronDown, Mail, Instagram, MessageSquare
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-poppins selection:bg-blue-600 selection:text-white tracking-tighter overflow-x-hidden">
      
      {/* --- 1. NAVBAR --- */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600 p-1.5 rounded-xl shadow-lg shadow-blue-500/20">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-black uppercase tracking-tighter italic">JITU <span className="text-blue-600 not-italic">DIGITAL</span></span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Link href="/login" className="text-slate-900 bg-slate-100 px-6 py-3 rounded-xl hover:bg-slate-200 transition-all">Login</Link>
            <Link href="/register" className="bg-[#0F172A] text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-all shadow-xl active:scale-95">Mulai Sekarang</Link>
          </div>

          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 p-6 space-y-4 animate-in slide-in-from-top-5 text-center">
            <Link href="/login" className="block text-sm font-bold uppercase text-blue-600 py-2">Login</Link>
            <Link href="/register" className="block w-full text-center bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-lg">Daftar Akun</Link>
          </div>
        )}
      </nav>

      {/* --- 2. HERO SECTION --- */}
      <section className="pt-32 md:pt-48 pb-20 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[9px] font-black uppercase tracking-widest text-blue-600 mb-8 animate-bounce">
          <Star size={10} className="fill-blue-600" /> Capek Iklan Boncos Terus?
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 leading-[0.95] mb-8 uppercase italic">IKLAN PROFIT<br/><span className="text-blue-600 not-italic">ADALAH JITU.</span></h1>
        <p className="text-sm md:text-lg text-slate-500 mb-10 max-w-2xl mx-auto font-medium leading-relaxed px-4 text-pretty">Gunakan kecerdasan AI untuk memvalidasi market, riset produk, hingga audit funnel secara otomatis. Berhenti menebak, mulai mendominasi.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
          <Link href="/register" className="w-full sm:w-auto px-10 py-5 bg-[#0F172A] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-3">AMBIL POIN GRATIS <ArrowRight size={16}/></Link>
        </div>
      </section>

      {/* --- 3. THE ARSENAL --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic">SENJATA <span className="text-blue-600 not-italic">PERANG</span></h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">AI-Powered Tools for Digital Marketer</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <WeaponCard icon={<Search />} color="bg-blue-50 text-blue-600" title="Riset Produk" desc="Cari ide winning product tanpa perlu tebak-tebakan." />
            <WeaponCard icon={<Target />} color="bg-indigo-50 text-indigo-600" title="Validasi Market" desc="Pastikan market haus sebelum lo bakar budget iklan." />
            <WeaponCard icon={<PenTool />} color="bg-rose-50 text-rose-600" title="Magic Ad Script" desc="Copywriting menghipnotis yang bikin orang klik." />
            <WeaponCard icon={<ShieldCheck />} color="bg-emerald-50 text-emerald-600" title="Audit Funnel" desc="Temukan kebocoran landing page lo secara otomatis." />
            <WeaponCard icon={<ImageIcon />} color="bg-amber-50 text-amber-600" title="Generate Gambar" desc="Bikin visual iklan premium dengan bantuan AI." />
            <WeaponCard icon={<BarChart3 />} color="bg-violet-50 text-violet-600" title="Analisis Iklan" desc="Bedah data ads lo biar tau langkah selanjutnya." />
            <WeaponCard icon={<Calculator />} color="bg-cyan-50 text-cyan-600" title="Kalkulator Ads" desc="Hitung ROAS dan BEP dengan akurasi 100%." />
            <WeaponCard icon={<Layers />} color="bg-slate-900 text-white" title="LP Builder" desc="Bikin halaman jualan High-Converting dalam detik." />
          </div>
        </div>
      </section>

      {/* --- 4. PRICING (Royal Edition Update) --- */}
      <section id="pricing" className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Luxury Gold Ambient Light */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-500/10 blur-[150px] rounded-full -mr-48 -mb-48" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="mb-16 space-y-3">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full shadow-inner">
                <Crown size={14} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">VIP Ammunition System</span>
             </div>
             <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic leading-none">PILIH <span className="text-blue-600 not-italic">AMUNISI</span></h2>
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] italic">Investasi Tepat, Hasil Jitu.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            <PricePack title="Starter Pack" price="24.900" totalPoints="1.100" bonus="Bonus +100 pts" />
            <PricePack title="Pro Advertiser" price="99.000" totalPoints="6.000" popular bonus="Bonus +1.000 pts" />
            <PricePack title="Agency Scale" price="249.000" totalPoints="20.000" bonus="Bonus +5.000 pts" goldTheme />
          </div>
        </div>
      </section>

      {/* --- 5. FAQ --- */}
      <section className="py-24 bg-white relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic">TANYA <span className="text-blue-600 not-italic">JITU</span></h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Hapus Keraguan, Ambil Keputusan.</p>
          </div>
          <div className="space-y-4">
            <FaqItem q="Apa Poin Jitu bisa hangus atau ada masa expired?" a="TIDAK. Di Jitu Digital, peluru yang Bapak beli adalah milik Bapak selamanya. Tidak ada sistem bulanan, tidak ada poin hangus. Gunakan kapan saja Bapak butuh." />
            <FaqItem q="Bisa dipakai untuk Iklan Facebook, TikTok, atau Google?" a="SANGAT BISA. AI Jitu dirancang untuk memahami algoritma platform besar tersebut. Mulai dari riset audiens hingga script iklan, semuanya disesuaikan dengan platform tujuan." />
            <FaqItem q="Saya gaptek, apakah tools ini susah dioperasikan?" a="Kalau Bapak bisa ngetik di WhatsApp, Bapak pasti bisa pakai Jitu. User Interface kami buat se-simpel mungkin: Input Nama Produk -> Klik Tombol -> AI Selesaikan Pekerjaannya." />
            <FaqItem q="Gimana cara dapet 500 Poin Gratisnya?" a="Cukup klik tombol 'Daftar' di atas. Setelah verifikasi akun, 500 Poin Jitu akan langsung mendarat di dashboard Bapak tanpa syarat kartu kredit apapun." />
          </div>
        </div>
      </section>

      {/* --- 6. FOOTER --- */}
      <footer className="bg-[#0F172A] text-white pt-24 pb-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
            <div className="lg:col-span-5 space-y-8 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <div className="bg-blue-600 p-2 rounded-xl">
                    <Zap className="w-6 h-6 text-white fill-white" />
                </div>
                <span className="text-3xl font-black italic uppercase tracking-tighter">JITU <span className="text-blue-500">DIGITAL</span></span>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mx-auto md:mx-0 uppercase tracking-tight opacity-80 italic">
                Pusat persenjataan AI paling mematikan untuk digital marketer Indonesia. Kami tidak menjual janji, kami memberikan data.
              </p>
              <div className="flex justify-center md:justify-start gap-4">
                 <SocialBtn icon={<Instagram size={18}/>} />
                 <SocialBtn icon={<MessageSquare size={18}/>} />
                 <SocialBtn icon={<Mail size={18}/>} />
              </div>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
                <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">The Arsenal</h4>
                    <ul className="space-y-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                        <li>AI Research</li>
                        <li>Magic Copy</li>
                        <li>Ad Audit</li>
                    </ul>
                </div>
                <div className="space-y-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Company</h4>
                    <ul className="space-y-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">
                        <li><Link href="/login">Login Admin</Link></li>
                        <li><Link href="/register">Daftar Member</Link></li>
                    </ul>
                </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">&copy; 2026 Jitu Digital. Seluruh Hak Cipta Dilindungi.</p>
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic tracking-tighter">All Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className={`group border rounded-[2rem] transition-all duration-300 ${open ? 'bg-[#0F172A] border-blue-600 shadow-xl' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'}`}>
            <button onClick={() => setOpen(!open)} className="w-full px-8 py-6 flex items-center justify-between text-left">
                <span className={`text-[11px] md:text-xs font-black uppercase tracking-tight italic ${open ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'}`}>{q}</span>
                <ChevronDown size={18} className={`transition-transform duration-500 ${open ? 'rotate-180 text-blue-500' : 'text-slate-300'}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-500 ${open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-8 pb-6 text-[10px] font-medium text-slate-400 leading-relaxed italic border-t border-white/5 pt-4 uppercase tracking-tight">{a}</div>
            </div>
        </div>
    )
}

function SocialBtn({ icon }) {
    return (
        <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white transition-all active:scale-95">{icon}</button>
    )
}

function WeaponCard({ icon, title, desc, color }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-50 hover:border-blue-600 transition-all group flex flex-col items-center text-center shadow-sm">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg ${color}`}>{icon}</div>
      <h3 className="text-[12px] font-black text-slate-900 mb-1 uppercase tracking-tight leading-none">{title}</h3>
      <p className="text-slate-400 text-[9px] font-medium leading-relaxed uppercase opacity-70 group-hover:opacity-100 px-2">{desc}</p>
    </div>
  );
}

function PricePack({ title, price, totalPoints, popular, bonus, goldTheme }) {
  return (
    <div className={`p-8 md:p-10 rounded-[3rem] border transition-all text-left relative overflow-hidden h-fit 
      ${popular ? 'bg-[#0F172A] border-blue-600 shadow-2xl md:scale-105 z-10 text-white' : 
        goldTheme ? 'bg-gradient-to-b from-[#020617] to-[#0F172A] border-amber-500 shadow-[0_0_50px_-12px_rgba(245,158,11,0.3)] text-white scale-100 border-2' : 
        'bg-white border-slate-100 shadow-sm'}`}>
      
      {/* Logos Jitu Watermark */}
      <div className={`absolute -top-4 -right-4 opacity-[0.04] rotate-12 pointer-events-none ${popular || goldTheme ? 'text-amber-400' : 'text-slate-900'}`}>
        <Zap size={150} fill="currentColor" />
      </div>

      {popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-1.5 rounded-b-2xl text-[8px] font-black uppercase tracking-[0.2em] shadow-lg">Best Value</div>}
      {goldTheme && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-600 text-[#0F172A] px-6 py-1.5 rounded-b-2xl text-[8px] font-black uppercase tracking-[0.3em] shadow-[0_4px_20px_rgba(245,158,11,0.4)] flex items-center gap-2">
            <Crown size={10} fill="currentColor" /> Agency Elite
        </div>
      )}
      
      <div className="relative z-10">
        <h3 className={`text-[9px] font-black uppercase tracking-[0.4em] mb-4 ${popular ? 'text-blue-400' : goldTheme ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`}>{title}</h3>
        <div className="mb-8 flex items-baseline gap-1">
            <span className={`text-[10px] font-bold uppercase italic ${goldTheme ? 'text-amber-500' : 'opacity-40'}`}>Rp</span>
            <span className={`text-3xl md:text-4xl font-black tracking-tighter uppercase italic ${popular || goldTheme ? 'text-white' : 'text-slate-900'}`}>{price}</span>
        </div>
        <div className={`py-5 rounded-[1.5rem] font-black text-3xl md:text-4xl mb-4 uppercase tracking-tighter text-center italic shadow-inner border
          ${popular ? 'bg-blue-600 text-white border-blue-400' : 
            goldTheme ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-[#0F172A] border-amber-300' : 
            'bg-slate-50 text-blue-600 border-slate-100'}`}>
          {totalPoints} <span className="text-[9px] not-italic opacity-40">pts</span>
        </div>
        {bonus && (
          <div className="flex items-center justify-center gap-2 mb-8">
              <Gift size={12} className={popular ? "text-blue-400" : "text-amber-500"} />
              <span className={`text-[9px] font-black uppercase tracking-widest italic ${popular ? 'text-blue-400' : 'text-amber-500'}`}>{bonus}</span>
          </div>
        )}
        <div className={`space-y-3 mb-10 border-t pt-8 mt-auto ${goldTheme ? 'border-amber-500/20' : 'border-slate-50'}`}>
            <Benefit item="All AI Arsenal Unlocked" light={popular || goldTheme} gold={goldTheme} />
            <Benefit item="Permanent Points Wallet" light={popular || goldTheme} gold={goldTheme} />
            <Benefit item="Priority Server Queue" light={popular || goldTheme} gold={goldTheme} />
        </div>
        <Link href="/register" className={`block w-full py-4 rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] transition-all text-center active:scale-95 border
          ${popular ? 'bg-white text-slate-900 border-transparent hover:bg-blue-500 hover:text-white shadow-xl' : 
            goldTheme ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-[#0F172A] border-amber-300 hover:scale-[1.02] shadow-[0_10px_30px_rgba(245,158,11,0.2)]' : 
            'bg-[#0F172A] text-white border-transparent hover:bg-blue-600'}`}>
          AUTHORIZE AMMO
        </Link>
      </div>
    </div>
  );
}

function Benefit({ item, light, gold }) {
    return (
        <div className="flex items-center gap-2.5">
            <CheckCircle2 size={12} className={gold ? "text-amber-500" : light ? "text-blue-400" : "text-blue-600"} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${gold ? 'text-amber-500/80' : light ? 'text-white/60' : 'text-slate-500'}`}>{item}</span>
        </div>
    )
}