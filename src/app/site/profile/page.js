"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Poppins } from 'next/font/google';
import { 
  User, 
  CreditCard, 
  Shield, 
  Smartphone, 
  Loader2, 
  Zap, 
  Save, 
  Lock, 
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle 
} from 'lucide-react';

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700', '800', '900'] 
});

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);
  
  const [user, setUser] = useState({ name: '', email: '', phone: '', credits: 0, role: 'user' });
  const [transactions, setTransactions] = useState([]); 
  const [priceInfo, setPriceInfo] = useState(100);
  const [pass, setPass] = useState({ new: '', confirm: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Paralel fetch agar lebih cepat
      const [resUser, resSettings, resLogs] = await Promise.all([
        fetch('/api/user/me'),
        fetch('/api/admin/settings'),
        fetch('/api/user/transactions?limit=10') // Limit 10 riwayat terakhir
      ]);

      const dataUser = await resUser.json();
      if (resUser.ok && dataUser.user) setUser(dataUser.user);

      const dataSettings = await resSettings.json();
      if (dataSettings.settings) setPriceInfo(dataSettings.settings.pricePerPoint);

      const dataLogs = await resLogs.json();
      // Pastikan dataLogs berupa array
      setTransactions(Array.isArray(dataLogs.transactions) ? dataLogs.transactions : []);

    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.name, phone: user.phone })
      });
      if (res.ok) alert("✅ Profil berhasil diperbarui!");
      else alert("Gagal update profil.");
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!pass.new || pass.new !== pass.confirm) return alert("Password tidak cocok!");
    if (pass.new.length < 6) return alert("Password minimal 6 karakter!");

    setUpdatingPass(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: pass.new })
      });
      if (res.ok) {
        alert("✅ Password berhasil diganti!");
        setPass({ new: '', confirm: '' });
      } else {
        alert("Gagal ganti password.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setUpdatingPass(false);
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-2">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memuat Profil...</span>
    </div>
  );

  return (
    <div className={`max-w-6xl mx-auto space-y-8 pb-20 mt-4 px-4 ${poppins.className}`}>
      
      {/* Header Utama */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pengaturan Akun</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Informasi pribadi, saldo kredit, dan riwayat aktivitas Anda.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
           <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">Status: Member Aktif</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* KOLOM KIRI: Saldo, Info Sistem, & RIWAYAT */}
        <div className="space-y-6">
          
          {/* Kartu Saldo */}
          <div className="bg-[#0F172A] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <Zap className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">Kredit Tersedia</p>
              <div className="flex items-baseline gap-2 mb-6">
                <h2 className="text-4xl font-bold tracking-tighter">{user?.credits?.toLocaleString('id-ID') || 0}</h2>
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Poin</span>
              </div>
              <button onClick={() => router.push('/site/topup')} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/30 active:scale-95">
                <CreditCard className="w-5 h-5" /> Top Up Sekarang
              </button>
              <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center text-[10px]">
                <span className="text-gray-500 font-bold uppercase">Rate Konversi</span>
                <span className="font-bold text-blue-400 uppercase">Rp {priceInfo}/poin</span>
              </div>
            </div>
          </div>

          {/* RIWAYAT TRANSAKSI */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <Clock className="w-3.5 h-3.5" /> Aktivitas Terakhir
              </h4>
            </div>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
              {transactions.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                    <Clock className="w-8 h-8 text-gray-200 mx-auto" />
                    <p className="text-xs text-gray-400 italic">Belum ada riwayat transaksi</p>
                </div>
              ) : (
                transactions.map((log) => {
                  const isPending = log.status === 'pending';
                  const isSuccess = log.status === 'success';
                  const isFailed = log.status === 'failed';
                  const isIncome = log.type === 'in' || log.type === 'topup' || log.type === 'bonus';

                  return (
                    <div 
                      key={log._id} 
                      onClick={() => isPending && router.push(`/payment/${log._id}`)} 
                      className={`flex items-center justify-between gap-3 group p-3 rounded-2xl transition-all border border-transparent ${isPending ? 'cursor-pointer hover:bg-blue-50 hover:border-blue-100' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          isPending ? 'bg-amber-50 text-amber-600' :
                          isFailed ? 'bg-red-50 text-red-600' :
                          isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {isPending ? <Clock className="w-3.5 h-3.5" /> : 
                           isFailed ? <AlertCircle className="w-3.5 h-3.5" /> :
                           isIncome ? <ArrowDownLeft className="w-3.5 h-3.5"/> : <ArrowUpRight className="w-3.5 h-3.5"/>}
                        </div>

                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-gray-800 truncate leading-tight mb-0.5 capitalize">
                            {log.description || (isIncome ? 'Top Up Poin' : 'Penggunaan Tool')}
                          </p>
                          <p className="text-[9px] text-gray-400 font-medium">
                            {new Date(log.createdAt).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        {isPending ? (
                          <span className="bg-amber-100 text-amber-600 px-2 py-1 rounded-lg text-[9px] font-bold tracking-wide uppercase">
                            Menunggu
                          </span>
                        ) : isFailed ? (
                          <span className="text-red-500 text-[10px] font-bold uppercase">
                            Gagal
                          </span>
                        ) : (
                          <span className={`text-xs font-black whitespace-nowrap ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isIncome ? '+' : '-'}{log.amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Informasi Sistem */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Informasi Sistem</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-xl"><Shield className="w-4 h-4 text-gray-400"/></div>
                <div><p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Role Akses</p><p className="text-xs font-bold text-gray-700 capitalize">{user?.role}</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-xl"><Smartphone className="w-4 h-4 text-gray-400"/></div>
                <div><p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Versi Aplikasi</p><p className="text-xs font-bold text-gray-700">Jitu Digital v1.0 (Beta)</p></div>
              </div>
            </div>
          </div>

        </div>

        {/* KOLOM KANAN: Form Edit & Keamanan */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Data Pribadi */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl"><User className="w-5 h-5 text-blue-600"/></div>
              Data Pribadi
            </h3>
            <form onSubmit={handleUpdateProfile} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input type="text" value={user.name} onChange={e => setUser({...user, name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email (Permanen)</label>
                <div className="relative">
                  <input type="email" value={user.email} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 cursor-not-allowed" />
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                </div>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
                <input type="text" value={user.phone} onChange={e => setUser({...user, phone: e.target.value})} placeholder="628123xxx" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold focus:bg-white focus:border-blue-500 outline-none transition-all" />
              </div>
              <div className="md:col-span-2 pt-2">
                <button type="submit" disabled={saving} className="bg-gray-900 text-white px-10 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black shadow-lg active:scale-95 disabled:opacity-50 transition-all">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} SIMPAN PERUBAHAN
                </button>
              </div>
            </form>
          </div>

          {/* Keamanan Akun */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <div className="p-2.5 bg-red-50 rounded-xl"><Lock className="w-5 h-5 text-red-600"/></div>
              Keamanan Akun
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password Baru</label>
                  <input type="password" value={pass.new} onChange={(e) => setPass({...pass, new: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold focus:bg-white focus:border-red-500 outline-none transition-all" placeholder="Minimal 6 karakter..." />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Konfirmasi Password</label>
                  <input type="password" value={pass.confirm} onChange={(e) => setPass({...pass, confirm: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold focus:bg-white focus:border-red-500 outline-none transition-all" placeholder="Ulangi password..." />
               </div>
               <div className="md:col-span-2 pt-2">
                  <button onClick={handleUpdatePassword} disabled={updatingPass} className="bg-red-50 text-red-600 border border-red-100 px-10 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50">
                    {updatingPass ? <Loader2 className="w-4 h-4 animate-spin"/> : <Shield className="w-4 h-4"/>} UPDATE PASSWORD
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}