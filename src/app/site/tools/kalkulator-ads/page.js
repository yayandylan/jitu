"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect, useRef } from 'react';
import remarkGfm from 'remark-gfm'; 
import { 
  Calculator, Loader2, PieChart, 
  TrendingUp, Coins, Wallet, History, Trash2, ChevronRight, X, Clock, Menu
} from 'lucide-react';
import Link from 'next/link';

export default function KalkulatorAdsPage() {
  // --- STATE ---
  const [data, setData] = useState({
    productPrice: '',
    cogs: '', 
    adBudget: '',
    targetSales: '',
    expectedCpr: '' 
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Mobile Drawer State
  const [config, setConfig] = useState({ creditCost: 40, isActive: true });
  
  const resultRef = useRef(null);

  // --- FETCH DATA ---
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/user/history?tool=kalkulator-ads');
      const json = await res.json();
      if (json.data) setHistory(json.data);
    } catch (err) { console.error("Gagal load history"); }
  };

  useEffect(() => {
    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/admin/tools');
            const json = await res.json();
            const myTool = json.find(t => t.slug === 'kalkulator-ads');
            if (myTool) setConfig(myTool);
        } catch (e) {}
    };
    fetchConfig();
    fetchHistory();
  }, []);

  // --- HELPERS ---
  const formatRupiah = (value) => {
    const numberString = value.replace(/[^,\d]/g, '').toString();
    const split = numberString.split(',');
    const sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);
    if (ribuan) {
      const separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }
    return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
  };

  const handleInputChange = (e, field) => {
      const val = e.target.value;
      if (field === 'targetSales') {
          setData({...data, [field]: val});
      } else {
          setData({...data, [field]: formatRupiah(val)});
      }
  };

  const cleanNumber = (val) => val.replace(/\./g, '');

  // --- HANDLERS ---
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if(!config.isActive) return alert("Fitur sedang maintenance.");
    if(!data.productPrice || !data.cogs || !data.adBudget) return alert("Mohon lengkapi data harga dan budget.");

    setLoading(true); setResult(''); setActiveHistoryId(null);

    const cleanData = {
        productPrice: cleanNumber(data.productPrice),
        cogs: cleanNumber(data.cogs),
        adBudget: cleanNumber(data.adBudget),
        targetSales: data.targetSales,
        expectedCpr: cleanNumber(data.expectedCpr)
    };

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'kalkulator-ads', data: cleanData }),
      });

      const json = await res.json();
      if (res.status === 402) { alert("Poin tidak cukup!"); setLoading(false); return; }
      if (!res.ok) throw new Error(json.message);
      
      setResult(json.result);
      
      // Simpan & Refresh
      await fetch('/api/user/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'kalkulator-ads',
          title: `Forecasting - Rp ${data.productPrice}`,
          inputData: data,
          resultData: json.result 
        })
      });
      fetchHistory();
      
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    } catch (err) { alert("Gagal kalkulasi: " + err.message); } finally { setLoading(false); }
  };

  const handleLoadHistory = (item) => {
    setActiveHistoryId(item._id);
    if(item.inputData) setData(item.inputData);
    const output = item.resultData?.text || item.resultData;
    setResult(output || "");
    setIsHistoryOpen(false); // Tutup drawer mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = async (e, id) => {
    e.stopPropagation();
    if(!confirm("Hapus laporan ini?")) return;
    try {
        await fetch(`/api/user/history?id=${id}`, { method: 'DELETE' }); 
        fetchHistory();
        if (result && activeHistoryId === id) setResult('');
    } catch(err){}
  };

  // --- COMPONENT: HISTORY LIST ---
  const HistoryList = () => (
    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 h-full">
        {history.length === 0 ? (
            <div className="text-center py-10 opacity-50">
                <History size={24} className="mx-auto mb-2 text-slate-300" />
                <p className="text-[10px] font-bold text-slate-400 uppercase">Belum ada riwayat</p>
            </div>
        ) : (
            history.map((item) => (
                <div 
                    key={item._id} 
                    onClick={() => handleLoadHistory(item)} 
                    className={`group p-3 rounded-xl border cursor-pointer transition-all active:scale-95
                        ${activeHistoryId === item._id 
                            ? 'bg-emerald-50 border-emerald-200 shadow-sm ring-1 ring-emerald-100' 
                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'}
                    `}
                >
                    <div className="flex justify-between items-center mb-1.5 pb-1.5 border-b border-dashed border-slate-100 group-hover:border-slate-200">
                        <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 group-hover:text-emerald-600">
                            {new Date(item.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                        </span>
                        <button onClick={(e) => handleDeleteHistory(e, item._id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                            <Trash2 size={12} />
                        </button>
                    </div>
                    <h4 className={`text-[10px] font-bold leading-tight line-clamp-2 ${activeHistoryId === item._id ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {item.title || "Kalkulasi Ads"}
                    </h4>
                </div>
            ))
        )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-85px)] md:h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-12 gap-6 font-poppins antialiased text-slate-900 pb-2 md:pb-4 relative bg-[#F8FAFC]">
      
      {/* --- SIDEBAR KIRI (DESKTOP) --- */}
      <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 h-full overflow-hidden">
         {/* CARD 1: INFO & POIN */}
         <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm shrink-0">
            <h1 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-3 text-emerald-900">
                <Calculator className="w-4 h-4 text-emerald-600 fill-emerald-100" /> Kalkulator Ads
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl w-full justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Biaya: {config.creditCost} Poin / Hitung
            </div>
         </div>

         {/* CARD 2: RIWAYAT (FILL HEIGHT) */}
         <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                <History size={14} /> Riwayat Kalkulasi
            </h3>
            <HistoryList />
         </div>
      </div>

      {/* --- MOBILE DRAWER (HISTORY) --- */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsHistoryOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col border-l border-slate-100 ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-emerald-900">
                <History size={16} className="text-emerald-600" /> Riwayat
             </h3>
             <button onClick={() => setIsHistoryOpen(false)} className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-rose-500"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50"><HistoryList /></div>
      </div>

      {/* --- KONTEN KANAN (FORM & HASIL) --- */}
      <div className="lg:col-span-9 h-full flex flex-col overflow-y-auto custom-scrollbar space-y-6 pr-1 md:pr-4">
        
        {/* HEADER MOBILE ONLY */}
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Calculator size={16}/></div>
                Kalkulator Ads
            </div>
            <button onClick={() => setIsHistoryOpen(true)} className="p-2 bg-slate-50 rounded-lg text-slate-500"><History size={18}/></button>
        </div>

        {/* FORM CARD */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 shrink-0">
            <div className="mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-800 mb-1">Input Data Keuangan</h2>
                <p className="text-xs text-slate-500">Hitung potensi cuan dan batas aman (BEP) iklan Anda.</p>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-8">
              {/* INPUTS HARGA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Wallet size={14} className="text-emerald-500" /> Harga Jual Produk
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Rp</span>
                        <input type="text" placeholder="250.000" value={data.productPrice} onChange={(e) => handleInputChange(e, 'productPrice')} className="w-full pl-10 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-sm" required />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Coins size={14} className="text-rose-500" /> Modal Produk (HPP)
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Rp</span>
                        <input type="text" placeholder="100.000" value={data.cogs} onChange={(e) => handleInputChange(e, 'cogs')} className="w-full pl-10 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-sm" required />
                    </div>
                </div>
              </div>

              {/* INPUTS BUDGET */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Budget Iklan</label>
                    <input type="text" value={data.adBudget} onChange={(e) => handleInputChange(e, 'adBudget')} placeholder="1.000.000" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Target Sales (Qty)</label>
                    <input type="number" value={data.targetSales} onChange={(e) => handleInputChange(e, 'targetSales')} placeholder="100" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ekspektasi CPR</label>
                    <input type="text" value={data.expectedCpr} onChange={(e) => handleInputChange(e, 'expectedCpr')} placeholder="20.000" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition-all" />
                </div>
              </div>

              {/* TOMBOL */}
              <button type="submit" disabled={loading || !config.isActive} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><TrendingUp size={18} className="group-hover:scale-110 transition-transform"/> HITUNG POTENSI CUAN</>}
              </button>
            </form>
        </div>

        {/* HASIL ANALISA */}
        <div ref={resultRef} className="pb-10">
          {result && (
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="bg-slate-900 px-8 py-5 flex justify-between items-center border-b border-slate-800">
                      <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                          <PieChart size={16} className="text-emerald-400" /> Hasil Analisa
                      </h3>
                      <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-emerald-300 border border-white/10">AI REPORT</div>
                  </div>
                  <div className="p-8 md:p-10 prose prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase prose-strong:text-emerald-600 prose-strong:font-bold prose-p:font-medium prose-p:text-slate-600 leading-relaxed prose-ul:marker:text-emerald-500">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                  </div>
              </div>
          )}
        </div>

      </div>
    </div>
  );
}