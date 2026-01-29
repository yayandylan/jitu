"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm'; 
import { Search, Loader2, TrendingUp, BrainCircuit, Sparkles, Trophy, Save, History, AlertCircle } from 'lucide-react';
import ToolHistory from '@/components/ToolHistory'; 

export default function RisetProdukPage() {
  const [idea, setIdea] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  
  // State Data
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState({ creditCost: 50, isActive: true });
  
  // --- 1. FUNGSI LOAD DATA (Config & History) ---
  const fetchData = async () => {
    try {
        // A. Ambil Config Tool
        const confRes = await fetch('/api/admin/tools').catch(() => null);
        if(confRes?.ok) {
            const tools = await confRes.json();
            const myTool = tools.find(t => t.slug === 'riset-produk');
            if (myTool) setConfig(myTool);
        }

        // B. Ambil History (Pastikan endpoint ini benar)
        const histRes = await fetch('/api/user/history?tool=riset-produk').catch(() => null);
        if(histRes?.ok) {
            const histData = await histRes.json();
            // Validasi: pastikan data berupa array
            setHistory(Array.isArray(histData.data) ? histData.data : []);
        }
    } catch (err) {
        console.error("Error loading data:", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. LOGIKA GENERATE AI ---
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!idea || !skills || !config.isActive) return;
    setLoading(true); setResult('');

    try {
      // Step A: Request ke AI
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            type: 'riset-produk', 
            data: { idea, skills } 
        }),
      });

      const data = await res.json();
      
      if (res.status === 402) { 
          alert("Saldo Poin tidak cukup! Silakan Top Up."); 
          setLoading(false); 
          return; 
      }
      
      if (!res.ok) throw new Error(data.message || "Gagal generate");
      
      // Step B: Tampilkan Hasil
      setResult(data.result);

      // Step C: Simpan ke Database History
      // Kita lakukan fetch ulang history setelah simpan agar data sinkron
      const saveRes = await fetch('/api/user/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'riset-produk',
          title: idea.substring(0, 30) + (idea.length > 30 ? "..." : ""), // Judul singkat
          inputData: { idea, skills },
          resultData: data.result 
        })
      });

      if(saveRes.ok) {
          fetchData(); // Refresh sidebar history
      }

    } catch (err) { 
        alert("Terjadi kesalahan: " + err.message); 
    } finally { 
        setLoading(false); 
    }
  };

  // --- 3. INTERAKSI HISTORY ---
  const handleSelectHistory = (item) => {
    if (item.inputData) {
        setIdea(item.inputData.idea || ''); 
        setSkills(item.inputData.skills || '');
    }
    // Support format lama (string) atau baru (object)
    const output = typeof item.resultData === 'object' ? item.resultData.text : item.resultData;
    setResult(output || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = async (id) => {
    if(!confirm("Hapus riwayat ini?")) return;
    try {
      const res = await fetch(`/api/user/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistory(prev => prev.filter(h => h._id !== id));
      }
    } catch (err) { alert("Gagal hapus"); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 font-poppins antialiased text-slate-900">
      
      {/* AREA KIRI: INPUT & HASIL */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                <Search className="w-6 h-6 text-white" />
            </div>
            Riset Produk Winning
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2 ml-1">
            Temukan produk "Blue Ocean" yang profitabel sesuai skill Anda.
          </p>
        </div>

        {/* Form Input */}
        <div className={`bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 transition-all ${!config.isActive ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-blue-500" /> Aset & Skill
                    </label>
                    <textarea
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all h-32 resize-none placeholder-slate-400"
                        placeholder="Contoh: Saya jago desain grafis, punya 2k followers IG, modal 500rb..."
                        value={skills} onChange={(e) => setSkills(e.target.value)} required
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Ide Dasar (Opsional)
                    </label>
                    <textarea
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all h-32 resize-none placeholder-slate-400"
                        placeholder="Contoh: Pengen jualan jasa undangan digital tapi yang beda..."
                        value={idea} onChange={(e) => setIdea(e.target.value)} required
                    />
                </div>
            </div>
            
            <button
              type="submit" disabled={loading || !config.isActive}
              className={`w-full text-white py-5 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg transition-all flex items-center justify-center gap-3 group active:scale-95 
              ${loading ? 'bg-slate-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30'}`}
            >
              {loading ? (
                <><Loader2 className="animate-spin w-5 h-5" /> Sedang Menganalisa...</>
              ) : (
                <><TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" /> Mulai Riset
                  <span className="bg-white/20 text-[9px] font-bold py-1 px-2.5 rounded-lg text-white ml-1">-{config.creditCost} Poin</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* HASIL GENERATE - PREMIUM STYLING */}
        {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden">
                    
                    {/* Toolbar Hasil */}
                    <div className="bg-[#0F172A] p-5 flex justify-between items-center text-white border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 p-2 rounded-xl"><Trophy className="w-5 h-5 text-emerald-400" /></div>
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-400">Winning Blueprint</h3>
                                <p className="text-[9px] text-slate-400 font-medium">Generated by Jitu AI Engine v2.0</p>
                            </div>
                        </div>
                        <button onClick={() => navigator.clipboard.writeText(result)} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95">
                            <Save size={14} /> Salin
                        </button>
                    </div>

                    {/* Konten Markdown - CUSTOM STYLING AGAR TIDAK NEMPEL */}
                    <div className="p-8 md:p-12">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                                // JUDUL BESAR
                                h1: ({node, ...props}) => <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 border-b-2 border-blue-100 pb-4 uppercase tracking-tighter" {...props} />,
                                
                                // SUB-JUDUL (Biru)
                                h2: ({node, ...props}) => <h2 className="text-xl font-black text-blue-700 mt-10 mb-4 flex items-center gap-2 uppercase tracking-tight" {...props} />,
                                
                                // SUB-SUB-JUDUL
                                h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-800 mt-6 mb-3" {...props} />,
                                
                                // PARAGRAF (Renggang & Enak Dibaca)
                                p: ({node, ...props}) => <p className="text-slate-600 leading-8 mb-5 text-[15px]" {...props} />,
                                
                                // LIST (Rapi dengan bullet)
                                ul: ({node, ...props}) => <ul className="space-y-3 mb-6 list-disc list-outside ml-5 text-slate-600 marker:text-blue-500 leading-7" {...props} />,
                                ol: ({node, ...props}) => <ol className="space-y-3 mb-6 list-decimal list-outside ml-5 text-slate-600 marker:text-blue-500 font-bold leading-7" {...props} />,
                                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                
                                // HIGHLIGHT (Kuning Stabilo)
                                strong: ({node, ...props}) => <strong className="font-black text-slate-900 bg-yellow-100 px-1 rounded mx-0.5 box-decoration-clone" {...props} />,
                                
                                // QUOTE BOX (Premium Look)
                                blockquote: ({node, ...props}) => (
                                    <blockquote className="border-l-4 border-blue-500 bg-blue-50/50 p-6 rounded-r-2xl my-8 italic text-slate-700 shadow-sm relative overflow-hidden">
                                        <span className="absolute top-0 left-0 text-blue-200 text-6xl font-serif opacity-50 -translate-y-2 translate-x-1">“</span>
                                        <div className="relative z-10">{props.children}</div>
                                    </blockquote>
                                ),

                                // TABLE (Modern Zebra)
                                table: ({node, ...props}) => (
                                    <div className="overflow-x-auto my-8 rounded-2xl border border-slate-200 shadow-sm">
                                        <table className="w-full text-sm text-left" {...props} />
                                    </div>
                                ),
                                thead: ({node, ...props}) => <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs tracking-wider" {...props} />,
                                th: ({node, ...props}) => <th className="px-6 py-4 border-b border-slate-200 whitespace-nowrap" {...props} />,
                                td: ({node, ...props}) => <td className="px-6 py-4 border-b border-slate-50 bg-white hover:bg-slate-50 transition-colors" {...props} />,
                                
                                // CODE BLOCK
                                code: ({node, inline, className, children, ...props}) => {
                                    return !inline ? (
                                        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs my-4 overflow-x-auto border border-slate-800 shadow-inner">
                                            {children}
                                        </div>
                                    ) : (
                                        <code className="bg-slate-100 text-rose-500 px-1.5 py-0.5 rounded font-mono text-xs font-bold border border-slate-200" {...props}>{children}</code>
                                    )
                                }
                            }}
                        >
                            {result}
                        </ReactMarkdown>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* AREA KANAN: HISTORY (Sidebar) */}
      <div className="lg:col-span-1">
        <div className="sticky top-8 bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-sm h-fit max-h-[85vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 sticky top-0 bg-white pb-2 z-10">
                <History size={14} /> Riwayat Riset
            </h3>
            
            <div className="space-y-3">
                {history.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <History size={32} className="mx-auto mb-2 text-slate-300" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Belum ada data</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <div key={item._id} onClick={() => handleSelectHistory(item)} className="group p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-100 cursor-pointer transition-all active:scale-95 relative">
                            <div className="flex justify-between items-start mb-2">
                                <span className="bg-white text-[9px] font-bold text-slate-400 px-2 py-1 rounded-lg border border-slate-100 group-hover:border-blue-200 group-hover:text-blue-500 transition-colors">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDeleteHistory(item._id); }}
                                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                            <h4 className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-2 group-hover:text-blue-700 mb-1">
                                {item.title || "Riset Tanpa Judul"}
                            </h4>
                            <p className="text-[9px] text-slate-400 truncate">
                                Klik untuk melihat detail
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
}