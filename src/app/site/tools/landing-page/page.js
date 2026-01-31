"use client";
import { useState, useEffect } from 'react';
import { 
    Zap, Loader2, Plus, Trash2, Smartphone, Code, 
    FileText, Image as ImageIcon, Copy, History, 
    LayoutTemplate, X, ChevronLeft, Tablet, Monitor, 
    RefreshCw, Package, Users, Star
} from 'lucide-react';
import Link from 'next/link';

export default function LandingPageBuilder() {
  const [config, setConfig] = useState({ creditCost: 100, isActive: true });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  
  // STATE UI
  const [viewport, setViewport] = useState('mobile'); 
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); 
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [activeTab, setActiveTab] = useState('form'); 

  // STATE DATA
  const [productImage, setProductImage] = useState(null);
  const [testimoniImages, setTestimoniImages] = useState([]);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [formData, setFormData] = useState({
      productName: '',
      targetMarket: '',
      productKnowledge: '',
      originalPrice: '', 
      price: '',         
      benefits: [''], 
  });

  const [generatedHtml, setGeneratedHtml] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // --- UTILS & EFFECTS ---
  const extractHtml = (text) => text ? text.replace(/```html/gi, '').replace(/```/g, '').trim() : '';

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
          setActiveTab('preview'); 

          await fetch('/api/user/history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  toolType: 'landing-page',
                  title: formData.productName,
                  inputData: formData,
                  resultData: cleanCode
              })
          });
          fetchHistory();
      } catch (err) { alert(err.message); } 
      finally { setLoading(false); }
  };

  const handleLoadHistory = (item) => {
      setActiveHistoryId(item._id);
      if(item.inputData) {
          setFormData({ ...formData, ...item.inputData });
          localStorage.setItem('JITU_LP_DRAFT_FORM', JSON.stringify(item.inputData));
      }
      if(item.resultData) {
          setGeneratedHtml(extractHtml(item.resultData));
          setActiveTab('preview');
      }
      setIsHistoryOpen(false);
  };

  const handleDeleteHistory = async (e, id) => {
      e.stopPropagation();
      if(!confirm("Hapus?")) return;
      try {
          await fetch(`/api/user/history?id=${id}`, { method: 'DELETE' });
          setHistory(prev => prev.filter(h => h._id !== id));
          if(activeHistoryId === id) { setGeneratedHtml(''); setActiveHistoryId(null); }
      } catch(err) {}
  };

  // --- PREVIEW LOGIC ---
  const getPreviewHtml = () => {
      if (!generatedHtml) return '';
      let html = generatedHtml;
      const PLACEHOLDER_PROD = 'https://placehold.co/800x600/f1f5f9/334155?text=Product+Image';
      const PLACEHOLDER_TESTI = 'https://placehold.co/100x100/f1f5f9/334155?text=User';

      const finalProdImg = productImage || PLACEHOLDER_PROD;
      html = html.replace(/__PRODUCT_IMAGE__/g, finalProdImg)
                 .replace(/{{?\s*PRODUCT_IMAGE\s*}?}/gi, finalProdImg)
                 .replace(/src=["']PRODUCT_IMAGE["']/gi, `src="${finalProdImg}"`);

      testimoniImages.forEach((url, i) => {
          html = html.replace(new RegExp(`__TESTIMONI_${i}__`, 'g'), url)
                     .replace(new RegExp(`{{?\\s*TESTIMONI_${i}\\s*}?}`, 'gi'), url);
      });
      html = html.replace(/__TESTIMONI_\d+__/g, PLACEHOLDER_TESTI)
                 .replace(/{{?\s*TESTIMONI_\d+\s*}?}/gi, PLACEHOLDER_TESTI);
      return html;
  };

  const getTextOnly = () => {
      if (!generatedHtml) return '';
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = generatedHtml;
      return tempDiv.innerText || tempDiv.textContent || "";
  };

  // --- COMPONENTS: HISTORY DRAWER ---
  const HistoryDrawer = () => (
      <>
        {isHistoryOpen && <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm transition-opacity" onClick={() => setIsHistoryOpen(false)} />}
        <div className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-xs bg-white z-[60] shadow-2xl transition-transform duration-300 transform ${isHistoryOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><History size={18} className="text-blue-600"/> Riwayat Project</h3>
                <button onClick={()=>setIsHistoryOpen(false)} className="p-1.5 hover:bg-white rounded-lg shadow-sm border border-transparent hover:border-gray-200 transition-all"><X size={18}/></button>
            </div>
            <div className="p-4 overflow-y-auto h-full pb-20 bg-slate-50/50">
                {history.length === 0 ? (
                    <div className="text-center mt-10">
                        <History className="mx-auto text-gray-300 mb-2" size={32}/>
                        <p className="text-xs text-gray-400 font-medium">Belum ada riwayat.</p>
                    </div>
                ) : history.map((item) => (
                    <div key={item._id} onClick={() => handleLoadHistory(item)} className={`p-3 rounded-xl border mb-2 cursor-pointer transition-all active:scale-95 shadow-sm ${activeHistoryId === item._id ? 'border-blue-500 bg-white ring-1 ring-blue-100' : 'border-white bg-white hover:border-blue-200'}`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(item.createdAt).toLocaleDateString([], {day:'numeric', month:'short'})}</span>
                            <button onClick={(e) => handleDeleteHistory(e, item._id)} className="text-gray-300 hover:text-rose-500 p-1"><Trash2 size={14}/></button>
                        </div>
                        <h4 className={`text-xs font-bold line-clamp-2 ${activeHistoryId === item._id ? 'text-blue-600' : 'text-gray-700'}`}>{item.title}</h4>
                    </div>
                ))}
            </div>
        </div>
      </>
  );

  // --- COMPONENTS: HISTORY LIST (DESKTOP) ---
  const DesktopHistoryList = () => (
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {history.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                  <LayoutTemplate size={24} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Belum ada project</p>
              </div>
          ) : (
              history.map((item) => (
                  <div key={item._id} onClick={() => handleLoadHistory(item)} className={`p-3 rounded-xl border cursor-pointer transition-all active:scale-95 group relative ${activeHistoryId === item._id ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-100' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'}`}>
                      <div className="flex justify-between mb-1 opacity-70">
                          <span className={`text-[9px] font-bold ${activeHistoryId === item._id ? 'text-blue-600' : 'text-gray-400'}`}>{new Date(item.createdAt).toLocaleDateString()}</span>
                          <button onClick={(e) => handleDeleteHistory(e, item._id)} className="text-gray-300 hover:text-rose-500"><Trash2 size={12}/></button>
                      </div>
                      <h4 className={`text-xs font-bold line-clamp-2 ${activeHistoryId === item._id ? 'text-blue-800' : 'text-gray-700'}`}>{item.title}</h4>
                  </div>
              ))
          )}
      </div>
  );

  return (
    <div className="h-[calc(100vh-85px)] md:h-[calc(100vh-100px)] bg-gray-50 font-poppins text-gray-900 flex flex-col md:flex-row overflow-hidden relative">
      <HistoryDrawer />

      {/* --- 1. LEFT PANEL: FORM INPUT --- */}
      <div className={`md:w-[400px] lg:w-[450px] shrink-0 h-full flex flex-col border-r border-gray-200 bg-white z-10 ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Header Form */}
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
              <div className="flex items-center gap-3">
                  
                  {/* TOMBOL HISTORY ANIMATED (MOBILE ONLY) */}
                  <button 
                    onClick={() => setIsHistoryOpen(true)} 
                    className="md:hidden relative group p-2 bg-white rounded-xl border border-blue-100 shadow-sm text-blue-600 active:scale-95 transition-all"
                  >
                      {/* Animasi Ping/Pulse */}
                      <span className="absolute inset-0 rounded-xl bg-blue-400/20 animate-pulse group-hover:bg-blue-400/30"></span>
                      
                      {/* Red Dot Notification */}
                      {history.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3 z-20">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white"></span>
                        </span>
                      )}
                      
                      <History size={20} className="relative z-10 group-hover:rotate-12 transition-transform duration-300"/>
                  </button>

                  <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <span className="w-1.5 h-6 rounded-full bg-blue-500"></span> Input Produk
                  </h2>
              </div>
              <button onClick={handleResetForm} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded transition-colors"><RefreshCw size={12}/> Reset</button>
          </div>

          {/* Scrollable Form */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6 bg-slate-50/30">
              
              {/* SECTION 1: PRODUCT INFO */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Package size={14} className="text-blue-500"/> Dasar</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Produk</label>
                          <input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Contoh: Ebook Diet" value={formData.productName} onChange={e => setFormData({...formData, productName: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Harga Coret</label>
                              <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-xs text-slate-400">Rp</span>
                                  <input type="number" className="w-full pl-8 p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" value={formData.originalPrice} onChange={e => setFormData({...formData, originalPrice: e.target.value})} />
                              </div>
                          </div>
                          <div>
                              <label className="block text-[10px] font-bold text-emerald-600 uppercase mb-1">Harga Jual</label>
                              <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-xs text-emerald-500 font-bold">Rp</span>
                                  <input type="number" className="w-full pl-8 p-2.5 bg-white border-emerald-200 border rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* SECTION 2: COPYWRITING */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Users size={14} className="text-blue-500"/> Detail</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Target Market</label>
                          <input type="text" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="Siapa yang beli?" value={formData.targetMarket} onChange={e => setFormData({...formData, targetMarket: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Penjelasan Produk</label>
                          <textarea className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all h-24 resize-none leading-relaxed" placeholder="Jelaskan produk Anda..." value={formData.productKnowledge} onChange={e => setFormData({...formData, productKnowledge: e.target.value})} />
                      </div>
                  </div>
              </div>

              {/* SECTION 3: USP */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Star size={14} className="text-blue-500"/> Keunggulan</h3>
                  <div className="space-y-2">
                      {formData.benefits.map((b, i) => (
                          <div key={i} className="flex gap-2">
                              <input type="text" className="flex-1 p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" value={b} onChange={e => handleChangeBenefit(e.target.value, i)} placeholder={`Keunggulan ${i+1}`}/>
                              {formData.benefits.length > 1 && <button onClick={() => handleRemoveBenefit(i)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16}/></button>}
                          </div>
                      ))}
                      <button onClick={handleAddBenefit} className="text-xs font-bold text-blue-600 flex items-center gap-1 mt-2 hover:underline"><Plus size={14}/> Tambah Poin</button>
                  </div>
              </div>

              {/* SECTION 4: MEDIA */}
              <div className="grid grid-cols-2 gap-3">
                  <label className={`aspect-video bg-white border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all relative overflow-hidden group ${!productImage && 'opacity-70 hover:opacity-100'}`}>
                      {uploadingImg ? <Loader2 className="animate-spin text-blue-500"/> : productImage ? <img src={productImage} className="w-full h-full object-cover"/> : <div className="text-center text-slate-400"><ImageIcon className="mx-auto mb-1"/><span className="text-[9px] font-bold">FOTO</span></div>}
                      <input type="file" className="hidden" onChange={e => handleImageUpload(e, 'product')} accept="image/*" disabled={uploadingImg}/>
                  </label>
                  <label className={`aspect-video bg-white border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all relative overflow-hidden group`}>
                      {uploadingImg ? <Loader2 className="animate-spin text-blue-500"/> : <div className="text-center text-slate-400"><Plus className="mx-auto mb-1"/><span className="text-[9px] font-bold">TESTI ({testimoniImages.length})</span></div>}
                      <input type="file" className="hidden" onChange={e => handleImageUpload(e, 'testimoni')} accept="image/*" multiple disabled={uploadingImg}/>
                  </label>
              </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0 z-20">
              <button 
                onClick={handleGenerate} 
                disabled={loading || uploadingImg || !formData.productName} 
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-slate-800 hover:shadow-2xl transition-all active:scale-95"
              >
                  {loading ? <Loader2 className="animate-spin" size={18}/> : <Zap size={18} className="text-yellow-400 fill-yellow-400"/>}
                  {loading ? 'Sedang Meracik...' : 'GENERATE PAGE'}
              </button>
          </div>
      </div>

      {/* --- 2. RIGHT PANEL: PREVIEW (Flexible) --- */}
      <div className={`flex-1 flex flex-col bg-slate-100 h-full relative ${activeTab === 'form' ? 'hidden md:flex' : 'flex'}`}>
          
          {/* Top Bar */}
          <div className="h-16 border-b border-slate-200 bg-white flex justify-between items-center px-4 shrink-0">
              {/* Mobile Toggle */}
              <div className="md:hidden flex bg-slate-100 rounded-lg p-1">
                  <button onClick={() => setActiveTab('form')} className="px-3 py-1.5 text-xs font-bold text-slate-500">Editor</button>
                  <button onClick={() => setActiveTab('preview')} className="px-3 py-1.5 text-xs font-bold bg-white rounded shadow-sm text-blue-600">Preview</button>
              </div>

              {/* Desktop Viewport Controls */}
              <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button onClick={() => setViewport('mobile')} className={`p-2 rounded ${viewport === 'mobile' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><Smartphone size={16}/></button>
                  <button onClick={() => setViewport('tablet')} className={`p-2 rounded ${viewport === 'tablet' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><Tablet size={16}/></button>
                  <button onClick={() => setViewport('desktop')} className={`p-2 rounded ${viewport === 'desktop' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}><Monitor size={16}/></button>
              </div>

              {/* History Button (Desktop) - WITH ANIMATION */}
              <div className="hidden md:flex items-center gap-3">
                  <button 
                    onClick={() => setIsHistoryOpen(true)} 
                    className="relative group p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-all flex items-center gap-2 text-xs font-bold"
                  >
                      <div className="relative">
                          <History size={18} className="group-hover:text-blue-600"/>
                          {history.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse ring-2 ring-white"></span>}
                      </div>
                      <span className="group-hover:text-blue-600">Riwayat</span>
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-2"></div>
                  <button onClick={() => navigator.clipboard.writeText(generatedHtml)} className="text-xs font-bold text-white bg-slate-900 px-4 py-2 rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10"><Code size={14}/> Salin HTML</button>
              </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 overflow-hidden relative flex flex-col items-center justify-center p-4">
              
              {loading && (
                  <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
                      <Loader2 size={40} className="text-blue-600 animate-spin mb-3"/>
                      <p className="text-sm font-bold text-slate-600 animate-pulse">AI sedang mendesain...</p>
                  </div>
              )}

              {!generatedHtml ? (
                  <div className="text-center opacity-40 max-w-sm">
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200"><LayoutTemplate size={40} className="text-slate-300"/></div>
                      <h3 className="font-bold text-slate-600">Preview Area</h3>
                      <p className="text-xs text-slate-400 mt-1">Hasil landing page akan muncul di sini.</p>
                  </div>
              ) : (
                  <div className={`
                      transition-all duration-500 ease-in-out bg-white shadow-2xl overflow-hidden relative border-slate-900
                      ${viewport === 'mobile' ? 'w-[375px] h-[80vh] rounded-[2.5rem] border-[10px]' : ''}
                      ${viewport === 'tablet' ? 'w-[768px] h-[85vh] rounded-xl border-[4px]' : ''}
                      ${viewport === 'desktop' ? 'w-full h-full rounded-none border-0' : ''}
                  `}>
                      {viewport === 'mobile' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-b-xl z-20"></div>}
                      <iframe 
                        srcDoc={getPreviewHtml()} 
                        className="w-full h-full bg-white"
                        title="Preview"
                        sandbox="allow-scripts" 
                      />
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}