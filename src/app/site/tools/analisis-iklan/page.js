"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect, useRef } from 'react';
import remarkGfm from 'remark-gfm'; 
import { 
  BarChart3, Loader2, Upload, History, Trash2, 
  ChevronRight, ScanLine, Image as ImageIcon, X, 
  CheckCircle, Share2, TrendingUp, FileText, Menu
} from 'lucide-react';
import Link from 'next/link';

export default function AnalisisIklanPage() {
  // --- STATE ---
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [context, setContext] = useState(''); 
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Mobile Drawer
  const [config, setConfig] = useState({ creditCost: 75, isActive: true });
  
  const resultRef = useRef(null);

  // --- FETCH DATA ---
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/user/history?tool=analisis-iklan-visual');
      const data = await res.json();
      if (data.data) setHistory(data.data);
    } catch (err) { console.error("History error"); }
  };

  useEffect(() => {
    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/admin/tools');
            const json = await res.json();
            const myTool = json.find(t => t.slug === 'analisis-iklan'); // Slug harus match DB
            if (myTool) setConfig(myTool);
        } catch (e) {}
    };
    fetchConfig();
    fetchHistory();
  }, []);

  // --- HANDLERS ---
  const handleFileChange = (e) => {
      const f = e.target.files[0];
      if (f) {
          if (f.size > 5 * 1024 * 1024) return alert("Maksimal 5MB!");
          setFile(f);
          setPreview(URL.createObjectURL(f));
      }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if(!config.isActive) return alert("Fitur sedang maintenance.");
    if (!file) return alert("Upload screenshot dashboard dulu!");
    
    setLoading(true); setResult(''); setActiveHistoryId(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'analisis-iklan-visual'); 
    if(context) formData.append('lpLink', context); // Kirim konteks user

    try {
      const res = await fetch('/api/ai/vision', { method: 'POST', body: formData });
      const data = await res.json();

      if (res.status === 402) { alert("Poin tidak cukup!"); setLoading(false); return; }
      if (!res.ok) throw new Error(data.message || "Gagal analisa");
      
      setResult(data.result);
      fetchHistory(); 
      
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) { alert(err.message); } 
    finally { setLoading(false); }
  };

  // --- HISTORY ACTIONS ---
  const handleSelectHistory = (item) => {
    setActiveHistoryId(item._id);
    const output = typeof item.resultData === 'string' ? item.resultData : item.resultData?.text;
    setResult(output || "");
    // Restore konteks jika ada
    if(item.inputData?.lpLink && item.inputData.lpLink !== '-') setContext(item.inputData.lpLink);
    
    setIsHistoryOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = async (e, id) => {
    e.stopPropagation();
    if(!confirm("Hapus data ini?")) return;
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
                <p className="text-[10px] font-bold text-slate-400 uppercase">Belum ada data</p>
            </div>
        ) : (
            history.map((item) => (
                <div 
                    key={item._id} 
                    onClick={() => handleSelectHistory(item)}
                    className={`group p-3 rounded-xl border cursor-pointer transition-all active:scale-95
                        ${activeHistoryId === item._id 
                            ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100' 
                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'}
                    `}
                >
                    <div className="flex justify-between items-center mb-1.5 pb-1.5 border-b border-dashed border-slate-100 group-hover:border-slate-200">
                        <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 group-hover:text-blue-600">
                            {new Date(item.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                        </span>
                        <button onClick={(e) => handleDeleteHistory(e, item._id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                            <Trash2 size={12} />
                        </button>
                    </div>
                    <h4 className={`text-[10px] font-bold leading-tight line-clamp-2 ${activeHistoryId === item._id ? 'text-blue-700' : 'text-slate-700'}`}>
                        {item.inputData?.lpLink && item.inputData.lpLink !== '-' ? item.inputData.lpLink : (item.inputData?.fileName || "Audit Dashboard")}
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
            <h1 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-3 text-blue-900">
                <BarChart3 className="w-4 h-4 text-blue-600 fill-blue-100" /> Analisis Iklan
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl w-full justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Biaya: {config.creditCost} Poin / Audit
            </div>
         </div>

         {/* CARD 2: RIWAYAT */}
         <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                <History size={14} /> Riwayat Audit
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
             <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-blue-900">
                <History size={16} className="text-blue-600" /> Riwayat
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
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><BarChart3 size={16}/></div>
                Audit Dashboard
            </div>
            <button onClick={() => setIsHistoryOpen(true)} className="p-2 bg-slate-50 rounded-lg text-slate-500"><History size={18}/></button>
        </div>

        {/* FORM CARD */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 shrink-0">
            <div className="mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-800 mb-1">Diagnosa Performa Iklan</h2>
                <p className="text-xs text-slate-500">Upload screenshot dashboard (Meta/TikTok/Google Ads) untuk dianalisa.</p>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-6">
                
                {/* 1. UPLOAD DASHBOARD */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={14} className="text-blue-600" /> 1. Screenshot Dashboard
                        </label>
                        {preview && (
                            <button type="button" onClick={() => {setFile(null); setPreview(null);}} className="text-[10px] text-rose-500 font-bold hover:underline">Hapus</button>
                        )}
                    </div>

                    {!preview ? (
                        <label className="flex flex-col items-center justify-center w-full h-40 md:h-52 border-2 border-dashed border-slate-300 rounded-3xl cursor-pointer bg-slate-50 hover:bg-blue-50/50 hover:border-blue-400 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                            <div className="relative z-10 flex flex-col items-center animate-in zoom-in duration-300">
                                <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform text-blue-600">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-bold text-slate-600">Upload Screenshot</p>
                                <p className="text-[9px] text-slate-400 mt-1">PNG/JPG Max 5MB</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    ) : (
                        <div className="relative h-40 md:h-52 rounded-3xl bg-slate-900 border-2 border-slate-200 flex items-center justify-center overflow-hidden group shadow-inner">
                            <img src={preview} className="max-w-full max-h-full object-contain" alt="Preview" />
                        </div>
                    )}
                </div>

                {/* 2. CONTEXT INPUT */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText size={14} className="text-blue-600" /> 2. Konteks Kampanye (Opsional)
                    </label>
                    <textarea 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-blue-500 focus:bg-white transition-all h-20 resize-none placeholder:text-slate-400 leading-relaxed"
                        placeholder="Cth: Iklan produk herbal 200rb. Target leads 50/hari. Apakah CPR 20rb kemahalan?"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                    />
                </div>

                <button type="submit" disabled={loading || !file} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group">
                    {loading ? <Loader2 className="animate-spin" /> : <><TrendingUp size={18} className="group-hover:scale-110 transition-transform"/> ANALISA PERFORMA</>}
                </button>
            </form>
        </div>

        {/* HASIL ANALISA */}
        <div ref={resultRef} className="pb-10">
        {result && (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-blue-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                
                {/* Header Report */}
                <div className="bg-slate-900 px-8 py-5 flex justify-between items-center border-b border-slate-800">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 size={16} className="text-green-400"/> Audit Dashboard
                    </h3>
                    <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-blue-300 border border-white/10">MEDIA BUYER AI</div>
                </div>

                {/* Content Markdown */}
                <div className="p-8 md:p-10 prose prose-sm max-w-none 
                    prose-headings:font-black prose-headings:text-slate-800 
                    prose-p:text-slate-600 prose-p:leading-relaxed
                    prose-strong:text-blue-700 prose-strong:bg-blue-50 prose-strong:px-1 prose-strong:rounded
                    prose-ul:marker:text-blue-500">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>

                {/* Action Bar */}
                <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center gap-3">
                    <p className="text-[10px] text-slate-400 font-medium hidden sm:block">AI Recommendation Engine</p>
                    <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Hasil Audit Iklan:\n" + result)}`)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center justify-center gap-2">
                        <Share2 size={14}/> Share Report
                    </button>
                </div>
            </div>
        )}
        </div>

      </div>
    </div>
  );
}