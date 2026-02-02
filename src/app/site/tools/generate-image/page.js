"use client";
import { useState } from 'react';
// FIX: Pastikan semua icon ini di-import
import { 
  Zap, Loader2, Newspaper, Type, Image as ImageIcon, 
  Search, Copy, ExternalLink, Download, CheckCircle, 
  Facebook 
} from 'lucide-react';

export default function FBAutopilotPage() {
  const [topic, setTopic] = useState('');
  
  // State 1: Discovery (Teks)
  const [loadingText, setLoadingText] = useState(false);
  const [data, setData] = useState(null);

  // State 2: Creative (Gambar)
  const [loadingImage, setLoadingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);

  // State 3: Execution (Posting)
  const [loadingPost, setLoadingPost] = useState(false);
  const [postResult, setPostResult] = useState(null);

  // --- FUNGSI 1: CARI BERITA & BUAT CAPTION ---
  const handleGenerateText = async (e) => {
    e.preventDefault();
    if (!topic) return;
    
    setLoadingText(true);
    setData(null);
    setGeneratedImage(null); 
    setPostResult(null);

    try {
      const res = await fetch('/api/ai/autopilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        alert(json.message || "Gagal mengambil data berita.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setLoadingText(false);
    }
  };

  // --- FUNGSI 2: GENERATE GAMBAR ---
  const handleGenerateImage = async () => {
    if (!data?.result?.imagePrompt) return;
    
    setLoadingImage(true);
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: data.result.imagePrompt })
      });
      const json = await res.json();
      
      if (res.ok && json.imageUrl) {
        setGeneratedImage(json.imageUrl);
      } else {
        alert("Gagal generate gambar: " + (json.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Server error saat generate gambar.");
    } finally {
      setLoadingImage(false);
    }
  };

  // --- FUNGSI 3: POSTING KE FACEBOOK ---
  const handlePostToFacebook = async () => {
    if (!data?.result?.caption || !generatedImage) return;

    if (!confirm("Posting konten ini ke Fanpage sekarang?")) return;

    setLoadingPost(true);
    try {
        const res = await fetch('/api/facebook/post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: data.result.caption,
                imageUrl: generatedImage,
                link: data.source.link 
            })
        });

        const json = await res.json();

        if (res.ok && json.postUrl) {
            setPostResult(json.postUrl);
            alert("✅ Berhasil diposting ke Facebook!");
        } else {
            alert("Gagal posting: " + (json.message || "Pastikan Token FB Valid"));
        }
    } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan koneksi ke Facebook API.");
    } finally {
        setLoadingPost(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-poppins pb-20">
      
      {/* HEADER */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-blue-900/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2 flex items-center gap-3">
                <span className="p-3 bg-blue-600 text-white rounded-2xl"><Zap size={24}/></span>
                FB Auto-Pilot <span className="text-blue-600">Publisher</span>
            </h1>
            <p className="text-slate-500 font-medium">
                Cari berita viral, tulis caption, buat visual, dan posting otomatis.
            </p>
        </div>
      </div>

      {/* INPUT FORM */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm sticky top-4 z-30">
        <form onSubmit={handleGenerateText} className="flex gap-4 items-center">
            <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Topik / Niche</label>
                <input 
                    type="text" 
                    placeholder="Contoh: Tips Diet, Harga Emas, Gadget Terbaru..." 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-500 transition-all"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                />
            </div>
            <button 
                type="submit" 
                disabled={loadingText || !topic}
                className="h-[80px] w-[80px] bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shrink-0"
            >
                {loadingText ? <Loader2 className="animate-spin"/> : <Search size={28}/>}
            </button>
        </form>
      </div>

      {/* RESULT DISPLAY */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* KOLOM KIRI: TEKS & SUMBER */}
            <div className="space-y-6">
                
                {/* 1. SUMBER BERITA */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-3">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Newspaper size={16} className="text-blue-500"/> Sumber Berita
                    </h3>
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <h4 className="font-bold text-slate-800 leading-snug mb-2 line-clamp-2">{data.source?.title}</h4>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-500">
                                {data.source?.pubDate ? new Date(data.source.pubDate).toLocaleDateString() : 'Hari ini'}
                            </span>
                            <a href={data.source?.link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                                Baca Sumber <ExternalLink size={10}/>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 2. HASIL CAPTION */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Type size={16} className="text-emerald-500"/> Caption FB
                        </h3>
                        <button onClick={() => navigator.clipboard.writeText(data.result.caption)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-emerald-600 active:scale-95 transition-all"><Copy size={16}/></button>
                    </div>
                    <textarea 
                        readOnly 
                        className="w-full h-[350px] p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl text-sm text-slate-700 font-medium leading-relaxed outline-none resize-none custom-scrollbar"
                        value={data.result?.caption || ''}
                    />
                </div>
            </div>

            {/* KOLOM KANAN: GAMBAR & POSTING */}
            <div className="space-y-6">
                
                {/* 3. GENERATOR GAMBAR */}
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4 h-full flex flex-col">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={16} className="text-purple-500"/> Visual Generator
                        </h3>
                    </div>

                    {/* Area Preview Gambar */}
                    <div className="flex-1 min-h-[300px] bg-slate-900 rounded-2xl overflow-hidden relative group border border-slate-800 flex items-center justify-center">
                        {loadingImage ? (
                            <div className="text-center space-y-3">
                                <Loader2 className="animate-spin text-purple-500 w-10 h-10 mx-auto"/>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Meracik Pixel...</p>
                            </div>
                        ) : generatedImage ? (
                            <>
                                {/* Menggunakan tag img standar agar lebih aman dari error config Next.js */}
                                <img src={generatedImage} alt="Generated Content" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <a href={generatedImage} target="_blank" download className="p-3 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase hover:bg-purple-500 hover:text-white transition-all flex items-center gap-2">
                                        <Download size={16}/> Download
                                    </a>
                                </div>
                            </>
                        ) : (
                            <div className="text-center px-6">
                                <ImageIcon className="w-12 h-12 text-slate-700 mx-auto mb-3"/>
                                <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4">
                                    Prompt: "{data.result?.imagePrompt?.substring(0, 80)}..."
                                </p>
                                <button 
                                    onClick={handleGenerateImage}
                                    className="px-6 py-3 bg-purple-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 active:scale-95 flex items-center gap-2 mx-auto"
                                >
                                    <Zap size={14} fill="currentColor"/> Generate Gambar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Image Prompt (Read Only) */}
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-400 font-mono break-words leading-tight">
                        PROMPT: {data.result?.imagePrompt}
                    </div>

                    {/* TOMBOL POSTING */}
                    {generatedImage && !postResult && (
                         <button 
                            onClick={handlePostToFacebook}
                            disabled={loadingPost}
                            className="w-full py-4 bg-[#1877F2] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            {loadingPost ? <Loader2 className="animate-spin" size={16}/> : <Facebook size={16} fill="currentColor" />}
                            {loadingPost ? "Sedang Memposting..." : "Posting ke Fanspage"}
                         </button>
                    )}

                    {/* HASIL POSTING */}
                    {postResult && (
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center animate-in fade-in zoom-in duration-300">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600">
                                <CheckCircle size={20}/>
                            </div>
                            <p className="text-xs font-bold text-emerald-700 mb-2">Konten Berhasil Tayang!</p>
                            <a href={postResult} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline flex items-center justify-center gap-1">
                                Lihat di Facebook <ExternalLink size={10}/>
                            </a>
                        </div>
                    )}
                </div>
            </div>

        </div>
      )}
    </div>
  );
}