"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm'; 
import { Wand2, Loader2, PlayCircle, Image as ImageIcon, FileText, Save, History, Trash2, Megaphone, Sparkles } from 'lucide-react';
import ToolHistory from '@/components/ToolHistory'; 

export default function MagicAdScriptPage() {
  // Input State
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [benefit, setBenefit] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  
  // Data State
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState({ creditCost: 50, isActive: true });
  
  // --- 1. LOAD DATA ---
  const fetchConfig = async () => {
    try {
        const confRes = await fetch('/api/admin/tools').catch(() => null);
        if(confRes?.ok) {
            const tools = await confRes.json();
            const myTool = tools.find(t => t.slug === 'magic-ad-script');
            if (myTool) setConfig(myTool);
        }
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async () => {
    try {
        const histRes = await fetch('/api/user/history?tool=magic-ad-script').catch(() => null);
        if(histRes?.ok) {
            const histData = await histRes.json();
            setHistory(Array.isArray(histData.data) ? histData.data : []);
        }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { 
      fetchConfig();
      fetchHistory(); 
  }, []);

  // --- 2. GENERATE AI ---
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!product || !audience || !benefit || !config.isActive) return;
    
    setLoading(true); 
    setResult(''); 
    window.scrollTo({ top: 400, behavior: 'smooth' });

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            type: 'magic-ad-script', 
            data: { product, audience, benefit } 
        }),
      });

      const data = await res.json();
      
      if (res.status === 402) { 
          alert("Poin habis! Top up dulu yuk."); 
          setLoading(false); 
          return; 
      }
      
      if (!res.ok) throw new Error(data.message || "Gagal generate");
      
      setResult(data.result);

      // Save History
      const saveRes = await fetch('/api/user/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'magic-ad-script',
          title: product.substring(0, 30) + "...", 
          inputData: { product, audience, benefit },
          resultData: data.result 
        })
      });

      if(saveRes.ok) await fetchHistory(); 

    } catch (err) { 
        alert("Error: " + err.message); 
    } finally { 
        setLoading(false); 
    }
  };

  // --- 3. HELPER ---
  const handleSelectHistory = (item) => {
    if (item.inputData) {
        setProduct(item.inputData.product || '');
        setAudience(item.inputData.audience || '');
        setBenefit(item.inputData.benefit || '');
    }
    const output = typeof item.resultData === 'object' ? item.resultData.text : item.resultData;
    setResult(output || '');
    setTimeout(() => {
        const resultSection = document.getElementById('result-section');
        if(resultSection) resultSection.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteHistory = async (id) => {
    if(!confirm("Hapus materi iklan ini?")) return;
    try {
      const res = await fetch(`/api/user/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) setHistory(prev => prev.filter(h => h._id !== id));
    } catch (err) { alert("Gagal hapus"); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20 font-poppins antialiased text-slate-900">
      
      {/* --- KIRI: INPUT FORM (7 Kolom) --- */}
      <div className="lg:col-span-7 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
            <div className="bg-violet-600 p-2 rounded-xl shadow-lg shadow-violet-200">
                <Wand2 className="w-6 h-6 text-white" />
            </div>
            Magic Ad Generator
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Buat konten iklan lengkap (Video, Gambar, Caption) dalam hitungan detik.
          </p>
        </div>

        {/* TIPS BOX */}
        <div className="bg-violet-50 border border-violet-100 p-5 rounded-2xl flex gap-4">
            <Sparkles className="w-6 h-6 text-violet-600 shrink-0 mt-1" />
            <div className="text-xs text-violet-800 leading-relaxed">
                <strong className="block mb-1 text-violet-900 uppercase tracking-wider">Formula Iklan Winning:</strong>
                <p>Pastikan "Keunggulan" yang Anda tulis benar-benar menyelesaikan masalah "Target Audiens" Anda. Semakin spesifik, semakin tajam hasilnya.</p>
            </div>
        </div>

        {/* FORM INPUT */}
        <div className={`bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 transition-all ${!config.isActive ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <form onSubmit={handleAnalyze} className="space-y-5">
            
            <div>
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 block">
                    📦 Nama & Deskripsi Produk
                </label>
                <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-violet-500 focus:bg-white transition-all placeholder-slate-400"
                    placeholder="Contoh: Serum Wajah Glowing X5"
                    value={product} onChange={(e) => setProduct(e.target.value)} required
                />
            </div>

            <div>
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 block">
                    🎯 Target Audiens
                </label>
                <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-violet-500 focus:bg-white transition-all placeholder-slate-400"
                    placeholder="Contoh: Wanita karir usia 25-35 yang sibuk dan wajah kusam"
                    value={audience} onChange={(e) => setAudience(e.target.value)} required
                />
            </div>

            <div>
                <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-2 block">
                    💎 Keunggulan Utama (USP)
                </label>
                <textarea
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-violet-500 focus:bg-white transition-all h-28 resize-none placeholder-slate-400"
                    placeholder="Contoh: Mencerahkan wajah dalam 7 hari, bahan alami, tidak lengket..."
                    value={benefit} onChange={(e) => setBenefit(e.target.value)} required
                />
            </div>
            
            <button
              type="submit" disabled={loading || !config.isActive}
              className={`w-full text-white py-5 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg transition-all flex items-center justify-center gap-3 group active:scale-95 
              ${loading ? 'bg-slate-800 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700 hover:shadow-violet-600/30'}`}
            >
              {loading ? (
                <><Loader2 className="animate-spin w-5 h-5" /> Meracik Mantra Iklan...</>
              ) : (
                <><Megaphone className="w-5 h-5 group-hover:scale-110 transition-transform" /> Generate Iklan
                  <span className="bg-white/20 text-[9px] font-bold py-1 px-2.5 rounded-lg text-white ml-1">-{config.creditCost} Poin</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* --- KANAN: HASIL & HISTORY (5 Kolom) --- */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* LOADING STATE */}
        {loading && (
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col items-center justify-center text-center h-[400px]">
                <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
                <h3 className="text-lg font-black text-slate-800 animate-pulse">Sedang Menulis Script...</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-xs">AI sedang menyiapkan konsep video, desain gambar, dan caption yang menghipnotis.</p>
             </div>
        )}

        {/* HASIL GENERATE */}
        {!loading && result && (
            <div id="result-section" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-violet-900/10 border border-slate-100 overflow-hidden relative">
                    
                    {/* Header Hasil */}
                    <div className="bg-[#0F172A] p-5 flex justify-between items-center text-white border-b border-slate-800 sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <div className="bg-violet-500/20 p-2 rounded-xl"><Wand2 className="w-5 h-5 text-violet-400" /></div>
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-violet-400">Creative Ad Kit</h3>
                                <p className="text-[9px] text-slate-400 font-medium">Siap Posting</p>
                            </div>
                        </div>
                        <button onClick={() => navigator.clipboard.writeText(result)} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95">
                            <Save size={14} /> Simpan
                        </button>
                    </div>

                    {/* Konten Markdown */}
                    <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({node, ...props}) => <h1 className="text-2xl font-black text-slate-900 mb-6 border-b-2 border-violet-100 pb-3 uppercase tracking-tight" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-lg font-black text-violet-800 mt-8 mb-3 flex items-center gap-2 uppercase tracking-wide bg-violet-50/50 p-2 rounded-lg" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-base font-bold text-slate-800 mt-5 mb-2 pl-2 border-l-4 border-amber-400" {...props} />,
                                p: ({node, ...props}) => <p className="text-slate-600 leading-7 mb-4 text-sm" {...props} />,
                                ul: ({node, ...props}) => <ul className="space-y-2 mb-5 list-disc list-outside ml-4 text-slate-600 marker:text-violet-500 text-sm" {...props} />,
                                ol: ({node, ...props}) => <ol className="space-y-2 mb-5 list-decimal list-outside ml-4 text-slate-600 marker:text-violet-500 font-bold text-sm" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-black text-slate-900 bg-yellow-100/80 px-1 rounded mx-0.5" {...props} />,
                            }}
                        >
                            {result}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        )}

        {/* SIDEBAR HISTORY */}
        {!loading && !result && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm h-fit">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <History size={14} /> Riwayat Iklan
                </h3>
                <div className="space-y-3">
                    {history.length === 0 ? (
                        <div className="text-center py-10 opacity-50">
                            <History size={32} className="mx-auto mb-2 text-slate-300" />
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Belum ada data</p>
                        </div>
                    ) : (
                        history.slice(0, 5).map((item) => ( 
                            <div key={item._id} onClick={() => handleSelectHistory(item)} className="group p-4 rounded-2xl bg-slate-50 hover:bg-violet-50 border border-transparent hover:border-violet-100 cursor-pointer transition-all active:scale-95 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="bg-white text-[9px] font-bold text-slate-400 px-2 py-1 rounded-lg border border-slate-100 group-hover:border-violet-200 group-hover:text-violet-600 transition-colors">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteHistory(item._id); }}
                                        className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                                <h4 className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-2 group-hover:text-violet-700 mb-1">
                                    {item.title || "Iklan Tanpa Judul"}
                                </h4>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
      </div>

    </div>
  );
}