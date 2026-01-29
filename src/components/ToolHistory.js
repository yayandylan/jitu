"use client";
import { useState } from 'react';
import { History, Trash2, Copy, Check, Clock, FileX, ExternalLink } from 'lucide-react';

export default function ToolHistory({ title = "Riwayat Aktivitas", historyData = [], onSelect, onDelete }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (e, text, id) => {
    e.stopPropagation(); 
    // Pastikan text yang disalin ada isinya
    const contentToCopy = typeof text === 'object' ? JSON.stringify(text, null, 2) : text;
    navigator.clipboard.writeText(contentToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl h-full flex flex-col shadow-sm overflow-hidden">
      
      {/* HEADER */}
      <div className="p-5 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white z-10">
        <div className="flex items-center gap-2">
            <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
                <History size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">{title}</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
            {historyData.length} Item
        </span>
      </div>

      {/* LIST CONTENT */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar bg-slate-50/30">
        {historyData.length > 0 ? (
            <div className="space-y-2">
                {historyData.map((item) => (
                    <div 
                        key={item._id} // MongoDB menggunakan _id
                        onClick={() => onSelect && onSelect(item)}
                        className="group p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer relative overflow-hidden"
                    >
                        {/* Garis Indikator Aktif */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="flex justify-between items-start gap-3 mb-2">
                            <h4 className="text-[13px] font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                                {item.inputData?.productName || item.title || "Hasil Generate"}
                            </h4>
                            
                            <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  if(confirm("Hapus riwayat ini?")) onDelete(item._id); 
                                }}
                                className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                                title="Hapus Riwayat"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock size={12} />
                                <span className="text-[10px] font-semibold tracking-tight">
                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : item.date}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={(e) => handleCopy(e, item.resultData || item.result, item._id)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                        copiedId === item._id 
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                        : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-blue-600 hover:text-white hover:border-blue-600'
                                    }`}
                                >
                                    {copiedId === item._id ? <Check size={12} /> : <Copy size={12} />}
                                    {copiedId === item._id ? 'Disalin' : 'Salin'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-4">
                <div className="bg-white shadow-sm border border-slate-100 p-5 rounded-3xl mb-4">
                    <FileX size={40} className="text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-900">Belum Ada Riwayat</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[180px] leading-relaxed">
                    Data riset Anda akan muncul di sini setelah Anda melakukan generate.
                </p>
            </div>
        )}
      </div>
    </div>
  );
}