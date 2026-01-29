"use client";
import { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, Loader2, Zap, Ticket, CheckCircle2, 
  XCircle, Star, Flame, Crown, Gift, Plus, ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TopupPage() {
  const router = useRouter();
  
  // DATA PAKET (Fallback jika API belum ready)
  const DEFAULT_PACKAGES = [
    { _id: 'starter', name: 'STARTER PACK', basePoints: 1000, bonusPoints: 100, price: 24000 },
    { _id: 'pro', name: 'PRO ADVERTISER', basePoints: 5000, bonusPoints: 1000, price: 99000 },
    { _id: 'agency', name: 'AGENCY SCALE', basePoints: 15000, bonusPoints: 5000, price: 249000 },
  ];

  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [displayPoints, setDisplayPoints] = useState(1100); // Default ke paket pertama (1000 + 100)
  const [basePoints, setBasePoints] = useState(1000); 
  const [bonus, setBonus] = useState(100);
  const [pricePerPoint, setPricePerPoint] = useState(25); // Harga eceran jika input manual
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherData, setVoucherData] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // Load Settings (Opsional)
  useEffect(() => {
    // Simulasi ambil setting harga (bisa diganti fetch API beneran nanti)
    setPricePerPoint(30); 
  }, []);

  // Deteksi Paket yang sedang dipilih
  const currentPkg = useMemo(() => {
    return packages.find(p => (p.basePoints + p.bonusPoints) === Number(displayPoints));
  }, [displayPoints, packages]);

  // Hitung Harga
  const subtotal = currentPkg ? currentPkg.price : (displayPoints * pricePerPoint);
  
  const calculateDiscount = () => {
    if (!voucherData) return 0;
    if (voucherData.type === 'fixed') return voucherData.value;
    return (subtotal * voucherData.value) / 100;
  };

  const finalPrice = subtotal - calculateDiscount(); // Total sebelum kode unik (Backend yg generate kode unik)

  // Handler Pilih Paket
  const handleSelectPackage = (pkg) => {
    setBasePoints(pkg.basePoints);
    setBonus(pkg.bonusPoints);
    setDisplayPoints(pkg.basePoints + pkg.bonusPoints); 
    setVoucherData(null); // Reset voucher saat ganti paket
  };

  // Handler Input Manual
  const handleManualInput = (val) => {
    const totalInput = Number(val);
    setDisplayPoints(totalInput);
    
    // Cek apakah input manual cocok dengan salah satu paket
    const pkg = packages.find(p => (p.basePoints + p.bonusPoints) === totalInput);
    if (pkg) { 
        setBasePoints(pkg.basePoints); 
        setBonus(pkg.bonusPoints); 
    } else { 
        // Jika custom, anggap semua base points (tanpa bonus spesifik)
        setBasePoints(totalInput); 
        setBonus(0); 
    }
  };

  // Handler Voucher
  const handleApplyVoucher = async () => {
    setVoucherError(""); setVoucherData(null);
    if (!voucherCode) return;
    setIsValidating(true);
    try {
      const res = await fetch(`/api/vouchers/validate?code=${voucherCode}`);
      const data = await res.json();
      if (data.success) setVoucherData(data.voucher);
      else setVoucherError(data.message || "Voucher tidak valid");
    } catch (e) { setVoucherError("Gagal memvalidasi voucher."); }
    finally { setIsValidating(false); }
  };

  // HANDLER UTAMA: CREATE TRANSACTION
  const handleTopup = async () => {
    if (displayPoints < 500) return alert("Minimal Top Up 500 poin.");
    
    setLoading(true);
    try {
      // Panggil API Backend yang sudah kita buat
      const res = await fetch('/api/transactions', {
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
        // Redirect ke Payment Page dengan ID Transaksi
        router.push(`/site/topup/payment/${data.transactionId}`);
      } else {
        alert(data.message || "Gagal membuat transaksi.");
      }
    } catch (e) { 
        console.error(e);
        alert("Terjadi kesalahan jaringan."); 
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
    <div className="max-w-5xl mx-auto space-y-8 pb-20 pt-4 px-4 font-poppins antialiased text-slate-900 tracking-tighter">
      
      {/* --- COMPACT HEADER --- */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-6">
        <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black italic uppercase">Isi <span className="text-blue-600 not-italic">Amunisi</span></h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] italic">Jitu Digital Premium Dashboard</p>
        </div>
        <div className="text-right hidden sm:block">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">Market Rate</span>
            <span className="text-xs font-black italic">Rp {pricePerPoint}/pts</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT: PACKAGES & INPUT --- */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* PACKAGE GRID */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilihan Paket Eksklusif</h3>
            </div>
            
            {fetching ? (
                <div className="h-32 flex items-center justify-center bg-white rounded-3xl border border-slate-50 animate-pulse text-[10px] font-bold text-slate-300 uppercase">Sinkronisasi Paket...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {packages.map((pkg, idx) => {
                        const isSelected = basePoints === pkg.basePoints && bonus === pkg.bonusPoints;
                        return (
                            <button 
                                key={pkg._id} 
                                onClick={() => handleSelectPackage(pkg)} 
                                className={`group p-6 rounded-[2.5rem] border transition-all text-left relative overflow-hidden flex flex-col justify-between h-[200px] 
                                  ${isSelected 
                                    ? 'border-amber-500/50 bg-gradient-to-br from-[#0F172A] via-[#1e3a8a] to-[#0F172A] text-white shadow-xl shadow-amber-500/10 scale-[1.02]' 
                                    : 'border-slate-100 bg-white hover:border-amber-400/30 hover:shadow-lg'}`}
                            >
                                {/* WATERMARK */}
                                <div className={`absolute -top-6 -right-6 opacity-[0.06] rotate-12 transition-transform duration-700 group-hover:scale-110 
                                  ${isSelected ? 'text-amber-400' : 'text-slate-900'}`}>
                                    <Zap size={140} fill="currentColor" />
                                </div>

                                <div className="relative z-10">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-all 
                                      ${isSelected 
                                        ? 'bg-gradient-to-br from-amber-300 to-amber-600 text-[#0F172A]' 
                                        : 'bg-slate-50 text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600'}`}>
                                        {getPackageIcon(idx)}
                                    </div>
                                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${isSelected ? 'text-amber-200/60' : 'text-slate-400'}`}>{pkg.name}</p>
                                    <h4 className="text-2xl font-black tabular-nums tracking-tighter italic uppercase leading-none">
                                        {(pkg.basePoints + pkg.bonusPoints).toLocaleString()} <span className={`text-[9px] font-medium lowercase not-italic ${isSelected ? 'text-amber-400' : 'opacity-40'}`}>pts</span>
                                    </h4>
                                </div>

                                <div className="relative z-10">
                                    <p className={`text-[12px] font-bold uppercase tracking-widest mb-2 ${isSelected ? 'text-amber-400' : 'text-slate-900'}`}>Rp {pkg.price.toLocaleString('id-ID')}</p>
                                    {pkg.bonusPoints > 0 && (
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-colors
                                          ${isSelected 
                                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
                                            : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                                            <Gift size={10} fill="currentColor" className={isSelected ? "animate-pulse" : ""} />
                                            <span className="text-[8px] font-black uppercase tracking-tighter italic">+{pkg.bonusPoints.toLocaleString()} Bonus</span>
                                        </div>
                                    )}
                                </div>

                                {isSelected && <div className="absolute top-6 right-6 text-amber-500 animate-in zoom-in-50"><CheckCircle2 size={18} fill="currentColor" className="text-[#0F172A]" /></div>}
                            </button>
                        )
                    })}
                </div>
            )}
          </div>

          {/* MANUAL INPUT SLEEK */}
          <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 text-center space-y-4 relative overflow-hidden group hover:border-blue-200 transition-colors">
             <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Nominal Custom</h3>
             <div className="relative inline-block w-full">
                <input 
                    type="number" value={displayPoints} onChange={(e) => handleManualInput(e.target.value)}
                    className="text-5xl md:text-7xl font-black text-slate-900 outline-none w-full text-center bg-transparent tabular-nums tracking-tighter placeholder-slate-200 focus:text-blue-600 transition-colors"
                    placeholder="0"
                />
                <div className="mt-2 text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] italic">
                   {bonus > 0 ? `${basePoints.toLocaleString()} Utama + ${bonus.toLocaleString()} Extra` : 'Market Rate Applied'}
                </div>
             </div>
          </div>
        </div>

        {/* --- RIGHT: SUMMARY & ACTIONS --- */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* VOUCHER BOX */}
          <div className="bg-[#0F172A] rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-2xl border border-slate-800">
            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Ticket size={16} className="text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Privilese Voucher</span>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="KODE PROMO" 
                        value={voucherCode} 
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} 
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-amber-500/50 transition-all placeholder:opacity-20 text-center tracking-widest" 
                    />
                    <button onClick={handleApplyVoucher} disabled={isValidating} className="bg-amber-500 text-[#0F172A] px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 disabled:opacity-50">
                        {isValidating ? <Loader2 className="animate-spin" size={14}/> : "Klaim"}
                    </button>
                </div>
                
                {voucherError && (
                    <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20 animate-in fade-in slide-in-from-top-1">
                        <XCircle size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-wide">{voucherError}</span>
                    </div>
                )}
                {voucherData && (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 animate-in fade-in slide-in-from-top-1">
                        <CheckCircle2 size={12} />
                        <span className="text-[9px] font-bold uppercase tracking-wide">Voucher Aktif: {voucherData.code}</span>
                    </div>
                )}
            </div>
          </div>

          {/* SUMMARY BOX */}
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8 flex flex-col justify-between h-fit">
            <div className="space-y-4 text-[10px]">
                <h3 className="font-black text-slate-400 uppercase tracking-widest px-1 italic">Order Summary</h3>
                <div className="space-y-3 font-bold uppercase tracking-widest">
                    <div className="flex justify-between text-slate-400"><span>Ammunition</span><span className="text-slate-900 font-black">Rp {subtotal.toLocaleString('id-ID')}</span></div>
                    {voucherData && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>- Rp {calculateDiscount().toLocaleString('id-ID')}</span></div>}
                    <div className="flex justify-between text-blue-600 italic"><span>Security Code</span><span className="tabular-nums opacity-50">Generated at Payment</span></div>
                    
                    <div className="pt-6 border-t border-slate-50 flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Estimasi Total</p>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums leading-none italic uppercase">
                                <span className="text-sm not-italic text-blue-600 mr-1">Rp</span>{finalPrice.toLocaleString('id-ID')}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION BUTTON */}
            <button 
                onClick={handleTopup} 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg shadow-blue-500/30 transition-all active:scale-95 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                ) : (
                    <>
                        Lanjut Pembayaran <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}