"use client";
import { useState, useEffect, useRef } from 'react';
import { 
  Bell, Info, CheckCircle2, XCircle, CreditCard, 
  Shield, Megaphone, Loader2 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // 1. FETCH DATA
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/user/notifications');
      if (!res.ok) throw new Error("Gagal");
      const data = await res.json();
      
      setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      setNotifications([]); 
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. MARK AS READ
  const handleToggle = async () => {
    const newState = !isOpen;
    setIsOpen(newState);

    if (newState && unreadCount > 0) {
      setUnreadCount(0);
      try {
        await fetch('/api/user/notifications', { method: 'PUT' });
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (e) { console.error(e); }
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. ICON & COLOR HELPER
  const getIcon = (category, type) => {
    if (type === 'success') return <CheckCircle2 size={18} className="text-emerald-500" />;
    if (type === 'danger') return <XCircle size={18} className="text-rose-500" />;
    
    switch (category) {
        case 'billing': return <CreditCard size={18} className="text-blue-500" />;
        case 'security': return <Shield size={18} className="text-purple-500" />;
        case 'promo': return <Megaphone size={18} className="text-orange-500" />;
        default: return <Info size={18} className="text-slate-400" />;
    }
  };

  const getBgColor = (type, isRead) => {
    if (isRead) return 'bg-white hover:bg-slate-50';
    if (type === 'success') return 'bg-emerald-50/50 hover:bg-emerald-50';
    if (type === 'danger') return 'bg-rose-50/50 hover:bg-rose-50';
    return 'bg-blue-50/50 hover:bg-blue-50';
  };

  return (
    <div className="relative font-poppins text-left" ref={dropdownRef}>
      
      {/* TOMBOL LONCENG */}
      <button 
        onClick={handleToggle} 
        className={`relative p-2.5 rounded-xl transition-all active:scale-95 border border-transparent ${isOpen ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-500 hover:text-blue-600'}`}
      >
        <Bell size={20} />
        {unreadCount > 0 && !loading && (
          <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse shadow-sm"></span>
        )}
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 md:right-auto md:left-1/2 md:-translate-x-1/2 top-full mt-3 w-80 md:w-96 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
          
          {/* HEADER */}
          <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 text-left">Notifikasi</h3>
            <button onClick={fetchNotifications} className="text-slate-400 hover:text-blue-600 p-1 rounded-lg">
               {loading ? <Loader2 size={14} className="animate-spin"/> : <Info size={14}/>}
            </button>
          </div>

          {/* LIST NOTIFIKASI */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-white">
            {loading && notifications.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                <Loader2 className="animate-spin text-blue-500" size={24} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Memuat...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
                <div className="bg-slate-50 p-4 rounded-full"><Bell size={24} className="text-slate-300" /></div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tidak ada notifikasi</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((item) => (
                  <div 
                    key={item._id} 
                    onClick={() => { setIsOpen(false); if(item.link) router.push(item.link); }}
                    className={`p-4 flex gap-4 transition-all cursor-pointer group relative items-start text-left ${getBgColor(item.type, item.isRead)}`}
                  >
                    {/* ICON (Kiri) */}
                    <div className="mt-1 shrink-0 bg-white p-1.5 rounded-lg shadow-sm border border-slate-100 h-fit">
                        {getIcon(item.category, item.type)}
                    </div>

                    {/* KONTEN (Tengah - Rata Kiri) */}
                    <div className="flex-1 space-y-1 min-w-0 text-left">
                        <div className="flex justify-between items-start gap-2">
                            {/* Judul: Force Text Left */}
                            <h4 className={`text-[13px] font-bold leading-tight truncate text-left ${item.isRead ? 'text-slate-600' : 'text-slate-900'}`}>
                                {item.title}
                            </h4>
                            {/* Tanggal */}
                            <span className="text-[9px] font-bold text-slate-300 shrink-0 whitespace-nowrap pt-0.5">
                                {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                        </div>
                        
                        {/* Pesan: Force Text Left & Align Left */}
                        <p className={`text-[11px] leading-relaxed line-clamp-2 text-left ${item.isRead ? 'text-slate-400' : 'text-slate-600'}`}>
                            {item.message}
                        </p>
                        
                        {/* Link: Force Text Left */}
                        {item.link && (
                            <span className="text-[9px] font-bold text-blue-500 group-hover:underline decoration-blue-500/30 pt-1 block text-left">
                                Lihat Detail &rarr;
                            </span>
                        )}
                    </div>

                    {/* Indikator Belum Dibaca (Garis Biru di Kiri) */}
                    {!item.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}