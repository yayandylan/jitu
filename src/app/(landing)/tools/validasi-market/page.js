"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm'; 
import { Target, Loader2, ShieldCheck, Microscope, Users, Swords } from 'lucide-react';
import ToolHistory from '../../../../components/ToolHistory'; 

export default function ValidasiMarketPage() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [userCredits, setUserCredits] = useState(null);
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState({ creditCost: 50, isActive: true });
  const [loadingConfig, setLoadingConfig] = useState(true);

  // 1. FUNGSI AMBIL HISTORY DARI DATABASE
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history?tool=validasi-market');
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
        const myTool = data.find(t => t.slug === 'validasi-market');
        if (myTool) setConfig(myTool);
      } catch (err) { console.error("Gagal load config"); } finally { setLoadingConfig(false); }
    };
    
    fetchConfig();
    fetchHistory(); // Ambil riwayat saat halaman dimuat
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!idea || !config.isActive) return;
    setLoading(true); setResult('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'validasi-market', data: { idea } }),
      });

      const data = await res.json();
      if (res.status === 402) { alert("Poin tidak cukup!"); setLoading(false); return; }
      if (!res.ok) throw new Error(data.message);
      
      setResult(data.result);
      if (data.remainingCredits !== undefined) setUserCredits(data.remainingCredits);

      // 2. SIMPAN HASIL KE DATABASE
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'validasi-market',
          title: idea.substring(0, 40),
          inputData: { idea },
          resultData: data.result 
        })
      });

      // Refresh list riwayat
      fetchHistory();

    } catch (err) { alert("Gagal: " + err.message); } finally { setLoading(false); }
  };

  const handleSelectHistory = (item) => {
    // Sesuaikan dengan struktur MongoDB (inputData & resultData)
    setIdea(item.inputData.idea); 
    setResult(item.resultData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      
      {/* KOLOM KIRI: WORKSPACE */}
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
            <div className="bg-rose-600 p-2 rounded-xl shadow-lg shadow-rose-200">
                <Target className="w-6 h-6 text-white" />
            </div>
            Validasi Market
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Bedah potensi pasar, intip celah kompetitor, dan temukan "Angle" jualan yang mematikan.
          </p>
        </div>

        {/* INPUT FORM */}
        <div className={`bg-white p-6 md:p-8 rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 transition-all ${!config.isActive ? 'opacity-50 pointer-events-none' : ''}`}>
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div>
                <label className="text-[11px] font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Microscope className="w-4 h-4 text-rose-500" /> Detail Produk / Ide Anda
                </label>
                <textarea
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-rose-500 focus:bg-white transition-all h-40 resize-none"
                    placeholder="Contoh: Saya ingin menjual keripik pisang coklat lumer dengan branding premium khusus untuk oleh-oleh Gen Z..."
                    value={idea} onChange={(e) => setIdea(e.target.value)} required
                />
            </div>
            
            <button
              type="submit" disabled={loading || !config.isActive}
              className={`w-full text-white py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg transition-all flex items-center justify-center gap-3 group ${loading ? 'bg-slate-400' : 'bg-rose-600 hover:bg-rose-700 hover:shadow-rose-500/30'}`}
            >
              {loading ? (
                <> <Loader2 className="animate-spin w-5 h-5" /> Membedah Pasar... </>
              ) : (
                <>
                    <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                    Validasi Sekarang
                    {config.isActive && (
                      <span className="bg-rose-800/40 text-[10px] font-bold py-1 px-2.5 rounded-lg text-rose-50 ml-1 border border-rose-400/30">
                        -{config.creditCost} Poin
                      </span>
                    )}
                </>
              )}
            </button>
          </form>
        </div>

        {/* HASIL VALIDASI */}
        {result && (
          <div className="bg-white rounded-[1.5rem] shadow-2xl shadow-rose-900/10 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-[#0F172A] p-6 flex justify-between items-center text-white">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3">
                <div className="bg-rose-500/20 p-1.5 rounded-lg"><Swords className="w-4 h-4 text-rose-400" /></div>
                Laporan Intelijen Pasar
              </h3>
            </div>
            
            <div className="p-6 md:p-10 prose prose-sm max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-black text-slate-900 border-b-4 border-rose-500 pb-2 mb-6" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-lg font-bold text-slate-900 mt-8 mb-4 border-l-4 border-rose-600 pl-3" {...props} />,
                  blockquote: ({node, ...props}) => (
                    <div className="bg-slate-900 text-white p-6 rounded-2xl border-l-8 border-rose-500 my-6 shadow-lg" {...props} />
                  ),
                  li: ({node, ...props}) => (
                    <li className="bg-slate-50 p-3 rounded-xl flex gap-2 items-start mb-2 border border-slate-100" {...props} />
                  ),
                  strong: ({node, ...props}) => <strong className="text-rose-600 font-bold" {...props} />
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* KOLOM KANAN: HISTORY (Database Sync) */}
      <div className="lg:col-span-1">
        <div className="sticky top-8 h-[calc(100vh-100px)]">
            <ToolHistory 
                title="Riwayat Validasi" 
                historyData={history} 
                onSelect={handleSelectHistory} 
                onDelete={handleDeleteHistory} 
            />
        </div>
      </div>
    </div>
  );
}