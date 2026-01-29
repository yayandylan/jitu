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
  const WA_ADMIN = "6281234567890";

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

  const formatPriceParts = (price) => {
    if (!price) return { main: "0", unique: "000" };
    const str = price.toString();
    const main = parseInt(str.slice(0, -3)).toLocaleString('id-ID');
    const unique = str.slice(-3);
    return { main, unique };
  };

  if (loading && !trx) return (
    <div className="flex flex-col h-screen items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
        <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-[0.2em]">Menyiapkan Tagihan...</span>
    </div>
  );

  const { main, unique } = formatPriceParts(trx?.totalPrice);

  return (
    <div className="max-w-xl mx-auto py-10 px-4 md:px-0 text-slate-900 font-sans antialiased">
      <button onClick={() => router.push('/topup')} className="group flex items-center text-slate-400 mb-8 hover:text-slate-900 transition-all text-[10px] font-bold uppercase tracking-widest">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 overflow-hidden shadow-blue-900/5">
        
        {/* SECTION: NOMINAL TRANSFER */}
        <div className={`p-10 text-center text-white relative overflow-hidden ${trx?.status === 'success' ? 'bg-emerald-600' : 'bg-slate-900'}`}>
          <Banknote size={150} className="absolute top-0 right-0 p-8 opacity-5 rotate-12" />
          <div className="relative z-10 space-y-4">
            <p className="text-white/50 text-[10px] font-semibold uppercase tracking-[0.3em]">Total Nominal Transfer</p>
            <div className="flex flex-col items-center">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter flex items-baseline justify-center">
                    <span className="text-lg font-normal opacity-40 mr-1.5">Rp</span>
                    <span>{main}</span>
                    <span className="text-amber-400 bg-amber-400/10 px-1.5 rounded-xl ml-1">{unique}</span>
                </h1>
                <div className="mt-6 inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm">
                    <Sparkles size={12} className="text-amber-400" fill="currentColor"/>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200">
                        Penting: Transfer tepat hingga angka <span className="underline decoration-amber-400/40">{unique}</span>
                    </p>
                </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          
          {/* SECTION: BANK INFO CARD */}
          <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 flex flex-col items-center gap-6 relative group">
              {/* Logo BCA Styled */}
              <div className="flex flex-col items-center gap-1">
                <div className="bg-blue-700 text-white px-3 py-1 rounded-lg font-black text-xs tracking-tighter italic">BCA</div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Bank Central Asia</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                    <span className="text-2xl md:text-3xl font-semibold text-slate-800 tabular-nums tracking-wider">{BANK_INFO.number}</span>
                    <button 
                        onClick={() => { navigator.clipboard.writeText(BANK_INFO.number); setCopied(true); setTimeout(()=>setCopied(false), 2000); }} 
                        className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition-all active:scale-90"
                    >
                        {copied ? <CheckCircle size={18} className="text-emerald-500"/> : <Copy size={18} />}
                    </button>
                </div>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">A/N: <span className="text-slate-900 font-bold">{BANK_INFO.name}</span></p>
              </div>

              {/* Info Bank Lain */}
              <div className="pt-4 border-t border-slate-200 w-full flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Kode Bank BCA (Lain Bank)</span>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                    <Landmark size={12} className="text-blue-600" />
                    <span className="text-xs font-black text-slate-700">{BANK_INFO.code}</span>
                </div>
              </div>
          </div>

          {/* SECTION: TUTORIAL TRANSFER */}
          <div className="border border-slate-100 rounded-[1.5rem] overflow-hidden">
            <button 
                onClick={() => setShowTutorial(!showTutorial)}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-all group"
            >
                <div className="flex items-center gap-3">
                    <BookOpen size={16} className="text-blue-600" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600">Cara Transfer & Tutorial</span>
                </div>
                {showTutorial ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            
            {showTutorial && (
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-6 animate-in fade-in slide-in-from-top-2">
                    {/* M-Banking */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 tracking-widest">
                            <Smartphone size={14} /> M-Banking / Internet Banking
                        </div>
                        <ol className="text-[11px] text-slate-600 space-y-2 list-decimal ml-4 font-medium">
                            <li>Buka aplikasi Bank Bapak (BCA/Lainnya).</li>
                            <li>Pilih menu <span className="font-bold">Transfer</span>.</li>
                            <li>Pilih <span className="font-bold">Antar Bank</span> jika Bapak bukan pengguna BCA.</li>
                            <li>Masukkan kode <span className="font-bold">014</span> dan nomor rekening di atas.</li>
                            <li>Masukkan nominal persis <span className="font-bold text-blue-600 italic">Rp {trx?.totalPrice.toLocaleString('id-ID')}</span>.</li>
                            <li>Simpan bukti transfer Bapak.</li>
                        </ol>
                    </div>
                    {/* ATM */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-600 tracking-widest">
                            <Landmark size={14} /> ATM & Mesin Transfer
                        </div>
                        <ol className="text-[11px] text-slate-600 space-y-2 list-decimal ml-4 font-medium">
                            <li>Masukkan kartu ATM dan PIN.</li>
                            <li>Pilih menu <span className="font-bold">Transaksi Lainnya</span> &gt; <span className="font-bold">Transfer</span>.</li>
                            <li>Pilih <span className="font-bold">Ke Rek Bank Lain</span>.</li>
                            <li>Masukkan kode bank <span className="font-bold">014</span> diikuti nomor rekening.</li>
                            <li>Masukkan jumlah transfer yang <span className="font-bold underline decoration-blue-200">tepat</span>.</li>
                        </ol>
                    </div>
                </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-3 pt-2">
              <button onClick={() => window.open(`https://wa.me/${WA_ADMIN}?text=Halo Admin Jitu, saya sudah transfer tepat Rp ${trx?.totalPrice.toLocaleString('id-ID')} untuk Order ID: ${trx?._id.slice(-6).toUpperCase()}. Mohon diproses.`, '_blank')} 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4.5 rounded-2xl flex items-center justify-center gap-3 shadow-xl text-[11px] uppercase tracking-widest h-14 transition-all active:scale-95">
                  <MessageCircle size={18} /> Konfirmasi Via WhatsApp
              </button>
              <button onClick={fetchTransaction} className="w-full bg-white border border-slate-100 text-slate-400 font-semibold py-4.5 rounded-2xl hover:bg-slate-50 hover:text-slate-600 transition-all flex items-center justify-center gap-3 text-[11px] uppercase tracking-widest h-14">
                  <RefreshCw size={16} /> Perbarui Status Tagihan
              </button>
          </div>

          {/* FOOTER INFO */}
          <div className="flex gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
             <div className="shrink-0 text-blue-600 mt-0.5"><Info size={16}/></div>
             <p className="text-[11px] text-blue-800/70 font-medium leading-relaxed uppercase tracking-tight">
                Saldo Poin Jitu akan masuk otomatis dalam <span className="font-bold text-blue-900">1-5 menit</span> setelah transfer Bapak terverifikasi oleh sistem kami.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}