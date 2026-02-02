"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, Power, Loader2, Search, Check, 
  ChevronDown, Calculator, Database, Zap, 
  Image as ImageIcon, MessageSquare, Brain, Eye, Code,
  DollarSign
} from 'lucide-react';

// --- 1. HELPER: DETEKSI KATEGORI MODEL ---
const getModelCategory = (modelId) => {
  if(!modelId) return { label: 'TEXT', icon: <MessageSquare size={10} />, style: 'bg-slate-100 text-slate-500 border-slate-200' };
  
  const id = modelId.toLowerCase();
  
  if (id.includes('dall-e') || id.includes('flux') || id.includes('stable') || id.includes('midjourney')) {
    return { label: 'IMAGE', desc: 'Visual Generator', icon: <ImageIcon size={10} />, style: 'bg-purple-100 text-purple-700 border-purple-200' };
  }
  if (id.includes('gpt-4o') || id.includes('claude-3-5') || id.includes('gemini') || id.includes('vision')) {
    return { label: 'VISION', desc: 'Smart & Multimodal', icon: <Eye size={10} />, style: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  }
  if (id.includes('deepseek') || id.includes('coder') || id.includes('qwen') || id.includes('sonnet')) {
    return { label: 'LOGIC', desc: 'Coding & Complex Task', icon: <Code size={10} />, style: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
  }
  if (id.includes('mini') || id.includes('flash') || id.includes('haiku') || id.includes('llama-3-8b')) {
    return { label: 'FAST', desc: 'Cheap & Fast', icon: <Zap size={10} />, style: 'bg-amber-100 text-amber-700 border-amber-200' };
  }

  return { label: 'GEN', desc: 'General LLM', icon: <Brain size={10} />, style: 'bg-blue-50 text-blue-600 border-blue-100' };
};

// --- 2. DROPDOWN COMPONENT ---
function AIModelSelect({ options = [], value, onChange, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Pastikan options unik berdasarkan ID
  const safeOptions = Array.isArray(options) ? options : [];
  
  const selectedModel = safeOptions.find(o => o.id === value);
  const categoryInfo = selectedModel ? getModelCategory(selectedModel.id) : null;
  
  const filteredOptions = safeOptions.filter(option => 
    (option.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (option.id || "").toLowerCase().includes(search.toLowerCase())
  ).slice(0, 50);

  useEffect(() => {
    function handleClickOutside(e) { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
        setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [isOpen]);

  return (
    <div className="relative w-full font-poppins" ref={dropdownRef}>
      {/* TRIGGER BUTTON */}
      <button 
        onClick={() => !loading && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl bg-slate-50 border transition-all text-left group relative ${isOpen ? 'border-blue-500 bg-white ring-2 ring-blue-500/10 z-20' : 'border-slate-200 hover:border-blue-300'}`}
      >
        <div className="flex flex-col w-full mr-2 overflow-hidden">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex justify-between">
              Model AI Engine
              {categoryInfo && <span className="text-[8px] font-normal normal-case text-emerald-600">{categoryInfo.desc}</span>}
          </span>
          
          <div className="flex items-start gap-2">
            {selectedModel ? (
               <>
                 <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider shrink-0 mt-0.5 ${categoryInfo.style}`}>
                    {categoryInfo.icon}
                    {categoryInfo.label}
                 </div>
                 <div className="flex flex-col min-w-0">
                     <span className="text-[11px] font-bold text-slate-700 leading-tight truncate">{selectedModel.name}</span>
                     <span className="text-[9px] text-slate-400 font-mono leading-tight truncate">{selectedModel.id}</span>
                 </div>
               </>
            ) : (
               <span className="text-[11px] font-bold text-slate-400 italic flex items-center gap-2">
                 {loading ? <Loader2 size={12} className="animate-spin"/> : <Search size={12}/>}
                 {loading ? "Syncing..." : "Pilih Model..."}
               </span>
            )}
          </div>
        </div>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 ${isOpen ? 'rotate-180 text-blue-500' : ''} transition-transform duration-300 group-hover:text-blue-500`} />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute z-[9999] top-full left-1/2 -translate-x-1/2 mt-2 w-[110%] bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5"> 
          
          <div className="p-3 border-b border-slate-100 bg-slate-50 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Cari model..." 
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:font-normal placeholder:text-slate-400"
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 custom-scrollbar bg-white">
            {filteredOptions.length === 0 ? (
                <div className="p-6 text-center">
                    <p className="text-[10px] text-slate-400 font-medium">Model tidak ditemukan.</p>
                </div>
            ) : (
                filteredOptions.map((option) => {
                    const cat = getModelCategory(option.id);
                    const isSelected = option.id === value;
                    return (
                        <div 
                            key={option.id} 
                            onClick={() => { onChange(option.id); setIsOpen(false); setSearch(""); }} 
                            className={`p-3 rounded-lg cursor-pointer flex gap-3 items-start transition-all group ${isSelected ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'}`}
                        >
                            <div className={`mt-0.5 px-1.5 py-1 rounded text-[8px] font-black border uppercase h-fit ${cat.style}`}>
                                {cat.label}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-bold text-slate-800 leading-snug break-words whitespace-normal mb-1">
                                    {option.name}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono break-all leading-tight">
                                    {option.id}
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">
                                        In: <span className="font-bold text-slate-700">{option.perTokenPrompt ? `$${option.perTokenPrompt}/1k` : '-'}</span>
                                    </span>
                                    <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">
                                        Out: <span className="font-bold text-slate-700">{option.perTokenCompletion ? `$${option.perTokenCompletion}/1k` : '-'}</span>
                                    </span>
                                </div>
                            </div>
                            {isSelected && <div className="mt-1"><Check size={14} className="text-blue-600" /></div>}
                        </div>
                    );
                })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- 3. MAIN PAGE ---
export default function ToolConfig() {
  const router = useRouter();
  const [tools, setTools] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  
  // Profit Simulator State
  const [packagePrice, setPackagePrice] = useState(100000); 
  const [packagePoints, setPackagePoints] = useState(10000); 
  const pricePerPoint = packagePoints > 0 ? packagePrice / packagePoints : 0;

  useEffect(() => {
    // Cek Session Admin
    const checkAdmin = async () => {
        try {
            const res = await fetch('/api/user/me');
            const data = await res.json();
            if (data.user && data.user.role === 'admin') {
                setAuthChecking(false);
                fetchData();
            } else {
                router.push('/site/dashboard');
            }
        } catch (e) { router.push('/login'); }
    };
    checkAdmin();
    
    // Load Simulator Config
    const savedSim = localStorage.getItem('JITU_ADMIN_SIMULATOR');
    if(savedSim) {
        try {
            const parsed = JSON.parse(savedSim);
            setPackagePrice(parsed.price);
            setPackagePoints(parsed.points);
        } catch(e){}
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, mRes] = await Promise.all([
          fetch('/api/admin/tools').then(r => r.ok ? r.json() : []), 
          fetch('/api/admin/models').then(r => r.ok ? r.json() : [])
      ]);

      const rawTools = Array.isArray(tRes) ? tRes : [];
      const rawModels = Array.isArray(mRes) ? mRes : [];

      // --- FILTER DUPLIKAT (Fixing Double Render) ---
      // Kita filter berdasarkan 'slug' agar hanya 1 tool per slug yang tampil
      const uniqueTools = rawTools.filter((tool, index, self) =>
        index === self.findIndex((t) => (
           t.slug === tool.slug
        ))
      );

      // Kita filter model juga biar aman
      const uniqueModels = rawModels.filter((model, index, self) =>
        index === self.findIndex((m) => (
           m.id === model.id
        ))
      );

      setTools(uniqueTools);
      setModels(uniqueModels);

    } catch (err) { console.error("Error fetching data"); } finally { setLoading(false); }
  };

  const handleChange = (index, field, value) => {
    const newTools = [...tools];
    newTools[index][field] = value;
    setTools(newTools);
  };

  const handleSaveTool = async (tool, currentHpp) => {
    try {
      const res = await fetch('/api/admin/tools', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            id: tool._id, 
            creditCost: parseInt(tool.creditCost), 
            aiModel: tool.aiModel, 
            isActive: tool.isActive, 
            costPerToken: currentHpp 
        }),
      });
      if (res.ok) alert(`✅ Setting ${tool.name} tersimpan!`);
    } catch (err) { alert("Gagal Simpan"); }
  };

  const handleSaveSimulator = () => {
      localStorage.setItem('JITU_ADMIN_SIMULATOR', JSON.stringify({ price: packagePrice, points: packagePoints }));
      alert("✅ Setting Profit Simulator tersimpan di sesi browser.");
  };

  // Kalkulasi Margin Real-time
  const calculateMargin = (tool) => {
    const revenue = (parseInt(tool.creditCost) || 0) * pricePerPoint;
    const modelData = models.find(m => m.id === tool.aiModel);
    const KURS = 16200; 
    let hpp = 0;
    
    if (modelData) {
        const isImage = getModelCategory(modelData.id).label === 'IMAGE';
        if (isImage) {
            hpp = (modelData.perTokenPrompt || 0.04) * KURS; 
        } else {
            const promptCost = modelData.perTokenPrompt || 0;
            const compCost = modelData.perTokenCompletion || 0;
            hpp = ((1000 * promptCost) + (1000 * compCost)) * KURS;
        }
    }
    const profit = revenue - hpp;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { hpp, profit, margin };
  };

  if (authChecking || loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-poppins bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{authChecking ? 'Memeriksa Akses...' : 'Sinkronisasi OpenRouter...'}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 mt-8 font-poppins text-slate-900">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-6">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Control <span className="text-blue-600">Tools</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Admin Dashboard • Live Sync OpenRouter</p>
        </div>
        <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm group active:scale-95">
            <Database size={20} className="group-hover:animate-pulse" />
        </button>
      </div>

      {/* PROFIT SIMULATOR (WITH SAVE BUTTON) */}
      <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] text-white shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <div className="flex items-center gap-4 z-10">
            <div className="bg-blue-600 p-3.5 rounded-2xl shadow-lg shadow-blue-900/50"><Calculator size={28} /></div>
            <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Profit Simulator</span>
                <h3 className="text-2xl font-black tracking-tight">HPP Poin: <span className="text-emerald-400">Rp {pricePerPoint.toFixed(2)}</span></h3>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto z-10 items-end">
            <div className="w-full sm:w-auto">
                <span className="text-[9px] block text-slate-400 uppercase mb-1 font-bold">Harga Paket (Rp)</span>
                <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                    <input type="number" value={packagePrice} onChange={(e)=>setPackagePrice(Number(e.target.value))} className="bg-white/10 border border-white/10 focus:border-blue-500 pl-9 pr-4 py-2.5 rounded-xl w-full sm:w-40 font-bold text-white outline-none transition-all"/>
                </div>
            </div>
            <div className="w-full sm:w-auto">
                <span className="text-[9px] block text-slate-400 uppercase mb-1 font-bold">Total Poin</span>
                <div className="relative">
                    <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                    <input type="number" value={packagePoints} onChange={(e)=>setPackagePoints(Number(e.target.value))} className="bg-white/10 border border-white/10 focus:border-blue-500 pl-9 pr-4 py-2.5 rounded-xl w-full sm:w-32 font-bold text-white outline-none transition-all text-right"/>
                </div>
            </div>
            <button onClick={handleSaveSimulator} className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all" title="Simpan Setting Simulator">
                <Save size={18} fill="currentColor" className="text-emerald-900"/>
            </button>
        </div>
      </div>

      {/* TOOLS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => {
          const { hpp, profit, margin } = calculateMargin(tool);
          return (
            <div key={tool.slug || index} className={`bg-white rounded-[2rem] border shadow-sm p-6 flex flex-col gap-5 group transition-all duration-300 relative ${tool.isActive ? 'border-slate-200 hover:border-blue-300 hover:shadow-md' : 'border-slate-100 opacity-75 grayscale hover:grayscale-0'}`}>
                
                {/* Header Card */}
                <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${tool.isActive ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-400'}`}>
                        <Zap size={20} fill={tool.isActive ? "currentColor" : "none"}/>
                    </div>
                    <div>
                        <h3 className="font-black text-sm uppercase tracking-tight text-slate-800">{tool.name}</h3>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{tool.slug}</span>
                    </div>
                </div>
                
                {/* Margin Calculator */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 relative z-10">
                    <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">HPP (Est.)</span>
                        <span className="font-mono text-xs font-bold text-slate-600">Rp {hpp.toFixed(0)}</span>
                    </div>
                    <div className="text-right">
                        <span className={`text-[9px] font-bold uppercase block mb-0.5 ${profit > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>Margin {margin.toFixed(0)}%</span>
                        <span className={`font-mono text-sm font-black ${profit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {profit > 0 ? '+' : ''}Rp {Math.round(profit)}
                        </span>
                    </div>
                </div>

                {/* Form Controls */}
                <div className="space-y-4 relative z-20">
                    <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 flex justify-between">
                            Harga Jual
                            <span className="text-blue-500">{(tool.creditCost * pricePerPoint).toFixed(0)} IDR</span>
                        </label>
                        <div className="relative">
                            <Zap size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                            <input 
                                type="number" 
                                value={tool.creditCost} 
                                onChange={(e)=>handleChange(index, 'creditCost', e.target.value)} 
                                className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">PTS</span>
                        </div>
                    </div>
                    
                    {/* DROPDOWN AI MODEL */}
                    <AIModelSelect 
                        options={models} 
                        value={tool.aiModel} 
                        onChange={(val)=>handleChange(index, 'aiModel', val)} 
                        loading={models.length === 0}
                    />
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-2 pt-2 mt-auto relative z-10">
                    <button 
                        onClick={()=>handleChange(index, 'isActive', !tool.isActive)} 
                        className={`p-3.5 rounded-xl border-2 transition-all active:scale-95 ${tool.isActive ? 'border-slate-100 text-slate-400 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50' : 'bg-slate-800 border-slate-800 text-white shadow-lg'}`}
                        title={tool.isActive ? "Matikan Tool" : "Aktifkan Tool"}
                    >
                        <Power size={18}/>
                    </button>
                    <button 
                        onClick={()=>handleSaveTool(tool, hpp)} 
                        className="flex-1 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <Save size={14}/> SIMPAN PERUBAHAN
                    </button>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}