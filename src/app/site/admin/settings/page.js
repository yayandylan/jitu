"use client";

import { useState, useEffect } from 'react';
import { Save, Settings, CreditCard, Loader2, Zap, ShieldCheck, Banknote } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State Form (Default value string kosong biar input enak)
  const [price, setPrice] = useState(""); 
  const [minTopup, setMinTopup] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) {
        setPrice(data.settings.pricePerPoint);
        setMinTopup(data.settings.minimumTopup);
      } else {
        // Default jika database kosong
        setPrice(25);
        setMinTopup(10000);
      }
    } catch (error) {
      console.error("Gagal load setting:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pricePerPoint: Number(price),
          minimumTopup: Number(minTopup)
        }),
      });
      
      if (res.ok) {
        alert("✅ Pengaturan berhasil disimpan!");
      } else {
        alert("❌ Gagal menyimpan.");
      }
    } catch (err) {
      alert("Error server.");
    } finally {
      setSaving(false);
    }
  };

  // Logic aman untuk simulasi (hindari pembagian dengan 0)
  const safePrice = Number(price) > 0 ? Number(price) : 1;
  const simulationPoints = Math.floor(100000 / safePrice);

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center font-poppins">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sinkronisasi System...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 px-4 mt-8 font-poppins antialiased text-slate-900">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-6">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">System <span className="text-blue-600">Settings</span></h1>
            <p className="text-[10px] font-normal text-slate-400 uppercase tracking-[0.2em] mt-1">Konfigurasi Global Jitu Digital</p>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 shadow-sm">
            <Settings size={20} />
        </div>
      </div>

      {/* CARD FORM */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex items-start gap-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                <ShieldCheck size={20} />
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Kurs & Batasan Transaksi</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                    Pengaturan ini mempengaruhi konversi Rupiah ke Poin saat user melakukan Top Up.
                </p>
            </div>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-8">
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* HARGA PER POIN */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <Zap size={12} className="text-amber-500" /> Harga Per 1 Poin
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold text-sm group-focus-within:text-blue-600 transition-colors">Rp</span>
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-12 w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-black text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner placeholder-slate-300"
                  placeholder="25"
                />
              </div>
              <p className="text-[10px] text-slate-400 px-1 italic">
                Rekomendasi: <strong>25 - 100</strong> Rupiah per poin.
              </p>
            </div>

            {/* MINIMAL TOPUP */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <CreditCard size={12} className="text-blue-500" /> Minimal Top Up
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-bold text-sm group-focus-within:text-blue-600 transition-colors">Rp</span>
                </div>
                <input
                  type="number"
                  required
                  value={minTopup}
                  onChange={(e) => setMinTopup(e.target.value)}
                  className="pl-12 w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-black text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner placeholder-slate-300"
                  placeholder="10000"
                />
              </div>
              <p className="text-[10px] text-slate-400 px-1 italic">
                Batas minimum transfer (Disarankan Rp 10.000).
              </p>
            </div>
          </div>

          {/* SIMULASI REALTIME */}
          <div className="bg-[#0F172A] p-6 rounded-3xl text-white relative overflow-hidden flex items-center justify-between shadow-lg">
             <div className="relative z-10 space-y-1">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Simulasi User</p>
                 <p className="text-sm font-medium opacity-90">
                    Bayar <span className="font-bold text-emerald-400">Rp 100.000</span> dapat:
                 </p>
             </div>
             <div className="relative z-10 text-right">
                 <h2 className="text-3xl font-black italic tracking-tighter">
                    {simulationPoints.toLocaleString()} <span className="text-sm not-italic font-bold text-blue-500">pts</span>
                 </h2>
             </div>
             <Banknote className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-5 rotate-12" />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 px-10 rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}