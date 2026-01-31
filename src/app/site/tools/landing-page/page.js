"use client";
import { useState, useEffect, useRef } from 'react';
import { 
    Zap, Loader2, Plus, Trash2, Smartphone, Code, 
    FileText, Image as ImageIcon, Copy, History, 
    LayoutTemplate, X, ChevronLeft, Tablet, Monitor, 
    RefreshCw, Package, Users, Star, Layers, GripVertical, ArrowDown
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPageBuilder() {
  const [config, setConfig] = useState({ creditCost: 100, isActive: true });
  
  // REFS (Untuk Auto Scroll)
  const previewRef = useRef(null);

  // STATE RESIZABLE (Desktop Only)
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);

  // STATE UI
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [viewport, setViewport] = useState('desktop');

  // STATE DATA
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

  // --- ANIMATED LOADING STEPS ---
  const loadingMessages = [
      "📡 Mengakses Database Pasar...",
      "🧠 Menganalisa Psikologi Audiens...",
      "📝 Menulis Copywriting Hipnotik...",
      "🎨 Merancang Layout Konversi Tinggi...",
      "💅 Finalizing Design & Tailwind CSS...",
      "🚀 Landing Page Siap Meluncur!"
  ];

  useEffect(() => {
      let interval;
      if (loading) {
          setLoadingStep(0);
          setLoadingProgress(0);
          const progressInterval = setInterval(() => {
              setLoadingProgress(old => {
                  if (old >= 95) return 95;
                  return old + (Math.random() * 3);
              });
          }, 200);
          interval = setInterval(() => {
              setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
          }, 2000);
          return () => {
              clearInterval(interval);
              clearInterval(progressInterval);
          };
      } else {
          setLoadingProgress(100);
      }
  }, [loading]);

  // --- RESIZE LOGIC (Desktop) ---
  useEffect(() => {
      const handleMouseMove = (e) => {
          if (!isResizing) return;
          e.preventDefault(); 
          let w = e.clientX;
          if(w < 320) w = 320; 
          if(w > window.innerWidth - 400) w = window.innerWidth - 400; 
          setSidebarWidth(w);
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

  // --- LOAD DATA ---
  useEffect(() => {
    fetchConfig();
    fetchHistory();
    const savedDraft = localStorage.getItem('JITU_LP_DRAFT_FORM');
    if (savedDraft) {
        try {
            const parsed = JSON.parse(savedDraft);
            if (parsed.productName !== undefined) setFormData(parsed);
        } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('JITU_LP_DRAFT_FORM', JSON.stringify(formData));
  }, [formData, isLoaded]);

  const fetchConfig = async () => {
    try {
        const res = await fetch('/api/admin/tools').catch(() => null);
        if(res?.ok) {
            const tools = await res.json();
            const myTool = tools.find(t => t.slug === 'landing-page');
            if (myTool) setConfig(myTool);
        }
    } catch (e) {}
  };

  const fetchHistory = async () => {
    try {
        const res = await fetch('/api/user/history?tool=landing-page').catch(() => null);
        if(res?.ok) {
            const data = await res.json();
            setHistory(Array.isArray(data.data) ? data.data : []);
        }
    } catch (e) {}
  };

  // --- HANDLERS ---
  const handleAddBenefit = () => setFormData({...formData, benefits: [...formData.benefits, '']});
  const handleRemoveBenefit = (i) => {
      const b = [...formData.benefits]; b.splice(i, 1); setFormData({...formData, benefits: b});
  };
  const handleChangeBenefit = (v, i) => {
      const b = [...formData.benefits]; b[i] = v; setFormData({...formData, benefits: b});
  };

  const handleImageUpload = (e, type) => {
      const files = e.target.files;
      if (files && files.length > 0) {
          setUploadingImg(true); 
          setTimeout(() => {
              if (type === 'product') {
                  setProductImage(URL.createObjectURL(files[0]));
              } else {
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
          setProductImage(null); setTestimoniImages([]); setGeneratedHtml(''); setActiveHistoryId(null);
          localStorage.removeItem('JITU_LP_DRAFT_FORM');
      }
  };

  const handleGenerate = async () => {
      if(!formData.productName || !config.isActive) return;
      setLoading(true);
      
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

          const cleanCode = extractHtml(data.result);
          setGeneratedHtml(cleanCode);

          await fetch('/api/user/history', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({
                  toolType: 'landing-page',
                  title: formData.productName,
                  inputData: formData,
                  resultData: cleanCode
              })
          });
          fetchHistory();

          // AUTO SCROLL KE PREVIEW (MOBILE)
          setTimeout(() => {
              previewRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 500);

      } catch (err) { alert(err.message); } 
      finally { setLoading(false); }
  };

  const handleLoadHistory = (item) => {
      setActiveHistoryId(item._id);
      if(item.inputData) setFormData(item.inputData);
      if(item.resultData) {
          setGeneratedHtml(extractHtml(item.resultData));
          // Auto Scroll saat load history
          setTimeout(() => {
              previewRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 200);
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

  // --- UTILS ---
  const extractHtml = (text) => text ? text.replace(/```html/gi, '').replace(/```/g, '').trim() : '';

  const getPreviewHtml = () => {
      if (!generatedHtml) return '';
      let html = generatedHtml;
      
      const PLACEHOLDER_PROD = 'https://placehold.co/600x400/f1f5f9/334155?text=Product+Image';
      const PLACEHOLDER_TESTI = 'https://placehold.co/100x100/f1f5f9/334155?text=User';

      const finalProdImg = productImage || PLACEHOLDER_PROD;
      html = html.replace(/https:\/\/placehold\.co\/600x400\/e2e8f0\/1e293b\?text=Product\+Image/g, finalProdImg)
                 .replace(/__PRODUCT_IMAGE__/g, finalProdImg);

      testimoniImages.forEach((url, i) => {
          html = html.replace(new RegExp(`https://placehold.co/100x100/e2e8f0/1e293b\\?text=User${i+1}`, 'g'), url)
                     .replace(new RegExp(`__TESTIMONI_${i}__`, 'g'), url);
      });
      
      return html;
  };

  // --- HISTORY DRAWER ---
  const HistoryDrawer = () => (
      <>
        {isHistoryOpen && <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setIsHistoryOpen(false)} />}
        <div className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-xs bg-white z-[60] shadow-2xl transition-transform duration-300 transform ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><History size={18} className="text-emerald-600"/> Riwayat Project</h3>
                <button onClick={()=>setIsHistoryOpen(false)} className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors"><X size={18}/></button>
            </div>
            <div className="p-4 overflow-y-auto h-full pb-20 bg-slate-50/50">
                {history.length === 0 ? <p className="text-xs text-gray-400 text-center mt-10">Belum ada riwayat.</p> : history.map((item) => (
                    <div key={item._id} onClick={() => handleLoadHistory(item)} className={`p-3 rounded-xl border mb-2 cursor-pointer transition-all active:scale-95 ${activeHistoryId === item._id ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-100 bg-white hover:border-emerald-300 hover:shadow-sm'}`}>
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
    // PARENT CONTAINER: Hapus h-screen fixed di mobile agar bisa scroll ke bawah
    <div className="min-h-screen md:h-[calc(100vh-85px)] md:overflow-hidden bg-white font-poppins text-gray-900 flex flex-col md:flex-row relative selection:bg-emerald-100 selection:text-emerald-900">
      <HistoryDrawer />

      {/* --- LEFT PANEL: INPUT --- */}
      {/* Mobile: Full Width, Auto Height. Desktop: Fixed Resizable Width, Full Height Scroll */}
      <div 
        style={{ width: (typeof window !== 'undefined' && window.innerWidth >= 768 ? `${sidebarWidth}px` : '100%') }}
        className="shrink-0 flex flex-col border-r border-slate-200 bg-white z-10 transition-all duration-200 ease-in-out md:h-full"
      >
          {/* HEADER */}
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-20">
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200 animate-in zoom-in duration-300"><Zap size={16} fill="currentColor"/></div>
                  <h2 className="font-black text-slate-800 text-sm tracking-wide">BUILDER</h2>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={() => setIsHistoryOpen(true)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors" title="Riwayat"><History size={18}/></button>
                  <button onClick={()=>{if(confirm('Reset?')) setFormData({productName:'',targetMarket:'',productKnowledge:'',originalPrice:'',price:'',benefits:['']})}} className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"><RefreshCw size={16}/></button>
              </div>
          </div>

          {/* FORM */}
          {/* Desktop: overflow-y-auto. Mobile: overflow-visible (scroll body) */}
          <div className="flex-1 p-5 pb-10 bg-slate-50/30 md:overflow-y-auto custom-scrollbar">
              <div className="space-y-5">
                  {/* IDENTITAS */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center gap-2 mb-2 opacity-60"><Package size={14} className="text-emerald-600"/><span className="text-[10px] font-black uppercase tracking-widest">Produk</span></div>
                      <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:scale-[1.01] transition-all" placeholder="Nama Produk" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} />
                      <div className="grid grid-cols-2 gap-3">
                          <div className="relative"><span className="absolute left-3 top-3 text-xs text-slate-400">Rp</span><input type="number" className="w-full pl-8 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-emerald-500 transition-all" placeholder="Coret" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} /></div>
                          <div className="relative"><span className="absolute left-3 top-3 text-xs text-emerald-600 font-bold">Rp</span><input type="number" className="w-full pl-8 p-3 bg-emerald-50/30 border border-emerald-200 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all" placeholder="Jual" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
                      </div>
                  </div>

                  {/* DETAIL */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center gap-2 mb-2 opacity-60"><Users size={14} className="text-emerald-600"/><span className="text-[10px] font-black uppercase tracking-widest">Detail</span></div>
                      <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-emerald-500 focus:scale-[1.01] transition-all" placeholder="Target Market" value={formData.targetMarket} onChange={e => setFormData({...formData, targetMarket: e.target.value})} />
                      <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-emerald-500 transition-all h-24 resize-none" placeholder="Penjelasan produk..." value={formData.productKnowledge} onChange={e => setFormData({...formData, productKnowledge: e.target.value})} />
                  </div>

                  {/* USP */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center gap-2 mb-2 opacity-60"><Star size={14} className="text-emerald-600"/><span className="text-[10px] font-black uppercase tracking-widest">Keunggulan</span></div>
                      {formData.benefits.map((b, i) => (
                          <div key={i} className="flex gap-2"><input type="text" className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:bg-white focus:border-emerald-500 focus:scale-[1.01] transition-all" value={b} onChange={e => {const n=[...formData.benefits]; n[i]=e.target.value; setFormData({...formData, benefits:n})}} placeholder={`Poin ${i+1}`}/></div>
                      ))}
                      <button onClick={() => setFormData({...formData, benefits: [...formData.benefits, '']})} className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline"><Plus size={14}/> Tambah</button>
                  </div>

                  {/* MEDIA */}
                  <div className="grid grid-cols-2 gap-3">
                      <label className={`h-24 bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all overflow-hidden relative group ${!productImage && 'opacity-60 hover:opacity-100'}`}>
                          {uploadingImg ? <Loader2 className="animate-spin text-emerald-500"/> : productImage ? <img src={productImage} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/> : <ImageIcon className="text-slate-400 mb-1 group-hover:text-emerald-500 transition-colors"/>}
                          <input type="file" className="hidden" onChange={e => handleImageUpload(e, 'product')} accept="image/*" disabled={uploadingImg}/>
                          {!productImage && <span className="text-[9px] font-bold text-slate-400 group-hover:text-emerald-600">FOTO</span>}
                      </label>
                      <label className={`h-24 bg-white border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/20 transition-all overflow-hidden group`}>
                          {uploadingImg ? <Loader2 className="animate-spin text-emerald-500"/> : <Plus className="text-slate-400 mb-1 group-hover:text-emerald-500 transition-colors"/>}
                          <input type="file" className="hidden" onChange={e => handleImageUpload(e, 'testimoni')} accept="image/*" multiple disabled={uploadingImg}/>
                          <span className="text-[9px] font-bold text-slate-400 group-hover:text-emerald-600">TESTIMONI</span>
                      </label>
                  </div>
              </div>
          </div>

          <div className="p-5 border-t border-slate-100 bg-white sticky bottom-0 z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
              <button 
                onClick={handleGenerate} 
                disabled={loading || uploadingImg || !formData.productName} 
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm tracking-widest shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 group relative overflow-hidden"
              >
                  <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent z-10"></div>
                  {loading ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} fill="currentColor" className="text-yellow-400"/>}
                  {loading ? 'MERACIK...' : 'GENERATE PAGE'}
              </button>
          </div>
      </div>

      {/* --- RESIZER --- */}
      <div 
        className={`w-1.5 bg-slate-100 hover:bg-emerald-500 cursor-col-resize hidden md:flex items-center justify-center transition-colors z-30 ${isResizing ? 'bg-emerald-500' : ''}`} 
        onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
      >
          <GripVertical size={12} className={`transition-colors ${isResizing ? 'text-white' : 'text-slate-300'}`}/>
      </div>

      {/* --- RIGHT PANEL: PREVIEW (STACKED ON MOBILE) --- */}
      {/* Mobile: Full height, Visible. Desktop: Flex-1 */}
      <div className="w-full md:flex-1 h-[700px] md:h-full bg-slate-100 flex flex-col relative" ref={previewRef}>
          
          {/* Top Bar Desktop Only */}
          <div className="hidden md:flex h-14 bg-white border-b border-slate-200 justify-between items-center px-4 shrink-0 shadow-sm z-20">
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setViewport('mobile')} className={`p-1.5 rounded transition-all ${viewport === 'mobile' ? 'bg-white shadow text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}><Smartphone size={16}/></button>
                  <button onClick={() => setViewport('tablet')} className={`p-1.5 rounded transition-all ${viewport === 'tablet' ? 'bg-white shadow text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}><Tablet size={16}/></button>
                  <button onClick={() => setViewport('desktop')} className={`p-1.5 rounded transition-all ${viewport === 'desktop' ? 'bg-white shadow text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}><Monitor size={16}/></button>
              </div>
              <button onClick={() => navigator.clipboard.writeText(generatedHtml)} className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-all flex items-center gap-1 active:scale-95"><Code size={14}/> Salin HTML</button>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-hidden relative flex flex-col items-center justify-center p-0 md:p-8 bg-[#F8FAFC]">
              
              {/* HEADER MOBILE PREVIEW */}
              <div className="md:hidden w-full bg-slate-900 text-white p-3 text-center text-xs font-bold flex items-center justify-center gap-2">
                  <ArrowDown size={14}/> HASIL PREVIEW <ArrowDown size={14}/>
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
                      <p className="text-xs font-mono text-emerald-600 mt-4 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 flex items-center gap-2 transition-all">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>{loadingMessages[loadingStep]}
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
                          <iframe srcDoc={getPreviewHtml()} className="w-full h-full bg-white" title="Preview" sandbox="allow-scripts"/>
                      </div>
                  </>
              )}
          </div>
      </div>
    </div>
  );
}