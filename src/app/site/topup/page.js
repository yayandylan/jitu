"use client";
import { useState, useEffect, useMemo } from 'react';
import { 
  Loader2, Zap, Ticket, CheckCircle2, 
  XCircle, Star, Flame, Crown, Gift, ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TopupPage() {
  const router = useRouter();
  
  // State Data dari Database
  const [packages, setPackages] = useState([]);
  const [pricePerPoint, setPricePerPoint] = useState(100); 
  
  // State Input & Perhitungan
  const [displayPoints, setDisplayPoints] = useState(0); 
  const [basePoints, setBasePoints] = useState(0); 
  const [bonus, setBonus] = useState(0);
  
  // State UI
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // State Voucher
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherData, setVoucherData] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // --- 1. SINKRONISASI DATA DARI ADMIN (PRICE RATE & PACKAGES) ---
  useEffect(() => {
    const syncData = async () => {
        setFetching(true);
        try {
            // A. Ambil Harga Per Poin (Global Setting)
            const sRes = await fetch('/api/admin/settings').catch(()=>({ok:false}));
            if(sRes.ok) {
                const sData = await sRes.json();
                const rate = sData.settings?.pricePerPoint || sData.pricePerPoint;
                if(rate) setPricePerPoint(rate);
            }

            // B. Ambil Daftar Paket Promo
            const pRes = await fetch('/api/packages').catch(()=>({ok:false}));
            if(pRes.ok) {
                const pData = await pRes.json();
                if(pData.success && pData.packages?.length > 0) {
                    setPackages(pData.packages);
                    
                    // Default: Pilih paket pertama yang tersedia
                    const firstPkg = pData.packages[0];
                    setBasePoints(firstPkg.basePoints);
                    setBonus(firstPkg.bonusPoints);
                    setDisplayPoints(firstPkg.basePoints + firstPkg.bonusPoints);
                }
            }
        } catch (e) { 
            console.error("Gagal sinkronisasi data:", e); 
        } finally { 
            setFetching(false); 
        }
    };
    syncData();
  }, []);

  // --- 2. LOGIKA PERHITUNGAN HARGA ---
  const currentPkg = useMemo(() => {
    return packages.find(p => (p.basePoints + p.bonusPoints) === Number(displayPoints));
  }, [displayPoints, packages]);

  const subtotal = currentPkg ? currentPkg.price : (displayPoints * pricePerPoint);
  
  const calculateDiscount = () => {
    if (!voucherData) return 0;
    if (voucherData.type === 'fixed') return voucherData.value;
    return (subtotal * voucherData.value) / 100;
  };

  const finalPrice = Math.round(subtotal - calculateDiscount());

  // --- 3. EVENT HANDLERS ---
  const handleSelectPackage = (pkg) => {
    setBasePoints(pkg.basePoints);
    setBonus(pkg.bonusPoints);
    setDisplayPoints(pkg.basePoints + pkg.bonusPoints); 
    setVoucherData(null); 
    setVoucherCode("");
  };

  const handleManualInput = (val) => {
    const totalInput = Number(val);
    setDisplayPoints(totalInput);
    
    // Cek apakah input manual ini sama dengan salah satu paket yang ada
    const pkg = packages.find(p => (p.basePoints + p.bonusPoints) === totalInput);
    if (pkg) { 
        setBasePoints(pkg.basePoints); 
        setBonus(pkg.bonusPoints); 
    } else { 
        setBasePoints(totalInput); 
        setBonus(0); 
    }
  };

  const handleApplyVoucher = async () => {
    setVoucherError(""); 
    setVoucherData(null);
    if (!voucherCode) return;
    
    setIsValidating(true);
    try {
      const res = await fetch(`/api/vouchers/validate?code=${voucherCode.trim()}`);
      const data = await res.json();
      if (data.success) setVoucherData(data.voucher);
      else setVoucherError(data.message || "Kode tidak valid");
    } catch (e) { 
      setVoucherError("Gagal verifikasi voucher"); 
    } finally { 
      setIsValidating(false); 
    }
  };

  // --- 4. LOGIKA TOMBOL LANJUT PEMBAYARAN ---
  const handleTopup = async () => {
    if (displayPoints < 500) return alert("Minimal pengisian adalah 500 poin.");
    
    setLoading(true);
    try {
      const res = await fetch('/api/transaction/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          packageName: currentPkg ? currentPkg.name : 'Custom Topup', 
          price: finalPrice, 
          points: displayPoints,
          voucherCode: voucherData?.code || null
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        // REDIRECT KE PEMBAYARAN (Sesuai folder Bapak)
        router.push(`/site/topup/payment/${data.transactionId}`);
      } else {
        alert(data.message || "Gagal memproses pesanan.");
      }
    } catch (e) { 
        console.error("Topup Error:", e);
        alert(`Terjadi kesalahan koneksi ke server.`); 
    } finally { 
        setLoading(false); 
    }
  };

  const getPackageIcon = (index) => {
    if (index === 0) return <Flame size={16} />;
    if (index === packages.length - 1) return <Crown size={16} />;
    return <Zap size={16} />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 pt-4 px-4 font-poppins antialiased text-slate-900">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-slate-800">
                Isi <span className="text-blue-600 not-italic">Amunisi</span>
            </h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] italic">Jitu Digital Premium Dashboard</p>
        </div>
        <div className="text-right hidden sm:block">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">Market Rate</span>
            <span className="text-xs font-black italic text-slate-700">Rp {pricePerPoint}/pts</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* KIRI: DAFTAR PAKET & INPUT MANUAL */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* PAKET PROMO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilihan Paket Hemat</h3>
            </div>
            
            {fetching ? (
                <div className="h-40 flex items-center justify-center bg-white rounded-3xl border border-slate-50 animate-pulse text-[10px] font-bold text-slate-300 uppercase">
                    <Loader2 className="animate-spin mr-2" size={16}/> Loading Paket...
                </div>
            ) : packages.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-100 text-slate-400 text-xs">
                    Belum ada paket tersedia. Silakan gunakan nominal custom.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {packages.map((pkg, idx) => {
                        const isSelected = (basePoints + bonus) === (pkg.basePoints + pkg.bonusPoints);
                        return (
                            <button 
                                key={pkg._id} 
                                onClick={() => handleSelectPackage(pkg)} 
                                className={`group p-6 rounded-[2.5rem] border transition-all text-left relative overflow-hidden flex flex-col justify-between h-[210px] 
                                    ${isSelected 
                                        ? 'border-amber-500/50 bg-slate-900 text-white shadow-xl shadow-blue-900/10 scale-[1.02]' 
                                        : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-lg'
                                    }`}
                            >
                                <div className="relative z-10">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-all 
                                        ${isSelected ? 'bg-amber-400 text-slate-900' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50'}`}>
                                        {getPackageIcon(idx)}
                                    </div>
                                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`}>{pkg.name}</p>
                                    <h4 className="text-2xl font-black tabular-nums tracking-tighter italic uppercase leading-none">
                                        {(pkg.basePoints + pkg.bonusPoints).toLocaleString()} <span className={`text-[9px] font-medium lowercase not-italic ${isSelected ? 'text-amber-400' : 'opacity-40'}`}>pts</span>
                                    </h4>
                                </div>
                                <div className="relative z-10">
                                    <p className={`text-sm font-bold tracking-tight mb-2 ${isSelected ? 'text-white' : 'text-slate-900'}`}>Rp {pkg.price.toLocaleString('id-ID')}</p>
                                    {pkg.bonusPoints > 0 && (
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-colors ${isSelected ? 'bg-white/10 border-white/20 text-amber-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                                            <Gift size={10} fill="currentColor" />
                                            <span className="text-[8px] font-black uppercase tracking-tighter italic">+{pkg.bonusPoints.toLocaleString()} Bonus</span>
                                        </div>
                                    )}
                                </div>
                                {isSelected && <div className="absolute top-6 right-6 text-amber-400"><CheckCircle2 size={20} fill="currentColor" className="text-slate-900" /></div>}
                            </button>
                        )
                    })}
                </div>
            )}
          </div>

          {/* MANUAL INPUT */}
          <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 text-center space-y-4 group hover:border-blue-200 transition-all duration-500">
             <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Atur Nominal Custom</h3>
             <div className="relative inline-block w-full">
                <input 
                    type="number" 
                    value={displayPoints || ""} 
                    onChange={(e) => handleManualInput(e.target.value)} 
                    className="text-5xl md:text-7xl font-black text-slate-900 outline-none w-full text-center bg-transparent tabular-nums tracking-tighter placeholder-slate-200 focus:text-blue-600 transition-colors" 
                    placeholder="0" 
                />
                <div className="mt-2 text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] italic">
                    {bonus > 0 ? `${basePoints.toLocaleString()} Utama + ${bonus.toLocaleString()} Extra` : `Minimal Pengisian 500 Poin`}
                </div>
             </div>
          </div>
        </div>

        {/* KANAN: RINGKASAN PEMBAYARAN */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* VOUCHER CARD */}
          <div className="bg-[#0F172A] rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Ticket size={16} className="text-amber-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Gunakan Voucher</span>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="KODE PROMO" 
                        value={voucherCode} 
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} 
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-amber-400 transition-all text-center tracking-widest" 
                    />
                    <button 
                        onClick={handleApplyVoucher} 
                        disabled={isValidating || !voucherCode} 
                        className="bg-amber-400 text-slate-900 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isValidating ? <Loader2 className="animate-spin" size={14}/> : "Cek"}
                    </button>
                </div>
                {voucherError && <p className="text-[9px] font-bold text-rose-400 uppercase text-center">{voucherError}</p>}
                {voucherData && <p className="text-[9px] font-bold text-emerald-400 uppercase text-center">Voucher {voucherData.code} Berhasil Dipasang!</p>}
            </div>
          </div>

          {/* TOTAL SUMMARY CARD */}
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8 h-fit">
            <div className="space-y-5 text-[10px]">
                <h3 className="font-black text-slate-400 uppercase tracking-widest italic">Rincian Pembayaran</h3>
                <div className="space-y-4 font-bold uppercase tracking-widest">
                    <div className="flex justify-between text-slate-400">
                        <span>Harga Subtotal</span>
                        <span className="text-slate-900">Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    {voucherData && (
                        <div className="flex justify-between text-emerald-600">
                            <span>Potongan Diskon</span>
                            <span>- Rp {calculateDiscount().toLocaleString('id-ID')}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-blue-600 italic">
                        <span>Kode Unik Verifikasi</span>
                        <span className="tabular-nums opacity-60">Dihitung di Pembayaran</span>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Estimasi Total</p>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums italic uppercase">
                                <span className="text-sm not-italic text-blue-600 mr-1">Rp</span>
                                {finalPrice.toLocaleString('id-ID')}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            <button 
                onClick={handleTopup} 
                disabled={loading || displayPoints === 0} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 group"
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                    <>
                        Lanjut Bayar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}