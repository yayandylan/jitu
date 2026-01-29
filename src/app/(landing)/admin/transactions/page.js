"use client";
import { useState, useEffect } from 'react';
import { 
  RefreshCcw, CheckCircle, Trash2, Wallet, Zap, 
  TrendingUp, Calendar, X, AlertCircle, BarChart3, Banknote, Search
} from 'lucide-react';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('in'); 
  const [searchTerm, setSearchTerm] = useState(''); // State untuk pencarian
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = '/api/admin/transactions';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const res = await fetch(params.toString() ? `${url}?${params.toString()}` : url);
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally { setLoading(false); }
  };

  const handleUpdateStatus = async (id, status) => {
    if (!confirm(`Ubah status ke ${status.toUpperCase()}?`)) return;
    const res = await fetch(`/api/admin/transactions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newStatus: status })
    });
    if (res.ok) fetchTransactions();
  };

  const handleDelete = async (id) => {
    if (!confirm("Hapus transaksi ini secara permanen?")) return;
    const res = await fetch(`/api/admin/transactions/${id}`, { method: 'DELETE' });
    if (res.ok) fetchTransactions();
  };

  useEffect(() => { fetchTransactions(); }, [startDate, endDate]);

  // --- LOGIKA FILTER TAB & SEARCH ---
  const filteredByTab = transactions.filter(t => t.type === tab);
  
  const searchedData = filteredByTab.filter(item => {
    const name = item.userId?.name?.toLowerCase() || '';
    const orderId = item._id?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || orderId.includes(search);
  });

  // --- LOGIKA STATISTIK (Berdasarkan data yang sudah di-filter tanggal) ---
  const totalIncome = transactions
    .filter(t => t.type === 'in' && (t.status === 'success' || t.status === 'SUCCESS'))
    .reduce((sum, t) => sum + (t.totalPrice || 0), 0);

  const totalAISpentPoints = transactions
    .filter(t => t.type === 'out')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalModalAI = transactions
    .filter(t => t.type === 'out')
    .reduce((sum, t) => sum + (t.actualCost || 0), 0);

  const profit = totalIncome - totalModalAI;

  return (
    <div className="space-y-6 pb-10">
      {/* 1. KARTU STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-600 p-5 rounded-[2rem] text-white shadow-lg">
          <p className="text-[10px] font-bold opacity-70 uppercase mb-1 tracking-wider">Omzet Topup</p>
          <h2 className="text-xl font-black">Rp {totalIncome.toLocaleString('id-ID')}</h2>
        </div>
        <div className="bg-orange-500 p-5 rounded-[2rem] text-white shadow-lg">
          <p className="text-[10px] font-bold opacity-70 uppercase mb-1 tracking-wider">Poin Terpakai</p>
          <h2 className="text-xl font-black">{totalAISpentPoints.toLocaleString('id-ID')} Poin</h2>
        </div>
        <div className="bg-rose-600 p-5 rounded-[2rem] text-white shadow-lg">
          <p className="text-[10px] font-bold opacity-70 uppercase mb-1 tracking-wider">Modal API (Riil)</p>
          <h2 className="text-xl font-black">Rp {totalModalAI.toLocaleString('id-ID')}</h2>
        </div>
        <div className={`p-5 rounded-[2rem] shadow-lg border-2 border-white/10 text-white ${profit >= 0 ? 'bg-emerald-600' : 'bg-red-800'}`}>
          <p className="text-[10px] font-bold opacity-70 uppercase mb-1 tracking-wider">Laba Bersih</p>
          <h2 className="text-xl font-black">Rp {profit.toLocaleString('id-ID')}</h2>
        </div>
      </div>

      {/* 2. AREA FILTER & SEARCH */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Input Pencarian */}
        <div className="flex-1 bg-white p-2 rounded-3xl border border-gray-100 flex items-center px-4 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Cari Nama User atau Order ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs font-bold outline-none text-gray-700 w-full py-2"
          />
        </div>

        {/* Filter Tanggal */}
        <div className="bg-white p-2 rounded-3xl border border-gray-100 flex items-center px-4 shadow-sm gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-transparent text-xs font-bold outline-none text-gray-700" />
          <span className="text-gray-300">sampai</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-transparent text-xs font-bold outline-none text-gray-700" />
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate(''); }} className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded-full">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. TABS PEMISAH */}
      <div className="flex gap-2 p-1 bg-gray-100 w-fit rounded-2xl">
        <button onClick={() => setTab('in')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${tab === 'in' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
          <Banknote className="inline w-4 h-4 mr-2" /> Penjualan Poin
        </button>
        <button onClick={() => setTab('out')} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${tab === 'out' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>
          <BarChart3 className="inline w-4 h-4 mr-2" /> Penggunaan & Modal
        </button>
      </div>

      {/* 4. TABEL DATA */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100 font-black text-gray-400 text-[10px] uppercase tracking-widest">
              <tr>
                <th className="px-6 py-5">Order ID</th>
                <th className="px-6 py-5">User / Waktu</th>
                <th className="px-6 py-4">Keterangan</th>
                <th className="px-6 py-5">Poin</th>
                <th className="px-6 py-5">{tab === 'in' ? 'Harga Jual' : 'Modal Riil'}</th>
                <th className="px-6 py-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {searchedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-gray-400 font-medium">
                    Tidak ditemukan transaksi yang cocok dengan "{searchTerm}"
                  </td>
                </tr>
              ) : (
                searchedData.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] text-gray-400">
                      #{item._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800 uppercase">{item.userId?.name || 'User'}</p>
                      <p className="text-[10px] text-gray-400">{new Date(item.createdAt).toLocaleString('id-ID')}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-600 uppercase">
                      {item.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-black ${tab === 'in' ? 'text-green-600' : 'text-orange-600'}`}>
                        {tab === 'in' ? '+' : '-'}{item.amount?.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">
                      {tab === 'in' ? (
                        <span className="text-blue-700 font-black">Rp {(item.totalPrice || 0).toLocaleString('id-ID')}</span>
                      ) : (
                        <div className="text-rose-600">
                          <p className="font-black text-xs">Rp {(item.actualCost || 0).toLocaleString('id-ID')}</p>
                          <p className="text-[9px] text-gray-400 font-normal">API Cost</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {item.status?.toLowerCase() === 'pending' && (
                        <button onClick={() => handleUpdateStatus(item._id, 'success')} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all"><CheckCircle className="w-4 h-4" /></button>
                      )}
                      <button onClick={() => handleDelete(item._id)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
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