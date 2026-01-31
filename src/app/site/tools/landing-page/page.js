"use client";
import { useState, useEffect, useRef } from 'react';
import { 
    Zap, Loader2, Plus, Trash2, Smartphone, Code, 
    FileText, Image as ImageIcon, Copy, History, 
    LayoutTemplate, X, ChevronLeft, Tablet, Monitor, 
    RefreshCw, Package, Users, Star, GripVertical
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPageBuilder() {
  const [config, setConfig] = useState({ creditCost: 100, isActive: true });
  const previewRef = useRef(null);

  // --- STATE UI ---
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false); 
  const [activeTab, setActiveTab] = useState('form'); 
  const [viewport, setViewport] = useState('desktop'); 

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  // --- STATE DATA ---
  const [history, setHistory] = useState([]);
  const [productImage, setProductImage] = useState(null);
  const [testimoniImages, setTestimoniImages] = useState([]);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [formData, setFormData] = useState({
      productName: '', targetMarket: '', productKnowledge: '', 
      originalPrice: '', price: '', benefits: [''], 
  });

  const [generatedHtml, setGeneratedHtml] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // --- 1. HANDLE RESIZE WINDOW ---
  useEffect(() => {
      const handleResize = () => {
          setIsMobile(window.innerWidth < 768);
          if (window.innerWidth >= 768) {
              setActiveTab('form'); 
          }
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- 2. RESIZABLE SIDEBAR LOGIC ---
  useEffect(() => {
      const handleMouseMove = (e) => {
          if (!isResizing) return;
          e.preventDefault(); 
          let newWidth = e.clientX;
          if(newWidth < 300) newWidth = 300;
          if(newWidth > window.innerWidth - 400) newWidth = window.innerWidth - 400;
          setSidebarWidth(newWidth);
      };

      const handleMouseUp = () => {
          setIsResizing(false);
          document.body.style.cursor = 'default';
          document.body.style.userSelect = 'auto'; 
      };
      
      if(isResizing) {
          document.body.style.cursor = 'col-resize';
          document.body.style.userSelect = 'none';
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isResizing]);

  // --- 3. LOADING ANIMATION ---
  const loadingMessages = [
      "📡 Mengakses Database Pasar...", "🧠 Analisa Psikologi Audiens...", 
      "📝 Menulis Copywriting Hipnotik...", "🎨 Merancang Layout High-Convert...", 
      "💅 Finalizing Design...", "🚀 Siap Meluncur!"
  ];

  useEffect(() => {
      let interval;
      if (loading) {
          setLoadingStep(0);
          setLoadingProgress(0);
          const progressInterval = setInterval(() => {
              setLoadingProgress(old => (old >= 95 ? 95 : old + (Math.random() * 3)));
          }, 200);
          interval = setInterval(() => setLoadingStep(p => (p + 1) % loadingMessages.length), 2000);
          return () => { clearInterval(interval); clearInterval(progressInterval); };
      } else {
          setLoadingProgress(100);
      }
  }, [loading]);

  // --- 4. DATA HANDLERS ---
  useEffect(() => {
    fetchConfig();
    fetchHistory();
    const saved = localStorage.getItem('JITU_LP_DRAFT_FORM');
    if (saved) { try { setFormData(JSON.parse(saved)); } catch(e){} }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('JITU_LP_DRAFT_FORM', JSON.stringify(formData));
  }, [formData, isLoaded]);

  const fetchConfig = async () => {
      try {
          const res = await fetch('/api/admin/tools');
          const json = await res.json();
          const myTool = json.find(t => t.slug === 'landing-page');
          if (myTool) setConfig(myTool);
      } catch (e) {}
  };

  const fetchHistory = async () => { 
      try {
        const res = await fetch('/api/user/history?tool=landing-page');
        const data = await res.json();
        setHistory(Array.isArray(data.data) ? data.data : []);
      } catch(e) {}
  };

  const handleImageUpload = (e, type) => {
      const files = e.target.files;
      if (files?.length) {
          setUploadingImg(true); 
          setTimeout(() => {
              if (type === 'product') setProductImage(URL.createObjectURL(files[0]));
              else {
                  const urls = Array.from(files).map(f => URL.createObjectURL(f));
                  setTestimoniImages(prev => [...prev, ...urls].slice(0, 5));
              }
              setUploadingImg(false);
          }, 800);
      }
  };

  const handleResetForm = () => {
      if(confirm("Reset form?")) {
          setFormData({ productName: '', targetMarket: '', productKnowledge: '', originalPrice: '', price: '', benefits: [''] });
          setProductImage(null); setTestimoniImages([]); setGeneratedHtml('');
          localStorage.removeItem('JITU_LP_DRAFT_FORM');
      }
  };

  const handleGenerate = async () => {
      if(!formData.productName) return;
      setLoading(true);
      if (window.innerWidth < 768) setTimeout(() => {
          previewRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      try {
          const res = await fetch('/api/ai', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  type: 'landing-page',
                  data: {
                      ...formData,
                      benefits: formData.benefits.filter(b => b.trim() !== ''),
                      testimoniCount: testimoniImages.length > 0 ? testimoniImages.length : 2
                  }
              })
          });
          const data = await res.json();
          if(!res.ok) throw new Error(data.message);

          const code = data.result ? data.result.replace(/```html/gi, '').replace(/```/g, '').trim() : '';
          setGeneratedHtml(code);

          await fetch('/api/user/history', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ toolType: 'landing-page', title: formData.productName, inputData: formData, resultData: code })
          });
          fetchHistory();
      } catch (err) { alert(err.message); } 
      finally { setLoading(false); }
  };

  const handleLoadHistory = (item) => {
      setActiveHistoryId(item._id);
      if(item.inputData) setFormData(item.inputData);
      if(item.resultData) {
          setGeneratedHtml(item.resultData.replace(/```html/gi, '').replace(/```/g, '').trim());
          if(window.innerWidth < 768) setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
      }
      setIsHistoryOpen(false);
  };

  const handleDeleteHistory = async (e, id) => {
      e.stopPropagation();
      if(!confirm("Hapus?")) return;
      try {
          await fetch(`/api/user/history?id=${id}`, { method: 'DELETE' });
          setHistory(prev => prev.filter(h => h._id !== id));
          if(activeHistoryId === id) setGeneratedHtml('');
      } catch(err) {}
  };

  const getPreviewHtml = () => {
      if (!generatedHtml) return '';
      let html = generatedHtml;
      const PLACEHOLDER_PROD = 'https://placehold.co/600x400/f1f5f9/334155?text=Product+Image';
      const finalProdImg = productImage || PLACEHOLDER_PROD;
      html = html.replace(/https:\/\/placehold\.co\/600x400\/f1f5f9\/334155\?text=Product\+Image/g, finalProdImg) 
                 .replace(/__PRODUCT_IMAGE__/g, finalProdImg);

      testimoniImages.forEach((url, i) => {
          html = html.replace(new RegExp(`https://placehold.co/100x100/f1f5f9/334155\\?text=User${i+1}`, 'g'), url) 
                     .replace(new RegExp(`__TESTIMONI_${i}__`, 'g'), url);
      });
      return html;
  };

  // --- SUB-COMPONENT: HISTORY DRAWER ---
  const HistoryDrawer = () => (
      <>
        {isHistoryOpen && <div className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm transition-opacity" onClick={() => setIsHistoryOpen(false)} />}
        <div className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-xs bg-white z-[70] shadow-2xl transition-transform duration-300 transform ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><History size={18} className="text-emerald-600"/> Riwayat Project</h3>
                <button onClick={()=>setIsHistoryOpen(false)} className="p-1.5 hover:bg-slate-50 rounded-lg"><X size={18}/></button>
            </div>
            <div className="p-2 overflow-y-auto h-full pb-20 bg-slate-50/50">
                {history.length === 0 ? <p className="text-xs text-gray-400 text-center mt-10">Belum ada riwayat.</p> : history.map((item) => (
                    <div key={item._id} onClick={() => handleLoadHistory(item)} className={`p-3 rounded-xl border mb-2 cursor-pointer transition-all shadow-sm ${activeHistoryId === item._id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white hover:border-emerald-300'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-gray-400 font-bold">{new Date(item.createdAt).toLocaleDateString()}</span>
                            <button onClick={(e) => handleDeleteHistory(e, item._id)} className="text-gray-300 hover:text-rose-500"><Trash2 size={14}/></button>
                        </div>
                        <h4 className={`text-xs font-bold line-clamp-1 ${activeHistoryId === item._id ? 'text-emerald-700' : 'text-slate-700'}`}>{item.title || "Landing Page"}</h4>
                    </div>
                ))}
            </div>
        </div>
      </>
  );

  return (
    // CONTAINER UTAMA
    <div className="min-h-screen md:h-[calc(100vh-85px)] md:overflow-hidden bg-white font-poppins text-gray-900 flex flex-col md:flex-row relative">
      <HistoryDrawer />

      {/* --- GLOBAL OVERLAY SAAT RESIZING --- */}
      {isResizing && <div className="fixed inset-0 z-[9999] cursor-col-resize bg-transparent"></div>}

      {/* --- LEFT PANEL: INPUT --- */}
      <div 
        style={{ width: isMobile ? '100%' : `${sidebarWidth}px` }}
        className="shrink-0 flex flex-col border-r border-slate-200 bg-white z-10 transition-none md:h-full"
      >
          {/* HEADER UTILITY (History & Reset) */}
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
              <div className="flex items-center gap-2">
                  <Link href="/site/dashboard" className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors">
                      <ChevronLeft size={20}/>
                  </Link>
                  <h2 className="font-black text-slate-800 text-sm tracking-wide">BUILDER</h2>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={() => setIsHistoryOpen(true)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors" title="Riwayat"><History size={18}/></button>
                  <button onClick={handleResetForm} className="text-[10px] font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg"><RefreshCw size={12}/> Reset</button>
              </div>
          </div>

          {/* FORM SCROLLABLE */}
          <div className="flex-1 p-5 pb-10 bg-slate-50/30 md:overflow-y-auto custom-scrollbar">
              <div className="space-y-5">
                  
                  {/* --- NEW: INFO & COST CARD (POSISI BARU) --- */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                          <h1 className="text-xs font-black uppercase tracking-widest text-emerald-900 flex items-center gap-2">
                             <LayoutTemplate className="w-4 h-4 text-emerald-600" /> LP Builder AI
                          </h1>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                              Biaya: {config.creditCost} Poin
                          </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                          Generator Landing Page otomatis dengan struktur copywriting hipnotik. Isi form di bawah ini selengkap mungkin.
                      </p>
                  </div>

                  {/* IDENTITAS */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-2 opacity-60"><Package size={14} className="text-emerald-600"/><span className="text-[10px] font-black uppercase tracking-widest">Produk</span></div>
                      <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 transition-all" placeholder="Nama Produk" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} />
                      <div className="grid grid-cols-2 gap-3">
                          <div className="relative"><span className="absolute left-3 top-3 text-xs text-slate-400">Rp</span><input type="number" className="w-full pl-8 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:bg-white focus:border-emerald-500" placeholder="Coret" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} /></div>
                          <div className="relative"><span className="absolute left-3 top-3 text-xs text-emerald-600 font-bold">Rp</span><input type="number" className="w-full pl-8 p-3 bg-emerald-50/30 border border-emerald-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-emerald-500" placeholder="Jual" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
                      </div>
                  </div>

                  {/* DETAIL */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-2 opacity-60"><Users size={14} className="text-emerald-600"/><span className="text-[10px] font-black uppercase tracking-widest">Detail</span></div>
                      <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-emerald-500" placeholder="Target Market" value={formData.targetMarket} onChange={e => setFormData({...formData, targetMarket: e.target.value})} />
                      <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-emerald-500 h-28 resize-none" placeholder="Penjelasan produk..." value={formData.productKnowledge} onChange={e => setFormData({...formData, productKnowledge: e.target.value})} />
                  </div>

                  {/* USP */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 mb-2 opacity-60"><Star size={14} className="text-emerald-600"/><span className="text-[10px] font-black uppercase tracking-widest">Keunggulan</span></div>
                      {formData.benefits.map((b, i) => (
                          <div key={i} className="flex gap-2"><input type="text" className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-emerald-500" value={b} onChange={e => {const n=[...formData.benefits]; n[i]=e.target.value; setFormData({...formData, benefits:n})}} placeholder={`Poin ${i+1}`}/></div>
                      ))}
                      <button onClick={()=>{setFormData({...formData, benefits: [...formData.benefits, '']})}} className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline"><Plus size={14}/> Tambah</button>
                  </div>

                  {/* MEDIA */}
                  <div className="grid grid-cols-2 gap-3">
                      <label className={`h-24 bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 relative overflow-hidden group ${!productImage && 'opacity-60 hover:opacity-100'}`}>
                          {uploadingImg ? <Loader2 className="animate-spin text-emerald-500"/> : productImage ? <img src={productImage} className="w-full h-full object-cover"/> : <ImageIcon className="text-slate-400 mb-1"/>}
                          <input type="file" className="hidden" onChange={e => handleImageUpload(e, 'product')} accept="image/*" disabled={uploadingImg}/>
                          {!productImage && <span className="text-[9px] font-bold text-slate-400">FOTO</span>}
                      </label>
                      <label className={`h-24 bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 overflow-hidden group`}>
                          {uploadingImg ? <Loader2 className="animate-spin text-emerald-500"/> : <Plus className="text-slate-400 mb-1"/>}
                          <input type="file" className="hidden" onChange={e => handleImageUpload(e, 'testimoni')} accept="image/*" multiple disabled={uploadingImg}/>
                          <span className="text-[9px] font-bold text-slate-400">TESTIMONI</span>
                      </label>
                  </div>
              </div>
          </div>

          <div className="p-5 border-t border-slate-100 bg-white sticky bottom-0 z-20 shadow-lg">
              <button 
                onClick={handleGenerate} 
                disabled={loading || uploadingImg || !formData.productName} 
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm tracking-widest shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-slate-800 transition-all active:scale-95 group relative overflow-hidden"
              >
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"></div>
                  {loading ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} fill="currentColor" className="text-yellow-400"/>}
                  {loading ? 'MERACIK...' : 'GENERATE PAGE'}
              </button>
          </div>
      </div>

      {/* --- RESIZER HANDLE (Desktop Only) --- */}
      <div 
        className="hidden md:flex w-1.5 bg-slate-100 hover:bg-emerald-500 cursor-col-resize items-center justify-center transition-colors z-30"
        onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
      >
          <GripVertical size={12} className={`transition-colors ${isResizing ? 'text-white' : 'text-slate-300'}`}/>
      </div>

      {/* --- RIGHT PANEL: PREVIEW --- */}
      <div className="w-full md:flex-1 h-[700px] md:h-full bg-slate-100 flex flex-col relative" ref={previewRef}>
          
          {/* Top Bar Desktop */}
          <div className="hidden md:flex h-14 bg-white border-b border-slate-200 justify-between items-center px-4 shrink-0 shadow-sm z-20">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setViewport('mobile')} className={`p-1.5 rounded transition-all ${viewport === 'mobile' ? 'bg-white shadow text-emerald-600' : 'text-slate-400'}`} title="Mobile"><Smartphone size={16}/></button>
                  <button onClick={() => setViewport('tablet')} className={`p-1.5 rounded transition-all ${viewport === 'tablet' ? 'bg-white shadow text-emerald-600' : 'text-slate-400'}`} title="Tablet"><Tablet size={16}/></button>
                  <button onClick={() => setViewport('desktop')} className={`p-1.5 rounded transition-all ${viewport === 'desktop' ? 'bg-white shadow text-emerald-600' : 'text-slate-400'}`} title="Desktop"><Monitor size={16}/></button>
              </div>
              <button onClick={() => navigator.clipboard.writeText(generatedHtml)} className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-all flex items-center gap-1 active:scale-95"><Code size={14}/> Salin HTML</button>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-hidden relative flex flex-col items-center justify-center p-0 md:p-8 bg-[#F8FAFC]">
              
              <div className="md:hidden w-full bg-slate-800 text-white text-xs font-bold py-2 text-center shadow-md">
                  HASIL LANDING PAGE
              </div>

              {loading && (
                  <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center backdrop-blur-sm animate-in fade-in">
                      <div className="relative mb-6">
                          <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center animate-bounce shadow-2xl">
                              <Code size={40} className="text-emerald-400" />
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">{Math.round(loadingProgress)}%</div>
                      </div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight animate-pulse">AI SEDANG BEKERJA</h3>
                      <div className="w-64 h-2 bg-slate-100 rounded-full mt-4 overflow-hidden border border-slate-200">
                          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-300 ease-out" style={{width: `${loadingProgress}%`}}></div>
                      </div>
                      <p className="text-xs font-mono text-emerald-600 mt-4 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 flex items-center gap-2 animate-pulse">
                          {loadingMessages[loadingStep]}
                      </p>
                  </div>
              )}

              {!generatedHtml ? (
                  <div className="text-center opacity-40 max-w-sm p-10">
                      <LayoutTemplate size={64} className="mx-auto mb-4 text-slate-300"/>
                      <h3 className="font-bold text-slate-600">Preview Kosong</h3>
                      <p className="text-xs text-slate-400 mt-1">Generate untuk melihat hasil.</p>
                  </div>
              ) : (
                  <>
                      {isResizing && <div className="absolute inset-0 z-50 bg-transparent cursor-col-resize"></div>}
                      
                      <div className={`
                          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] bg-white shadow-2xl overflow-hidden relative border-slate-800 z-10
                          ${viewport === 'mobile' ? 'w-full md:w-[375px] h-full md:h-[85vh] md:rounded-[3rem] md:border-[10px] md:ring-4 ring-slate-900/5' : ''}
                          ${viewport === 'tablet' ? 'w-full md:w-[768px] h-full md:h-[90vh] md:rounded-2xl md:border-[8px] md:ring-4 ring-slate-900/5' : ''}
                          ${viewport === 'desktop' ? 'w-full h-full rounded-none border-0' : ''}
                      `}>
                          <iframe 
                            srcDoc={getPreviewHtml()} 
                            className={`w-full h-full bg-white border-none ${isResizing ? 'pointer-events-none' : ''}`}
                            title="Preview"
                            sandbox="allow-scripts" 
                          />
                      </div>
                  </>
              )}
          </div>
      </div>
    </div>
  );
}