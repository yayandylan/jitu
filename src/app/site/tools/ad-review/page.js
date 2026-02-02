"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect, useRef } from 'react';
import remarkGfm from 'remark-gfm'; 
import { 
  ScanEye, Loader2, Upload, History, Trash2, 
  ChevronRight, Globe, Image as ImageIcon, X, 
  CheckCircle, Share2, Sparkles, Link as LinkIcon, Video, PlayCircle, Gauge 
} from 'lucide-react';
import Link from 'next/link';

export default function AdReviewPage() {
  // --- STATE ---
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState(null); // 'image' | 'video'
  const [lpLink, setLpLink] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Mulai Diagnosa");
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [config, setConfig] = useState({ creditCost: 80, isActive: true });
  
  const resultRef = useRef(null);

  // --- FETCH DATA ---
  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/user/history?tool=ad-review');
      const data = await res.json();
      if (data.data) setHistory(data.data);
    } catch (err) { console.error("History error"); }
  };

  useEffect(() => {
    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/admin/tools');
            const json = await res.json();
            const myTool = json.find(t => t.slug === 'ad-review');
            if (myTool) setConfig(myTool);
        } catch (e) {}
    };
    fetchConfig();
    fetchHistory();
  }, []);

  // --- HELPER: KOMPRESI GAMBAR (PENTING AGAR TIDAK ERROR "REQUEST TOO LARGE") ---
  const compressImage = async (imageFile) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(imageFile);
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Resize: Max Lebar 800px (Cukup untuk AI baca, hemat size)
            const MAX_WIDTH = 800;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Kompres ke JPEG quality 0.7
            canvas.toBlob((blob) => {
                resolve(new File([blob], "compressed_image.jpg", { type: "image/jpeg" }));
            }, "image/jpeg", 0.7);
        };
    });
  };

  // --- HELPER: VIDEO FRAME EXTRACTOR (DENGAN RESIZE) ---
  const extractFramesFromVideo = async (videoFile) => {
    setLoadingText("Mengekstrak Frame Video...");
    return new Promise((resolve) => {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(videoFile);
        video.currentTime = 1; // Mulai dari detik ke-1 biar bukan layar hitam
        
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const frames = [];

        video.onloadeddata = () => {
            // Resize Frame Video juga agar ringan
            const MAX_WIDTH = 800;
            let width = video.videoWidth;
            let height = video.videoHeight;
            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }
            canvas.width = width;
            canvas.height = height;
        };

        const captureFrame = (time) => {
            return new Promise((res) => {
                video.currentTime = time;
                video.onseeked = () => {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((blob) => {
                        res(new File([blob], `frame_${time}.jpg`, { type: "image/jpeg" }));
                    }, "image/jpeg", 0.7);
                };
            });
        };

        video.oncanplay = async () => {
            // Ambil 1 frame terbaik di tengah durasi
            const midPoint = video.duration / 2;
            const frame = await captureFrame(midPoint > 0 ? midPoint : 1);
            frames.push(frame);
            resolve(frames);
        };
    });
  };

  // --- HANDLERS ---
  const handleFileChange = (e) => {
      const f = e.target.files[0];
      if (f) {
          if (f.size > 100 * 1024 * 1024) return alert("File terlalu besar (Max 100MB)");
          setFile(f);
          setPreview(URL.createObjectURL(f));
          setFileType(f.type.startsWith('video/') ? 'video' : 'image');
      }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if(!config.isActive) return alert("Fitur sedang maintenance.");
    if (!file || !lpLink) return alert("Mohon upload iklan & masukkan link LP!");
    
    setLoading(true); 
    setResult(''); 
    setActiveHistoryId(null);
    setLoadingText("Mengompres Media..."); // Info ke user

    const formData = new FormData();
    formData.append('lpLink', lpLink);
    formData.append('type', 'ad-review'); 

    try {
        let fileToSend = file;

        // 1. JIKA VIDEO: Ekstrak Frame & Resize
        if (fileType === 'video') {
            const frames = await extractFramesFromVideo(file);
            fileToSend = frames[0]; // Ambil frame hasil ekstrak
        } 
        // 2. JIKA GAMBAR: Kompres dulu jika size > 1MB
        else if (file.size > 1 * 1024 * 1024) { 
            fileToSend = await compressImage(file);
        }

        formData.append('file', fileToSend);

        setLoadingText("Sedang Menganalisa AI...");

        const res = await fetch('/api/ai/vision', { method: 'POST', body: formData });
        
        // Handle Error JSON vs HTML (Request Too Large)
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Gagal: File terlalu besar atau server error (${res.status}).`);
        }

        const data = await res.json();

        if (res.status === 402) { alert("Poin tidak cukup!"); setLoading(false); return; }
        if (!res.ok) throw new Error(data.message || "Gagal analisa");
        
        setResult(data.result);
        fetchHistory(); 
        
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    } catch (err) { 
        console.error(err);
        alert(err.message); 
    } 
    finally { setLoading(false); setLoadingText("Mulai Diagnosa"); }
  };

  const handleSelectHistory = (item) => {
    setActiveHistoryId(item._id);
    if (item.inputData?.lpLink) setLpLink(item.inputData.lpLink);
    const output = typeof item.resultData === 'string' ? item.resultData : item.resultData?.text;
    setResult(output || "");
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

  const HistoryList = () => (
    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 h-full">
        {history.length === 0 ? (
            <div className="text-center py-10 opacity-50">
                <History size={24} className="mx-auto mb-2 text-slate-300" />
                <p className="text-[10px] font-bold text-slate-400 uppercase">Belum ada riwayat</p>
            </div>
        ) : (
            history.map((item) => (
                <div 
                    key={item._id} 
                    onClick={() => handleSelectHistory(item)}
                    className={`group p-3 rounded-xl border cursor-pointer transition-all active:scale-95
                        ${activeHistoryId === item._id 
                            ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-100' 
                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'}
                    `}
                >
                    <div className="flex justify-between items-center mb-1.5 pb-1.5 border-b border-dashed border-slate-100 group-hover:border-slate-200">
                        <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 group-hover:text-indigo-600">
                            {new Date(item.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
                        </span>
                        <button onClick={(e) => handleDeleteHistory(e, item._id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                            <Trash2 size={12} />
                        </button>
                    </div>
                    <h4 className={`text-[10px] font-bold leading-tight line-clamp-2 ${activeHistoryId === item._id ? 'text-indigo-700' : 'text-slate-700'}`}>
                        {item.inputData?.lpLink || "Audit Iklan"}
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
         <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm shrink-0">
            <h1 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-3 text-indigo-900">
                <ScanEye className="w-4 h-4 text-indigo-600" /> Ad & LP Reviewer
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-2 rounded-xl w-full justify-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Biaya: {config.creditCost} Poin / Audit
            </div>
         </div>

         <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                <History size={14} /> Riwayat Audit
            </h3>
            <HistoryList />
         </div>
      </div>

      {/* --- MOBILE DRAWER --- */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsHistoryOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col border-l border-slate-100 ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-indigo-900">
                <History size={16} className="text-indigo-600" /> Riwayat
             </h3>
             <button onClick={() => setIsHistoryOpen(false)} className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-rose-500"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50"><HistoryList /></div>
      </div>

      {/* --- KONTEN KANAN --- */}
      <div className="lg:col-span-9 h-full flex flex-col overflow-y-auto custom-scrollbar space-y-6 pr-1 md:pr-4">
        
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><ScanEye size={16}/></div>
                Ad Reviewer
            </div>
            <button onClick={() => setIsHistoryOpen(true)} className="p-2 bg-slate-50 rounded-lg text-slate-500"><History size={18}/></button>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 shrink-0">
            <div className="mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-800 mb-1">Checkup Kesehatan Iklan</h2>
                <p className="text-xs text-slate-500">Upload video/gambar iklan dan link landing page untuk analisa sinkronisasi.</p>
            </div>

            <form onSubmit={handleAnalyze} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Video size={14} className="text-indigo-600" /> 1. Kreatif Iklan (Video / Gambar)
                    </label>
                    
                    {!preview ? (
                        <label className="flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-slate-300 rounded-3xl cursor-pointer bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-400 transition-all group relative overflow-hidden">
                            <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
                            <div className="relative z-10 flex flex-col items-center animate-in zoom-in duration-300">
                                <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform text-indigo-500">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-bold text-slate-600">Klik Upload Kreatif</p>
                                <p className="text-[9px] text-slate-400 mt-1">MP4 / PNG / JPG</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                        </label>
                    ) : (
                        <div className="relative h-48 md:h-64 rounded-3xl bg-slate-900 border-2 border-indigo-500/50 flex items-center justify-center overflow-hidden group">
                            {fileType === 'video' ? (
                                <video src={preview} controls className="w-full h-full object-contain" autoPlay muted loop />
                            ) : (
                                <img src={preview} className="w-full h-full object-contain" alt="Preview" />
                            )}
                            <button type="button" onClick={() => {setFile(null); setPreview(null);}} className="absolute top-4 right-4 p-2 bg-white text-rose-600 rounded-full hover:bg-rose-50 shadow-lg z-20">
                                <X size={16}/>
                            </button>
                            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase flex items-center gap-1 border border-white/10">
                                {fileType === 'video' ? <><PlayCircle size={12}/> Video Ad</> : <><ImageIcon size={12}/> Image Ad</>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Globe size={14} className="text-indigo-600" /> 2. Link Landing Page
                    </label>
                    <div className="relative group">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                        <input required type="url" value={lpLink} onChange={(e) => setLpLink(e.target.value)} placeholder="https://website-anda.com/promo" className="w-full pl-11 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400" />
                    </div>
                </div>

                <button type="submit" disabled={loading || !file} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 group">
                    {loading ? <Loader2 className="animate-spin" /> : <><Gauge size={18} className="group-hover:scale-110 transition-transform"/> {loadingText}</>}
                </button>
            </form>
        </div>

        <div ref={resultRef} className="pb-10">
        {result && (
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-indigo-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-slate-900 px-8 py-5 flex justify-between items-center border-b border-slate-800">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={16} className="text-yellow-400"/> Laporan Medis Iklan
                    </h3>
                    <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold text-indigo-300 border border-white/10">VISION AI</div>
                </div>

                <div className="p-8 md:p-10 prose prose-sm max-w-none prose-headings:font-black prose-headings:text-slate-800 prose-p:text-slate-600 prose-strong:text-indigo-700 prose-strong:bg-indigo-50 prose-strong:px-1 prose-strong:rounded">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>

                <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex justify-between items-center gap-3">
                    <p className="text-[10px] text-slate-400 font-medium hidden sm:block">AI Funnel Doctor</p>
                    <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Hasil Audit:\n" + result)}`)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
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