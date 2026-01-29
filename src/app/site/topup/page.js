"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm'; 
import { 
  GitMerge, Loader2, Upload, Globe, Link as LinkIcon, 
  CheckCircle2, AlertCircle, Gauge, Sparkles, Image as ImageIcon, X, History 
} from 'lucide-react';
import ToolHistory from '@/components/ToolHistory'; 

export default function AuditIklanLPPage() {
  // State
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [lpLink, setLpLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  
  // Config Default (Fallback jika DB belum ready)
  const [config, setConfig] = useState({ creditCost: 80, isActive: true }); 

  // 1. FETCH DATA (History & Config)
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history?tool=audit-iklan-lp');
      const data = await res.json();
      if (data.data) setHistory(data.data);
    } catch (err) { console.error("Gagal load history"); }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/tools');
        const data = await res.json();
        // Cari tool dengan slug 'audit-iklan-lp'
        const myTool = data.find(t => t.slug === 'audit-iklan-lp');
        if (myTool) setConfig(myTool);
      } catch (e) { console.log("Gagal load config tool"); }
    };
    fetchConfig();
    fetchHistory();
  }, []);

  // 2. HANDLER UTAMA (Submit Form)
  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    // Validasi Input
    if (!file || !lpLink) {
      alert("Mohon lengkapi data: Upload gambar iklan DAN masukkan link Landing Page.");
      return;
    }
    if (!config.isActive) {
      alert("Maaf, tool ini sedang dalam maintenance.");
      return;
    }

    setLoading(true); 
    setResult('');

    // Siapkan FormData (karena ada upload file)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lpLink', lpLink);
    formData.append('type', 'audit-iklan-lp'); // Wajib: untuk backend membedakan jenis request

    try {
      const res = await fetch('/api/ai/vision', { 
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.status === 402) { 
        alert("Saldo poin tidak mencukupi untuk analisa Vision AI."); 
        setLoading(false); 
        return; 
      }
      
      if (!res.ok) throw new Error(data.message || "Gagal melakukan analisa.");
      
      setResult(data.result);
      fetchHistory(); // Refresh history setelah sukses
    } catch (err) { 
      alert(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  // 3. RESTORE FROM HISTORY
  const handleSelectHistory = (item) => {
    // Restore Link LP
    if (item.inputData?.lpLink) setLpLink(item.inputData.lpLink);
    
    // Restore Gambar (Jika backend menyimpan URL gambar)
    // Note: Biasanya history tidak menyimpan file blob, jadi preview mungkin kosong
    // Tapi kita tetap bisa menampilkan hasil analisanya
    setResult(item.resultData);
    
    // Scroll ke hasil
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = async (id) => {
    if(!confirm("Hapus riwayat ini?")) return;
    try { 
        await fetch(`/api/history?id=${id}`, { method: 'DELETE' }); 
        fetchHistory(); 
    } catch(e) { alert("Gagal hapus history"); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 font-poppins antialiased text-slate-900">
      
      {/* AREA KIRI: FORM & HASIL */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* HEADER */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 italic">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
                <GitMerge className="w-6 h-6 text-white" />
            </div>
            Ad & LP <span className="text-indigo-600">Synchronizer</span>
          </h1>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest leading-relaxed">
            Analisa apakah "Janji" di iklan Bapak selaras dengan "Realita" di Landing Page.
          </p>
        </div>

        {/* FORM CARD */}
        <div className={`bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all ${!config.isActive ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <form onSubmit={handleAnalyze} className="space-y-8">
            
            {/* STEP 1: UPLOAD IKLAN (VISION) */}
            <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ImageIcon size={14} className="text-indigo-500" /> 1. Upload Kreatif Iklan (Gambar)
                </label>
                
                {!preview ? (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-300 transition-all group overflow-hidden relative">
                        <div className="flex flex-col items-center justify-center z-10">
                            <Upload className="w-10 h-10 text-slate-300 mb-3 group-hover:text-indigo-500 group-hover:scale-110 transition-all" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-indigo-600">Klik untuk upload file</p>
                            <p className="text-[9px] text-slate-400 mt-2">JPG, PNG (Max 5MB)</p>
                        </div>
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/png, image/jpeg, image/jpg, image/webp" 
                            onChange={(e) => {
                                const f = e.target.files[0];
                                if(f) { 
                                    if(f.size > 5 * 1024 * 1024) return alert("Ukuran file maksimal 5MB");
                                    setFile(f); 
                                    setPreview(URL.createObjectURL(f)); 
                                }
                            }} 
                        />
                    </label>
                ) : (
                    <div className="relative h-64 rounded-[2rem] overflow-hidden bg-slate-900 group border-2 border-indigo-500 shadow-lg flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} className="max-w-full max-h-full object-contain" alt="Preview Iklan" />
                        <button 
                            type="button"
                            onClick={() => {setFile(null); setPreview(null);}} 
                            className="absolute top-4 right-4 p-2 bg-rose-500/80 text-white rounded-full hover:bg-rose-600 transition-all backdrop-blur-sm shadow-lg"
                        >
                            <X size={16}/>
                        </button>
                    </div>
                )}
            </div>

            {/* STEP 2: LINK LANDING PAGE */}
            <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Globe size={14} className="text-indigo-500" /> 2. Masukkan Link Landing Page
                </label>
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <LinkIcon size={18}/>
                    </div>
                    <input 
                        required type="url" 
                        value={lpLink}
                        onChange={(e) => setLpLink(e.target.value)}
                        placeholder="https://website-bapak.com/halaman-promo"
                        className="w-full pl-12 pr-6 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm placeholder-slate-300"
                    />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                    <AlertCircle size={14} className="text-blue-500 shrink-0" /> 
                    <span>AI akan mengunjungi link ini (scraping) dan membandingkan isinya dengan gambar iklan di atas.</span>
                </div>
            </div>

            {/* ACTION BUTTON */}
            <button
                type="submit" 
                disabled={loading || !file || !lpLink}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 h-16 shadow-xl active:scale-[0.98] ${
                    loading || !file || !lpLink 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200' 
                    : 'bg-indigo-600 text-white hover:bg-slate-900 shadow-indigo-500/20'
                }`}
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin" /> MENGANALISA VISUAL & KONTEN...
                    </div>
                ) : (
                    <>
                        <Gauge size={18} /> 
                        ANALISA KESELARASAN (SYNC CHECK) 
                        <span className="bg-white/20 px-2 py-1 rounded-lg ml-1 font-mono">-{config.creditCost} pts</span>
                    </>
                )}
            </button>
          </form>
        </div>

        {/* HASIL ANALISA */}
        {result && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="bg-[#0F172A] p-6 flex justify-between items-center text-white border-b border-slate-800">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400" /> Laporan Message Match Expert
                    </h3>
                    <div className="px-3 py-1 bg-indigo-500/20 rounded-full text-[9px] font-bold tracking-widest uppercase border border-indigo-400/30 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.2)]">Deep Vision Audit</div>
                </div>
                
                <div className="p-8 md:p-12 prose prose-slate prose-sm max-w-none 
                  prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight
                  prose-strong:text-indigo-700 prose-strong:font-bold
                  prose-p:font-medium prose-p:text-slate-600 prose-p:leading-loose
                  prose-li:text-slate-600 prose-li:font-medium
                  prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/30 prose-blockquote:p-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
            </div>
        )}
      </div>

      {/* AREA KANAN: HISTORY */}
      <div className="lg:col-span-1">
        <div className="sticky top-8">
            <ToolHistory 
                title="Riwayat Sinkronisasi" 
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