"use client";
import { useState, useEffect } from 'react';
import { 
  CheckCircle, Trash2, Calendar, X, BarChart3, Banknote, Search, ArrowUpRight, ArrowDownLeft, RefreshCw
} from 'lucide-react';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('in'); // 'in' = Topup, 'out' = Usage
  const [searchTerm, setSearchTerm] = useState(''); 
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. FETCH DATA (MENDUKUNG FILTER)
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/transactions';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      // Ambil data dari API
      const res = await fetch(params.toString() ? `${url}?${params.toString()}` : url);
      const data = await res.json();
      
      // Validasi data array
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally { 
      setLoading(false); 
    }
  };

  // 2. APPROVE TRANSAKSI (Manual Confirm)
  const handleUpdateStatus = async (id, status) => {
    if (!confirm(`Yakin ingin mengubah status menjadi ${status.toUpperCase()}? Saldo user akan bertambah.`)) return;
    
    try {
      // Panggil API Approval yang sudah kita buat (yang ada logika notif + premium)
      const res = await fetch(`/api/transaction/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status }) // status: 'success'
      });
      
      const result = await res.json();

      if (res.ok) {
        alert(result.message || "Berhasil diupdate!");
        fetchTransactions(); // Refresh data
      } else {
        alert("Gagal: " + result.message);
      }
    } catch (e) { 
        alert("Gagal update status. Cek koneksi."); 
    }
  };

  // 3. DELETE TRANSAKSI
  const handleDelete = async (id) => {
    if (!confirm("Hapus transaksi ini permanen? Data tidak bisa kembali.")) return;
    try {
      const res = await fetch(`/api/admin/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) fetchTransactions();
    } catch (e) { alert("Gagal menghapus"); }
  };

  useEffect(() => { fetchTransactions(); }, [startDate, endDate]);

  // --- FILTERING LOGIC (CLIENT SIDE) ---
  const filteredByTab = transactions.filter(t => t.type === tab);
  
  const searchedData = filteredByTab.filter(item => {
    const name = item.userId?.name?.toLowerCase() || 'user';
    const email = item.userId?.email?.toLowerCase() || '';
    const orderId = item._id?.toLowerCase() || '';
    const uniqueCode = item.uniqueCode ? item.uniqueCode.toString() : '';
    const search = searchTerm.toLowerCase();
    
    // Cari berdasarkan Nama, Email, Order ID, atau Kode Unik
    return name.includes(search) || orderId.includes(search) || email.includes(search) || uniqueCode.includes(search);
  });

  // --- STATISTIK RINGKAS (REALTIME) ---
  // Total Uang Masuk (Hanya yang SUKSES)
  const totalIncome = transactions
    .filter(t => t.type === 'in' && t.status === 'success')
    .reduce((sum, t) => sum + (t.price || t.totalPrice || 0), 0); // Support field 'price' & 'totalPrice'

  // Total Poin Keluar (Usage)
  const totalAISpentPoints = transactions
    .filter(t => t.type === 'out')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Total Modal API (Pengeluaran Riil ke OpenRouter)
  const totalModalAI = transactions
    .filter(t => t.type === 'out')
    .reduce((sum, t) => sum + (t.actualCost || 0), 0);

  const profit = totalIncome - totalModalAI;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 mt-2 font-poppins antialiased text-slate-900">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">Transaction <span className="text-blue-600 font-black">Monitor</span></h1>
            <p className="text-slate-400 text-[10px] font-normal uppercase tracking-widest mt-1">Pantau arus kas & approval top up manual</p>
        </div>
        <button onClick={fetchTransactions} className="bg-white border border-slate-200 p-2 rounded-xl text-slate-400 hover:text-blue-600 shadow-sm transition-colors" title="Refresh Data">
            <RefreshCw size={18} />
        </button>
      </div>

      {/* 1. KARTU STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-600 p-6 rounded-[2rem] text-white shadow-lg shadow-blue-200 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 opacity-80">
                <ArrowDownLeft size={16} />
                <p className="text-[10px] font-bold uppercase tracking-wider">Omzet (Masuk)</p>
            </div>
            <h2 className="text-2xl font-black tracking-tighter">Rp {totalIncome.toLocaleString('id-ID')}</h2>
          </div>
          <div className="absolute right-0 bottom-0 p-4 opacity-10"><Banknote size={80}/></div>
        </div>
        
        <div className="bg-orange-500 p-6 rounded-[2rem] text-white shadow-lg shadow-orange-200">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <ArrowUpRight size={16} />
            <p className="text-[10px] font-bold uppercase tracking-wider">Poin Terpakai</p>
          </div>
          <h2 className="text-2xl font-black tracking-tighter">{totalAISpentPoints.toLocaleString('id-ID')} <span className="text-sm font-medium">pts</span></h2>
        </div>
        
        <div className="bg-rose-600 p-6 rounded-[2rem] text-white shadow-lg shadow-rose-200">
           <div className="flex items-center gap-2 mb-2 opacity-80">
            <BarChart3 size={16} />
            <p className="text-[10px] font-bold uppercase tracking-wider">Modal API (Keluar)</p>
          </div>
          <h2 className="text-2xl font-black tracking-tighter">Rp {totalModalAI.toLocaleString('id-ID')}</h2>
        </div>
        
        <div className={`p-6 rounded-[2rem] shadow-lg border-2 border-white/10 text-white ${profit >= 0 ? 'bg-emerald-600 shadow-emerald-200' : 'bg-slate-800 shadow-slate-200'}`}>
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Banknote size={16} />
            <p className="text-[10px] font-bold uppercase tracking-wider">Laba Bersih</p>
          </div>
          <h2 className="text-2xl font-black tracking-tighter">Rp {profit.toLocaleString('id-ID')}</h2>
        </div>
      </div>

      {/* 2. AREA FILTER & SEARCH */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Input Pencarian */}
        <div className="flex-1 bg-white p-3 rounded-3xl border border-slate-100 flex items-center px-4 shadow-sm group hover:border-blue-200 transition-colors">
          <Search className="w-4 h-4 text-slate-400 mr-2 group-hover:text-blue-500" />
          <input 
            type="text" 
            placeholder="Cari User, Kode Unik, atau Order ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs font-bold outline-none text-slate-700 w-full py-1"
          />
        </div>

        {/* Filter Tanggal */}
        <div className="bg-white p-3 rounded-3xl border border-slate-100 flex items-center px-4 shadow-sm gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-[10px] font-bold outline-none text-slate-600 uppercase" />
          <span className="text-slate-300 text-[10px]">s/d</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-[10px] font-bold outline-none text-slate-600 uppercase" />
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="ml-2 p-1 text-rose-500 hover:bg-rose-50 rounded-full transition-all">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. TABS PEMISAH */}
      <div className="flex gap-2 p-1.5 bg-slate-100 w-fit rounded-2xl border border-slate-200">
        <button onClick={() => setTab('in')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${tab === 'in' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
           Penjualan Poin (IN)
        </button>
        <button onClick={() => setTab('out')} className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${tab === 'out' ? 'bg-white shadow text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
           Penggunaan (OUT)
        </button>
      </div>

      {/* 4. TABEL DATA */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden text-xs min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 font-bold text-slate-400 text-[9px] uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-6">Order ID</th>
                <th className="px-6 py-6">User / Waktu</th>
                <th className="px-6 py-6">Keterangan</th>
                <th className="px-6 py-6">Nominal</th>
                <th className="px-6 py-6">{tab === 'in' ? 'Status Bayar' : 'Biaya Modal'}</th>
                <th className="px-8 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                 <tr><td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-medium animate-pulse">Memuat data transaksi...</td></tr>
              ) : searchedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-slate-400 font-medium">
                    Tidak ditemukan data yang cocok.
                  </td>
                </tr>
              ) : (
                searchedData.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                    {/* ID & Kode Unik */}
                    <td className="px-8 py-5 font-mono text-[10px] text-slate-400 font-bold">
                      #{item._id?.slice(-6).toUpperCase()}
                      {item.uniqueCode > 0 && (
                          <span className="block text-blue-600 bg-blue-50 w-fit px-1 rounded mt-1">Kode: {item.uniqueCode}</span>
                      )}
                    </td>

                    {/* User Info */}
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-800 uppercase text-[11px]">{item.userId?.name || 'User Terhapus'}</p>
                      <p className="text-[9px] text-slate-400 font-medium mt-0.5">{item.userId?.email}</p>
                      <p className="text-[9px] text-slate-300 font-medium mt-0.5">{new Date(item.createdAt).toLocaleString('id-ID')}</p>
                    </td>

                    {/* Deskripsi */}
                    <td className="px-6 py-5 font-medium text-slate-500 text-[11px]">
                      {item.description}
                      {item.packageName && <span className="block text-[9px] text-blue-400 font-bold uppercase">{item.packageName}</span>}
                    </td>

                    {/* Jumlah Poin */}
                    <td className="px-6 py-5">
                      <span className={`font-black text-xs px-2 py-1 rounded-lg ${tab === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                        {tab === 'in' ? '+' : '-'}{item.amount?.toLocaleString('id-ID')}
                      </span>
                    </td>

                    {/* Status / Modal */}
                    <td className="px-6 py-5 font-bold text-slate-700">
                      {tab === 'in' ? (
                        <div className="space-y-1">
                             <span className="text-blue-700 font-black text-xs">Rp {(item.price || item.totalPrice || 0).toLocaleString('id-ID')}</span>
                             <div className={`text-[9px] font-bold uppercase tracking-wider w-fit px-1.5 py-0.5 rounded flex items-center gap-1
                                ${item.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 
                                  item.status === 'failed' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                {item.status === 'success' && <CheckCircle size={10}/>}
                                {item.status}
                             </div>
                        </div>
                      ) : (
                        <div className="text-rose-600">
                          <p className="font-black text-xs">Rp {(item.actualCost || 0).toLocaleString('id-ID')}</p>
                          <p className="text-[9px] text-slate-400 font-normal">API Cost</p>
                        </div>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="px-8 py-5 text-right flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {tab === 'in' && item.status === 'pending' && (
                        <>
                            <button onClick={() => handleUpdateStatus(item._id, 'success')} title="Setujui (Approve)" className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"><CheckCircle className="w-4 h-4" /></button>
                            <button onClick={() => handleUpdateStatus(item._id, 'failed')} title="Tolak (Reject)" className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><X className="w-4 h-4" /></button>
                        </>
                      )}
                      <button onClick={() => handleDelete(item._id)} title="Hapus Permanen" className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}