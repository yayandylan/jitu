"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
// GANTI ICON YANG AMAN (Versi lama Lucide mungkin belum ada MessageSquareText)
import { 
  Save, Power, Wallet, Loader2, Search, Check, 
  ChevronDown, Calculator, Database, Trash2, 
  Zap, X, Cpu, Eye, Image as ImageIcon, MessageSquare, ShieldAlert 
} from 'lucide-react';

// Helper Aman
const getModelCapability = (modelId) => {
  if(!modelId) return { label: 'TEXT', icon: <MessageSquare size={10} />, style: 'bg-slate-100' }; // Default
  
  const id = modelId.toLowerCase();
  if (id.includes('dall-e') || id.includes('flux') || id.includes('stable')) {
    return { label: 'IMG GEN', icon: <ImageIcon size={10} />, style: 'bg-purple-50 text-purple-600 border-purple-200' };
  }
  if (id.includes('gpt-4o') || id.includes('claude-3-5') || id.includes('gemini') || id.includes('vision')) {
    return { label: 'VISION', icon: <Eye size={10} />, style: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
  }
  return { label: 'TEXT', icon: <MessageSquare size={10} />, style: 'bg-slate-100 text-slate-500 border-slate-200' };
};

function AIModelSelect({ options = [], value, onChange, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  
  // Safeguard: Pastikan options adalah array
  const safeOptions = Array.isArray(options) ? options : [];
  const selectedModel = safeOptions.find(o => o.id === value);
  
  const filteredOptions = safeOptions.filter(option => 
    (option.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (option.id || "").toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e) { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full font-poppins" ref={dropdownRef}>
      <button onClick={() => !loading && setIsOpen(!isOpen)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border transition-all ${isOpen ? 'border-blue-500 bg-white ring-2 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300'}`}>
        <div className="flex flex-col text-left overflow-hidden w-full mr-2">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Model AI Engine</span>
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedModel ? (
               <>
                 <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider shrink-0 ${getModelCapability(selectedModel.id).style}`}>
                    {getModelCapability(selectedModel.id).icon}
                    {getModelCapability(selectedModel.id).label}
                 </div>
                 <span className="text-[11px] font-bold text-slate-700 truncate">{selectedModel.name}</span>
               </>
            ) : (<span className="text-[11px] font-bold text-slate-400">{loading ? "Menghubungkan..." : "Pilih Model"}</span>)}
          </div>
        </div>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 ${isOpen ? 'rotate-180' : ''} transition-transform duration-300`} />
      </button>
      {isOpen && (
        <div className="absolute z-[100] left-0 right-0 bottom-full mb-2 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" /><input autoFocus type="text" placeholder="Cari engine..." className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-blue-500 uppercase text-slate-600 placeholder:normal-case" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
            {filteredOptions.map((option) => (
                <div key={option.id} onClick={() => { onChange(option.id); setIsOpen(false); setSearch(""); }} className={`p-2.5 rounded-xl cursor-pointer flex justify-between items-center transition-all ${option.id === value ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'}`}>
                    <div className="flex flex-col gap-1 min-w-0"><div className="flex items-center gap-2"><span className={`text-[10px] font-bold truncate ${option.id === value ? 'text-blue-700' : 'text-slate-700'}`}>{option.name}</span></div><span className="text-[9px] font-medium text-slate-400 pl-1">{option.priceLabel}</span></div>
                    {option.id === value && <Check size={14} className="text-blue-600" />}
                </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ToolConfigPage() {
  const router = useRouter();
  const [tools, setTools] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  
  const [packagePrice, setPackagePrice] = useState(100000); 
  const [packagePoints, setPackagePoints] = useState(10000); 
  const pricePerPoint = packagePoints > 0 ? packagePrice / packagePoints : 0;

  useEffect(() => {
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
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, mRes] = await Promise.all([
          fetch('/api/admin/tools').catch(() => ({ ok: false })), 
          fetch('/api/admin/models').catch(() => ({ ok: false }))
      ]);
      
      const toolsData = tRes.ok ? await tRes.json() : [];
      const modelsData = mRes.ok ? await mRes.json() : [];

      setTools(Array.isArray(toolsData) ? toolsData : []);
      setModels(Array.isArray(modelsData) ? modelsData : []);
    } catch (err) { 
        console.error("Gagal load data:", err);
    } finally { 
        setLoading(false); 
    }
  };

  const handleChange = (index, field, value) => {
    const newTools = [...tools];
    newTools[index][field] = value;
    setTools(newTools);
  };

  const handleSave = async (tool, currentHpp) => {
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
      if (res.ok) alert(`✅ Konfigurasi berhasil disimpan!`);
    } catch (err) { alert("Gagal Simpan"); }
  };

  const calculateMargin = (tool) => {
    const revenue = (parseInt(tool.creditCost) || 0) * pricePerPoint;
    const modelData = models.find(m => m.id === tool.aiModel);
    const KURS = 16200; 
    let hpp = 0;
    
    if (modelData) {
        // Gunakan data dari backend jika ada
        const promptCost = modelData.perTokenPrompt || 0;
        const compCost = modelData.perTokenCompletion || 0;
        hpp = ((1000 * promptCost) + (1000 * compCost)) * KURS;
    }

    const profit = revenue - hpp;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { hpp, profit, margin };
  };

  if (authChecking || loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-poppins bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{authChecking ? 'Memeriksa Akses...' : 'Sinkronisasi Data...'}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 mt-8 font-poppins text-slate-900">
      <div className="flex justify-between items-center border-b border-slate-200 pb-6">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Control <span className="text-blue-600">Tools</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Admin Dashboard</p>
        </div>
        <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm"><Database size={20} /></button>
      </div>

      <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl"><Calculator size={24} /></div>
            <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Profit Simulator</span>
                <h3 className="text-xl font-bold">HPP Poin: <span className="text-emerald-400">Rp {pricePerPoint.toFixed(2)}</span></h3>
            </div>
        </div>
        <div className="flex gap-4">
            <div><span className="text-[9px] block text-slate-400 uppercase mb-1">Paket (Rp)</span><input type="number" value={packagePrice} onChange={(e)=>setPackagePrice(Number(e.target.value))} className="bg-white/10 p-2 rounded-lg w-32 font-bold text-white outline-none"/></div>
            <div><span className="text-[9px] block text-slate-400 uppercase mb-1">Poin</span><input type="number" value={packagePoints} onChange={(e)=>setPackagePoints(Number(e.target.value))} className="bg-white/10 p-2 rounded-lg w-24 font-bold text-white outline-none text-right"/></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => {
          const { hpp, profit, margin } = calculateMargin(tool);
          return (
            <div key={tool._id || index} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tool.isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}><Zap size={18}/></div>
                    <div><h3 className="font-bold text-sm uppercase">{tool.name}</h3><span className="text-[10px] text-slate-400 font-bold uppercase">{tool.slug}</span></div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div><span className="text-[9px] font-bold text-slate-400 uppercase block">Est. Cost</span><span className="font-mono text-xs font-bold">Rp {hpp.toFixed(0)}</span></div>
                    <div><span className={`text-[9px] font-bold uppercase block ${profit > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>Margin {Math.round(margin)}%</span><span className={`font-mono text-xs font-bold ${profit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Rp {Math.round(profit)}</span></div>
                </div>

                <div className="space-y-3">
                    <div><label className="text-[9px] font-bold text-slate-400 uppercase mb-1 block">Harga (Poin)</label><input type="number" value={tool.creditCost} onChange={(e)=>handleChange(index, 'creditCost', e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"/></div>
                    <AIModelSelect options={models} value={tool.aiModel} onChange={(val)=>handleChange(index, 'aiModel', val)} />
                </div>

                <div className="flex gap-2 pt-2 mt-auto">
                    <button onClick={()=>handleChange(index, 'isActive', !tool.isActive)} className={`p-3 rounded-xl border-2 transition-all ${tool.isActive ? 'border-slate-200 text-slate-400' : 'bg-slate-800 border-slate-800 text-white'}`}><Power size={18}/></button>
                    <button onClick={()=>handleSave(tool, hpp)} className="flex-1 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 flex items-center justify-center gap-2"><Save size={14}/> SIMPAN</button>
                </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}