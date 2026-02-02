"use client";
import { useState, useEffect } from 'react';
import { 
  Zap, Loader2, Type, Image as ImageIcon, Search, Copy, RotateCcw,
  Pencil, Facebook, Share2, Tag, History, Trash2, Layers, Smartphone, Square, ChevronLeft, X,
  Download, PlusCircle, FileText, Grid, Layout
} from 'lucide-react';
import Link from 'next/link';

export default function SocialMediaCreator() {
  // --- KONFIGURASI ---
  const POINT_COST = 50; 

  // --- STATE DATA ---
  const [topic, setTopic] = useState('');
  const [userCredits, setUserCredits] = useState(0); 
  
  // --- NEW: MODE POSTING ---
  const [postMode, setPostMode] = useState('carousel'); // 'single' | 'carousel'

  // State Konten Teks
  const [loadingText, setLoadingText] = useState(false);
  const [headline, setHeadline] = useState(""); 
  const [caption, setCaption] = useState("");   
  const [visualPrompt, setVisualPrompt] = useState(""); 
  const [newsLink, setNewsLink] = useState("");
  
  // State Konten Slide & Desain (Dari AI)
  const [slidesContentAi, setSlidesContentAi] = useState([]); 
  const [aiThemeColor, setAiThemeColor] = useState(""); 
  const [aiArtStyle, setAiArtStyle] = useState("");     

  // State Visual
  const [loadingImage, setLoadingImage] = useState(false);
  const [slides, setSlides] = useState([]); 
  const [activeSlideIndex, setActiveSlideIndex] = useState(0); 
  
  const [themeLabel, setThemeLabel] = useState("UPDATE TERKINI"); 
  const [aspectRatio, setAspectRatio] = useState("1:1"); 
  
  // State Input Manual
  const [manualSlideTitle, setManualSlideTitle] = useState("");
  const [manualSlideBody, setManualSlideBody] = useState("");
  const [slideNumber, setSlideNumber] = useState(""); 
  
  // State History & UI
  const [historyList, setHistoryList] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchHistory();
    const savedDraft = localStorage.getItem('JITU_SOSMED_DRAFT_V3');
    if(savedDraft) {
        const data = JSON.parse(savedDraft);
        setTopic(data.topic || ""); setHeadline(data.headline || ""); setCaption(data.caption || "");
        setSlides(data.slides || []); setThemeLabel(data.theme || "UPDATE TERKINI");
        setAiThemeColor(data.aiThemeColor || ""); setAiArtStyle(data.aiArtStyle || "");
        setPostMode(data.postMode || 'carousel'); 
    }
  }, []);

  // Auto Save
  useEffect(() => {
    localStorage.setItem('JITU_SOSMED_DRAFT_V3', JSON.stringify({ 
        topic, headline, caption, slides, theme: themeLabel, ratio: aspectRatio,
        aiThemeColor, aiArtStyle, postMode 
    }));
  }, [topic, headline, caption, slides, themeLabel, aspectRatio, aiThemeColor, aiArtStyle, postMode]);

  // Efek: Mengisi Input Manual Otomatis
  useEffect(() => {
      const targetIndex = slides.length; 
      if (targetIndex === 0) {
          // Jika belum ada slide, manual title diisi Headline utama
          setManualSlideTitle(headline);
      } else {
          // Jika sudah ada slide (misal slide ke-2), ambil data dari AI index ke-0 dst
          const aiIndex = targetIndex - 1; 
          
          // Hanya isi otomatis jika mode carousel & data AI tersedia
          if (postMode === 'carousel' && slidesContentAi[aiIndex]) {
              setManualSlideTitle(slidesContentAi[aiIndex].title);
              setManualSlideBody(slidesContentAi[aiIndex].body);
          } else {
              setManualSlideTitle(""); setManualSlideBody("");
          }
      }
  }, [slides.length, slidesContentAi, headline, postMode]);

  const fetchUserData = async () => { try { const res = await fetch('/api/user/me'); const data = await res.json(); if (data.user) setUserCredits(data.user.credits); } catch (err) {} };
  const fetchHistory = async () => { try { const res = await fetch('/api/history/social-post'); const data = await res.json(); if(data.success) setHistoryList(data.history); } catch (err) {} };

  const handleReset = () => {
    if(confirm("Mulai project baru?")) {
        setTopic(""); setHeadline(""); setCaption(""); setVisualPrompt("");
        setSlides([]); setSlidesContentAi([]); 
        setAiThemeColor(""); setAiArtStyle(""); 
        setManualSlideTitle(""); setManualSlideBody("");
        setActiveSlideIndex(0); setActiveHistoryId(null);
        localStorage.removeItem('JITU_SOSMED_DRAFT_V3');
    }
  };

  const handleLoadHistory = (item) => {
    setSlides([{ id: Date.now(), url: item.imageUrl }]);
    setActiveSlideIndex(0);
    setHeadline(item.headline); setCaption(item.caption); setTopic(item.topic);
    setThemeLabel(item.theme || "UPDATE TERKINI");
    setIsHistoryOpen(false);
  };
  
  const deleteHistory = async (id, e) => {
      e.stopPropagation(); if(!confirm("Hapus?")) return;
      await fetch(`/api/history/social-post?id=${id}`, { method: 'DELETE' });
      fetchHistory();
  };

  // --- 1. GENERATE TEKS (MODE AWARE) ---
  const handleGenerateText = async (e) => {
    e.preventDefault();
    if (userCredits < POINT_COST) { alert("Saldo kurang!"); return; }
    if (!topic) return;
    
    setLoadingText(true);
    // Reset Data Lama
    setCaption(""); setHeadline(""); setVisualPrompt(""); 
    setSlides([]); setSlidesContentAi([]); 
    setAiThemeColor(""); setAiArtStyle("");
    setActiveSlideIndex(0); setActiveHistoryId(null); 

    try {
      const res = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            prompt: topic,
            mode: postMode // Kirim mode ke backend agar output AI sesuai
        }) 
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      let aiResult;
      try {
        const cleanJson = data.result.replace(/```json/g, '').replace(/```/g, '');
        aiResult = JSON.parse(cleanJson);
      } catch (e) {
        aiResult = { headline: `INFO: ${topic}`, caption: data.result, slidesContent: [] };
      }

      setHeadline(aiResult.headline);
      setCaption(aiResult.caption);
      setVisualPrompt(aiResult.imagePrompt || topic);
      setAiThemeColor(aiResult.themeColor || "#FFD700"); 
      setAiArtStyle(aiResult.artStyle || "cinematic lighting"); 

      if (aiResult.slidesContent && Array.isArray(aiResult.slidesContent)) {
          setSlidesContentAi(aiResult.slidesContent);
      }
      fetchUserData(); 

    } catch (err) {
      alert("Gagal generate: " + err.message);
    } finally {
      setLoadingText(false);
    }
  };

  // --- 2. GENERATE IMAGE (LOGIKA PENTING) ---
  const handleGenerateImage = async () => {
    const promptToUse = visualPrompt || topic;
    if (!promptToUse) return;
    
    setLoadingImage(true);
    
    const currentSlideIndex = slides.length; 
    let textPayload = {};
    let customVisualPayload = ""; 

    // Logika Payload Berdasarkan Slide
    if (currentSlideIndex === 0) {
        // Slide 1 (Cover) - Pakai Headline & Visual Prompt Utama
        textPayload = { title: headline }; 
        customVisualPayload = visualPrompt; 
    } else {
        // Slide 2+ (Content) - Pakai Input Manual (yang sudah auto-fill)
        textPayload = { slideTitle: manualSlideTitle, slideBody: manualSlideBody };
        
        // Ambil visual prompt spesifik per slide jika ada dari AI
        const aiIndex = currentSlideIndex - 1;
        if (slidesContentAi[aiIndex] && slidesContentAi[aiIndex].visual) {
            customVisualPayload = slidesContentAi[aiIndex].visual;
        } else {
            // Fallback visual
            customVisualPayload = `${visualPrompt}, different angle, scene number ${currentSlideIndex}`;
        }
    }

    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            prompt: promptToUse, 
            theme: themeLabel,
            ratio: aspectRatio,
            slideIndex: currentSlideIndex,
            customVisual: customVisualPayload, // Prompt visual spesifik
            themeColor: aiThemeColor, 
            artStyle: aiArtStyle,
            ...textPayload 
        })
      });
      const json = await res.json();
      
      if (res.ok && json.imageUrl) {
        const newSlide = { id: Date.now(), url: json.imageUrl };
        
        // --- LOGIKA MODE: Single = Replace, Carousel = Append ---
        if (postMode === 'single') {
            setSlides([newSlide]); // Ganti total
            setActiveSlideIndex(0);
        } else {
            const updatedSlides = [...slides, newSlide]; // Tambah ke belakang
            setSlides(updatedSlides);
            setActiveSlideIndex(updatedSlides.length - 1); // Pindah ke slide baru
        }
        
        // Reset/Siapkan input manual untuk slide berikutnya (Carousel only)
        if(postMode === 'carousel') {
            const nextAiIndex = currentSlideIndex; 
            if (slidesContentAi[nextAiIndex]) {
                setManualSlideTitle(slidesContentAi[nextAiIndex].title);
                setManualSlideBody(slidesContentAi[nextAiIndex].body);
            } else {
                setManualSlideTitle(""); setManualSlideBody("");
            }
        }

        // Auto Save History (Hanya saat generate cover/single pertama kali)
        if(slides.length === 0 || postMode === 'single') {
            fetch('/api/history/social-post', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ topic, headline, caption, imageUrl: json.imageUrl, theme: themeLabel, ratio: aspectRatio })}).then(()=>fetchHistory());
        }
        fetchUserData(); // Refresh poin

      } else { alert("Gagal generate gambar."); }
    } catch (err) { alert("Error generating image."); } finally { setLoadingImage(false); }
  };

  const handleDownload = async () => {
    const currentUrl = slides[activeSlideIndex]?.url;
    if (!currentUrl) return;
    try {
        const response = await fetch(currentUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `jitu-post-${activeSlideIndex + 1}.jpg`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
    } catch (e) { alert("Gagal download."); }
  };

  const handleNativeShare = async () => { /*...*/ };
  const handlePostToFB = async () => { alert("Coming Soon"); };
  
  const HistoryList = () => ( <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">{historyList.map(item=>(<div key={item._id} onClick={()=>handleLoadHistory(item)} className="p-2 bg-white border hover:bg-slate-50 rounded-lg cursor-pointer flex gap-3 items-center"><div className="w-10 h-10 bg-slate-200 rounded overflow-hidden shrink-0"><img src={item.imageUrl} className="w-full h-full object-cover"/></div><div className="flex-1 min-w-0"><p className="text-[10px] font-bold truncate text-slate-700">{item.headline}</p></div></div>))}</div> );

  const isSlideOne = slides.length === 0;

  return (
    <div className="h-[calc(100vh-85px)] md:h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-12 gap-6 font-poppins pb-2 md:pb-4 relative">
      
      {/* SIDEBAR HISTORY */}
      <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 h-full overflow-hidden">
         <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm shrink-0">
            <h1 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-purple-900"><Layers className="w-4 h-4 text-purple-600" /> Creator Studio</h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg w-fit mt-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div> Biaya: {POINT_COST} Poin
            </div>
         </div>
         <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4 overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2 px-1">RIWAYAT</h3>
            <HistoryList />
         </div>
      </div>

      {/* DRAWER MOBILE */}
      {isHistoryOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsHistoryOpen(false)}/>}
      <div className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl transition-transform duration-300 lg:hidden flex flex-col border-l border-slate-100 ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-purple-900"><History size={16} /> Riwayat Post</h3>
             <button onClick={() => setIsHistoryOpen(false)} className="p-2"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50"><HistoryList /></div>
      </div>

      {/* WORKSPACE */}
      <div className="lg:col-span-9 h-full flex flex-col bg-white rounded-xl md:rounded-[2.5rem] shadow-sm md:shadow-xl border border-slate-100 overflow-hidden relative">
        {/* HEADER */}
        <div className="px-4 py-3 md:p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md flex justify-between items-center shrink-0 sticky top-0 z-20">
             <div className="flex items-center gap-2 md:gap-3">
                <Link href="/site/dashboard" className="lg:hidden p-2 bg-slate-50 rounded-xl text-slate-500"><ChevronLeft size={20}/></Link>
                <div className="flex items-center gap-2"><Zap className="text-purple-600 fill-current"/><span className="font-black uppercase text-sm text-slate-800">Viral Maker</span></div>
             </div>
             <div className="flex items-center gap-2">
                <button onClick={() => setIsHistoryOpen(true)} className="lg:hidden p-2 bg-slate-50 text-purple-600 rounded-xl border border-slate-200"><History size={18}/></button>
                <button onClick={handleReset} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all"><RotateCcw size={18}/></button>
             </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50 custom-scrollbar">
            
            {/* 1. PILIH MODE POSTING (TAB BARU) */}
            <div className="flex gap-2">
                <button onClick={() => setPostMode('single')} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 border-2 transition-all ${postMode === 'single' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-100 bg-white text-slate-400 hover:bg-slate-50'}`}>
                    <ImageIcon size={16}/> Single Post (1 Gambar)
                </button>
                <button onClick={() => setPostMode('carousel')} className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 border-2 transition-all ${postMode === 'carousel' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-100 bg-white text-slate-400 hover:bg-slate-50'}`}>
                    <Layers size={16}/> Carousel (Banyak Slide)
                </button>
            </div>

            {/* 2. INPUT TOPIK */}
            <div className="bg-white p-2 rounded-[2rem] border border-slate-200 shadow-sm ring-4 ring-white">
                <form onSubmit={handleGenerateText} className="flex gap-2 items-center">
                    <input type="text" placeholder={`Topik ${postMode === 'single' ? 'Single Post' : 'Carousel'}: Berita, Tips, Fakta...`} className="flex-1 pl-6 bg-transparent font-bold text-lg outline-none text-slate-800 placeholder:text-slate-300" value={topic} onChange={e=>setTopic(e.target.value)}/>
                    <button type="submit" disabled={loadingText || !topic} className="h-12 px-6 bg-purple-600 text-white rounded-[1.5rem] font-bold shadow-lg hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center gap-2">
                        {loadingText ? <Loader2 className="animate-spin"/> : "GENERATE IDE"}
                    </button>
                </form>
            </div>

            {(headline || caption) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
                    
                    {/* VISUAL EDITOR */}
                    <div className="bg-slate-900 p-5 rounded-[2rem] shadow-2xl text-white border border-slate-800 space-y-4 flex flex-col">
                        
                        {/* RASIO SWITCHER */}
                        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-800 rounded-xl">
                            <button onClick={()=>setAspectRatio("1:1")} className={`py-2 rounded-lg text-[10px] font-bold uppercase flex flex-col items-center gap-1 ${aspectRatio==="1:1" ? "bg-purple-600" : "hover:bg-slate-700"}`}><Square size={14}/> Feed</button>
                            <button onClick={()=>setAspectRatio("4:5")} className={`py-2 rounded-lg text-[10px] font-bold uppercase flex flex-col items-center gap-1 ${aspectRatio==="4:5" ? "bg-purple-600" : "hover:bg-slate-700"}`}><ImageIcon size={14}/> Potrait</button>
                            <button onClick={()=>setAspectRatio("9:16")} className={`py-2 rounded-lg text-[10px] font-bold uppercase flex flex-col items-center gap-1 ${aspectRatio==="9:16" ? "bg-purple-600" : "hover:bg-slate-700"}`}><Smartphone size={14}/> Story</button>
                        </div>

                        {/* PREVIEW */}
                        <div className={`relative bg-black/50 rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center mx-auto transition-all duration-300 ${aspectRatio === "1:1" ? "aspect-square w-full" : aspectRatio === "4:5" ? "aspect-[4/5] w-[80%]" : "aspect-[9/16] w-[60%]"}`}>
                             {loadingImage ? (
                                <div className="text-center"><Loader2 className="animate-spin text-purple-500 mx-auto"/><span className="text-xs mt-2 block">Meracik Pixel...</span></div>
                             ) : slides.length > 0 ? (
                                <img src={slides[activeSlideIndex]?.url} className="w-full h-full object-cover"/>
                             ) : (
                                <div className="text-center opacity-30"><ImageIcon size={48} className="mx-auto"/><p className="text-xs mt-2">Siap Generate</p></div>
                             )}
                        </div>

                        {/* SLIDE STRIP (HANYA MUNCUL JIKA MODE CAROUSEL) */}
                        {postMode === 'carousel' && slides.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar relative z-10">
                                {slides.map((slide, idx) => (
                                    <div key={slide.id} onClick={() => setActiveSlideIndex(idx)} className={`w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${activeSlideIndex === idx ? 'border-purple-500 scale-105 opacity-100' : 'border-slate-700 opacity-50 hover:opacity-100'}`}>
                                        <img src={slide.url} className="w-full h-full object-cover"/>
                                    </div>
                                ))}
                                <div className="w-14 h-14 shrink-0 rounded-lg border-2 border-slate-800 border-dashed flex flex-col items-center justify-center text-slate-600">
                                    <PlusCircle size={16}/><span className="text-[9px] font-bold">NEXT</span>
                                </div>
                            </div>
                        )}

                        {/* INPUTS TEKS */}
                        <div className="space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-slate-400 uppercase flex gap-2"><Pencil size={12}/> {isSlideOne ? "Judul Gambar" : `Isi Slide #${slides.length + 1}`}</label>
                                {postMode === 'carousel' && !isSlideOne && slidesContentAi.length > slides.length && <span className="text-[9px] bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full animate-pulse">AI Suggested</span>}
                            </div>
                            
                            <textarea 
                                value={isSlideOne ? headline : manualSlideTitle} 
                                onChange={e => isSlideOne ? setHeadline(e.target.value) : setManualSlideTitle(e.target.value)} 
                                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-md font-bold text-white outline-none focus:border-purple-500 transition-all" 
                                rows={2} placeholder="Judul Besar..."
                            />
                            
                            {/* Input Body hanya muncul untuk slide 2+ di mode Carousel */}
                            {postMode === 'carousel' && !isSlideOne && (
                                <textarea 
                                    value={manualSlideBody} 
                                    onChange={e => setManualSlideBody(e.target.value)} 
                                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300 outline-none focus:border-purple-500 transition-all" 
                                    rows={3} placeholder="Penjelasan singkat..."
                                />
                            )}

                            {isSlideOne && (
                                <div className="space-y-1 pt-2 border-t border-slate-700/50">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex gap-2"><Tag size={12}/> Label Merah</label>
                                    <input value={themeLabel} onChange={e=>setThemeLabel(e.target.value)} className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-red-400 outline-none"/>
                                </div>
                            )}
                        </div>

                        {/* TOMBOL GENERATE (TEXT BERUBAH SESUAI MODE) */}
                        <button onClick={handleGenerateImage} disabled={loadingImage || (isSlideOne && !headline)} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                             <Zap size={18} fill="currentColor"/> 
                             {postMode === 'single' 
                                ? (slides.length > 0 ? "UPDATE GAMBAR (GANTI)" : "GENERATE SINGLE POST") 
                                : (slides.length === 0 ? "GENERATE COVER" : "TAMBAH SLIDE BARU")
                             }
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2">
                             <button onClick={handleDownload} disabled={slides.length === 0} className="py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2"><Download size={14}/> Download</button>
                             <button onClick={handleNativeShare} disabled={slides.length === 0} className="py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2"><Share2 size={14}/> Share</button>
                             <button onClick={handlePostToFB} disabled={loadingPost || slides.length === 0} className="col-span-2 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2"><Facebook size={14}/> Post FB</button>
                        </div>
                    </div>

                    {/* CAPTION (KIRI) */}
                    <div className="bg-white p-5 rounded-[2rem] border border-slate-200 h-full flex flex-col">
                        <div className="flex justify-between mb-2 items-center"><span className="text-xs font-black text-slate-400 uppercase flex gap-2"><FileText size={14}/> Caption</span><Copy size={14} className="cursor-pointer text-slate-400 hover:text-purple-600" onClick={() => navigator.clipboard.writeText(caption)}/></div>
                        <textarea className="flex-1 w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium leading-relaxed outline-none resize-none focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all min-h-[300px]" value={caption} onChange={e=>setCaption(e.target.value)}/>
                    </div>

                </div>
            )}

        </div>
      </div>
    </div>
  );
}