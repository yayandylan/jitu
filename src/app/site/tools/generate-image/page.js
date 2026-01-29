"use client";

import { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, Loader2, Download, Sparkles, 
  Wallet, Monitor, BookOpen, AppWindow, Grid, 
  Maximize2, History 
} from 'lucide-react';
// FIX: Absolute import
import ToolHistory from '@/components/ToolHistory'; 

export default function GenerateImagePage() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [productType, setProductType] = useState('ebook'); 
  
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState({ creditCost: 100, isActive: true });

  // 1. FETCH HISTORY DARI DB
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history?tool=generate-image');
      const data = await res.json();
      if (data.data) setHistory(data.data);
    } catch (err) { console.error("Gagal load history"); }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/admin/tools');
        const data = await res.json();
        const myTool = data.find(t => t.slug === 'generate-image');
        if (myTool) setConfig(myTool);
      } catch (e) { console.log("Config error"); }
    };
    fetchConfig();
    fetchHistory();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt || !config.isActive) return;

    setLoading(true);
    setImageUrl('');

    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio, productType }),
      });

      const data = await res.json();
      
      if (res.status === 402) {
        alert("Poin tidak cukup! Topup dulu bosku.");
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.message);
      
      setImageUrl(data.result); // URL Gambar dari OpenAI/Cloudinary

      // 2. SIMPAN HISTORY
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: 'generate-image',
          title: prompt.substring(0, 30),
          inputData: { prompt, aspectRatio, productType },
          resultData: { imageUrl: data.result } // Simpan URL gambar
        })
      });

      fetchHistory();

    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (item) => {
    setPrompt(item.inputData.prompt);
    setAspectRatio(item.inputData.aspectRatio);
    setProductType(item.inputData.productType);
    // Handle resultData format
    const url = item.resultData?.imageUrl || item.resultData;
    setImageUrl(url);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistory = async (id) => {
    if(!confirm("Hapus gambar ini?")) return;
    await fetch(`/api/history?id=${id}`, { method: 'DELETE' }); 
    fetchHistory();
  };

  // Pilihan Jenis Produk
  const productTypes = [
    { id: 'ebook', label: 'E-Book 3D', icon: <BookOpen className="w-4 h-4"/>, desc: 'Cover buku hardbox realistis' },
    { id: 'course', label: 'E-Course', icon: <Monitor className="w-4 h-4"/>, desc: 'Tampilan layar laptop & modul' },
    { id: 'software', label: 'SaaS / App', icon: <AppWindow className="w-4 h-4"/>, desc: 'Dashboard UI Isometric' },
    { id: 'mockup', label: 'Product Box', icon: <Grid className="w-4 h-4"/>, desc: 'Packaging Box Premium' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 font-poppins antialiased text-slate-900">
      
      {/* KOLOM KIRI: INPUT & PREVIEW */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* HEADER */}
        <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
                <div className="bg-purple-600 p-2 rounded-xl shadow-lg shadow-purple-200">
                    <ImageIcon className="w-6 h-6 text-white" />
                </div>
                AI Product Mockup
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-2">
                Generate gambar produk digital kualitas studio tanpa perlu render manual.
            </p>
        </div>

        {/* INPUT FORM */}
        <div className={`bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-purple-900/5 transition-all ${!config.isActive ? 'opacity-50 pointer-events-none' : ''}`}>
            <form onSubmit={handleGenerate} className="space-y-6">
              
              {/* 1. Jenis Produk */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Jenis Aset</label>
                <div className="grid grid-cols-2 gap-3">
                  {productTypes.map((type) => (
                    <div 
                      key={type.id}
                      onClick={() => setProductType(type.id)}
                      className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${productType === type.id ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500' : 'hover:bg-slate-50 border-slate-200'}`}
                    >
                      <div className={`p-2.5 rounded-xl ${productType === type.id ? 'bg-purple-200 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                        {type.icon}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${productType === type.id ? 'text-purple-900' : 'text-slate-700'}`}>{type.label}</p>
                        <p className="text-[9px] text-slate-400">{type.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Prompt */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Deskripsi Visual</label>
                <textarea
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium outline-none focus:border-purple-500 focus:bg-white transition-all h-28 resize-none placeholder-slate-400"
                  placeholder={
                    productType === 'ebook' ? "Buku tentang diet keto, cover warna hijau segar, ada gambar alpukat, lighting studio..." : 
                    "Deskripsikan warna, suasana, dan elemen yang ingin ditampilkan..."
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                />
              </div>

              {/* 3. Aspect Ratio */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Rasio Gambar</label>
                <div className="flex gap-2">
                  {['1:1', '16:9', '9:16'].map((ratio) => (
                      <button 
                        key={ratio}
                        type="button" 
                        onClick={() => setAspectRatio(ratio)} 
                        className={`flex-1 py-2.5 border rounded-xl text-xs font-bold transition-all ${aspectRatio === ratio ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
                      >
                        {ratio}
                      </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-purple-600 text-white font-black uppercase tracking-[0.2em] text-[11px] py-5 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    RENDERING 3D ASSETS...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    GENERATE MOCKUP
                    <span className="bg-white/20 text-[9px] py-1 px-2 rounded-lg ml-1 font-mono">
                      -{config.creditCost} pts
                    </span>
                  </>
                )}
              </button>
            </form>
        </div>

        {/* HASIL GAMBAR */}
        {imageUrl && (
            <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-slate-100 rounded-[2rem] overflow-hidden relative group">
                    <img 
                        src={imageUrl} 
                        alt="Hasil Mockup AI" 
                        className="w-full h-auto object-cover shadow-inner"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 backdrop-blur-sm">
                        <a href={imageUrl} target="_blank" rel="noreferrer" className="p-3 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform shadow-lg">
                            <Maximize2 size={20}/>
                        </a>
                        <button onClick={() => window.open(imageUrl, '_blank')} className="p-3 bg-purple-600 rounded-full text-white hover:bg-purple-500 hover:scale-110 transition-all shadow-lg shadow-purple-500/50">
                            <Download size={20}/>
                        </button>
                    </div>
                </div>
                <div className="mt-4 px-2 flex justify-between items-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                    <span>Generated by DALL-E 3</span>
                    <span>High Quality Render</span>
                </div>
            </div>
        )}
      </div>

      {/* KOLOM KANAN: HISTORY */}
      <div className="lg:col-span-1">
        <div className="sticky top-8">
            <ToolHistory 
                title="Galeri Mockup" 
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