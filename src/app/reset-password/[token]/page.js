"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage({ params }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  // Ambil token dari URL
  const { token } = params;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Password tidak sama');
      setLoading(false);
      return;
    }

    try {
      // Kirim password baru + token ke API
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Redirect ke login setelah 3 detik
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(data.message || 'Gagal mereset password');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-3xl shadow-sm text-center max-w-md w-full">
          <div className="inline-flex p-3 bg-emerald-100 text-emerald-600 rounded-full mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Password Berhasil Diubah!</h2>
          <p className="text-slate-500 text-sm">Anda akan dialihkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Buat Password Baru</h1>
          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">Amankan akun Anda sekarang</p>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-[10px] font-black text-center uppercase">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password Baru */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Baru</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900"
                placeholder="Minimal 6 karakter"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ulangi Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900"
              placeholder="Ketik ulang password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Simpan Password Baru'}
          </button>
        </form>
      </div>
    </div>
  );
}