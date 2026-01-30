"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Copy, CheckCircle, MessageCircle, Loader2, 
  ArrowLeft, RefreshCw, Banknote, Info, Hash, 
  Sparkles, BookOpen, Smartphone, Landmark, ChevronDown, ChevronUp, Crown
} from 'lucide-react';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [trx, setTrx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // --- CONFIG BANK BAPAK ---
  const BANK_INFO = { 
    bank: "BCA", 
    code: "014",
    number: "0561361061", // Pastikan No Rek Benar
    name: "Ahmad Sofyan" 
  };
  
  const WA_ADMIN = "628175760760"; 

  const fetchTransaction = useCallback(async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      // Menuju API Tunggal yang kita buat tadi
      const res = await fetch(`/api/transaction/${params.id}`);
      const data = await res.json();
      if(data.transaction) setTrx(data.transaction);
    } catch (err) { 
      console.error("Gagal load transaksi"); 
    } finally { 
      setLoading(false); 
    }
  }, [params.id]);

  useEffect(() => { fetchTransaction(); }, [fetchTransaction]);

  // LOGIC KODE UNIK (Ambil 3 digit terakhir dari total rupiah)
  const formatPriceParts = (price) => {
    if (!price) return { main: "0", unique: "000" };
    const str = price.toString();
    const unique = str.slice(-3); // Misal: 123
    const mainNum = parseInt(str.slice(0, -3)); // Misal: 99
    const main = mainNum ? mainNum.toLocaleString('id-ID') : "0";
    return { main, unique };
  };

  if (loading || !trx) return (
    <div className="flex flex-col h-screen items-center justify-center gap-4 bg-slate-50 font-poppins">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Menyiapkan Tagihan...</span>
    </div>
  );

  // amount = Rupiah Total (99.123), credits = Poin (6000)
  const totalRupiah = trx.amount || 0;
  const totalPoin = trx.credits || 0;
  const { main, unique } = formatPriceParts(totalRupiah);

  return (
    <div className="max-w-xl mx-auto py-10 px-4 md:px-0 text-slate-900 font-poppins antialiased">
      
      {/* HEADER ACTION */}
      <button onClick={() => router.push('/site/dashboard')} className="group flex items-center text-slate-400 mb-8 hover:text-slate-900 transition-all text-[10px] font-black uppercase tracking-widest">
        <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Kembali
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 overflow-hidden shadow-blue-900/5">
        
        {/* HARGA & STATUS */}
        <div className={`p-10 text-center text-white relative overflow-hidden transition-colors duration-500 ${trx.status === 'success' ? 'bg-emerald-600' : 'bg-[#0F172A]'}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="relative z-10 space-y-4">
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                {trx.status === 'success' ? <CheckCircle size={14}/> : <Hash size={14}/>}
                {trx.status === 'success' ? 'Pembayaran Berhasil' : 'Nominal Transfer'}
            </p>
            
            <div className="flex flex-col items-center">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-baseline justify-center">
                    <span className="text-lg font-normal opacity-40 mr-1.5">Rp</span>
                    <span>{main}</span>
                    {/* Digit unik diberi highlight warna amber */}
                    <span className="text-amber-400 bg-amber-400/10 px-1.5 rounded-xl ml-1 shadow-[0_0_15px_rgba(251,191,36,0.3)]">{unique}</span>
                </h1>
                
                {trx.status === 'success' ? (
                   <div className="mt-6 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                      <Crown size={14} className="text-yellow-400 fill-yellow-400"/>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Top Up Lunas & Poin Masuk</span>
                   </div>
                ) : (
                    <div className="mt-6 inline-flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl backdrop-blur-sm">
                        <Sparkles size={12} className="text-amber-400 animate-pulse" fill="currentColor"/>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-100">
                            Transfer tepat hingga angka <span className="text-amber-400 underline font-black">{unique}</span>
                        </p>
                    </div>
                )}
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          
          {/* INFO REKENING */}
          <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 flex flex-col items-center gap-6 relative group transition-all">
              <div className="flex flex-col items-center gap-1">
                <div className="bg-[#00529C] text-white px-4 py-1.5 rounded-lg font-black text-sm tracking-tighter italic shadow-sm">BCA</div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bank Central Asia</span>
              </div>

              <div className="flex flex-col items-center gap-2 w-full">
                <div className="flex items-center justify-center gap-3 w-full">
                    <span className="text-2xl md:text-3xl font-black text-slate-800 tabular-nums tracking-wider text-center">{BANK_INFO.number}</span>
                    <button 
                        onClick={() => { navigator.clipboard.writeText(BANK_INFO.number); setCopied(true); setTimeout(()=>setCopied(false), 2000); }} 
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all active:scale-90 shadow-sm"
                    >
                        {copied ? <CheckCircle size={18} className="text-emerald-500"/> : <Copy size={18} />}
                    </button>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">A/N: <span className="text-slate-900 font-black">{BANK_INFO.name}</span></p>
              </div>

              <div className="pt-4 border-t border-slate-200 w-full flex justify-between items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-1.5">
                    <Info size={12}/> Kode Bank Transfer
                </span>
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                    <Landmark size={12} className="text-blue-600" />
                    <span className="text-xs font-black text-slate-700">{BANK_INFO.code}</span>
                </div>
              </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="space-y-3 pt-2">
              {trx.status === 'pending' ? (
                <>
                  <button 
                      onClick={() => window.open(`https://wa.me/${WA_ADMIN}?text=Halo Admin Jitu Digital, saya sudah transfer sebesar Rp ${totalRupiah.toLocaleString('id-ID')} untuk Order ID: ${trx._id.slice(-6).toUpperCase()}. Mohon diproses agar poin ${totalPoin} segera masuk.`, '_blank')} 
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
                </>
              ) : (
                <button 
                    onClick={() => router.push('/site/dashboard')}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-[1.2rem] flex items-center justify-center gap-3 shadow-xl text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95"
                >
                    <ArrowLeft size={16} /> Kembali ke Dashboard
                </button>
              )}
          </div>

          {/* FOOTER INFO */}
          <div className="flex gap-4 p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50 items-start">
             <div className="shrink-0 text-blue-600 mt-0.5 bg-white p-1.5 rounded-full shadow-sm"><Info size={14}/></div>
             <p className="text-[10px] text-blue-900/70 font-medium leading-relaxed">
                <strong className="text-blue-700 uppercase tracking-tight">Info:</strong> Saldo sebesar <span className="font-bold text-blue-900">{totalPoin.toLocaleString()} Poin</span> akan masuk otomatis setelah Admin memverifikasi mutasi bank Anda. Pastikan nominal transfer sesuai.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}