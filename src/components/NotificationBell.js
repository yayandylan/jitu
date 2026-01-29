"use client";
import { useState, useEffect, useRef } from 'react';
import { Bell, Loader2, Star, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const dropdownRef = useRef(null);

  const fetchNotif = async () => {
    try {
      // API ini harus mengembalikan data yang sudah difilter berdasarkan status user di backend
      const res = await fetch('/api/user/notifications');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setNotifications(data);
        setLoading(false);

        const lastSeenId = localStorage.getItem('last_notif_id');
        if (data.length > 0 && data[0]._id !== lastSeenId) {
          setHasNew(true);
        }
      }
    } catch (err) {
      console.error("Gagal load notif:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotif();
    const interval = setInterval(fetchNotif, 30000); // 30 detik sekali cukup agar tidak berat di server
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState && notifications.length > 0) {
      setHasNew(false);
      localStorage.setItem('last_notif_id', notifications[0]._id);
    }
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className="relative tracking-tighter" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className={`p-2 rounded-full transition-all outline-none relative ${isOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
      >
        <Bell size={20} />
        {hasNew && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 md:left-0 mt-3 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right md:origin-top-left">
            
            {/* 1. Header: Bersih & Elegant */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Notifikasi</h3>
              {notifications.length > 0 && (
                <span className="text-[9px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-md uppercase">
                    {notifications.length} Pesan
                </span>
              )}
            </div>

            {/* 2. List Konten: Hirarki Visual yang Jelas */}
            <div className="max-h-[400px] overflow-y-auto bg-white custom-scrollbar">
              {loading ? (
                <div className="p-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500 opacity-40"/>
                    <p className="text-[10px] font-medium uppercase tracking-widest">Sinkronisasi...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-10 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell size={20} className="text-slate-200" />
                    </div>
                    <p className="text-xs font-bold text-slate-400">Belum ada info terbaru</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif._id} className="p-5 border-b border-slate-50 hover:bg-slate-50/80 transition-all cursor-pointer group relative">
                    <div className="flex gap-4">
                        {/* Ikon Dinamis berdasarkan Tipe/Target */}
                        <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                            notif.targetGroup === 'premium' ? 'bg-amber-50 text-amber-500' :
                            notif.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                            notif.type === 'warning' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'
                        }`}>
                            {notif.targetGroup === 'premium' ? <Star size={14} className="fill-amber-500" /> : 
                             notif.type === 'success' ? <CheckCircle2 size={14} /> :
                             notif.type === 'warning' ? <AlertTriangle size={14} /> : <Info size={14} />}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="text-[13px] font-bold text-slate-900 leading-snug truncate pr-2">
                                    {notif.title}
                                </h4>
                                <span className="text-[9px] font-medium text-slate-300 uppercase whitespace-nowrap mt-0.5">
                                    {new Date(notif.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-normal leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                                {notif.message}
                            </p>
                            
                            {/* Badge Khusus Premium */}
                            {notif.targetGroup === 'premium' && (
                                <div className="mt-2 inline-flex items-center gap-1 text-[8px] font-black text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                    Premium Exclusive
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* 3. Footer */}
            <button 
                onClick={() => setIsOpen(false)}
                className="w-full p-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-slate-600 bg-slate-50/50 transition-colors"
            >
                Tutup Panel
            </button>
        </div>
      )}
    </div>
  );
}