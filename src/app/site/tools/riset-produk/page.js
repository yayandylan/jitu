"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect, useRef } from 'react';
import remarkGfm from 'remark-gfm'; 
import { 
    Send, Loader2, User, Zap, Trash2, 
    History, ChevronLeft, X, Clock 
} from 'lucide-react';
import Link from 'next/link';

export default function RisetProdukPage() {
  const [input, setInput] = useState('');
  
  // Default Pesan Awal (Intro Jitu AI)
  const defaultChat = [
    { 
      role: 'assistant', 
      content: 'Halo! Saya **Jitu AI**. ⚡\n\nSiap membantu Anda menemukan ide produk yang profitabel. \n\nSilakan ceritakan:\n1. **Skill/Modal** yang Anda punya.\n2. **Ide Awal** (kalau ada).\n\nSaya akan bantu bedah potensinya!' 
    }
  ];

  const [chat, setChat] = useState(defaultChat);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState({ creditCost: 50, isActive: true });
  
  // State untuk ID History yang sedang aktif (supaya bisa update, bukan buat baru terus)
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  // State Mobile Sidebar
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // State Loading Text Animasi
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  
  const scrollRef = useRef(null);
  const isLoaded = useRef(false);

  // Kalimat Loading yang "Gaul"
  const loadingMessages = [
    "Sedang membedah pasar...",
    "Mencari celah cuan...",
    "Menghitung potensi profit...",
    "Menganalisa kompetitor...",
    "Menyusun strategi winning..."
  ];

  // --- 1. LOAD DATA & AUTO SAVE ---
  useEffect(() => {
    fetchConfig();
    fetchHistory();
    
    // Load chat sementara dari browser (biar kalau refresh gak ilang)
    const savedChat = localStorage.getItem('JITU_CHAT_RISET_PRODUK');
    const savedId = localStorage.getItem('JITU_ACTIVE_ID_RISET');

    if (savedChat) {
        try {
            const parsed = JSON.parse(savedChat);
            if (parsed.length > 0) setChat(parsed);
        } catch (e) { console.error(e); }
    }
    if (savedId) setActiveHistoryId(savedId);

    isLoaded.current = true;
  }, []);

  // Simpan otomatis ke Browser setiap ada chat baru
  useEffect(() => {
    if (isLoaded.current) {
        if (chat.length > 1 || (chat.length === 1 && chat[0].content !== defaultChat[0].content)) {
            localStorage.setItem('JITU_CHAT_RISET_PRODUK', JSON.stringify(chat));
        }
        if (activeHistoryId) {
            localStorage.setItem('JITU_ACTIVE_ID_RISET', activeHistoryId);
        }
    }
    // Auto Scroll ke bawah
    setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [chat, loading, activeHistoryId]);

  // Efek Rotasi Teks Loading
  useEffect(() => {
    let interval;
    if (loading) {
        interval = setInterval(() => {
            setLoadingTextIndex((prev) => (prev + 1) % loadingMessages.length);
        }, 2000);
    } else {
        setLoadingTextIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const fetchConfig = async () => {
    try {
        const confRes = await fetch('/api/admin/tools').catch(() => null);
        if(confRes?.ok) {
            const tools = await confRes.json();
            const myTool = tools.find(t => t.slug === 'riset-produk');
            if (myTool) setConfig(myTool);
        }
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async () => {
    try {
        const histRes = await fetch('/api/user/history?tool=riset-produk').catch(() => null);
        if(histRes?.ok) {
            const histData = await histRes.json();
            setHistory(Array.isArray(histData.data) ? histData.data : []);
        }
    } catch (e) { console.error(e); }
  };

  // --- 2. SEND MESSAGE LOGIC ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !config.isActive || loading) return;
    
    document.activeElement.blur(); // Tutup keyboard di HP

    const userMsg = { role: 'user', content: input };
    const newHistory = [...chat, userMsg];
    
    setChat(newHistory);
    setInput('');
    setLoading(true);

    try {
      // A. KIRIM KE AI
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            type: 'riset-produk', 
            messages: newHistory 
        }),
      });

      const data = await res.json();
      
      if (res.status === 402) { 
          alert("Poin habis!");
          setChat(prev => [...prev, { role: 'system', content: '⚠️ **Poin Habis.** Silakan Top Up untuk melanjutkan.' }]); 
          return; 
      }
      
      if (!res.ok) throw new Error(data.message || "Gagal generate");
      
      const aiResponse = { role: 'assistant', content: data.result };
      const updatedChat = [...newHistory, aiResponse];
      setChat(updatedChat);

      // B. SIMPAN KE DATABASE (Create or Update)
      if (!activeHistoryId) {
          // Kalo belum punya ID (Chat Baru) -> CREATE (POST)
          const saveRes = await fetch('/api/user/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toolType: 'riset-produk',
              title: userMsg.content.substring(0, 30) + "...", // Judul dari chat pertama
              inputData: { chat: updatedChat }, 
              resultData: data.result 
            })
          });
          
          const saveData = await saveRes.json();
          if (saveData.success && saveData.data) {
              setActiveHistoryId(saveData.data._id); // Simpan ID baru
              fetchHistory(); // Refresh sidebar agar muncul
          }
      } else {
          // Kalo sudah punya ID (Lanjut Chat) -> UPDATE (PUT)
          await fetch('/api/user/history', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: activeHistoryId,
              inputData: { chat: updatedChat },
              resultData: data.result
            })
          });
      }

    } catch (err) { 
        setChat(prev => [...prev, { role: 'system', content: `❌ Error: ${err.message}` }]);
    } finally { 
        setLoading(false); 
    }
  };

  // Reset Chat (Mulai Baru)
  const handleReset = () => {
    if(confirm("Mulai riset baru? Chat saat ini akan disimpan di riwayat.")) {
        setChat(defaultChat);
        setActiveHistoryId(null);
        localStorage.removeItem('JITU_CHAT_RISET_PRODUK');
        localStorage.removeItem('JITU_ACTIVE_ID_RISET');
        setIsHistoryOpen(false);
    }
  };

  // Load Chat Lama dari History
  const handleLoadHistory = (item) => {
    setActiveHistoryId(item._id);
    localStorage.setItem('JITU_ACTIVE_ID_RISET', item._id);

    if (item.inputData?.chat) {
        setChat(item.inputData.chat);
        localStorage.setItem('JITU_CHAT_RISET_PRODUK', JSON.stringify(item.inputData.chat));
    } else {
        // Fallback untuk data lama
        const restored = [
            { role: 'user', content: `Skill: ${item.inputData.skills || '-'}, Ide: ${item.inputData.idea || '-'}` },
            { role: 'assistant', content: item.resultData }
        ];
        setChat(restored);
        localStorage.setItem('JITU_CHAT_RISET_PRODUK', JSON.stringify(restored));
    }
    setIsHistoryOpen(false); // Tutup drawer mobile
  };

  // --- KOMPONEN ITEM HISTORY (Reusable) ---
  const HistoryList = () => (
    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {history.length === 0 ? (
            <div className="text-center py-10 opacity-50">
                <History size={24} className="mx-auto mb-2 text-slate-300" />
                <p className="text-[10px] font-bold text-slate-400 uppercase">Belum ada riwayat</p>
            </div>
        ) : (
            history.map((item) => {
                // Format Waktu Indonesia
                const dateObj = new Date(item.createdAt);
                const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
                const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                return (
                    <div 
                        key={item._id} 
                        onClick={() => handleLoadHistory(item)} 
                        className={`group p-3 rounded-xl border cursor-pointer transition-all active:scale-95
                            ${activeHistoryId === item._id 
                                ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100' 
                                : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'}
                        `}
                    >
                        <div className="flex justify-between items-center mb-1.5 pb-1.5 border-b border-dashed border-slate-100 group-hover:border-slate-200">
                            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 group-hover:text-blue-600">
                                {dateStr}
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-medium text-slate-300 group-hover:text-blue-400">
                                <Clock size={8} /> {timeStr}
                            </span>
                        </div>
                        <h4 className={`text-[10px] font-bold leading-tight line-clamp-2 ${activeHistoryId === item._id ? 'text-blue-700' : 'text-slate-700'}`}>
                            {item.title || "Riset Tanpa Judul"}
                        </h4>
                    </div>
                );
            })
        )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-85px)] md:h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-12 gap-6 font-poppins antialiased text-slate-900 pb-2 md:pb-4 relative">
      
      {/* --- KIRI: SIDEBAR HISTORY (DESKTOP) --- */}
      <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 h-full overflow-hidden">
         <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm shrink-0">
            <h1 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-2 text-blue-900">
                <Zap className="w-4 h-4 text-blue-600 fill-blue-600" /> Jitu Research
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Biaya: {config.creditCost} Poin / Chat
            </div>
         </div>

         <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <History size={14} /> Riwayat Chat
            </h3>
            <HistoryList />
         </div>
      </div>

      {/* --- DRAWER HISTORY (MOBILE) --- */}
      {isHistoryOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsHistoryOpen(false)}
        />
      )}
      <div className={`
        fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col border-l border-slate-100
        ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-blue-900">
                <History size={16} className="text-blue-600" /> Riwayat Chat
             </h3>
             <button onClick={() => setIsHistoryOpen(false)} className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-rose-500 active:scale-90 transition-all">
                <X size={18} />
             </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
             <HistoryList />
          </div>
      </div>

      {/* --- KANAN: CHAT ROOM --- */}
      <div className="lg:col-span-9 h-full flex flex-col bg-white rounded-xl md:rounded-[2.5rem] shadow-sm md:shadow-xl border border-slate-100 overflow-hidden relative">
        
        {/* Header Chat */}
        <div className="px-4 py-3 md:p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md flex justify-between items-center shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-2 md:gap-3">
                <Link href="/site/dashboard" className="lg:hidden p-2 bg-slate-50 rounded-xl text-slate-500 active:scale-95">
                    <ChevronLeft size={20} />
                </Link>

                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
                        <Zap size={18} fill="currentColor" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-black uppercase tracking-tight text-slate-800 truncate">Jitu AI</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Online</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setIsHistoryOpen(true)}
                    className="lg:hidden p-2 bg-slate-50 text-blue-600 rounded-xl hover:bg-blue-50 transition-all active:scale-95 border border-slate-200"
                >
                    <History size={18} />
                </button>
                <button 
                    onClick={handleReset} 
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95" 
                    title="Mulai Riset Baru"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 custom-scrollbar scroll-smooth">
            {chat.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const isSystem = msg.role === 'system';
                if (isSystem) return null;

                return (
                  <div key={idx} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                    <div className={`flex max-w-[90%] lg:max-w-[80%] gap-3 md:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        
                        {/* AVATAR */}
                        <div className="shrink-0">
                            {isUser ? (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                    <User size={16} />
                                </div>
                            ) : (
                                <div className="relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10">
                                     <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-50"></div>
                                     <div className="relative w-full h-full bg-blue-600 rounded-full flex items-center justify-center shadow-md shadow-blue-600/20 border-2 border-white">
                                         <Zap size={18} className="text-white fill-white" />
                                     </div>
                                </div>
                            )}
                        </div>

                        {/* BUBBLE CHAT */}
                        <div className={`
                            px-4 py-3 md:p-5 text-sm leading-relaxed shadow-sm relative group
                            ${isUser 
                                ? 'bg-slate-800 text-white rounded-2xl rounded-tr-sm' 
                                : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm'}
                        `}>
                            {!isUser ? (
                                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-800 prose-ul:list-disc prose-a:text-blue-600 prose-strong:font-semibold prose-strong:text-slate-900">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                            )}
                        </div>
                    </div>
                  </div>
                );
            })}
            
            {/* LOADING ANIMATION */}
            {loading && (
                <div className="flex justify-start w-full animate-in fade-in duration-500 px-1">
                    <div className="flex max-w-[90%] gap-3 items-end">
                        <div className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm relative">
                             <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-blue-600 italic animate-pulse">
                                {loadingMessages[loadingTextIndex]}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <div ref={scrollRef} className="h-2" />
        </div>

        {/* Input Area */}
        <div className="p-3 md:p-5 bg-white border-t border-slate-100 shrink-0 sticky bottom-0 z-20">
            <form onSubmit={handleSend} className="relative flex items-end gap-2 max-w-4xl mx-auto">
                <div className="relative flex-1 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all flex items-center px-2">
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { 
                            if(e.key === 'Enter' && !e.shiftKey) { 
                                e.preventDefault(); 
                                handleSend(e); 
                            } 
                        }}
                        placeholder="Ketik ide produk..."
                        className="w-full bg-transparent border-none text-slate-800 text-sm font-medium px-3 py-3 md:py-4 outline-none placeholder:text-slate-400 resize-none max-h-[120px]"
                        style={{ minHeight: '48px', height: input ? 'auto' : '48px' }}
                        rows={1}
                        disabled={loading || !config.isActive}
                    />
                </div>
                
                <button type="submit" disabled={!input.trim() || loading || !config.isActive} className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 active:scale-90 flex items-center justify-center shrink-0">
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
                </button>
            </form>
            
            <p className="text-[9px] text-center text-slate-400 mt-2 font-medium hidden md:block">
                Tekan Shift + Enter untuk baris baru. Chat tersimpan otomatis.
            </p>
        </div>

      </div>
    </div>
  );
}