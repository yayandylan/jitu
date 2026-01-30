"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm'; 
import { 
  GitMerge, Loader2, Upload, Globe, Link as LinkIcon, 
  AlertCircle, Gauge, Sparkles, Image as ImageIcon, X, History 
} from 'lucide-react';
import ToolHistory from '@/components/ToolHistory'; // Pastikan komponen ini ada

export default function AuditIklanLPPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [lpLink, setLpLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  
  const config = { creditCost: 80, isActive: true }; // Hardcode config sementara biar cepat

  // 1. FETCH HISTORY
  const fetchHistory = async () => {
    try {
      // Pastikan API history support query param ?tool=...
      const res = await fetch('/api/history?tool=audit-iklan-lp');
      const data = await res.json();
      if (data.history) setHistory(data.history); // Sesuaikan dengan return API
    } catch (err) { console.error("Gagal load history"); }
  };

  useEffect(() => { fetchHistory(); }, []);

  // 2. ANALYZE HANDLER
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file || !lpLink) return alert("Upload gambar & masukkan link dulu!");
    
    setLoading(true); setResult('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('lpLink', lpLink);

    try {
      const res = await fetch('/api/ai/vision', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Gagal analisa");
      
      setResult(data.result);
      fetchHistory(); // Refresh history
    } catch (err) { alert(err.message); } 
    finally { setLoading(false); }
  };

  // 3. RESTORE HISTORY (FIXED)
  const handleSelectHistory = (item) => {
    // Restore Input
    if (item.inputData?.lpLink) setLpLink(item.inputData.lpLink);
    
    // Restore Result
    // Karena di DB disimpan { text: "..." }, kita ambil property .text
    // Fallback: jika ternyata tersimpan string langsung (data lama), pakai langsung
    const output = item.resultData?.text || item.resultData;
    setResult(output);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = async (id) => {
    if(!confirm("Hapus?")) return;
    await fetch(`/api/history?id=${id}`, { method: 'DELETE' }); 
    fetchHistory();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 font-poppins antialiased text-slate-900">
      
      {/* KIRI: INPUT & RESULT */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold flex items-center gap-3 italic">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                <GitMerge className="w-6 h-6 text-white" />
            </div>
            Ad & LP <span className="text-indigo-600">Synchronizer</span>
          </h1>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Cek keselarasan Iklan vs Landing Page dengan Vision AI.</p>
        </div>

        {/* Form */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <form onSubmit={handleAnalyze} className="space-y-8">
            {/* Upload */}
            <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon size={14} className="text-indigo-500" /> 1. Upload Kreatif Iklan
                </label>
                {!preview ? (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all group relative">
                        <Upload className="w-10 h-10 text-slate-300 mb-3 group-hover:text-indigo-500 transition-all" />
                        <p className="text-xs font-bold text-slate-500 uppercase">Klik Upload Gambar</p>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                            const f = e.target.files[0];
                            if(f) { setFile(f); setPreview(URL.createObjectURL(f)); }
                        }} />
                    </label>
                ) : (
                    <div className="relative h-64 rounded-[2rem] bg-slate-900 border-2 border-indigo-500 flex items-center justify-center">
                        <img src={preview} className="max-h-full max-w-full object-contain" alt="Preview" />
                        <button type="button" onClick={() => {setFile(null); setPreview(null);}} className="absolute top-4 right-4 p-2 bg-white/20 text-white rounded-full hover:bg-rose-500 backdrop-blur-md"><X size={16}/></button>
                    </div>
                )}
            </div>

            {/* Link */}
            <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Globe size={14} className="text-indigo-500" /> 2. Link Landing Page
                </label>
                <div className="relative">
                    <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input required type="url" value={lpLink} onChange={(e) => setLpLink(e.target.value)} placeholder="https://website.com/promo" className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white transition-all" />
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin"/> : <><Gauge size={18}/> ANALISA SEKARANG <span className="bg-white/20 px-2 py-0.5 rounded text-[9px]">-{config.creditCost} pts</span></>}
            </button>
          </form>
        </div>

        {/* Result */}
        {result && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-[#0F172A] p-6 text-white flex justify-between items-center">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} className="text-indigo-400"/> AI Analysis Report</h3>
                    <div className="px-3 py-1 bg-indigo-500/20 rounded-full text-[9px] font-bold border border-indigo-500/30 text-indigo-300">VISION MODEL</div>
                </div>
                <div className="p-10 prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-slate-800 prose-p:text-slate-600">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
            </div>
        )}
      </div>

      {/* KANAN: HISTORY */}
      <div className="lg:col-span-1">
        <div className="sticky top-8">
            <ToolHistory 
                title="Riwayat Audit" 
                icon={<History size={16}/>}
                historyData={history} 
                onSelect={handleSelectHistory} 
                onDelete={handleDeleteHistory} 
            />
        </div>
      </div>
    </div>
  );
}