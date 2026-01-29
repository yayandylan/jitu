"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm'; 
import { 
  Calculator, Loader2, DollarSign, PieChart, 
  TrendingUp, AlertCircle, CheckCircle2, 
  Coins, Wallet, Target, Gauge, ArrowRight
} from 'lucide-react';
import ToolHistory from '../../../../components/ToolHistory'; 

export default function KalkulatorAdsPage() {
  const [data, setData] = useState({
    productPrice: '',
    cogs: '', // Modal Produk
    adBudget: '',
    targetSales: '',
    expectedCpr: '' // Biaya per Closing yang diharapkan
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState({ creditCost: 40, isActive: true });

  const fetchHistory = async () => {
    const res = await fetch('/api/history?tool=kalkulator-ads');
    const json = await res.json();
    if (json.data) setHistory(json.data);
  };

  useEffect(() => {
    fetch('/api/admin/tools').then(res => res.json()).then(json => {
      const myTool = json.find(t => t.slug === 'kalkulator-ads');
      if (myTool) setConfig(myTool);
    });
    fetchHistory();
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!config.isActive) return;
    setLoading(true); setResult('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'kalkulator-ads', data: data }),
      });

      const json = await res.json();
      if (res.status === 402) { alert("Poin tidak cukup!"); setLoading(false); return; }
      
      setResult(json.result);
      
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'kalkulator-ads',
          title: `Forecasting - Rp ${Number(data.productPrice).toLocaleString()}`,
          inputData: data,
          resultData: json.result
        })
      });

      fetchHistory();
    } catch (err) { alert("Gagal kalkulasi"); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 pt-4 font-poppins antialiased">
      
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="bg-emerald-600 p-2.5 rounded-[1.2rem] shadow-lg shadow-emerald-200">
              <Calculator className="w-6 h-6 text-white" />
          </div>
          Kalkulator Profit Ads
        </h1>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest leading-relaxed">Hitung potensi cuan dan batas aman iklan (Break-Even ROAS) Bapak.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8 space-y-8">
          
          <div className={`bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm ${!config.isActive ? 'opacity-50 pointer-events-none' : ''}`}>
            <form onSubmit={handleAnalyze} className="space-y-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Harga Jual */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Wallet size={14} className="text-emerald-500" /> Harga Jual Produk (Rp)
                    </label>
                    <input 
                        type="number" placeholder="Contoh: 250000"
                        value={data.productPrice}
                        onChange={(e) => setData({...data, productPrice: e.target.value})}
                        className="w-full p-4.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                        required
                    />
                </div>

                {/* COGS / Modal */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Coins size={14} className="text-rose-500" /> Modal Produk / HPP (Rp)
                    </label>
                    <input 
                        type="number" placeholder="Contoh: 100000"
                        value={data.cogs}
                        onChange={(e) => setData({...data, cogs: e.target.value})}
                        className="w-full p-4.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-sm"
                        required
                    />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Budget Iklan</label>
                    <input type="number" value={data.adBudget} onChange={(e) => setData({...data, adBudget: e.target.value})} placeholder="Rp" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Target Sales</label>
                    <input type="number" value={data.targetSales} onChange={(e) => setData({...data, targetSales: e.target.value})} placeholder="Qty" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ekspektasi CPR (Rp)</label>
                    <input type="number" value={data.expectedCpr} onChange={(e) => setData({...data, expectedCpr: e.target.value})} placeholder="Rp" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 transition-all" />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 h-14 shadow-xl active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Analisa Kelayakan Bisnis <span className="bg-white/10 px-2 py-0.5 rounded-lg ml-2">-{config.creditCost} pts</span></>}
              </button>
            </form>
          </div>

          {/* HASIL ANALISA */}
          {result && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                          <PieChart className="w-4 h-4 text-emerald-400" /> Proyeksi Profitabilitas Jitu
                      </h3>
                  </div>
                  <div className="p-8 md:p-12 prose prose-slate prose-sm max-w-none 
                    prose-headings:text-slate-900 prose-headings:font-bold 
                    prose-strong:text-emerald-600 prose-p:font-medium prose-p:text-slate-600 leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                  </div>
              </div>
          )}
        </div>

        {/* HISTORY */}
        <div className="lg:col-span-4">
            <div className="sticky top-8">
                <ToolHistory 
                    title="Riwayat Kalkulasi" 
                    historyData={history} 
                    onSelect={(item) => { setData(item.inputData); setResult(item.resultData); }} 
                    onDelete={async (id) => { await fetch(`/api/history?id=${id}`, { method: 'DELETE' }); fetchHistory(); }} 
                />
            </div>
        </div>
      </div>
    </div>
  );
}