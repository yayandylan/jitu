"use client";
import { useState, useEffect } from 'react';
import { 
    Search, Trash2, Edit, Coins, 
    User, History, ArrowUpRight, ArrowDownLeft, Loader2, X, Star, Users, Save, ShieldAlert, Zap
} from 'lucide-react';

export default function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); 
  
  // State Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null); 
  
  // State Forms
  const [creditForm, setCreditForm] = useState({ amount: 0, type: 'add' });
  const [editForm, setEditForm] = useState({ name: '', role: 'user', isPremium: false });
  const [userHistory, setUserHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      const userData = Array.isArray(data.users) ? data.users : (Array.isArray(data) ? data : []);
      setUsers(userData);
    } catch (error) {
      console.error("Gagal load users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'premium') return matchesSearch && u.isPremium === true;
    if (activeTab === 'free') return matchesSearch && u.isPremium !== true;
    return matchesSearch;
  });

  const counts = {
    all: users.length,
    premium: users.filter(u => u.isPremium).length,
    free: users.filter(u => !u.isPremium).length
  };

  // --- ACTIONS ---
  const handleDeleteUser = async (id, name) => {
    if (!confirm(`⚠️ Hapus permanen member "${name}"? Seluruh history dan poin akan hilang.`)) return;
    try {
        const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
        if(res.ok) { alert("User berhasil dihapus"); fetchUsers(); }
    } catch(err) { alert("Gagal hapus user"); }
  };

  const openEditModal = (user) => { 
    setSelectedUser(user); 
    setEditForm({ name: user.name, role: user.role || 'user', isPremium: user.isPremium || false }); 
    setModalType('edit'); 
  };

  const handleUpdateUser = async () => {
    try {
        const res = await fetch('/api/admin/users', {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                id: selectedUser._id, 
                role: editForm.role, 
                isPremium: editForm.isPremium,
                name: editForm.name 
            })
        });
        if(res.ok) { setModalType(null); alert("Data diperbarui!"); fetchUsers(); }
    } catch(err) { alert("Gagal update user"); }
  };

  const openCreditModal = (user) => { setSelectedUser(user); setCreditForm({ amount: 0, type: 'add' }); setModalType('credit'); };
  const handleUpdateCredit = async () => {
    const amount = creditForm.type === 'add' ? Number(creditForm.amount) : -Number(creditForm.amount);
    try {
        const res = await fetch('/api/admin/users', {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId: selectedUser._id, action: 'adjust_credit', amount })
        });
        if(res.ok) { setModalType(null); fetchUsers(); }
    } catch(err) { console.error(err); }
  };

  const openHistoryModal = async (user) => {
    setSelectedUser(user); 
    setModalType('history'); 
    setLoadingHistory(true);
    try {
        const res = await fetch(`/api/admin/users/history?userId=${user._id}`);
        const data = await res.json();
        setUserHistory(data || []);
    } catch (err) { alert("Gagal ambil history"); } finally { setLoadingHistory(false); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 mt-8 antialiased">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">Manage <span className="text-blue-600 font-black">Users</span></h1>
            <p className="text-slate-400 text-[10px] font-normal uppercase tracking-widest mt-1">Otoritas Poin & Akses Member Jitu Digital</p>
        </div>
        <div className="relative w-full md:w-80">
            <input 
                type="text" 
                placeholder="Cari nama atau email..." 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/40 focus:outline-none focus:ring-2 focus:ring-blue-500/10 text-xs font-normal"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
        </div>
      </div>

      {/* 2. TAB FILTER */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/50">
        <button onClick={() => setActiveTab('all')} className={`px-6 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
          Semua <span className="ml-1 opacity-40 font-normal">{counts.all}</span>
        </button>
        <button onClick={() => setActiveTab('premium')} className={`px-6 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${activeTab === 'premium' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400'}`}>
          <Star size={10} className={activeTab === 'premium' ? 'fill-yellow-300 text-yellow-300' : ''} />
          Premium <span className="ml-0.5 opacity-60 font-normal">{counts.premium}</span>
        </button>
        <button onClick={() => setActiveTab('free')} className={`px-6 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === 'free' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
          Free <span className="ml-1 opacity-40 font-normal">{counts.free}</span>
        </button>
      </div>

      {/* 3. TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-50 text-slate-400 uppercase text-[9px] font-bold tracking-[0.2em]">
                    <tr>
                        <th className="px-8 py-6">Member</th>
                        <th className="px-8 py-6">Status & Role</th>
                        <th className="px-8 py-6">Saldo Poin</th>
                        <th className="px-8 py-6">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-[13px]">
                    {loading ? (
                        <tr><td colSpan="4" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32}/></td></tr>
                    ) : filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-50/50 transition-all group">
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                        <Zap size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-semibold text-slate-800 leading-tight">{user.name}</div>
                                        <div className="text-[10px] text-slate-400 font-normal mt-1">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${user.isPremium ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-50 text-slate-400'}`}>
                                        {user.isPremium ? 'PREMIUM' : 'FREE'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${user.role === 'admin' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {user.role}
                                    </span>
                                </div>
                            </td>
                            <td className="px-8 py-5">
                                <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg">
                                    {user.credits?.toLocaleString() || 0}
                                </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openCreditModal(user)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><Coins size={16} /></button>
                                    <button onClick={() => openEditModal(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={16} /></button>
                                    <button onClick={() => openHistoryModal(user)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"><History size={16} /></button>
                                    <button onClick={() => handleDeleteUser(user._id, user.name)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* --- MODAL EDIT --- */}
      {modalType === 'edit' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-3xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-black text-xl text-slate-900 uppercase italic">Edit Member</h3>
                    <button onClick={() => setModalType(null)} className="text-slate-300 hover:text-slate-500"><X size={20}/></button>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest block mb-2">Nama</label>
                        <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold outline-none focus:border-blue-500" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest block mb-2">Role Akses</label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold outline-none" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                            <option value="user">USER (Standard)</option>
                            <option value="admin">ADMIN (Full Access)</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Premium Status</span>
                        <button onClick={() => setEditForm({...editForm, isPremium: !editForm.isPremium})} className={`w-12 h-6 rounded-full transition-all relative ${editForm.isPremium ? 'bg-blue-600' : 'bg-slate-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editForm.isPremium ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                    <button onClick={handleUpdateUser} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl">Simpan Perubahan</button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL HISTORY (FIXED MINUS LOGIC) --- */}
      {modalType === 'history' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-3xl flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h3 className="font-black text-xl text-slate-900 uppercase italic">Usage History</h3>
                        <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mt-1">{selectedUser?.name}</p>
                    </div>
                    <button onClick={() => setModalType(null)} className="text-slate-300 hover:text-slate-500"><X size={20}/></button>
                </div>
                <div className="overflow-y-auto flex-1 pr-2 space-y-3 custom-scrollbar">
                    {loadingHistory ? (
                        <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>
                    ) : userHistory.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 text-xs font-normal">Belum ada riwayat transaksi poin.</div>
                    ) : userHistory.map((h, i) => {
                        const isExpense = h.type === 'reduce' || h.type === 'out';
                        return (
                          <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-100 transition-all">
                              <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${isExpense ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                      {isExpense ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}
                                  </div>
                                  <div>
                                      <p className="text-xs font-bold text-slate-700">{h.description || 'Transaksi Poin'}</p>
                                      <p className="text-[9px] font-normal text-slate-400 mt-0.5">{new Date(h.createdAt).toLocaleString('id-ID')}</p>
                                  </div>
                              </div>
                              <span className={`text-xs font-bold font-mono ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>
                                  {isExpense ? '-' : '+'}{h.amount?.toLocaleString()}
                              </span>
                          </div>
                        )
                    })}
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL CREDIT --- */}
      {modalType === 'credit' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-3xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-black text-xl text-slate-900 uppercase italic">Adjust Points</h3>
                    <button onClick={() => setModalType(null)} className="text-slate-300 hover:text-slate-500"><X size={20}/></button>
                </div>
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                        <button onClick={() => setCreditForm({...creditForm, type: 'add'})} className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${creditForm.type === 'add' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>+ Tambah</button>
                        <button onClick={() => setCreditForm({...creditForm, type: 'reduce'})} className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${creditForm.type === 'reduce' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>- Kurangi</button>
                    </div>
                    <div>
                        <label className="text-[10px] font-normal text-slate-400 uppercase tracking-widest block mb-2 px-1">Jumlah Poin</label>
                        <input type="number" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-2xl text-center outline-none focus:border-blue-500" value={creditForm.amount} onChange={(e) => setCreditForm({...creditForm, amount: e.target.value})} />
                    </div>
                    <button onClick={handleUpdateCredit} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all">Konfirmasi Poin</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}