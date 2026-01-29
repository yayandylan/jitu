"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm'; 
import { Search, Loader2, TrendingUp, BrainCircuit, Sparkles, Trophy, Target } from 'lucide-react';
import ToolHistory from '../../../../components/ToolHistory'; 

export default function RisetProdukPage() {
  const [idea, setIdea] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [userCredits, setUserCredits] = useState(null);
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState({ creditCost: 50, isActive: true });
  const [loadingConfig, setLoadingConfig] = useState(true);

  // 1. FUNGSI AMBIL HISTORY DARI DATABASE
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history?tool=riset-produk');
      const data = await res.json();
      if (data.data) setHistory(data.data);
    } catch (err) {
      console.error("Gagal load history dari database");
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/tools');
        const data = await res.json();
        const myTool = data.find(t => t.slug === 'riset-produk');
        if (myTool) setConfig(myTool);
      } catch (err) { console.error("Gagal load config"); } finally { setLoadingConfig(false); }
    };
    
    fetchConfig();
    fetchHistory(); // Panggil fungsi ambil history database
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!idea || !skills || !config.isActive) return;
    setLoading(true); setResult('');

    try {
      // PROSES ANALISA AI
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'riset-produk', data: { idea, skills } }),
      });

      const data = await res.json();
      if (res.status === 402) { alert("Poin tidak cukup!"); setLoading(false); return; }
      if (!res.ok) throw new Error(data.message);
      
      setResult(data.result);
      if (data.remainingCredits !== undefined) setUserCredits(data.remainingCredits);

      // 2. SIMPAN HASIL KE DATABASE (Bukan LocalStorage)
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'riset-produk',
          title: idea.substring(0, 40),
          inputData: { idea, skills },
          resultData: data.result // Simpan hasil AI-nya
        })
      });

      // Refresh riwayat agar data terbaru muncul di samping
      fetchHistory();

    } catch (err) { alert("Gagal: " + err.message); } finally { setLoading(false); }
  };

  const handleSelectHistory = (item) => {
    // Sesuaikan dengan struktur model History.js kita
    setIdea(item.inputData.idea); 
    setSkills(item.inputData.skills); 
    setResult(item.resultData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 3. FUNGSI HAPUS DARI DATABASE
  const handleDeleteHistory = async (id) => {
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchHistory(); // Refresh list setelah hapus
      }
    } catch (err) {
      alert("Gagal menghapus riwayat");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      <div className="lg:col-span-2 space-y-8">
        {/* ... (Bagian Header & Form Input Sama seperti sebelumnya) ... */}
        {/* Pastikan form Bapak tetap ada di sini */}

        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                <Search className="w-6 h-6 text-white" />
            </div>
            Riset Produk Winning
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Temukan produk "Blue Ocean" yang cocok dengan skill Anda.
          </p>
        </div>

        <div className={`bg-white p-6 md:p-8 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 transition-all ${!config.isActive ? 'opacity-50 pointer-events-none' : ''}`}>
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-blue-500" /> Skill / Aset
                </label>
                <textarea
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all h-32 resize-none"
                    placeholder="Contoh: Jago nulis, punya 1000 email list..."
                    value={skills} onChange={(e) => setSkills(e.target.value)} required
                />
                </div>
                <div>
                <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Ide Awal
                </label>
                <textarea
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all h-32 resize-none"
                    placeholder="Contoh: Ebook diet..."
                    value={idea} onChange={(e) => setIdea(e.target.value)} required
                />
                </div>
            </div>
            <button
              type="submit" disabled={loading || !config.isActive}
              className={`w-full text-white py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg transition-all flex items-center justify-center gap-3 group ${loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}
            >
              {loading ? (
                <><Loader2 className="animate-spin w-5 h-5" /> Menganalisa...</>
              ) : (
                <><TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" /> Mulai Riset AI
                  <span className="bg-blue-800/40 text-[10px] font-bold py-1 px-2.5 rounded-lg text-blue-50 ml-1">-{config.creditCost} Poin</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* HASIL GENERATE */}
        {result && (
            <div className="bg-white rounded-[1.5rem] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden">
                <div className="bg-[#0F172A] p-6 flex justify-between items-center text-white">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                        <div className="bg-emerald-500/20 p-1.5 rounded-lg"><Trophy className="w-4 h-4 text-emerald-400" /></div>
                        Blueprint Produk
                    </h3>
                </div>
                <div className="p-6 md:p-10 prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
            </div>
        )}
      </div>

      {/* KOLOM KANAN: HISTORY (Sinkron Database) */}
      <div className="lg:col-span-1">
        <div className="sticky top-8 h-[calc(100vh-100px)]">
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