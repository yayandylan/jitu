"use client";
import { useState } from 'react';
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // Untuk pesan sukses
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Cek inbox email Anda! Link reset sudah dikirim.');
        setEmail(''); // Kosongkan form
      } else {
        setError(data.message || 'Gagal mengirim permintaan.');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-slate-100 text-slate-900 rounded-xl mb-5">
            <Mail className="w-6 h-6" /> 
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Reset Password</h1>
          <p className="text-sm text-slate-400 font-bold mt-1 tracking-tight">
            Masukkan email yang terdaftar, kami akan kirimkan kuncinya.
          </p>
        </div>

        {/* Notifikasi Sukses */}
        {message && (
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-4 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-[11px] font-bold uppercase tracking-wide">{message}</p>
          </div>
        )}

        {/* Notifikasi Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-[10px] font-black text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                placeholder="email@anda.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Kirim Link Reset
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Tombol Balik ke Login */}
        <div className="text-center pt-2">
          <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-3 h-3" />
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}