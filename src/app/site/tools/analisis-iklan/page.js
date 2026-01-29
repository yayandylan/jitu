"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from 'react';
import remarkGfm from 'remark-gfm'; 
import { 
  BarChart3, Loader2, Upload, Image as ImageIcon, 
  CheckSquare, AlertCircle, Info, Gauge, X, FileText
} from 'lucide-react';
// FIX: Absolute import yang aman
import ToolHistory from '@/components/ToolHistory'; 

export default function AnalisisIklanPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState({ creditCost: 75, isActive: true });

  const fetchHistory = async () => {
    try {
      // Gunakan toolType yang konsisten: 'analisis-iklan'
      const res = await fetch('/api/history?tool=analisis-iklan');
      const data = await res.json();
      if (data.data) setHistory(data.data);
    } catch (err) { console.error("Gagal load history"); }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/tools');
        const data = await res.json();
        const myTool = data.find(t => t.slug === 'analisis-iklan');
        if (myTool) setConfig(myTool);
      } catch (err) { console.log("Config error"); }
    };
    fetchConfig();
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validasi ukuran file (Max 5MB agar tidak ditolak server)
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("Ukuran file terlalu besar! Maksimal 5MB.");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file || !isConfirmed || !config.isActive) return;
    setLoading(true); setResult('');

    // Gunakan FormData untuk kirim file ke API Vision
    const formData = new FormData();
    formData.append('file', file);
    // Tipe ini akan dibaca di backend untuk menentukan prompt AI
    formData.append('type', 'analisis-iklan-visual'); 

    try {
      // Pastikan endpoint ini adalah endpoint VISION yang sudah kita buat sebelumnya
      const res = await fetch('/api/ai/vision', { 
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.status === 402) { alert("Poin tidak cukup!"); setLoading(false); return; }
      if (!res.ok) throw new Error(data.message || "Gagal analisa");
      
      setResult(data.result);
      fetchHistory(); // Refresh riwayat agar muncul di sidebar
    } catch (err) { 
      alert("Gagal menganalisa gambar: " + err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  // Restore History
  const handleSelectHistory = (item) => {
    // Kita tidak bisa restore gambar aslinya, tapi hasil analisanya ada
    const output = item.resultData?.text || item.resultData;
    setResult(output);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = async (id) => {
    if(!confirm("Hapus laporan audit ini?")) return;
    await fetch(`/api/history?id=${id}`, { method: 'DELETE' }); 
    fetchHistory();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 pt-4 font-poppins antialiased text-slate-900">
      
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
          <div className="bg-rose-600 p-2 rounded-xl shadow-lg shadow-rose-200">
              <BarChart3 className="w-6 h-6 text-white" />
          </div>
          Audit Iklan Visual AI
        </h1>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-widest leading-relaxed">Unggah screenshot dashboard iklan Bapak, AI akan menganalisa secara mendalam.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* KOLOM KIRI: FORM & HASIL */}
        <div className="lg:col-span-8 space-y-8">
          
          <form onSubmit={handleAnalyze} className="space-y-8">
            
            {/* AREA UPLOAD */}
            <div className={`bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all ${!config.isActive ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                {!preview ? (
                    <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-slate-100 rounded-[2.2rem] cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-all group relative">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10">
                            <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-blue-600" />
                            </div>
                            <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">Pilih Screenshot Dashboard</p>
                            <p className="text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-[0.2em]">PNG, JPG (Max. 5MB)</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                ) : (
                    <div className="relative rounded-[2.2rem] overflow-hidden group h-80 bg-slate-900 border-4 border-slate-900 shadow-inner flex items-center justify-center">
                        <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                        <button 
                            type="button"
                            onClick={() => {setFile(null); setPreview(null);}}
                            className="absolute top-6 right-6 p-2.5 bg-rose-500 text-white rounded-xl shadow-xl hover:bg-rose-600 transition-all active:scale-90"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* KONFIRMASI DATA */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100">
                    <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Pernyataan Validitas Data</h4>
                        <p className="text-[11px] text-amber-700/70 font-medium leading-relaxed italic">
                            Pastikan screenshot yang Bapak unggah adalah data asli, terbaru, dan milik sendiri agar hasil diagnosa AI Jitu Digital akurat.
                        </p>
                    </div>
                </div>

                <label className="flex items-center gap-4 cursor-pointer group select-none">
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            checked={isConfirmed}
                            onChange={(e) => setIsConfirmed(e.target.checked)}
                            className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isConfirmed ? 'bg-blue-600 border-blue-600' : 'bg-slate-50 border-slate-200 group-hover:border-blue-300'}`}>
                            {isConfirmed && <CheckSquare size={14} className="text-white" />}
                        </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600">Saya menjamin file yang diunggah benar dan siap untuk dianalisa.</span>
                </label>

                <button
                    type="submit"
                    disabled={loading || !file || !isConfirmed}
                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 h-16 shadow-xl ${loading || !file || !isConfirmed ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-rose-600 text-white hover:bg-slate-900 hover:shadow-rose-500/20 active:scale-[0.98]'}`}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <>Audit Screenshot Sekarang <span className="bg-white/20 px-2 py-0.5 rounded-lg ml-2 font-mono">-{config.creditCost} pts</span></>}
                </button>
            </div>
          </form>

          {/* HASIL ANALISA */}
          {result && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="bg-[#0F172A] p-6 flex justify-between items-center text-white border-b border-slate-800">
                      <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                          <Gauge className="w-4 h-4 text-rose-400" /> Analisa Senior Media Buyer
                      </h3>
                  </div>
                  <div className="p-10 prose prose-slate prose-sm max-w-none 
                    prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase
                    prose-strong:text-rose-600 prose-strong:font-bold
                    prose-p:font-medium prose-p:text-slate-600 prose-p:leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                  </div>
              </div>
          )}
        </div>

        {/* KOLOM KANAN: RIWAYAT */}
        <div className="lg:col-span-4">
          <div className="sticky top-8">
            <ToolHistory 
                title="Riwayat Audit" 
                historyData={history} 
                onSelect={handleSelectHistory} 
                onDelete={handleDeleteHistory} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}