"use client";
import { useState, useEffect } from 'react';
import { Plus, Trash2, Ticket, Search, CheckCircle2, Loader2, Tag, AlertCircle } from 'lucide-react';

export default function AdminVoucherPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [formData, setFormData] = useState({ code: "", type: "fixed", value: "", limit: "" });

  useEffect(() => { fetchVouchers(); }, []);

  const fetchVouchers = async () => {
    try {
      const res = await fetch('/api/vouchers');
      const data = await res.json();
      if (data.success) setVouchers(data.vouchers);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    setBtnLoading(true);
    try {
      const res = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        fetchVouchers();
        setFormData({ code: "", type: "fixed", value: "", limit: "" });
      } else { alert(data.message); }
    } catch (err) { alert("Gagal!"); }
    finally { setBtnLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus voucher?")) return;
    await fetch(`/api/vouchers/${id}`, { method: 'DELETE' });
    fetchVouchers();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 pt-2 px-4 text-slate-900 leading-tight">
      <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight italic">Voucher <span className="text-blue-600">Control Center</span></h1>
          <p className="text-sm text-slate-500 font-medium">Atur kode promo untuk meningkatkan konversi Top Up.</p>
      </div>

      {/* --- FORM ATAS: FULL WIDTH --- */}
      <form onSubmit={handleCreateVoucher} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
           <div className="p-2 bg-slate-900 text-white rounded-xl shadow-lg"><Plus size={16} /></div>
           <h3 className="text-sm font-semibold uppercase tracking-wider">Terbitkan Voucher Baru</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kode Voucher</label>
            <input required type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="CONTOH: JITUSULTAN" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold uppercase outline-none focus:border-blue-400 focus:bg-white transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tipe Potongan</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold outline-none cursor-pointer">
                <option value="fixed">Fixed (Rp)</option>
                <option value="percent">Percent (%)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nilai Diskon</label>
            <input required type="number" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} placeholder="0" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Maksimal Pakai</label>
            <input type="number" value={formData.limit} onChange={(e) => setFormData({...formData, limit: e.target.value})} placeholder="100" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-semibold outline-none" />
          </div>
        </div>

        <button disabled={btnLoading} className="w-full md:w-fit px-12 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-200 active:scale-95 transition-all">
            {btnLoading ? <Loader2 className="animate-spin" size={16}/> : "Terbitkan Voucher"}
        </button>
      </form>

      {/* --- TABEL BAWAH: FULL WIDTH --- */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center gap-4 bg-slate-50/30">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                <input type="text" placeholder="Cari kode..." className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-medium outline-none focus:border-blue-400" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:block">Total Voucher: <span className="text-blue-600">{vouchers.length}</span></p>
        </div>

        {loading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Informasi Voucher</th>
                  <th className="px-6 py-5">Nilai Diskon</th>
                  <th className="px-6 py-5">Terpakai</th>
                  <th className="px-8 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {vouchers.map((v) => (
                  <tr key={v._id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Tag size={16} /></div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">{v.code}</p>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Status {v.status}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 italic text-xs font-semibold">
                      {v.type === 'fixed' ? `Rp ${v.value.toLocaleString('id-ID')}` : `${v.value}%`}
                    </td>
                    <td className="px-6 py-5">
                      <div className="w-32 space-y-2">
                          <div className="flex justify-between text-[9px] font-bold uppercase tracking-tight text-slate-500">
                              <span>{v.used}/{v.limit} used</span>
                              <span>{Math.round((v.used/v.limit)*100)}%</span>
                          </div>
                          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full bg-blue-600`} style={{ width: `${(v.used/v.limit)*100}%` }}></div>
                          </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => handleDelete(v._id)} className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2.5 rounded-xl transition-all"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}