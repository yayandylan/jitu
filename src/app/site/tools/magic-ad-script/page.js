"use client";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect, useRef } from 'react';
import remarkGfm from 'remark-gfm'; 
import { 
    Send, Loader2, User, Zap, Trash2, 
    History, ChevronLeft, X, Clock, Wand2, Film 
} from 'lucide-react';
import Link from 'next/link';

export default function MagicAdScriptPage() {
  const [input, setInput] = useState('');
  
  // Default Pesan Awal (Persona Copywriter)
  const defaultChat = [
    { 
      role: 'assistant', 
      content: 'Halo! Saya **Jitu Copywriter**. 🪄\n\nIklan yang bagus itu **80% di Hook & Copywriting**. \n\nKasih tahu saya:\n1. **Produk** apa yang dijual?\n2. **Siapa** targetnya? (Jujur aja)\n3. Apa **Keunggulan** utamanya?\n\nSaya akan racik Script Video & Caption yang nampol!' 
    }
  ];

  const [chat, setChat] = useState(defaultChat);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [config, setConfig] = useState({ creditCost: 50, isActive: true });
  
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  
  const scrollRef = useRef(null);
  const isLoaded = useRef(false);

  // Kalimat Loading ala Creative Director
  const loadingMessages = [
    "Meracik Hook yang mematikan...",
    "Mencari kata-kata hipnotis...",
    "Menyusun skenario video...",
    "Mempertajam angle marketing...",
    "Finishing touch copywriting..."
  ];

  // --- 1. LOGIC LOAD & SAVE ---
  useEffect(() => {
    fetchConfig();
    fetchHistory();
    
    // Key LocalStorage KHUSUS Magic Ads
    const savedChat = localStorage.getItem('JITU_CHAT_MAGIC_ADS');
    const savedId = localStorage.getItem('JITU_ACTIVE_ID_MAGIC');

    if (savedChat) {
        try {
            const parsed = JSON.parse(savedChat);
            if (parsed.length > 0) setChat(parsed);
        } catch (e) { console.error(e); }
    }
    if (savedId) setActiveHistoryId(savedId);

    isLoaded.current = true;
  }, []);

  useEffect(() => {
    if (isLoaded.current) {
        if (chat.length > 1 || (chat.length === 1 && chat[0].content !== defaultChat[0].content)) {
            localStorage.setItem('JITU_CHAT_MAGIC_ADS', JSON.stringify(chat));
        }
        if (activeHistoryId) {
            localStorage.setItem('JITU_ACTIVE_ID_MAGIC', activeHistoryId);
        }
    }
    setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [chat, loading, activeHistoryId]);

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
            const myTool = tools.find(t => t.slug === 'magic-ad-script');
            if (myTool) setConfig(myTool);
        }
    } catch (e) { console.error(e); }
  };

  const fetchHistory = async () => {
    try {
        const histRes = await fetch('/api/user/history?tool=magic-ad-script').catch(() => null);
        if(histRes?.ok) {
            const histData = await histRes.json();
            setHistory(Array.isArray(histData.data) ? histData.data : []);
        }
    } catch (e) { console.error(e); }
  };

  // --- 2. SEND MESSAGE ---
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !config.isActive || loading) return;
    
    document.activeElement.blur(); 

    const userMsg = { role: 'user', content: input };
    const newHistory = [...chat, userMsg];
    
    setChat(newHistory);
    setInput('');
    setLoading(true);

    try {
      // API call type: magic-ad-script
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            type: 'magic-ad-script', 
            messages: newHistory 
        }),
      });

      const data = await res.json();
      
      if (res.status === 402) { 
          alert("Poin habis!");
          setChat(prev => [...prev, { role: 'system', content: '⚠️ **Poin Habis.** Top Up dulu bosku.' }]); 
          return; 
      }
      
      if (!res.ok) throw new Error(data.message || "Gagal generate");
      
      const aiResponse = { role: 'assistant', content: data.result };
      const updatedChat = [...newHistory, aiResponse];
      setChat(updatedChat);

      // Save/Update History
      if (!activeHistoryId) {
          const saveRes = await fetch('/api/user/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toolType: 'magic-ad-script',
              title: userMsg.content.substring(0, 30) + "...", 
              inputData: { chat: updatedChat }, 
              resultData: data.result 
            })
          });
          
          const saveData = await saveRes.json();
          if (saveData.success && saveData.data) {
              setActiveHistoryId(saveData.data._id);
              fetchHistory(); 
          }
      } else {
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

  const handleReset = () => {
    if(confirm("Buat script baru?")) {
        setChat(defaultChat);
        setActiveHistoryId(null);
        localStorage.removeItem('JITU_CHAT_MAGIC_ADS');
        localStorage.removeItem('JITU_ACTIVE_ID_MAGIC');
        setIsHistoryOpen(false);
    }
  };

  const handleLoadHistory = (item) => {
    setActiveHistoryId(item._id);
    localStorage.setItem('JITU_ACTIVE_ID_MAGIC', item._id);

    if (item.inputData?.chat) {
        setChat(item.inputData.chat);
        localStorage.setItem('JITU_CHAT_MAGIC_ADS', JSON.stringify(item.inputData.chat));
    } else {
        const restored = [
            { role: 'user', content: `Produk: ${item.inputData.product || '-'}` },
            { role: 'assistant', content: item.resultData }
        ];
        setChat(restored);
        localStorage.setItem('JITU_CHAT_MAGIC_ADS', JSON.stringify(restored));
    }
    setIsHistoryOpen(false);
  };

  // --- HISTORY LIST COMPONENT ---
  const HistoryList = () => (
    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
        {history.length === 0 ? (
            <div className="text-center py-10 opacity-50">
                <History size={24} className="mx-auto mb-2 text-slate-300" />
                <p className="text-[10px] font-bold text-slate-400 uppercase">Belum ada script</p>
            </div>
        ) : (
            history.map((item) => {
                const dateObj = new Date(item.createdAt);
                const dateStr = dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
                const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                return (
                    <div 
                        key={item._id} 
                        onClick={() => handleLoadHistory(item)} 
                        className={`group p-3 rounded-xl border cursor-pointer transition-all active:scale-95
                            ${activeHistoryId === item._id 
                                ? 'bg-purple-50 border-purple-200 shadow-sm ring-1 ring-purple-100' 
                                : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-100'}
                        `}
                    >
                        <div className="flex justify-between items-center mb-1.5 pb-1.5 border-b border-dashed border-slate-100 group-hover:border-slate-200">
                            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 group-hover:text-purple-600">
                                {dateStr}
                            </span>
                            <span className="flex items-center gap-1 text-[9px] font-medium text-slate-300 group-hover:text-purple-400">
                                <Clock size={8} /> {timeStr}
                            </span>
                        </div>
                        <h4 className={`text-[10px] font-bold leading-tight line-clamp-2 ${activeHistoryId === item._id ? 'text-purple-700' : 'text-slate-700'}`}>
                            {item.title || "Script Tanpa Judul"}
                        </h4>
                    </div>
                );
            })
        )}
    </div>
  );

  return (
    <div className="h-[calc(100vh-85px)] md:h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-12 gap-6 font-poppins antialiased text-slate-900 pb-2 md:pb-4 relative">
      
      {/* SIDEBAR DESKTOP */}
      <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 h-full overflow-hidden">
         <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm shrink-0">
            <h1 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 mb-2 text-purple-900">
                <Wand2 className="w-4 h-4 text-purple-600" /> Magic Scripts
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg w-fit">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                Biaya: {config.creditCost} Poin
            </div>
         </div>
         <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <History size={14} /> Riwayat Script
            </h3>
            <HistoryList />
         </div>
      </div>

      {/* DRAWER MOBILE */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsHistoryOpen(false)} />
      )}
      <div className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col border-l border-slate-100 ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-purple-900">
                <History size={16} className="text-purple-600" /> Riwayat Script
             </h3>
             <button onClick={() => setIsHistoryOpen(false)} className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-rose-500"><X size={18} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50"><HistoryList /></div>
      </div>

      {/* CHAT AREA */}
      <div className="lg:col-span-9 h-full flex flex-col bg-white rounded-xl md:rounded-[2.5rem] shadow-sm md:shadow-xl border border-slate-100 overflow-hidden relative">
        
        {/* Header */}
        <div className="px-4 py-3 md:p-4 border-b border-slate-100 bg-white/80 backdrop-blur-md flex justify-between items-center shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-2 md:gap-3">
                <Link href="/site/dashboard" className="lg:hidden p-2 bg-slate-50 rounded-xl text-slate-500 active:scale-95"><ChevronLeft size={20} /></Link>
                <div className="flex items-center gap-3">
                    {/* ICON MAGIC */}
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 shrink-0">
                        <Wand2 size={18} fill="currentColor" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-sm font-black uppercase tracking-tight text-slate-800 truncate">Magic Ad Script</h2>
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
                <button onClick={() => setIsHistoryOpen(true)} className="lg:hidden p-2 bg-slate-50 text-purple-600 rounded-xl hover:bg-purple-50 transition-all border border-slate-200"><History size={18} /></button>
                <button onClick={handleReset} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-95"><Trash2 size={18} /></button>
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50 custom-scrollbar scroll-smooth">
            {chat.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const isSystem = msg.role === 'system';
                if (isSystem) return null;

                return (
                  <div key={idx} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                    <div className={`flex max-w-[90%] lg:max-w-[80%] gap-3 md:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className="shrink-0">
                            {isUser ? (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500"><User size={16} /></div>
                            ) : (
                                <div className="relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10">
                                     <div className="absolute inset-0 bg-purple-200 rounded-full animate-ping opacity-50"></div>
                                     <div className="relative w-full h-full bg-purple-600 rounded-full flex items-center justify-center shadow-md shadow-purple-600/20 border-2 border-white">
                                         <Wand2 size={18} className="text-white fill-white" />
                                     </div>
                                </div>
                            )}
                        </div>
                        <div className={`px-4 py-3 md:p-5 text-sm leading-relaxed shadow-sm relative group ${isUser ? 'bg-slate-800 text-white rounded-2xl rounded-tr-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-2xl rounded-tl-sm'}`}>
                            {!isUser ? (
                                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-800 prose-ul:list-disc prose-a:text-purple-600 prose-strong:font-semibold prose-strong:text-slate-900">
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
            {loading && (
                <div className="flex justify-start w-full animate-in fade-in duration-500 px-1">
                    <div className="flex max-w-[90%] gap-3 items-end">
                        <div className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm relative">
                             <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-purple-600 italic animate-pulse">{loadingMessages[loadingTextIndex]}</p>
                        </div>
                    </div>
                </div>
            )}
            <div ref={scrollRef} className="h-2" />
        </div>

        {/* Input */}
        <div className="p-3 md:p-5 bg-white border-t border-slate-100 shrink-0 sticky bottom-0 z-20">
            <form onSubmit={handleSend} className="relative flex items-end gap-2 max-w-4xl mx-auto">
                <div className="relative flex-1 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition-all flex items-center px-2">
                    <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }} placeholder="Jual produk apa nih?" className="w-full bg-transparent border-none text-slate-800 text-sm font-medium px-3 py-3 md:py-4 outline-none placeholder:text-slate-400 resize-none max-h-[120px]" style={{ minHeight: '48px', height: input ? 'auto' : '48px' }} rows={1} disabled={loading || !config.isActive} />
                </div>
                <button type="submit" disabled={!input.trim() || loading || !config.isActive} className="w-12 h-12 md:w-14 md:h-14 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/30 active:scale-90 flex items-center justify-center shrink-0">
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
                </button>
            </form>
            <p className="text-[9px] text-center text-slate-400 mt-2 font-medium hidden md:block">Tekan Shift + Enter untuk baris baru.</p>
        </div>

      </div>
    </div>
  );
}