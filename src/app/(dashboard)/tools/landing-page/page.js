"use client";
import { useState, useEffect } from 'react';
import { 
  LayoutTemplate, Loader2, Gift, MousePointer2, 
  UserCircle, ShoppingBag, Code, Eye, Copy, Check, 
  Smartphone, Monitor, Zap, MessageCircle, Briefcase,
  Info, AlertCircle, FileText, Quote
} from 'lucide-react';
import ToolHistory from '../../../../components/ToolHistory'; 

export default function LandingPageBuilder() {
  const [product, setProduct] = useState('');
  const [target, setTarget] = useState('');
  const [offer, setOffer] = useState('');
  const [style, setStyle] = useState('Santai & Akrab');
  const [productKnowledge, setProductKnowledge] = useState('');
  const [testimoniData, setTestimoniData] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Memulai...');
  const [result, setResult] = useState('');
  const [activeTab, setActiveTab] = useState('preview'); 
  const [viewMode, setViewMode] = useState('mobile'); 
  const [copied, setCopied] = useState(false);
  const [userCredits, setUserCredits] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState({ creditCost: 80, isActive: true });

  // 1. FUNGSI AMBIL HISTORY DARI DATABASE
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history?tool=landing-page');
      const data = await res.json();
      if (data.data) setHistory(data.data);
    } catch (err) {
      console.error("Gagal load history database");
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/tools');
        const data = await res.json();
        const myTool = data.find(t => t.slug === 'landing-page');
        if (myTool) setConfig(myTool);
      } catch (err) { console.error("Gagal load config"); }
    };
    fetchConfig();
    fetchHistory(); // Ambil history saat halaman dimuat
  }, []);

  useEffect(() => {
    if (loading) {
      const messages = [
        "🧠 Mempelajari Product Knowledge...",
        "💬 Menyusun Testimoni Asli...",
        "📝 Menulis Copywriting Persuasif...",
        "🎨 Coding Layout HTML...",
        "✨ Finalisasi..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        setLoadingMsg(messages[i]);
        i = (i + 1) % messages.length;
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!product || !target || !offer || !productKnowledge || !config.isActive) return;
    setLoading(true); setResult(''); setActiveTab('preview');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            type: 'landing-page', 
            data: { product, target, offer, style, productKnowledge, testimoniData } 
        }),
      });

      const data = await res.json();
      if (res.status === 402) { alert("Poin tidak cukup!"); setLoading(false); return; }
      if (!res.ok) throw new Error(data.message);
      
      let cleanHtml = data.result.replace(/```html/g, "").replace(/```/g, "");
      setResult(cleanHtml);
      if (data.remainingCredits !== undefined) setUserCredits(data.remainingCredits);

      // 2. SIMPAN HASIL KE DATABASE (CLOUD)
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'landing-page',
          title: product.substring(0, 30),
          inputData: { product, target, offer, style, productKnowledge, testimoniData },
          resultData: cleanHtml 
        })
      });

      fetchHistory(); // Refresh daftar riwayat

    } catch (err) { alert("Gagal: " + err.message); } finally { setLoading(false); }
  };

  const handleSelectHistory = (item) => {
    // Mapping ulang data dari Cloud ke State Input
    setProduct(item.inputData.product); 
    setTarget(item.inputData.target); 
    setOffer(item.inputData.offer);
    setProductKnowledge(item.inputData.productKnowledge || '');
    setTestimoniData(item.inputData.testimoniData || '');
    setStyle(item.inputData.style || 'Santai & Akrab');
    setResult(item.resultData); // Load HTML-nya
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = async (id) => {
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchHistory();
    } catch (err) {
      alert("Gagal menghapus riwayat");
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tones = [
    { id: 'Santai & Akrab', icon: <MessageCircle className="w-4 h-4"/>, desc: 'Gaya bercerita (Storytelling)' },
    { id: 'Profesional & Bersih', icon: <Briefcase className="w-4 h-4"/>, desc: 'Cocok untuk Jasa/Agency' },
    { id: 'Tegas & Hard Sell', icon: <Zap className="w-4 h-4"/>, desc: 'To the point, Desakan tinggi' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      
      {/* KOLOM KIRI: INPUT FORM */}
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <div className="bg-emerald-600 p-2 rounded-xl shadow-lg shadow-emerald-200">
                <LayoutTemplate className="w-6 h-6 text-white" />
            </div>
            Landing Page Builder
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Isi detail produk selengkap mungkin agar hasil generate <span className="text-emerald-600 font-bold">Akurat & Siap Iklan</span>.
          </p>
        </div>

        {/* Form Area */}
        <div className={`bg-white p-6 md:p-8 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 transition-all ${!config.isActive ? 'opacity-50 pointer-events-none' : ''}`}>
          <form onSubmit={handleAnalyze} className="space-y-8">
            
            {/* Bagian Input Form tetap sama... */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">1. Informasi Dasar</h3>
                <div>
                    <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-emerald-500" /> Nama Produk
                    </label>
                    <input
                        type="text"
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all"
                        placeholder="Contoh: Ebook Jago Ngonten 2026..."
                        value={product} onChange={(e) => setProduct(e.target.value)} required
                    />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-blue-500" /> Target Market
                        </label>
                        <textarea
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all h-28 resize-none"
                            placeholder="Siapa yang harus beli produk ini?"
                            value={target} onChange={(e) => setTarget(e.target.value)} required
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Gift className="w-4 h-4 text-rose-500" /> Penawaran / Bonus
                        </label>
                        <textarea
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all h-28 resize-none"
                            placeholder="Diskon, Bonus, Garansi..."
                            value={offer} onChange={(e) => setOffer(e.target.value)} required
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">2. Detail Produk</h3>
                <div>
                    <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-500" /> Product Knowledge
                    </label>
                    <textarea
                        className="w-full p-4 bg-amber-50/50 border-2 border-amber-100 rounded-2xl text-sm font-medium outline-none focus:border-amber-500 focus:bg-white transition-all h-40 resize-none"
                        placeholder="Jelaskan produk Anda sedetail mungkin disini..."
                        value={productKnowledge} onChange={(e) => setProductKnowledge(e.target.value)} required
                    />
                </div>
            </div>

            {/* Tombol Action */}
            <button
              type="submit" disabled={loading || !config.isActive}
              className={`w-full text-white py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg transition-all flex items-center justify-center gap-3 group ${loading ? 'bg-slate-400 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/30'}`}
            >
              {loading ? (<> <Loader2 className="animate-spin w-5 h-5" /> {loadingMsg} </>) : (<><MousePointer2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> Generate Landing Page {config.isActive && (<span className="bg-emerald-800/40 text-[10px] font-bold py-1 px-2.5 rounded-lg text-emerald-50 ml-1">-{config.creditCost} Poin</span>)}</>)}
            </button>
          </form>
        </div>

        {/* HASIL PREVIEW & CODE */}
        {result && (
          <div className="bg-white rounded-[1.5rem] shadow-2xl shadow-emerald-900/10 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-[#0F172A] p-4 flex justify-between items-center text-white border-b border-slate-800">
              <div className="flex gap-2">
                <button onClick={() => setActiveTab('preview')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'preview' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Eye size={14}/> Preview</button>
                <button onClick={() => setActiveTab('code')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'code' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Code size={14}/> Source Code</button>
              </div>
            </div>
            
            <div className="h-[650px] bg-slate-200 overflow-hidden relative flex justify-center py-6">
                {activeTab === 'preview' ? (
                    <iframe srcDoc={result} className={`bg-white shadow-2xl transition-all duration-500 ${viewMode === 'mobile' ? 'w-[375px] h-full rounded-[2rem] border-[8px] border-slate-800' : 'w-full h-full border-none'}`} title="Landing Page Preview" />
                ) : (
                    <div className="w-full h-full relative">
                        <textarea readOnly className="w-full h-full p-6 bg-[#1e293b] text-emerald-400 font-mono text-xs focus:outline-none resize-none" value={result} />
                        <button onClick={handleCopyCode} className="absolute top-4 right-4 bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-slate-100">{copied ? <Check size={14} className="text-emerald-600"/> : <Copy size={14}/>} {copied ? "Disalin!" : "Copy Code"}</button>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>

      {/* KOLOM KANAN: HISTORY (Arsip Web Cloud) */}
      <div className="lg:col-span-1">
        <div className="sticky top-8 h-[calc(100vh-100px)]">
            <ToolHistory 
                title="Arsip Web" 
                historyData={history} 
                onSelect={handleSelectHistory} 
                onDelete={handleDeleteHistory} 
            />
        </div>
      </div>
    </div>
  );
}