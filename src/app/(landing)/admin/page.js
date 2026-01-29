"use client";
import { useState, useEffect } from 'react';
import { 
  Users, Wallet, Zap, TrendingUp, 
  Activity, Clock, BarChart3, Settings, Megaphone 
} from 'lucide-react';
import Link from 'next/link';

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/overview')
      .then(res => res.ok ? res.json() : null)
      .then(json => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) return (
    <div className="p-10 text-slate-400 text-xs font-medium uppercase tracking-widest animate-pulse font-poppins">
      Sinkronisasi data Jitu Digital...
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 font-poppins antialiased">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin <span className="text-blue-600">Overview</span></h1>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-1">Laporan kesehatan sistem & finansial secara real-time.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">System Active</span>
        </div>
      </div>

      {/* 1. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total User" value={data.stats.totalUser} sub="User terdaftar" color="text-slate-900" />
        <StatCard title="Omzet (Lunas)" value={`Rp ${data.stats.totalIncome.toLocaleString()}`} sub="Penjualan poin" color="text-slate-900" />
        <StatCard title="Modal API" value={`Rp ${data.stats.totalCost.toLocaleString()}`} sub="Biaya OpenRouter" color="text-slate-900" />
        
        {/* PROFIT CARD: DYNAMIC COLOR */}
        <div className={`p-7 rounded-[2.5rem] border shadow-sm transition-all ${data.stats.profit >= 0 ? 'bg-blue-600 text-white border-blue-500' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ${data.stats.profit >= 0 ? 'text-blue-100' : 'text-rose-400'}`}>Laba Bersih</p>
          <h2 className="text-3xl font-bold tracking-tighter italic">Rp {data.stats.profit.toLocaleString()}</h2>
          <div className="mt-4 flex items-center gap-2">
            <div className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${data.stats.profit >= 0 ? 'bg-white/20' : 'bg-rose-100'}`}>
                {data.stats.profit >= 0 ? 'Profit' : 'Defisit'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. TOOL USAGE ANALYSIS */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-slate-900">
                <BarChart3 size={18} className="text-blue-600" />
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Aktivitas Tool Terbanyak</h3>
            </div>
          </div>
          <div className="space-y-7">
            {data.topTools.map(([name, count], i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-semibold uppercase tracking-tight">
                  <span className="text-slate-500">{name}</span>
                  <span className="text-slate-900">{count} <span className="text-[10px] font-medium text-slate-400">usage</span></span>
                </div>
                <div className="w-full bg-slate-50 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${(count / Math.max(...data.topTools.map(t => t[1]))) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. RECENT ACTIVITY */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-8 text-slate-900">
            <Activity size={18} className="text-blue-600" />
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em]">Log Aktivitas</h3>
          </div>
          <div className="space-y-6">
            {data.recent.map((item, i) => (
              <div key={i} className="flex gap-4 group">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.type === 'in' ? 'bg-emerald-500 shadow-lg shadow-emerald-200' : 'bg-slate-200'}`} />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate tracking-tight">{item.userId?.name || 'User'}</p>
                  <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">{item.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                      <Clock size={10} className="text-slate-300" />
                      <span className="text-[9px] font-bold text-slate-300 uppercase italic tracking-widest">{new Date(item.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
        <Link href="/admin/transactions" className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl hover:bg-blue-600 transition-all text-[11px] font-semibold uppercase tracking-[0.15em] shadow-xl shadow-slate-200 active:scale-95">
          <Wallet size={16} /> Kelola Transaksi
        </Link>
        
        <Link href="/admin/broadcast" className="flex items-center gap-3 bg-white border border-slate-200 text-slate-900 px-8 py-4 rounded-2xl hover:border-blue-600 hover:text-blue-600 transition-all text-[11px] font-semibold uppercase tracking-[0.15em] shadow-sm active:scale-95">
          <Megaphone size={16} /> Kirim Broadcast
        </Link>

        <Link href="/admin/settings" className="flex items-center gap-3 bg-white border border-slate-200 text-slate-400 px-8 py-4 rounded-2xl hover:bg-slate-50 transition-all text-[11px] font-semibold uppercase tracking-[0.15em]">
          <Settings size={16} /> Konfigurasi
        </Link>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, color }) {
  return (
    <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-blue-100 transition-all">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
      <h2 className={`text-2xl font-bold tracking-tight ${color}`}>{value}</h2>
      <p className="text-[10px] font-medium text-slate-300 uppercase tracking-tighter mt-1">{sub}</p>
    </div>
  );
}