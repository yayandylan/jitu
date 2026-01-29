"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // Tambah ini
import { 
  Save, Power, Wallet, Loader2, Search, Check, 
  ChevronDown, Calculator, Database, Trash2, 
  Zap, X, Cpu, Eye, Image as ImageIcon, MessageSquareText, ShieldAlert 
} from 'lucide-react';

// ... (Kode Helper getModelCapability & AIModelSelect TETAP SAMA, jangan dihapus) ...
const getModelCapability = (modelId) => {
  const id = modelId.toLowerCase();
  if (id.includes('dall-e') || id.includes('flux') || id.includes('stable-diffusion')) return { label: 'IMG GEN', icon: <ImageIcon size={10} />, style: 'bg-purple-50 text-purple-600 border-purple-200' };
  if (id.includes('gpt-4o') || id.includes('claude-3-5') || id.includes('gemini') || id.includes('vision')) return { label: 'VISION', icon: <Eye size={10} />, style: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
  return { label: 'TEXT', icon: <MessageSquareText size={10} />, style: 'bg-slate-100 text-slate-500 border-slate-200' };
};

function AIModelSelect({ options, value, onChange, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const selectedModel = options.find(o => o.id === value);
  const filteredOptions = options.filter(option => option.name.toLowerCase().includes(search.toLowerCase()) || option.id.toLowerCase().includes(search.toLowerCase()));

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
                 <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider shrink-0 ${getModelCapability(selectedModel.id).style}`}>{getModelCapability(selectedModel.id).icon}{getModelCapability(selectedModel.id).label}</div>
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
                    <div className="flex flex-col gap-1 min-w-0"><div className="flex items-center gap-2"><span className={`text-[10px] font-bold truncate ${option.id === value ? 'text-blue-700' : 'text-slate-700'}`}>{option.name}</span></div><span className="text-[9px] font-medium text-slate-400 pl-1">{option.id}</span></div>
                    {option.id === value && <Check size={14} className="text-blue-600" />}
                </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- HALAMAN UTAMA ---
export default function ToolConfigPage() {
  const router = useRouter(); // Init Router
  const [tools, setTools] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true); // State cek admin
  
  // Simulator State
  const [packagePrice, setPackagePrice] = useState(100000); 
  const [packagePoints, setPackagePoints] = useState(10000); 
  const pricePerPoint = packagePoints > 0 ? packagePrice / packagePoints : 0;

  // 1. CEK STATUS ADMIN DULU
  useEffect(() => {
    const checkAdmin = async () => {
        try {
            const res = await fetch('/api/user/me');
            const data = await res.json();
            
            if (data.user && data.user.role === 'admin') {
                setAuthChecking(false); // Lolos
                fetchData(); // Baru ambil data tools
            } else {
                router.push('/site/dashboard'); // Tendang ke dashboard
            }
        } catch (e) {
            router.push('/login');
        }
    };
    checkAdmin();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, mRes] = await Promise.all([
          fetch('/api/admin/tools'), 
          fetch('/api/admin/models')
      ]);
      
      if(!tRes.ok || !mRes.ok) throw new Error("Gagal akses API Admin");

      const toolsData = await tRes.json();
      const modelsData = await mRes.json();

      setTools(Array.isArray(toolsData) ? toolsData : []);
      setModels(Array.isArray(modelsData) ? modelsData : []);
    } catch (err) { 
        console.error("Gagal load data:", err); 
        alert("Gagal memuat data Admin. Pastikan Anda memiliki akses.");
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
      if (res.ok) alert(`✅ Konfigurasi "${tool.name}" berhasil disimpan!`);
    } catch (err) { alert("Gagal Simpan"); }
  };

  // --- TAMPILAN LOADING ---
  if (authChecking || loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center font-poppins">
        {authChecking ? (
            <>
                <ShieldAlert className="text-slate-300 w-12 h-12 mb-4 animate-pulse" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Verifikasi Izin Administrator...</p>
            </>
        ) : (
            <>
                <Loader2 className="animate-spin text-blue-600 mb-4" size={32} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sinkronisasi Ekonomi Digital...</p>
            </>
        )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 mt-8 font-poppins antialiased text-slate-900">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-6">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Control <span className="text-blue-600">Tools</span></h1>
            <p className="text-[10px] font-normal text-slate-400 uppercase tracking-[0.2em] mt-1">Manajemen Ekonomi & AI Jitu Digital</p>
        </div>
        <button onClick={fetchData} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm active:scale-95">
            <Database size={20} />
        </button>
      </div>

      {/* SIMULATOR CARD */}
      <div className="bg-[#0F172A] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-10 border border-slate-800">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none -rotate-12"><Cpu size={180} /></div>
        <div className="flex items-center gap-5 relative z-10 w-full md:w-auto">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-500/20"><Calculator size={24} /></div>
            <div className="space-y-1">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Profit Simulator</span>
                <h3 className="text-xl font-bold tracking-tight">HPP Poin Member: <span className="text-emerald-400 font-black">Rp {pricePerPoint.toFixed(2)}</span></h3>
            </div>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md w-full md:w-auto">
            <div className="flex flex-col px-4 w-full md:w-auto">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Harga Paket (Rp)</span>
                <input type="number" value={packagePrice} onChange={(e) => setPackagePrice(Number(e.target.value))} className="bg-transparent text-lg font-black w-full md:w-32 outline-none text-white focus:text-blue-400 transition-colors placeholder-white/20" />
            </div>
            <div className="hidden md:block w-px h-10 bg-white/10" />
            <div className="flex flex-col px-4 text-right w-full md:w-auto border-t md:border-t-0 border-white/10 pt-2 md:pt-0 mt-2 md:mt-0">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Jumlah Poin</span>
                <input type="number" value={packagePoints} onChange={(e) => setPackagePoints(Number(e.target.value))} className="bg-transparent text-lg font-black w-full md:w-24 outline-none text-white focus:text-blue-400 text-right placeholder-white/20" />
            </div>
        </div>
      </div>

      {/* TOOLS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => {
          const { hpp, profit, margin } = calculateMargin(tool);
          const isProfitable = profit > 0;
          return (
            <div key={tool._id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col overflow-hidden hover:border-blue-200 transition-all group hover:-translate-y-1 duration-300">
              <div className="p-7 flex justify-between items-start border-b border-slate-50 gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-colors ${tool.isActive ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400 grayscale'}`}>
                        <Zap size={20} fill={tool.isActive ? "currentColor" : "none"} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-[14px] font-black text-slate-900 leading-snug uppercase line-clamp-2 min-h-[40px] tracking-tight">{tool.name}</h3>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-1.5">{tool.slug}</span>
                    </div>
                </div>
              </div>
              <div className="p-7 py-5 grid grid-cols-2 gap-3 bg-slate-50/50">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 flex flex-col shadow-sm">
                    <div className="flex items-center gap-1.5 mb-1"><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Est. Cost</span></div>
                    <span className="text-xs font-black text-slate-700 font-mono tracking-tight">Rp {hpp.toFixed(1)}</span>
                </div>
                <div className={`p-3.5 rounded-2xl border flex flex-col shadow-sm ${isProfitable ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
                    <div className="flex items-center gap-1.5 mb-1"><span className={`text-[9px] font-bold uppercase tracking-widest ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>Margin {Math.round(margin)}%</span></div>
                    <span className={`text-xs font-black ${isProfitable ? 'text-emerald-600' : 'text-rose-600'} font-mono tracking-tight`}>{profit > 0 ? '+' : ''}Rp {Math.round(profit).toLocaleString()}</span>
                </div>
              </div>
              <div className="p-7 space-y-6 flex-1 flex flex-col">
                <div className="space-y-4">
                    <div>
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2 ml-1 text-left flex items-center gap-2"><Wallet size={12} /> Harga Jual (Poin)</label>
                        <input type="number" value={tool.creditCost} onChange={(e) => handleChange(index, 'creditCost', e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner placeholder-slate-300" />
                    </div>
                    <AIModelSelect options={models} value={tool.aiModel} loading={false} onChange={(val) => handleChange(index, 'aiModel', val)} />
                </div>
                <div className="pt-2 mt-auto flex gap-3">
                    <button onClick={() => handleChange(index, 'isActive', !tool.isActive)} className={`w-12 h-12 rounded-2xl border-2 font-bold transition-all flex items-center justify-center shadow-lg active:scale-95 ${tool.isActive ? 'bg-white border-slate-100 text-slate-300 hover:text-rose-500 hover:border-rose-100' : 'bg-slate-800 border-slate-800 text-white hover:bg-slate-900'}`}><Power size={18} /></button>
                    <button onClick={() => handleSave(tool, hpp)} className="flex-1 h-12 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 flex items-center justify-center gap-2"><Save size={16} /> Simpan Config</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}