"use client";
import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Gift, Loader2, Zap, TrendingUp, PlusCircle } from 'lucide-react';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '', basePoints: '', bonusPoints: '', price: '', icon: 'Zap', color: 'bg-blue-50 text-blue-600'
  });

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/packages', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setPackages(data.packages);
    } catch (err) { 
      console.error("Gagal tarik data"); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPackages(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/admin/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();

      if (result.success) {
        setIsModalOpen(false);
        setFormData({ name: '', basePoints: '', bonusPoints: '', price: '', icon: 'Zap', color: 'bg-blue-50 text-blue-600' });
        await fetchPackages();
      } else {
        alert("Gagal menyimpan: " + result.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePackage = async (id) => {
    if(!confirm("Hapus paket promo ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if(data.success) fetchPackages();
      else alert(data.message);
    } catch (err) {
      alert("Gagal menghapus paket.");
    }
  };

  return (
    <div className="space-y-10 font-poppins antialiased tracking-tighter">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black italic text-slate-900 uppercase">Paket <span className="text-blue-600 not-italic">Promo</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Konfigurasi amunisi harga & bonus saldo user.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          <PlusCircle size={18} /> Tambah Paket Baru
        </button>
      </div>

      {/* --- GRID DAFTAR PAKET --- */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-blue-600" size={40} />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sinkronisasi Database...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100">
               <Gift size={48} className="mx-auto text-slate-200 mb-4" />
               <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em]">Belum ada paket promo yang aktif.</p>
            </div>
          ) : (
            packages.map((pkg) => (
              <div key={pkg._id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all relative group overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-125 transition-transform duration-500">
                  <Zap size={100} fill="currentColor" />
                </div>
                
                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                      <Gift size={22} />
                    </div>
                    <button 
                      onClick={() => deletePackage(pkg._id)} 
                      className="w-10 h-10 flex items-center justify-center text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{pkg.name}</h3>
                    <p className="text-3xl font-black tabular-nums tracking-tighter">Rp {pkg.price.toLocaleString('id-ID')}</p>
                  </div>

                  <div className="pt-6 border-t border-slate-50 space-y-2">
                     <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-slate-400 italic">Total Saldo:</span>
                        <span className="text-blue-600 font-black">{(pkg.basePoints + pkg.bonusPoints).toLocaleString()} pts</span>
                     </div>
                     <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium italic">
                        <span>{pkg.basePoints.toLocaleString()} Utama</span>
                        {pkg.bonusPoints > 0 && (
                          <span className="text-emerald-500">+ {pkg.bonusPoints.toLocaleString()} Bonus</span>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white w-full max-w-md rounded-[3.5rem] p-10 space-y-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-xl font-black uppercase italic leading-none">Konfigurasi <span className="text-blue-600">Paket</span></h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">Detail penawaran amunisi baru</p>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Identitas Paket</label>
                <input 
                  type="text" required 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold text-sm outline-none focus:border-blue-500/20 focus:bg-white transition-all placeholder:text-slate-300" 
                  placeholder="Contoh: Agency Scale" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Poin Utama</label>
                  <input 
                    type="number" required 
                    value={formData.basePoints} 
                    onChange={(e) => setFormData({...formData, basePoints: e.target.value})} 
                    className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold text-sm outline-none focus:border-blue-500/20 focus:bg-white transition-all" 
                    placeholder="15000" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Bonus Poin</label>
                  <input 
                    type="number" 
                    value={formData.bonusPoints} 
                    onChange={(e) => setFormData({...formData, bonusPoints: e.target.value})} 
                    className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold text-sm outline-none focus:border-blue-500/20 focus:bg-white transition-all" 
                    placeholder="5000" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Harga Jual (Rp)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-sm">Rp</span>
                  <input 
                    type="number" required 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    className="w-full p-5 pl-14 bg-slate-50 border-2 border-transparent rounded-[2rem] font-bold text-sm outline-none focus:border-blue-500/20 focus:bg-white transition-all" 
                    placeholder="250000" 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-blue-500/30 hover:bg-slate-900 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "PUBLIKASIKAN PAKET"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}