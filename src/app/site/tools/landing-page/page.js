"use client";
import { useState, useEffect } from 'react';
import { 
  LayoutTemplate, Loader2, Save, Smartphone, Monitor, 
  Code, Eye, UploadCloud, Zap, History, Trash2, Clock, CheckCircle2, X, ChevronRight 
} from 'lucide-react';

export default function LandingPageBuilder() {
  // --- STATE INPUT DATA ---
  const [input, setInput] = useState({
    product: '',
    target: '',
    offer: '',
    details: ''
  });
  
  // --- STATE GAMBAR (Base64) ---
  const [productImage, setProductImage] = useState(null); 
  const [testiImages, setTestiImages] = useState([]); 

  // --- STATE SYSTEM ---
  const [activeTab, setActiveTab] = useState('editor'); // Tab Editor / Riwayat
  const [loading, setLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [viewMode, setViewMode] = useState('preview'); // preview / code
  const [deviceMode, setDeviceMode] = useState('mobile'); // Default Mobile
  const [config, setConfig] = useState({ creditCost: 50, isActive: true });
  
  // --- STATE HISTORY ---
  const [history, setHistory] = useState([]);

  // 1. Load Data Awal
  useEffect(() => {
    fetchConfig();
    fetchHistory();
  }, []);

  const fetchConfig = async () => {
    fetch('/api/admin/tools').then(r => r.json()).then(tools => {
        const tool = tools.find(t => t.slug === 'landing-page');
        if(tool) setConfig(tool);
    }).catch(() => {});
  };

  const fetchHistory = async () => {
    try {
        const res = await fetch('/api/user/history?tool=landing-page');
        const data = await res.json();
        if(data.success) setHistory(data.data);
    } catch (e) { console.error("Gagal load history"); }
  };

  // --- HANDLER UPLOAD GAMBAR ---
  const handleProductUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTestiUpload = (e) => {
    const files = Array.from(e.target.files);
    if (testiImages.length + files.length > 5) {
        alert("Maksimal 5 foto testimoni!");
        return;
    }
    files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setTestiImages(prev => [...prev, reader.result]);
        reader.readAsDataURL(file);
    });
  };

  const removeTestiImage = (index) => {
    setTestiImages(prev => prev.filter((_, i) => i !== index));
  };

  // --- CORE: GENERATE AI ---
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!config.isActive) return;
    
    // Validasi Foto Utama
    if (!productImage) {
        alert("Wajib upload Foto Produk utama dulu ya!");
        return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            type: 'landing-page', 
            data: { 
                ...input, 
                testiCount: testiImages.length > 0 ? testiImages.length : 1 
            } 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      let finalHtml = data.result;
      
      // 1. Inject Foto Produk
      finalHtml = finalHtml.replace(/{{PRODUCT_IMAGE}}/g, productImage);

      // 2. Inject Foto Testimoni (Looping)
      if (testiImages.length > 0) {
          testiImages.forEach((img, index) => {
              finalHtml = finalHtml.replace(new RegExp(`{{TESTIMONI_${index}}}`, 'g'), img);
          });
      } else {
          // Fallback dummy jika user tidak upload testi
          finalHtml = finalHtml.replace(/{{TESTIMONI_0}}/g, "https://placehold.co/400x300/png?text=Testimoni");
      }

      setGeneratedHtml(finalHtml);

      // 3. Simpan ke History (PENTING)
      await fetch('/api/user/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'landing-page',
          title: input.product || 'Sales Page Baru',
          inputData: input, // Simpan teks input agar bisa diedit lagi
          resultData: finalHtml // Simpan hasil HTML final (termasuk gambar base64)
        })
      });

      // Refresh list history
      await fetchHistory();

    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER HISTORY ---
  const handleLoadHistory = (item) => {
    // Restore Input Teks
    if (item.inputData) setInput(item.inputData);
    
    // Restore HTML Hasil (Gambar sudah tertanam di dalam HTML ini)
    setGeneratedHtml(item.resultData);
    
    // Switch ke tampilan Mobile Preview agar user langsung lihat hasilnya
    setDeviceMode('mobile');
    setActiveTab('editor'); 
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    if(!confirm("Hapus sales page ini dari riwayat?")) return;
    
    await fetch(`/api/user/history?id=${id}`, { method: 'DELETE' });
    setHistory(prev => prev.filter(h => h._id !== id));
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 font-sans text-slate-900">
      
      {/* --- KOLOM KIRI: EDITOR & HISTORY --- */}
      <div className="w-full lg:w-[420px] flex flex-col h-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden shrink-0">
        
        {/* Tab Switcher */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h1 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-800">
                <LayoutTemplate size={18} className="text-blue-600"/> Sales Page
            </h1>
            <div className="flex bg-slate-200/50 p-1 rounded-lg">
                <button onClick={() => setActiveTab('editor')} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'editor' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Editor</button>
                <button onClick={() => setActiveTab('history')} className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Riwayat</button>
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            
            {/* --- TAB 1: FORM EDITOR --- */}
            <div className={`p-5 space-y-5 ${activeTab === 'editor' ? 'block' : 'hidden'}`}>
                {/* Input Teks */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Produk</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-blue-500 outline-none" placeholder="Contoh: Madu Diet Express" value={input.product} onChange={(e) => setInput({...input, product: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Market</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-blue-500 outline-none" placeholder="Contoh: Pria buncit usia 30+" value={input.target} onChange={(e) => setInput({...input, target: e.target.value})} />
                </div>

                {/* Upload Foto */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">Foto Utama <span>(Wajib)</span></label>
                        <div className="relative group w-full h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center overflow-hidden">
                            <input type="file" onChange={handleProductUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept="image/*" />
                            {productImage ? <img src={productImage} className="w-full h-full object-cover" /> : <div className="text-center p-4"><div className="bg-white p-2 rounded-full shadow-sm w-fit mx-auto mb-2"><UploadCloud size={20} className="text-blue-500" /></div><span className="text-[9px] font-bold text-slate-400">Upload Foto Produk</span></div>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">Testimoni <span>({testiImages.length}/5)</span></label>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            {testiImages.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group/item">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button onClick={() => removeTestiImage(idx)} className="absolute top-1 right-1 bg-rose-500 text-white p-0.5 rounded shadow-sm opacity-0 group-hover/item:opacity-100 transition-opacity"><X size={12} /></button>
                                </div>
                            ))}
                            {testiImages.length < 5 && (
                                <div className="relative aspect-square rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center cursor-pointer">
                                    <input type="file" onChange={handleTestiUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" accept="image/*" multiple />
                                    <Zap size={16} className="text-slate-300 mb-1" />
                                    <span className="text-[8px] font-bold text-slate-400">+ Add</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penawaran (Harga & Bonus)</label>
                    <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 outline-none h-20 resize-none" placeholder="Harga Promo 99rb (Normal 200rb) + Bonus Ebook" value={input.offer} onChange={(e) => setInput({...input, offer: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detail Produk & Keunggulan</label>
                    <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:border-blue-500 outline-none h-32 resize-none" placeholder="Jelaskan manfaat utama, bahan, dan kenapa harus beli sekarang..." value={input.details} onChange={(e) => setInput({...input, details: e.target.value})} />
                </div>
            </div>

            {/* --- TAB 2: RIWAYAT / HISTORY --- */}
            <div className={`p-5 space-y-3 ${activeTab === 'history' ? 'block' : 'hidden'}`}>
                {history.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                        <History size={32} className="mx-auto mb-2 text-slate-300" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Belum ada history</p>
                    </div>
                ) : (
                    history.map((item) => (
                        <div key={item._id} onClick={() => handleLoadHistory(item)} className="group p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 cursor-pointer transition-all active:scale-95 relative">
                            <div className="flex justify-between items-start mb-2">
                                <span className="flex items-center gap-1 bg-white text-[9px] font-bold text-slate-400 px-2 py-1 rounded-lg border border-slate-200 group-hover:text-blue-600 transition-colors">
                                    <Clock size={10} /> {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                                <button onClick={(e) => handleDeleteHistory(item._id, e)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={12} /></button>
                            </div>
                            <h4 className="text-[12px] font-bold text-slate-800 leading-tight line-clamp-2 group-hover:text-blue-700">
                                {item.title || "Sales Page"}
                            </h4>
                            <div className="mt-2 flex items-center gap-1 text-[9px] font-medium text-slate-400">
                                <CheckCircle2 size={10} className="text-emerald-500" /> Siap Diakses
                            </div>
                            <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Footer Button (Only visible in Editor) */}
        {activeTab === 'editor' && (
            <div className="p-5 border-t border-slate-100 bg-white">
                <button
                    onClick={handleGenerate}
                    disabled={loading || !config.isActive}
                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95
                    ${loading ? 'bg-slate-800 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30'}`}
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" className="text-yellow-400"/>}
                    {loading ? 'AI Sedang Coding...' : `Generate Sales Page (-${config.creditCost})`}
                </button>
            </div>
        )}
      </div>

      {/* --- KOLOM KANAN: PREVIEW AREA --- */}
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 relative p-8">
        
        {/* Toolbar */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
            <div className="bg-slate-800/80 backdrop-blur-md p-1 rounded-lg border border-slate-700 flex gap-1">
                <button onClick={() => setDeviceMode('mobile')} className={`p-2 rounded-md ${deviceMode === 'mobile' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}><Smartphone size={16}/></button>
                <button onClick={() => setDeviceMode('desktop')} className={`p-2 rounded-md ${deviceMode === 'desktop' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}><Monitor size={16}/></button>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setViewMode(viewMode === 'preview' ? 'code' : 'preview')} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-[10px] font-bold border border-slate-700 hover:bg-slate-700"><Code size={14}/></button>
                <button onClick={() => {navigator.clipboard.writeText(generatedHtml); alert("HTML Berhasil Disalin!");}} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20"><Save size={14}/></button>
            </div>
        </div>

        {/* Preview Container */}
{!generatedHtml ? (
    <div className="text-center opacity-30">
        <LayoutTemplate size={80} className="mx-auto text-slate-500 mb-6" />
        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-lg">Sales Page Preview</h3>
        <p className="text-slate-600 text-sm mt-2 max-w-xs mx-auto">Upload foto produk, isi detail penawaran, dan biarkan AI menyusun struktur PAS yang mematikan.</p>
    </div>
) : (
    viewMode === 'preview' ? (
        // --- FIX: DEVICE MOCKUP YANG RESPONSIF ---
        <div className={`transition-all duration-500 relative bg-white shadow-2xl overflow-hidden flex flex-col
            ${deviceMode === 'mobile' 
                ? 'w-[360px] h-[90%] max-h-[740px] rounded-[3rem] border-[12px] border-[#121212] shadow-[0_0_80px_-20px_rgba(0,0,0,0.6)]' 
                : 'w-full h-full rounded-xl border border-slate-700'
            }
        `}>
            {/* iPhone Notch - Hanya muncul di Mobile */}
            {deviceMode === 'mobile' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#121212] rounded-b-2xl z-20 flex items-center justify-center">
                    <div className="w-8 h-1 rounded-full bg-slate-800"></div>
                </div>
            )}
            
            {/* Iframe: Pastikan height 100% dari kontainer mockup */}
            <iframe 
                srcDoc={generatedHtml} 
                className="w-full h-full bg-white flex-1" 
                title="Preview"
                sandbox="allow-scripts"
            />
        </div>
    ) : (
        // Source Code View
        <div className="w-full h-full overflow-auto custom-scrollbar bg-[#0d1117] p-6 rounded-2xl text-xs font-mono text-blue-300 border border-slate-800">
            <pre>{generatedHtml}</pre>
        </div>
    )
)}
      </div>
    </div>
  );
}