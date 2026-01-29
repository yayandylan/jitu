"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Copy, CheckCircle, MessageCircle, Loader2, 
  ArrowLeft, RefreshCw, AlertTriangle, 
  Sparkles, ShieldCheck, Banknote, Info, Hash,
  ChevronDown, ChevronUp, BookOpen, Smartphone, Landmark
} from 'lucide-react';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [trx, setTrx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const BANK_INFO = { 
    bank: "BCA", 
    code: "014", // Kode bank BCA
    number: "0561361061", 
    name: "Ahmad Sofyan" 
  };
  const WA_ADMIN = "6281234567890"; // Ganti dengan nomor WA Admin

  const fetchTransaction = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/transaction/${params.id}`);
      const data = await res.json();
      if(data.transaction) setTrx(data.transaction);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, [params.id]);

  useEffect(() => { fetchTransaction(); }, [fetchTransaction]);

  // LOGIC FORMAT HARGA (Safe Mode)
  const formatPriceParts = (price) => {
    if (!price) return { main: "0", unique: "000" };
    const str = price.toString();
    // Ambil 3 digit terakhir sebagai kode unik
    const unique = str.slice(-3);
    // Sisanya adalah nominal utama
    const mainNum = parseInt(str.slice(0, -3));
    const main = mainNum ? mainNum.toLocaleString('id-ID') : "0";
    return { main, unique };
  };

  if (loading || !trx) return (
    <div className="flex flex-col h-screen items-center justify-center gap-4 bg-slate-50 font-poppins">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Menyiapkan Tagihan...</span>
    </div>
  );

  const { main, unique } = formatPriceParts(trx?.totalPrice);

  return (
    <div className="max-w-xl mx-auto py-10 px-4 md:px-0 text-slate-900 font-poppins antialiased">
      {/* TOMBOL KEMBALI (Ke Dashboard Site) */}
      <button onClick={() => router.push('/site/dashboard')} className="group flex items-center text-slate-400 mb-8 hover:text-slate-900 transition-all text-[10px] font-black uppercase tracking-widest">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali ke Dashboard
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 overflow-hidden shadow-blue-900/5">
        
        {/* SECTION: NOMINAL TRANSFER */}
        <div className={`p-10 text-center text-white relative overflow-hidden ${trx?.status === 'success' ? 'bg-emerald-600' : 'bg-[#0F172A]'}`}>
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <Banknote size={150} className="absolute top-0 right-0 p-8 opacity-5 rotate-12" />
          
          <div className="relative z-10 space-y-4">
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                {trx?.status === 'success' ? <CheckCircle size={14}/> : <Hash size={14}/>}
                {trx?.status === 'success' ? 'Pembayaran Berhasil' : 'Total Nominal Transfer'}
            </p>
            
            <div className="flex flex-col items-center">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-baseline justify-center">
                    <span className="text-lg font-normal opacity-40 mr-1.5">Rp</span>
                    <span>{main}</span>
                    <span className="text-amber-400 bg-amber-400/10 px-1.5 rounded-xl ml-1 shadow-[0_0_15px_rgba(251,191,36,0.3)]">{unique}</span>
                </h1>
                
                {trx?.status !== 'success' && (
                    <div className="mt-6 inline-flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl backdrop-blur-sm">
                        <Sparkles size={12} className="text-amber-400 animate-pulse" fill="currentColor"/>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-100">
                            Transfer tepat hingga angka <span className="text-amber-400 underline decoration-amber-400/40 font-black">{unique}</span>
                        </p>
                    </div>
                )}
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          
          {/* SECTION: BANK INFO CARD */}
          <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 flex flex-col items-center gap-6 relative group hover:border-blue-200 transition-colors">
              {/* Logo BCA Styled */}
              <div className="flex flex-col items-center gap-1">
                <div className="bg-[#00529C] text-white px-4 py-1.5 rounded-lg font-black text-sm tracking-tighter italic shadow-sm">BCA</div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bank Central Asia</span>
              </div>

              <div className="flex flex-col items-center gap-2 w-full">
                <div className="flex items-center justify-center gap-3 w-full">
                    <span className="text-2xl md:text-3xl font-black text-slate-800 tabular-nums tracking-wider text-center break-all">{BANK_INFO.number}</span>
                    <button 
                        onClick={() => { navigator.clipboard.writeText(BANK_INFO.number); setCopied(true); setTimeout(()=>setCopied(false), 2000); }} 
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all active:scale-90 shrink-0 shadow-sm"
                        title="Salin No. Rekening"
                    >
                        {copied ? <CheckCircle size={18} className="text-emerald-500"/> : <Copy size={18} />}
                    </button>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">A/N: <span className="text-slate-900 font-black">{BANK_INFO.name}</span></p>
              </div>

              {/* Info Bank Lain */}
              <div className="pt-4 border-t border-slate-200 w-full flex justify-between items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-1.5">
                    <Info size={12}/> Kode Bank (Transfer Antar Bank)
                </span>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                    <Landmark size={12} className="text-blue-600" />
                    <span className="text-xs font-black text-slate-700">{BANK_INFO.code}</span>
                </div>
              </div>
          </div>

          {/* SECTION: TUTORIAL TRANSFER */}
          <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
            <button 
                onClick={() => setShowTutorial(!showTutorial)}
                className="w-full flex items-center justify-between p-6 bg-white hover:bg-slate-50 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <BookOpen size={16} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 group-hover:text-slate-900">Panduan Transfer</span>
                </div>
                {showTutorial ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            
            {showTutorial && (
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-6 animate-in fade-in slide-in-from-top-2">
                    {/* M-Banking */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 tracking-widest">
                            <Smartphone size={14} /> M-Banking
                        </div>
                        <ol className="text-[11px] text-slate-600 space-y-2 list-decimal ml-4 font-medium leading-relaxed marker:text-blue-600 marker:font-bold">
                            <li>Buka menu <span className="font-bold">Transfer</span> di aplikasi Bank Anda.</li>
                            <li>Pilih <span className="font-bold">Antar Bank</span> jika bukan pengguna BCA.</li>
                            <li>Masukkan Kode Bank <span className="font-bold bg-white px-1 border rounded">014</span> (jika diminta).</li>
                            <li>Masukkan No. Rekening <span className="font-bold select-all">{BANK_INFO.number}</span>.</li>
                            <li>Masukkan Nominal <span className="font-bold text-blue-600 italic">Rp {trx?.totalPrice.toLocaleString('id-ID')}</span> (harus sama persis).</li>
                        </ol>
                    </div>
                    {/* ATM */}
                    <div className="space-y-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-600 tracking-widest">
                            <Landmark size={14} /> ATM / Lainnya
                        </div>
                        <p className="text-[10px] text-slate-500 italic">Langkah sama seperti transfer bank pada umumnya. Pastikan nominal transfer sesuai hingga 3 digit terakhir.</p>
                    </div>
                </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-3 pt-2">
              <button 
                  onClick={() => window.open(`https://wa.me/${WA_ADMIN}?text=Halo Admin Jitu, saya sudah transfer tepat Rp ${trx?.totalPrice.toLocaleString('id-ID')} untuk Order ID: ${trx?._id.slice(-6).toUpperCase()}. Mohon diproses.`, '_blank')} 
                  className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black py-4 rounded-[1.2rem] flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95"
              >
                  <MessageCircle size={18} fill="white" /> Konfirmasi WhatsApp
              </button>
              
              <button 
                  onClick={fetchTransaction} 
                  className="w-full bg-white border border-slate-200 text-slate-400 font-bold py-4 rounded-[1.2rem] hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] active:scale-95"
              >
                  {loading ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={16} />} 
                  Cek Status Pembayaran
              </button>
          </div>

          {/* FOOTER INFO */}
          <div className="flex gap-4 p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50 items-start">
             <div className="shrink-0 text-blue-600 mt-0.5 bg-white p-1.5 rounded-full shadow-sm"><Info size={14}/></div>
             <p className="text-[10px] text-blue-900/70 font-medium leading-relaxed">
                <strong className="text-blue-700 uppercase tracking-tight">Sistem Otomatis:</strong> Saldo Poin akan masuk dalam <span className="font-bold text-blue-900 border-b border-blue-300">1-5 menit</span> setelah transfer Anda terverifikasi oleh mutasi bank.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}