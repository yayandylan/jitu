"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm'; 
import { Clapperboard, Loader2, Sparkles, Wallet, Megaphone, PenTool, Users, Video } from 'lucide-react';
import ToolHistory from '../../../../components/ToolHistory'; 

export default function MagicAdScriptPage() {
  const [product, setProduct] = useState('');
  const [audience, setAudience] = useState('');
  const [benefit, setBenefit] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [userCredits, setUserCredits] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState({ creditCost: 50, isActive: true });
  const [loadingConfig, setLoadingConfig] = useState(true);
  
  const STORAGE_KEY = 'history_magic_script'; 

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/tools');
        const data = await res.json();
        const myTool = data.find(t => t.slug === 'magic-ad-script'); // Pastikan slug di DB 'magic-ad-script'
        if (myTool) setConfig(myTool);
      } catch (err) { console.error("Gagal load config"); } finally { setLoadingConfig(false); }
    };
    fetchConfig();
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!product || !audience || !benefit || !config.isActive) return;
    setLoading(true); setResult('');

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
      if (res.status === 402) { alert("Poin tidak cukup!"); setLoading(false); return; }
      if (!res.ok) throw new Error(data.message);
      
      setResult(data.result);
      if (data.remainingCredits !== undefined) setUserCredits(data.remainingCredits);

      const newHistoryItem = {
        id: Date.now(),
        title: product.substring(0, 40) + "...",
        date: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
        result: data.result,
        inputs: { product, audience, benefit }
      };
      const updated = [newHistoryItem, ...history];
      setHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    } catch (err) { alert("Gagal: " + err.message); } finally { setLoading(false); }
  };

  const handleSelectHistory = (item) => {
    setProduct(item.inputs.product); 
    setAudience(item.inputs.audience); 
    setBenefit(item.inputs.benefit);
    setResult(item.result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = (id) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated); localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      
      {/* KOLOM KIRI: WORKSPACE */}
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <div className="bg-violet-600 p-2 rounded-xl shadow-lg shadow-violet-200">
                <Clapperboard className="w-6 h-6 text-white" />
            </div>
            Magic Ad Script
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Generate naskah iklan <span className="text-violet-600 font-bold">Hypnotic Copywriting</span> untuk Meta Ads & TikTok dalam hitungan detik.
          </p>
        </div>

        {/* INPUT FORM */}
        <div className={`bg-white p-6 md:p-8 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 transition-all ${!config.isActive ? 'opacity-50 pointer-events-none' : ''}`}>
          <form onSubmit={handleAnalyze} className="space-y-6">
            
            {/* Input Produk */}
            <div>
                <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-violet-500" /> Nama Produk / Jasa
                </label>
                <input
                    type="text"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-violet-500 focus:bg-white transition-all"
                    placeholder="Contoh: Pemutih Gigi Instan..."
                    value={product} onChange={(e) => setProduct(e.target.value)} required
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Input Audience */}
                <div>
                    <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" /> Target Audience
                    </label>
                    <textarea
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-violet-500 focus:bg-white transition-all h-32 resize-none"
                        placeholder="Contoh: Wanita karir usia 25-35 tahun yang sering meeting..."
                        value={audience} onChange={(e) => setAudience(e.target.value)} required
                    />
                </div>
                {/* Input Benefit */}
                <div>
                    <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Keunggulan / USP
                    </label>
                    <textarea
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-violet-500 focus:bg-white transition-all h-32 resize-none"
                        placeholder="Contoh: Hasil terlihat dalam 1x pakai, aman BPOM, tanpa rasa ngilu..."
                        value={benefit} onChange={(e) => setBenefit(e.target.value)} required
                    />
                </div>
            </div>
            
            <button
              type="submit" disabled={loading || !config.isActive}
              className={`w-full text-white py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg transition-all flex items-center justify-center gap-3 group ${loading ? 'bg-slate-400' : 'bg-violet-600 hover:bg-violet-700 hover:shadow-violet-500/30'}`}
            >
              {loading ? (
                <> <Loader2 className="animate-spin w-5 h-5" /> Meracik Mantra... </>
              ) : (
                <>
                    <PenTool className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                    Generate Magic Script
                    {config.isActive && (
                      <span className="bg-violet-800/40 text-[10px] font-bold py-1 px-2.5 rounded-lg text-violet-50 ml-1 border border-violet-400/30 normal-case tracking-normal">
                        -{config.creditCost} Poin
                      </span>
                    )}
                </>
              )}
            </button>
          </form>
        </div>

        {/* --- HASIL GENERATE --- */}
        {result && (
          <div className="bg-white rounded-[1.5rem] shadow-2xl shadow-violet-900/10 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Header Hasil */}
            <div className="bg-[#0F172A] p-6 flex justify-between items-center text-white">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                <div className="bg-violet-500/20 p-1.5 rounded-lg"><Clapperboard className="w-4 h-4 text-violet-400" /></div>
                Script Result
              </h3>
              {userCredits !== null && <span className="text-[10px] font-bold text-slate-400 uppercase">Sisa Poin: {userCredits}</span>}
            </div>
            
            <div className="p-6 md:p-10">
              <article className="prose prose-sm max-w-none">
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    components={{
                        // Judul Utama
                        h1: ({node, ...props}) => (
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight mb-6 border-b-4 border-violet-500 pb-4 inline-block" {...props} />
                        ),
                        // Sub Judul (Variasi A, B, C)
                        h2: ({node, ...props}) => (
                            <div className="bg-violet-50 border border-violet-100 p-4 rounded-xl flex items-center gap-3 mt-10 mb-4 shadow-sm">
                                <div className="bg-violet-600 p-1 rounded-full shrink-0"><Video size={14} className="text-white"/></div>
                                <h2 className="text-lg font-bold text-violet-900 uppercase tracking-widest m-0" {...props} />
                            </div>
                        ),
                        // Visual Cues (Blockquote)
                        blockquote: ({node, ...props}) => (
                            <div className="bg-[#0F172A] p-5 rounded-xl border-l-4 border-violet-500 my-4 shadow-md flex items-start gap-3">
                                <Sparkles className="w-5 h-5 text-violet-400 mt-1 shrink-0" />
                                <div className="text-slate-300 font-medium text-sm italic leading-relaxed" {...props} />
                            </div>
                        ),
                        // Formatting Dasar
                        p: ({node, ...props}) => (
                            <p className="text-slate-600 leading-7 mb-4 font-medium" {...props} />
                        ),
                        strong: ({node, ...props}) => (
                            <strong className="font-bold text-violet-700 bg-violet-50 px-1 rounded" {...props} />
                        ),
                        hr: ({node, ...props}) => (
                            <hr className="my-10 border-slate-200 border-dashed" {...props} />
                        ),
                    }}
                >
                    {result}
                </ReactMarkdown>
              </article>
            </div>
          </div>
        )}
      </div>

      {/* KOLOM KANAN: HISTORY */}
      <div className="lg:col-span-1">
        <div className="sticky top-8 h-[calc(100vh-100px)]">
            <ToolHistory 
                title="Riwayat Script" 
                historyData={history} 
                onSelect={handleSelectHistory} 
                onDelete={handleDeleteHistory} 
            />
        </div>
      </div>
    </div>
  );
}