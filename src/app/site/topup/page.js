"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, CheckCircle2, ShieldCheck, Zap, 
  Crown, Gem, Award, ArrowRight, Loader2, Lock, AlertTriangle 
} from 'lucide-react';

export default function TopUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // Loading saat klik bayar
  const [dataLoading, setDataLoading] = useState(true); // Loading saat ambil data user
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [user, setUser] = useState(null);

  // Ambil data user
  useEffect(() => {
    fetch('/api/user/me')
      .then(res => res.json())
      .then(data => { 
        if(data.user) setUser(data.user);
        setDataLoading(false);
      })
      .catch(() => setDataLoading(false));
  }, []);

  const plans = [
    {
      id: 'starter',
      name: 'Starter Pack',
      price: 24900,
      points: 1000,
      bonus: 100,
      isPopular: false,
      color: 'bg-white border-slate-200 text-slate-900',
      btnColor: 'bg-slate-900 hover:bg-slate-800 text-white',
      features: ['Akses Semua Tools', 'Masa Aktif Selamanya']
    },
    {
      id: 'pro',
      name: 'Pro Advertiser',
      price: 99000,
      points: 5000,
      bonus: 1000,
      isPopular: true, // BEST VALUE
      color: 'bg-[#0F172A] border-slate-900 text-white shadow-2xl scale-105 z-10',
      btnColor: 'bg-blue-600 hover:bg-blue-500 text-white',
      features: ['Prioritas Server', 'Unlock Fitur Premium', 'Masa Aktif Selamanya']
    },
    {
      id: 'agency',
      name: 'Agency Scale',
      price: 249000,
      points: 15000,
      bonus: 5000,
      isPopular: false,
      color: 'bg-gradient-to-b from-amber-50 to-white border-amber-200 text-slate-900',
      btnColor: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:to-amber-500 text-white shadow-lg shadow-amber-500/20',
      features: ['Support Prioritas', 'Akses Fitur Beta', 'Limit Request Tinggi']
    }
  ];

  const handleTopUp = async (plan) => {
    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      const res = await fetch('/api/midtrans/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.price,
          packageName: plan.name,
          points: plan.points + plan.bonus
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (window.snap) {
        window.snap.pay(data.token, {
          onSuccess: function(result) {
            alert("Pembayaran Berhasil! Poin telah ditambahkan.");
            router.push('/site/dashboard');
          },
          onPending: function(result) {
            alert("Menunggu pembayaran...");
            router.push('/site/history');
          },
          onError: function(result) {
            alert("Pembayaran gagal!");
            setLoading(false);
          },
          onClose: function() {
            setLoading(false);
          }
        });
      } else {
        alert("Sistem pembayaran belum siap. Coba refresh halaman.");
        setLoading(false);
      }
    } catch (error) {
      alert("Gagal membuat transaksi: " + error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load Midtrans Snap JS
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js"; // Ganti ke production URL jika live
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
    
    const script = document.createElement('script');
    script.src = snapScript;
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto pb-20 font-poppins text-slate-900">
      
      {/* 1. HEADER & ALERT WAJIB TOPUP */}
      <div className="text-center mb-16 space-y-6">
        
        {/* ALERT BOX: Hanya muncul jika Data sudah load DAN User BUKAN Premium */}
        {!dataLoading && user && !user.isPremium && (
            <div className="inline-flex items-start md:items-center gap-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl max-w-2xl mx-auto text-left shadow-sm animate-in fade-in zoom-in duration-500">
                <div className="bg-rose-100 p-2 rounded-xl shrink-0">
                    <Lock size={20} className="text-rose-600" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-rose-700 uppercase tracking-wide mb-1">Akses Tools Terkunci</h3>
                    <p className="text-xs text-rose-600/80 font-medium leading-relaxed">
                        Untuk membuka kunci fitur <b>Validasi Market</b>, <b>Landing Page Builder</b>, & <b>Audit Iklan</b>, silakan Top Up minimal satu kali. 
                    </p>
                </div>
            </div>
        )}

        <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 text-slate-900">
              Isi Ulang <span className="text-blue-600 not-italic">Amunisi</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto font-medium">
              Investasikan budget iklan Anda pada data yang akurat. <br className="hidden md:block"/>
              Pilih paket poin di bawah ini untuk mulai mendominasi pasar.
            </p>
        </div>
      </div>

      {/* 2. PRICING CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center px-4">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`
                relative rounded-[2.5rem] p-8 border transition-all duration-300 flex flex-col h-fit
                ${plan.color} 
                ${selectedPlan === plan.id ? 'ring-4 ring-blue-500/20' : ''}
            `}
          >
            {/* Badge Popular */}
            {plan.isPopular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-b-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-600/40">
                Paling Laris
              </div>
            )}

            {/* Badge Agency */}
            {plan.id === 'agency' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-amber-100 border border-amber-200 text-amber-700 px-6 py-1.5 rounded-b-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Crown size={12} className="fill-amber-700" /> Sultan Mode
                </div>
            )}

            <div className="mb-8 mt-4 text-center">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-4">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1 mb-6">
                    <span className="text-sm font-bold opacity-50">Rp</span>
                    <span className="text-5xl font-black tracking-tighter italic">{plan.price.toLocaleString('id-ID')}</span>
                </div>
                
                {/* Point Display */}
                <div className={`py-4 px-6 rounded-2xl border flex items-center justify-between ${plan.id === 'pro' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-left">
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Total Poin</p>
                        <p className="text-xl font-black tracking-tight">{(plan.points + plan.bonus).toLocaleString()}</p>
                    </div>
                    {plan.bonus > 0 && (
                        <div className={`px-2 py-1 rounded text-[9px] font-bold uppercase ${plan.id === 'pro' ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                            + {plan.bonus} Bonus
                        </div>
                    )}
                </div>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide opacity-80">
                        <CheckCircle2 size={16} className={plan.id === 'pro' ? "text-blue-400" : "text-blue-600"} /> 
                        {feat}
                    </li>
                ))}
            </ul>

            <button
                onClick={() => handleTopUp(plan)}
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.25em] flex items-center justify-center gap-2 transition-all active:scale-95 ${plan.btnColor} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {loading && selectedPlan === plan.id ? (
                    <Loader2 className="animate-spin" size={16} />
                ) : (
                    <>
                        Beli Sekarang <ArrowRight size={14} />
                    </>
                )}
            </button>
          </div>
        ))}
      </div>

      {/* 3. FOOTER INFO */}
      <div className="mt-20 border-t border-slate-200 pt-10 text-center max-w-2xl mx-auto space-y-4 px-4">
        <div className="flex justify-center gap-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Payment Logos Placeholder */}
            <span className="text-xs font-black uppercase tracking-widest">BCA</span>
            <span className="text-xs font-black uppercase tracking-widest">Mandiri</span>
            <span className="text-xs font-black uppercase tracking-widest">QRIS</span>
            <span className="text-xs font-black uppercase tracking-widest">Gopay</span>
        </div>
        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            Pembayaran Aman & Otomatis Terverifikasi oleh Midtrans
        </p>
      </div>

    </div>
  );
}