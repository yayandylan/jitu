"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Loader2, ArrowRight, Zap, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  // Tambahkan field 'confirmPassword' di state
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State untuk toggle lihat password
  
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. VALIDASI MINIMAL 8 KARAKTER
    if (formData.password.length < 8) {
      setError('Password wajib minimal 8 karakter');
      setLoading(false);
      return;
    }

    // 2. VALIDASI KECOCOKAN PASSWORD (PENTING)
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan Konfirmasi Password tidak sama!');
      setLoading(false);
      return;
    }

    try {
      // Kirim data ke API (Hanya kirim name, email, password. Confirm tidak perlu dikirim)
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registrasi Berhasil! Silakan Login.");
        router.push('/login');
      } else {
        setError(data.message || 'Gagal mendaftar, silakan coba lagi');
      }
    } catch (err) {
      setError('Gangguan koneksi ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
        
        {/* LOGO */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-blue-600 text-white rounded-xl mb-5 shadow-lg shadow-blue-200">
            <Zap className="w-8 h-8 fill-white" /> 
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Jitu Digital</h1>
          <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-tight">Buat Akun Baru</p>
        </div>

        {/* ALERT ERROR */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-[10px] font-black text-center uppercase tracking-widest animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* FULL NAME */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                placeholder="Contoh: Budi Santoso"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email</label>
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
                placeholder="nama@email.com"
              />
            </div>
          </div>

          {/* PASSWORD UTAMA */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"} // Toggle Tipe Input
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
                placeholder="Minimal 8 karakter"
              />
              {/* TOMBOL LIHAT PASSWORD */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* KONFIRMASI PASSWORD (BARU) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Konfirmasi Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"} // Ikut toggle password utama
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`block w-full pl-11 pr-4 py-4 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword 
                    ? 'border-rose-300 bg-rose-50 text-rose-900' // Merah jika beda
                    : 'border-slate-100'
                }`}
                placeholder="Ulangi password anda"
              />
            </div>
            {/* Pesan kecil realtime jika tidak sama */}
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-[10px] font-bold text-rose-500 ml-1 mt-1">* Password tidak sama</p>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-4"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Daftar Sekarang
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* LOGIN REDIRECT */}
        <div className="text-center pt-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Sudah punya akun? 
            <Link href="/login" className="text-slate-900 ml-2 hover:underline">Login Disini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}