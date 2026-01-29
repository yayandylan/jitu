"use client";
import { useState, useEffect } from 'react';
import { 
  Megaphone, Mail, Bell, Send, 
  Smartphone, Zap, Loader2, History, Trash2, Calendar,
  Users, Star, User // Tambah ikon untuk segmentasi
} from 'lucide-react';

export default function AdminBroadcastPage() {
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'info',
    targetGroup: 'all', // Pilihan: all, free, premium
    sendViaEmail: true,
    sendViaInApp: true,
  });
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [broadcastHistory, setBroadcastHistory] = useState([]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/admin/broadcast');
      const data = await res.json();
      if (res.ok) setBroadcastHistory(data.history || []);
    } catch (err) { console.error(err); } finally { setLoadingHistory(false); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSendBroadcast = async () => {
    if (!form.title || !form.message) return alert("⚠️ Isi judul dan pesan!");
    setLoading(true);
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sendEmailToAll: form.sendViaEmail // Mapping ke nama variabel di API Bapak
        })
      });
      if (res.ok) {
        alert("✅ Broadcast berhasil dikirim!");
        setForm({ ...form, title: '', message: '' });
        fetchHistory();
      }
    } catch (err) { alert("Error: " + err.message); } finally { setLoading(false); }
  };

  const handleDeleteBroadcast = async (id) => {
    if (!confirm("Hapus notifikasi ini?")) return;
    try {
      const res = await fetch(`/api/admin/broadcast?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchHistory();
    } catch (err) { alert("Gagal hapus"); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-5 border-b border-slate-200 pb-8">
        <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20">
            <Megaphone className="w-7 h-7 text-white" />
        </div>
        <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pusat Siaran</h1>
            <p className="text-sm font-normal text-slate-500 mt-1">Gunakan segmentasi audiens untuk konversi maksimal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* EDITOR */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                
                {/* PILIHAN TARGET AUDIENS (BARU) */}
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4 px-1">Target Audiens</label>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { id: 'all', label: 'Semua', icon: <Users size={14}/> },
                            { id: 'free', label: 'Free', icon: <User size={14}/> },
                            { id: 'premium', label: 'Premium', icon: <Star size={14}/> }
                        ].map((g) => (
                            <button
                                key={g.id}
                                onClick={() => setForm({...form, targetGroup: g.id})}
                                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-bold uppercase transition-all border ${
                                    form.targetGroup === g.id 
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                            >
                                {g.icon} {g.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3 px-1">Judul & Tipe</label>
                        <div className="flex gap-4">
                            <input 
                                type="text"
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold outline-none focus:border-blue-500 transition-all"
                                placeholder="Judul Pengumuman..."
                            />
                            <select 
                                value={form.type}
                                onChange={(e) => setForm({...form, type: e.target.value})}
                                className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold uppercase outline-none focus:border-blue-500 transition-all"
                            >
                                <option value="info">INFO</option>
                                <option value="warning">WARNING</option>
                                <option value="success">SUCCESS</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2 px-1">Isi Pesan</label>
                        <textarea 
                            value={form.message}
                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                            rows={6}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-normal text-slate-600 outline-none focus:border-blue-500 transition-all resize-none leading-relaxed"
                            placeholder="Tulis pesan Anda..."
                        />
                    </div>
                </div>
            </div>

            {/* CHANNEL SELECTION */}
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setForm({...form, sendViaEmail: !form.sendViaEmail})} className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${form.sendViaEmail ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-400 opacity-60'}`}><Mail size={18} /> <span className="text-xs font-bold uppercase">Email Blast</span></button>
                <button onClick={() => setForm({...form, sendViaInApp: !form.sendViaInApp})} className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${form.sendViaInApp ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-400 opacity-60'}`}><Bell size={18} /> <span className="text-xs font-bold uppercase">Dashboard</span></button>
            </div>

            {/* HISTORY */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Riwayat Siaran</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {broadcastHistory.map((item) => (
                        <div key={item._id} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${item.type === 'info' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 leading-tight">{item.title}</h4>
                                    <p className="text-[9px] text-slate-400 font-normal mt-1 uppercase tracking-wider">
                                        {new Date(item.createdAt).toLocaleDateString()} • Target: {item.targetGroup || 'All'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteBroadcast(item._id)} className="p-2 text-slate-300 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* PREVIEW */}
        <div className="lg:col-span-1 sticky top-8">
            <div className="bg-[#0F172A] p-7 rounded-[3rem] border-[6px] border-slate-800 shadow-2xl">
                <div className="flex items-center justify-center mb-10"><p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em]">Preview {form.targetGroup}</p></div>
                <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 min-h-[100px] flex gap-3">
                    <div className="bg-blue-50 p-2 h-fit rounded-lg text-blue-600"><Bell size={14}/></div>
                    <div className="min-w-0">
                        <h5 className="text-[11px] font-bold text-slate-900 truncate">{form.title || "Judul..."}</h5>
                        <p className="text-[10px] text-slate-500 leading-tight mt-1 line-clamp-2">{form.message || "Pesan..."}</p>
                    </div>
                </div>
                <button onClick={handleSendBroadcast} disabled={loading} className="w-full mt-12 bg-blue-600 text-white py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30">
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <><Send size={14} /> Kirim ke {form.targetGroup}</>}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}