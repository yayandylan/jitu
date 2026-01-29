"use client";
import { useState, useEffect, useRef } from 'react';
import { 
  Save, Power, Wallet, Loader2, Search, Check, 
  ChevronDown, Calculator, Database, Trash2, 
  Zap, X, Cpu 
} from 'lucide-react';

// --- DROPDOWN ENGINE DENGAN SEARCH ---
function AIModelSelect({ options, value, onChange, loading }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);
  const selectedModel = options.find(o => o.id === value);

  const filteredOptions = options.filter(option => 
    option.name.toLowerCase().includes(search.toLowerCase()) || 
    option.id.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e) { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full font-sans" ref={dropdownRef}>
      <button 
        onClick={() => !loading && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 border transition-all ${isOpen ? 'border-blue-500 bg-white ring-4 ring-blue-500/5' : 'border-slate-200 hover:border-slate-300'}`}
      >
        <div className="flex flex-col text-left overflow-hidden">
          <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mb-0.5">Model AI Engine</span>
          <span className="text-[13px] font-semibold text-slate-700 truncate">
            {loading ? "Menghubungkan..." : (selectedModel ? selectedModel.name : "Pilih Model")}
          </span>
        </div>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 ${isOpen ? 'rotate-180' : ''} transition-transform duration-300`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] left-0 right-0 bottom-full mb-2 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="p-2 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                autoFocus type="text" placeholder="Cari engine..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-normal outline-none focus:border-blue-500"
                value={search} onChange={(e) => setSearch(e.target.value)}
              />
              {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X size={14} /></button>}
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-8 text-center"><p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Tidak ditemukan</p></div>
            ) : (
              filteredOptions.map((option) => (
                <div key={option.id} onClick={() => { onChange(option.id); setIsOpen(false); setSearch(""); }} className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all ${option.id === value ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-600'}`}>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-semibold">{option.name}</span>
                    <span className={`text-[9px] font-normal uppercase mt-0.5 ${option.id === value ? 'text-blue-100' : 'text-slate-400'}`}>{option.priceLabel}</span>
                  </div>
                  {option.id === value && <Check size={14} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ToolConfigPage() {
  const [tools, setTools] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [packagePrice, setPackagePrice] = useState(100000); 
  const [packagePoints, setPackagePoints] = useState(10000); 

  const pricePerPoint = packagePoints > 0 ? packagePrice / packagePoints : 0;

  const fetchData = async () => {
    try {
      const [tRes, mRes] = await Promise.all([fetch('/api/admin/tools'), fetch('/api/admin/models')]);
      setTools(await tRes.json());
      setModels(await mRes.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

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
        body: JSON.stringify({ id: tool._id, creditCost: parseInt(tool.creditCost), aiModel: tool.aiModel, isActive: tool.isActive, costPerToken: currentHpp }),
      });
      if (res.ok) alert(`✅ Tersimpan: ${tool.name}`);
    } catch (err) { alert("Gagal Simpan"); }
  };

  const handleDelete = async (id) => {
    if(!confirm("Hapus permanen data ini?")) return;
    try { const res = await fetch(`/api/admin/tools?id=${id}`, { method: 'DELETE' }); if(res.ok) fetchData(); } catch(err) { console.error(err); }
  };

  const calculateMargin = (tool) => {
    const revenue = tool.creditCost * pricePerPoint;
    const modelData = models.find(m => m.id === tool.aiModel);
    const KURS = 16000;
    let hpp = 0;
    if (modelData) hpp = ((1200 * modelData.perTokenPrompt) + (800 * modelData.perTokenCompletion)) * KURS;
    const profit = revenue - hpp;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    return { hpp, profit, margin };
  };

  if (loading) return <div className="p-20 text-center flex flex-col items-center"><Loader2 className="animate-spin text-blue-600 mb-2" /><p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">Sinkronisasi Ekonomi...</p></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 mt-8 font-sans antialiased">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-6">
        <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic tracking-tighter">Control <span className="text-blue-600">Tools</span></h1>
            <p className="text-[11px] font-normal text-slate-400 uppercase tracking-[0.2em] mt-1">Manajemen Ekonomi & AI Jitu Digital</p>
        </div>
        <button onClick={fetchData} className="p-2.5 text-slate-300 hover:text-blue-600 transition-all"><Database size={20} /></button>
      </div>

      {/* SIMULATOR */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none -rotate-12"><Cpu size={180} /></div>
        <div className="flex items-center gap-5 relative z-10">
            <div className="bg-blue-600 p-3.5 rounded-2xl shadow-xl shadow-blue-500/20"><Calculator size={24} /></div>
            <div className="space-y-0.5">
                <span className="text-[10px] font-normal text-blue-400 uppercase tracking-widest block">Profit Analysis</span>
                <h3 className="text-xl font-bold tracking-tight">HPP Poin Member: <span className="text-white">Rp {pricePerPoint.toFixed(2)}</span></h3>
            </div>
        </div>
        <div className="relative z-10 flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex flex-col px-4">
                <span className="text-[9px] font-normal text-slate-500 uppercase tracking-widest mb-1">Harga Paket</span>
                <input type="number" value={packagePrice} onChange={(e) => setPackagePrice(Number(e.target.value))} className="bg-transparent text-sm font-bold w-24 outline-none text-white focus:text-blue-400 transition-colors" />
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="flex flex-col px-4 text-right">
                <span className="text-[9px] font-normal text-slate-500 uppercase tracking-widest mb-1">Poin</span>
                <input type="number" value={packagePoints} onChange={(e) => setPackagePoints(Number(e.target.value))} className="bg-transparent text-sm font-bold w-20 outline-none text-white focus:text-blue-400" />
            </div>
        </div>
      </div>

      {/* VERTICAL GRID CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => {
          const { hpp, profit, margin } = calculateMargin(tool);
          const isProfitable = profit > 0;
          return (
            <div key={tool._id} className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col overflow-hidden hover:border-blue-200 transition-all group">
              
              {/* Header Card: Fix Name Overflow */}
              <div className="p-6 flex justify-between items-start border-b border-slate-50 gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${tool.isActive ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                        <Zap size={18} fill={tool.isActive ? "currentColor" : "none"} />
                    </div>
                    <div className="min-w-0 flex-1">
                        {/* Pakai line-clamp-2 agar judul panjang tidak "keluar" atau merusak layout */}
                        <h3 className="text-[14px] font-bold text-slate-800 leading-snug uppercase line-clamp-2 min-h-[40px]">
                            {tool.name}
                        </h3>
                        <span className="text-[9px] font-normal text-slate-400 uppercase tracking-widest block mt-1">{tool.slug}</span>
                    </div>
                </div>
                <button onClick={() => handleDelete(tool._id)} className="p-2 text-slate-100 hover:text-rose-500 transition-colors shrink-0"><Trash2 size={16} /></button>
              </div>

              {/* Stats Area */}
              <div className="p-6 grid grid-cols-2 gap-3 bg-slate-50/50">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col">
                    <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mb-1.5">HPP / Klik</span>
                    <span className="text-[13px] font-bold text-slate-700 font-mono tracking-tighter">Rp {hpp.toFixed(1)}</span>
                </div>
                <div className={`p-4 rounded-2xl border flex flex-col ${isProfitable ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                    <span className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mb-1.5">Profit ({Math.round(margin)}%)</span>
                    <span className={`text-[13px] font-bold ${isProfitable ? 'text-emerald-600' : 'text-rose-600'} font-mono tracking-tighter`}>Rp {Math.round(profit).toLocaleString()}</span>
                </div>
              </div>

              {/* Inputs */}
              <div className="p-6 space-y-5 flex-1 flex flex-col">
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest block mb-2 ml-1 text-left">Harga Jual (Poin)</label>
                        <div className="relative">
                            <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                            <input type="number" value={tool.creditCost} onChange={(e) => handleChange(index, 'creditCost', e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner" />
                        </div>
                    </div>
                    <AIModelSelect options={models} value={tool.aiModel} loading={false} onChange={(val) => handleChange(index, 'aiModel', val)} />
                </div>

                {/* Buttons */}
                <div className="pt-4 mt-auto flex gap-3">
                    <button onClick={() => handleChange(index, 'isActive', !tool.isActive)} className={`px-4 py-3 rounded-xl border-2 font-bold text-[10px] uppercase tracking-[0.15em] transition-all flex items-center justify-center ${tool.isActive ? 'bg-white border-slate-100 text-slate-300 hover:text-rose-500 hover:border-rose-100' : 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-200'}`}>
                        <Power size={16} />
                    </button>
                    <button onClick={() => handleSave(tool, hpp)} className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2">
                        <Save size={16} /> Simpan
                    </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}