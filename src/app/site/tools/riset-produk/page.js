"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm'; 
import { Search, Loader2, TrendingUp, BrainCircuit, Sparkles, Trophy, Save, Trash2, Clock } from 'lucide-react';
import ToolHistory from '@/components/ToolHistory'; // Pastikan komponen ini ada

export default function RisetProdukPage() {
  const [idea, setIdea] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  
  // State Data
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState({ creditCost: 50, isActive: true });
  const [loadingConfig, setLoadingConfig] = useState(true);

  // 1. FUNGSI LOAD DATA (Config & History)
  const fetchData = async () => {
    try {
        // A. Ambil Config Tool (Harga Poin)
        const confRes = await fetch('/api/admin/tools');
        if(confRes.ok) {
            const tools = await confRes.json();
            const myTool = tools.find(t => t.slug === 'riset-produk');
            if (myTool) setConfig(myTool);
        }

        // B. Ambil History User untuk Tool Ini
        const histRes = await fetch('/api/user/history?tool=riset-produk');
        if(histRes.ok) {
            const histData = await histRes.json();
            setHistory(histData.data || []);
        }
    } catch (err) {
        console.error("Gagal memuat data:", err);
    } finally {
        setLoadingConfig(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // 2. LOGIKA UTAMA (Generate AI)
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!idea || !skills || !config.isActive) return;
    setLoading(true); setResult('');

    try {
      // Step A: Request ke AI Endpoint
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
          alert("Poin tidak cukup! Silakan Top Up."); 
          setLoading(false); 
          return; 
      }
      
      if (!res.ok) throw new Error(data.message || "Gagal generate");
      
      // Step B: Tampilkan Hasil
      setResult(data.result);

      // Step C: Simpan ke Database History (PENTING!)
      // Kita simpan manual agar frontend langsung update tanpa reload
      const saveRes = await fetch('/api/user/history', { // Perbaikan path API history (POST)
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'riset-produk',
          title: idea.substring(0, 40) + "...", // Judul otomatis
          inputData: { idea, skills },
          resultData: data.result 
        })
      });

      if(saveRes.ok) {
          // Refresh list history agar data baru muncul di sidebar
          const histRes = await fetch('/api/user/history?tool=riset-produk');
          const histData = await histRes.json();
          setHistory(histData.data || []);
      }

    } catch (err) { 
        alert("Terjadi kesalahan: " + err.message); 
    } finally { 
        setLoading(false); 
    }
  };

  // 3. LOGIKA INTERAKSI HISTORY
  const handleSelectHistory = (item) => {
    // Restore Input
    if (item.inputData) {
        setIdea(item.inputData.idea || ''); 
        setSkills(item.inputData.skills || '');
    }
    // Restore Output (Support format lama/baru)
    const output = typeof item.resultData === 'object' ? item.resultData.text : item.resultData;
    setResult(output || '');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = async (id) => {
    if(!confirm("Hapus riwayat ini permanen?")) return;
    try {
      const res = await fetch(`/api/user/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Update state lokal biar cepat (tanpa fetch ulang)
        setHistory(prev => prev.filter(h => h._id !== id));
      }
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 font-poppins antialiased text-slate-900">
      
      {/* AREA UTAMA (KIRI) */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                <Search className="w-6 h-6 text-white" />
            </div>
            Riset Produk Winning
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Temukan produk "Blue Ocean" yang cocok dengan skill Anda.
          </p>
        </div>

        {/* FORM INPUT */}
        <div className={`bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 transition-all ${!config.isActive ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-blue-500" /> Skill / Aset
                    </label>
                    <textarea
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all h-32 resize-none placeholder-slate-400"
                        placeholder="Contoh: Jago desain Canva, punya 1000 followers IG..."
                        value={skills} onChange={(e) => setSkills(e.target.value)} required
                    />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Ide Awal
                    </label>
                    <textarea
                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all h-32 resize-none placeholder-slate-400"
                        placeholder="Contoh: Jualan template undangan nikah..."
                        value={idea} onChange={(e) => setIdea(e.target.value)} required
                    />
                </div>
            </div>
            <button
              type="submit" disabled={loading || !config.isActive}
              className={`w-full text-white py-5 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-lg transition-all flex items-center justify-center gap-3 group active:scale-95 ${loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}
            >
              {loading ? (
                <><Loader2 className="animate-spin w-5 h-5" /> Sedang Menganalisa...</>
              ) : (
                <><TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" /> Mulai Riset AI
                  <span className="bg-blue-800/40 text-[9px] font-bold py-1 px-2.5 rounded-lg text-blue-50 ml-1">-{config.creditCost} Poin</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* HASIL GENERATE (PREMIUM UI) */}
        {result && (
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Hasil */}
                <div className="bg-[#0F172A] p-6 flex justify-between items-center text-white border-b border-slate-800">
                    <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                        <div className="bg-emerald-500/20 p-1.5 rounded-lg"><Trophy className="w-4 h-4 text-emerald-400" /></div>
                        Blueprint Produk Winning
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={() => navigator.clipboard.writeText(result)} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors" title="Salin Teks">
                            <Save size={16} />
                        </button>
                    </div>
                </div>
                
                {/* Konten Markdown */}
                <div className="p-8 md:p-12 prose prose-slate prose-sm max-w-none 
                    prose-headings:font-bold prose-headings:text-slate-900 prose-headings:tracking-tight
                    prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-4
                    prose-p:text-slate-600 prose-p:leading-loose
                    prose-strong:text-blue-600 prose-strong:font-black
                    prose-ul:list-disc prose-ul:pl-5 prose-li:marker:text-blue-300
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-slate-700
                ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
            </div>
        )}
      </div>

      {/* KOLOM KANAN: HISTORY */}
      <div className="lg:col-span-1">
        <div className="sticky top-8">
            <ToolHistory 
                title="Riwayat Riset" 
                historyData={history} 
                onSelect={handleSelectHistory} 
                onDelete={handleDeleteHistory} 
            />
        </div>
      </div>
    </div>
  );
}