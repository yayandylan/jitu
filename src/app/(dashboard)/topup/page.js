"use client";
import { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, Loader2, Zap, Ticket, CheckCircle2, 
  XCircle, Wallet, Star, Flame, Crown, Info, Hash, Gift, Plus, TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TopupPage() {
  const router = useRouter();
  
  const [packages, setPackages] = useState([]);
  const [displayPoints, setDisplayPoints] = useState(0); 
  const [basePoints, setBasePoints] = useState(0); 
  const [bonus, setBonus] = useState(0);
  const [pricePerPoint, setPricePerPoint] = useState(25);
  const [uniqueCode, setUniqueCode] = useState(0); 
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherData, setVoucherData] = useState(null);
  const [voucherError, setVoucherError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setUniqueCode(Math.floor(Math.random() * 899) + 100);
    fetch('/api/admin/settings').then(res => res.json()).then(data => {
      if(data?.settings) setPricePerPoint(data.settings.pricePerPoint);
    });

    const fetchPackages = async () => {
        setFetching(true);
        try {
            const res = await fetch('/api/packages', { cache: 'no-store' });
            const data = await res.json();
            if (data.success && data.packages.length > 0) {
                // URUTKAN: TERMURAH KE TERMAHAL
                const sorted = data.packages.sort((a, b) => a.price - b.price);
                setPackages(sorted);
                const first = sorted[0];
                setBasePoints(first.basePoints);
                setBonus(first.bonusPoints);
                setDisplayPoints(first.basePoints + first.bonusPoints);
            }
        } catch (err) { console.log("Gagal load paket."); }
        finally { setFetching(false); }
    };
    fetchPackages();
  }, []);

  const currentPkg = useMemo(() => {
    return packages.find(p => (p.basePoints + p.bonusPoints) === Number(displayPoints));
  }, [displayPoints, packages]);

  const subtotal = currentPkg ? currentPkg.price : (displayPoints * pricePerPoint);
  const calculateDiscount = () => {
    if (!voucherData) return 0;
    if (voucherData.type === 'fixed') return voucherData.value;
    return (subtotal * voucherData.value) / 100;
  };
  const totalPrice = (subtotal - calculateDiscount()) + uniqueCode;

  const handleSelectPackage = (pkg) => {
    setBasePoints(pkg.basePoints);
    setBonus(pkg.bonusPoints);
    setDisplayPoints(pkg.basePoints + pkg.bonusPoints); 
  };

  const handleManualInput = (val) => {
    const totalInput = Number(val);
    setDisplayPoints(totalInput);
    const pkg = packages.find(p => (p.basePoints + p.bonusPoints) === totalInput);
    if (pkg) { setBasePoints(pkg.basePoints); setBonus(pkg.bonusPoints); } 
    else { setBasePoints(totalInput); setBonus(0); }
  };

  const handleApplyVoucher = async () => {
    setVoucherError(""); setVoucherData(null);
    if (!voucherCode) return;
    setIsValidating(true);
    try {
      const res = await fetch(`/api/vouchers/validate?code=${voucherCode}`);
      const data = await res.json();
      if (data.success) setVoucherData(data.voucher);
      else setVoucherError(data.message);
    } catch (e) { setVoucherError("Error."); }
    finally { setIsValidating(false); }
  };

  const handleTopup = async () => {
    if (displayPoints < 1000) return alert("Min. 1.000 pts.");
    setLoading(true);
    try {
      const res = await fetch('/api/transaction/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: Number(basePoints), bonusPoints: bonus, voucherCode: voucherData?.code || null, uniqueCode, totalPrice }),
      });
      const data = await res.json();
      if (res.ok) router.push(`/payment/${data.transactionId}`);
      else alert(data.message);
    } catch (e) { alert("Error."); } finally { setLoading(false); }
  };

  const getPackageIcon = (index) => {
    if (index === 0) return <Flame size={16} />;
    if (index === packages.length - 1) return <Crown size={16} />;
    return <Zap size={16} />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 pt-2 px-4 font-poppins antialiased text-slate-900 tracking-tighter">
      
      {/* --- COMPACT HEADER --- */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="space-y-0.5">
            <h1 className="text-xl md:text-2xl font-black italic uppercase">Isi <span className="text-blue-600 not-italic">Amunisi</span></h1>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.2em] italic">Jitu Digital Premium Dashboard</p>
        </div>
        <div className="text-right hidden sm:block">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block">Market Rate</span>
            <span className="text-xs font-black italic">Rp {pricePerPoint}/pts</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* --- LEFT: PACKAGES & INPUT --- */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilihan Paket Eksklusif</h3>
            </div>
            
            {fetching ? (
                <div className="h-32 flex items-center justify-center bg-white rounded-3xl border border-slate-50 animate-pulse text-[10px] font-bold text-slate-300 uppercase">Sinkronisasi...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {packages.map((pkg, idx) => {
                        const isSelected = basePoints === pkg.basePoints && bonus === pkg.bonusPoints;
                        return (
                            <button 
                                key={pkg._id} 
                                onClick={() => handleSelectPackage(pkg)} 
                                className={`group p-5 rounded-[2.5rem] border transition-all text-left relative overflow-hidden flex flex-col justify-between h-[190px] 
                                  ${isSelected 
                                    ? 'border-amber-500/50 bg-gradient-to-br from-[#0F172A] via-[#1e3a8a] to-[#0F172A] text-white shadow-xl shadow-amber-500/10' 
                                    : 'border-slate-100 bg-white hover:border-amber-400/30'}`}
                            >
                                {/* LOGO JITU WATERMARK */}
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
                                    <p className={`text-[9px] font-bold uppercase tracking-widest mb-0.5 ${isSelected ? 'text-amber-200/60' : 'text-slate-400'}`}>{pkg.name}</p>
                                    <h4 className="text-2xl font-black tabular-nums tracking-tighter italic uppercase leading-none">
                                        {(pkg.basePoints + pkg.bonusPoints).toLocaleString()} <span className={`text-[9px] font-medium lowercase not-italic ${isSelected ? 'text-amber-400' : 'opacity-40'}`}>pts</span>
                                    </h4>
                                </div>

                                <div className="relative z-10">
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isSelected ? 'text-amber-400' : 'text-slate-900'}`}>Rp {pkg.price.toLocaleString('id-ID')}</p>
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
          <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 text-center space-y-4 relative overflow-hidden">
             <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Nominal Custom</h3>
             <div className="relative inline-block w-full">
                <input 
                    type="number" value={displayPoints} onChange={(e) => handleManualInput(e.target.value)}
                    className="text-5xl md:text-7xl font-black text-slate-900 outline-none w-full text-center bg-transparent tabular-nums tracking-tighter"
                />
                <div className="mt-2 text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] italic">
                   {bonus > 0 ? `${basePoints.toLocaleString()} Utama + ${bonus.toLocaleString()} Extra` : 'Market Rate Applied'}
                </div>
             </div>
          </div>
        </div>

        {/* --- RIGHT: COMPACT SUMMARY --- */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* VOUCHER COMPACT MIDNIGHT */}
          <div className="bg-[#0F172A] rounded-[2.5rem] p-6 text-white relative overflow-hidden shadow-xl border border-slate-800">
            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <Ticket size={16} className="text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Privilese Voucher</span>
                </div>
                <div className="flex gap-2">
                    <input type="text" placeholder="KODE JITU" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:border-amber-500/50 transition-all placeholder:opacity-20" />
                    <button onClick={handleApplyVoucher} disabled={isValidating} className="bg-amber-500 text-[#0F172A] px-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95">
                        {isValidating ? <Loader2 className="animate-spin" size={14}/> : "Klaim"}
                    </button>
                </div>
            </div>
          </div>

          {/* SUMMARY BOX FIT */}
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="space-y-4 text-[10px]">
                <h3 className="font-black text-slate-400 uppercase tracking-widest px-1 italic">Order Summary</h3>
                <div className="space-y-3 font-bold uppercase tracking-widest">
                    <div className="flex justify-between text-slate-400"><span>Ammunition</span><span className="text-slate-900 font-black">Rp {subtotal.toLocaleString('id-ID')}</span></div>
                    {voucherData && <div className="flex justify-between text-emerald-600"><span>Discount</span><span>- Rp {calculateDiscount().toLocaleString('id-ID')}</span></div>}
                    <div className="flex justify-between text-blue-600 italic"><span>Security Code</span><span className="tabular-nums">+ Rp {uniqueCode}</span></div>
                    
                    <div className="pt-5 border-t border-slate-50 flex justify-between items-end">
                        <div className="space-y-0.5">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Total Transfer</p>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums leading-none italic uppercase">
                                <span className="text-sm not-italic text-blue-600 mr-1">Rp</span>{totalPrice.toLocaleString('id-ID')}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* TOTAL SALDO MASUK PREMIUM FOOTER */}
            <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2rem] text-white space-y-3 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-3xl rounded-full -mr-12 -mt-12" />
                <div className="flex items-center gap-2 relative z-10">
                    <Zap size={14} className="fill-white" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Ammunition Total</span>
                </div>
                <div className="relative z-10">
                    <p className="text-4xl font-black tracking-tighter italic leading-none">{displayPoints.toLocaleString()} <span className="text-[9px] not-italic font-bold opacity-40 uppercase ml-1">pts</span></p>
                    <div className="mt-3 pt-3 border-t border-white/10 text-[8px] font-bold uppercase tracking-widest opacity-80 italic flex items-center gap-2">
                        <span>{basePoints.toLocaleString()} CORE</span>
                        {bonus > 0 && <><Plus size={8} /> <span className="text-amber-400">{bonus.toLocaleString()} REWARDS</span></>}
                    </div>
                </div>
            </div>

            <button onClick={handleTopup} disabled={loading || displayPoints < 1000} className="w-full bg-[#0F172A] text-white font-black py-6 rounded-3xl text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-3 active:scale-95 border border-slate-800">
                {loading ? <Loader2 className="animate-spin" /> : <CreditCard size={18} />} 
                BAYAR SEKARANG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}