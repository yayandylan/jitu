"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowRight, Zap } from 'lucide-react'; // Ubah ShieldCheck jadi Zap
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Redirection berdasarkan role (Admin ke /admin, User ke /dashboard)
        const destination = data.user.role === 'admin' ? '/admin' : '/dashboard';
        router.push(destination);
        router.refresh();
      } else {
        setError(data.message || 'Gagal masuk, periksa kembali data Anda');
      }
    } catch (err) {
      setError('Gangguan koneksi ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        
        {/* LOGO & BRANDING (Updated) */}
        <div className="text-center">
          {/* Ubah warna jadi Biru dan ikon jadi Zap (Petir) */}
          <div className="inline-flex p-3 bg-blue-600 text-white rounded-xl mb-5 shadow-lg shadow-blue-200">
            <Zap className="w-8 h-8 fill-white" /> 
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Jitu Digital</h1>
          <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-tight">Access Control Center</p>
        </div>

        {/* ALERT ERROR */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-[10px] font-black text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* EMAIL FIELD */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                placeholder="jitudigital@jitu.com"
              />
            </div>
          </div>

          {/* PASSWORD FIELD */}
          <div className="space-y-2">
            <div className="flex justify-between items-end px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Password</label>
              {/* TOMBOL LUPA PASSWORD */}
              <Link 
                href="/forgot-password" 
                className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
              >
                Lupa?
              </Link>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Login Akses
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* REGISTER REDIRECT */}
        <div className="text-center pt-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Belum punya akun? 
            <Link href="/register" className="text-slate-900 ml-2 hover:underline">Daftar Sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}