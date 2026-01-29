"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm'; 
import { 
  GitMerge, Loader2, Upload, Globe, Link as LinkIcon, 
  CheckCircle2, AlertCircle, Gauge, Sparkles, Image as ImageIcon, X
} from 'lucide-react';
import ToolHistory from '../../../../components/ToolHistory'; 

export default function AuditIklanLPPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [lpLink, setLpLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  // Ganti slug 'audit-iklan-lp' sesuai database Bapak
  const [config, setConfig] = useState({ creditCost: 80, isActive: true }); 

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history?tool=audit-iklan-lp');
      const data = await res.json();
      if (data.data) setHistory(data.data);
    } catch (err) { console.error("History error"); }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/tools');
        const data = await res.json();
        const myTool = data.find(t => t.slug === 'audit-iklan-lp');
        if (myTool) setConfig(myTool);
      } catch (e) { console.log("Config error"); }
    };
    fetchConfig();
    fetchHistory();
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    // Validasi: Harus ada file DAN link
    if (!file || !lpLink || !config.isActive) {
      alert("Mohon upload gambar iklan DAN masukkan link Landing Page.");
      return;
    }
    setLoading(true); setResult('');

    // Gunakan FormData untuk kirim FILE + TEXT
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lpLink', lpLink);
    formData.append('type', 'audit-iklan-lp'); // Penanda tipe tool

    try {
      // PENTING: Pastikan endpoint ini mendukung upload file (Vision API)
      const res = await fetch('/api/ai/vision', { 
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.status === 402) { alert("Poin tidak cukup!"); setLoading(false); return; }
      if (!res.ok) throw new Error(data.message || "Gagal analisa");
      
      setResult(data.result);
      fetchHistory();
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 font-poppins antialiased">
      <div className="lg:col-span-2 space-y-8">
        
        {/* HEADER */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 italic">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                <GitMerge className="w-6 h-6 text-white" />
            </div>
            Ad & LP <span className="text-indigo-600">Synchronizer</span>
          </h1>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest leading-relaxed">Analisa apakah "Janji" di iklan Bapak selaras dengan "Realita" di Landing Page.</p>
        </div>

        <div className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm ${!config.isActive ? 'opacity-50 pointer-events-none' : ''}`}>
          <form onSubmit={handleAnalyze} className="space-y-8">
            
            {/* STEP 1: UPLOAD IKLAN */}
            <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ImageIcon size={14} className="text-indigo-500" /> 1. Upload Kreatif Iklan (Gambar)
                </label>
                {!preview ? (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all group overflow-hidden">
                        <div className="flex flex-col items-center justify-center">
                            <Upload className="w-10 h-10 text-slate-300 mb-3 group-hover:text-indigo-500 group-hover:scale-110 transition-all" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600">Klik untuk upload file</p>
                        </div>
                        <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={(e) => {
                            const f = e.target.files[0];
                            if(f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                        }} />
                    </label>
                ) : (
                    <div className="relative h-64 rounded-[2rem] overflow-hidden bg-slate-900 group border-2 border-indigo-500 shadow-lg">
                        <img src={preview} className="w-full h-full object-contain" alt="Preview Iklan" />
                        <button onClick={() => {setFile(null); setPreview(null);}} className="absolute top-4 right-4 p-2 bg-rose-500/80 text-white rounded-full hover:bg-rose-600 transition-all backdrop-blur-sm"><X size={16}/></button>
                    </div>
                )}
            </div>

            {/* STEP 2: LINK LP */}
            <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Globe size={14} className="text-indigo-500" /> 2. Masukkan Link Landing Page
                </label>
                <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400"><LinkIcon size={18}/></div>
                    <input 
                        required type="url" 
                        value={lpLink}
                        onChange={(e) => setLpLink(e.target.value)}
                        placeholder="https://website-bapak.com/halaman-promo"
                        className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
                    />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400 bg-slate-50 p-3 rounded-xl">
                    <AlertCircle size={12} /> AI akan mengunjungi link ini untuk menganalisa kontennya.
                </div>
            </div>

            {/* ACTION BUTTON */}
            <button
                type="submit" disabled={loading || !file || !lpLink}
                className={`w-full py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 h-14 shadow-xl ${loading || !file || !lpLink ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-500/20 active:scale-[0.98]'}`}
            >
                {loading ? <Loader2 className="animate-spin" /> : <>Analisa Keselarasan (Sync Check) <span className="bg-white/10 px-2 py-0.5 rounded-lg ml-2">-{config.creditCost} pts</span></>}
            </button>
          </form>
        </div>

        {/* HASIL ANALISA */}
        {result && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-indigo-400" /> Laporan Message Match Expert
                    </h3>
                    <div className="px-3 py-1 bg-indigo-500/20 rounded-full text-[9px] font-bold tracking-widest uppercase border border-indigo-400/30 text-indigo-200">Deep Audit</div>
                </div>
                <div className="p-8 md:p-12 prose prose-slate prose-sm max-w-none 
                  prose-headings:text-slate-900 prose-headings:font-bold 
                  prose-strong:text-indigo-700 prose-p:font-medium prose-p:text-slate-600 leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
            </div>
        )}
      </div>

      {/* HISTORY */}
      <div className="lg:col-span-1">
        <div className="sticky top-8">
            <ToolHistory 
                title="Riwayat Sinkronisasi" 
                historyData={history} 
                onSelect={(item) => { setLpLink(item.inputData.lpLink); setResult(item.resultData); }} 
                onDelete={async (id) => { await fetch(`/api/history?id=${id}`, { method: 'DELETE' }); fetchHistory(); }} 
            />
        </div>
      </div>
    </div>
  );
}