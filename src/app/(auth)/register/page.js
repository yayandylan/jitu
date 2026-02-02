"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Loader2, ArrowRight, Zap, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  // STATE DATA
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  const [otp, setOtp] = useState(''); // State untuk kode OTP
  const [step, setStep] = useState(1); // 1: Form Register, 2: Input OTP
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();

  // --- STEP 1: KIRIM DATA & REQUEST OTP ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validasi Password
    if (formData.password.length < 8) {
      setError('Password wajib minimal 8 karakter');
      setLoading(false); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan Konfirmasi Password tidak sama!');
      setLoading(false); return;
    }

    try {
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
        setStep(2); // Pindah ke layar OTP
      } else {
        setError(data.message || 'Gagal mendaftar');
      }
    } catch (err) {
      setError('Gangguan koneksi ke server');
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFIKASI OTP ---
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Tampilkan alert sukses atau toast
        alert("✅ Akun Berhasil Diverifikasi! Silakan Login.");
        router.push('/login');
      } else {
        setError(data.message || 'Kode verifikasi salah atau kadaluarsa');
      }
    } catch (err) {
      setError('Gagal memverifikasi kode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 transition-all duration-500">
        
        {/* LOGO HEADER */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-blue-600 text-white rounded-xl mb-5 shadow-lg shadow-blue-200">
            <Zap className="w-8 h-8 fill-white" /> 
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Jitu Digital</h1>
          <p className="text-sm text-slate-400 font-bold mt-1 uppercase tracking-tight">
            {step === 1 ? "Buat Akun Baru" : "Verifikasi Email"}
          </p>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-[10px] font-black text-center uppercase tracking-widest animate-pulse">
            ⚠️ {error}
          </div>
        )}

        {/* --- FORM STEP 1: REGISTER --- */}
        {step === 1 && (
          <form onSubmit={handleRegister} className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
            
            {/* NAMA LENGKAP */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nama Lengkap</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all" placeholder="Contoh: Budi Santoso" />
              </div>
            </div>

            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all" placeholder="nama@email.com" />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input type={showPassword ? "text" : "password"} required minLength={8} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="block w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all" placeholder="Minimal 8 karakter" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Konfirmasi Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input type={showPassword ? "text" : "password"} required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className={`block w-full pl-11 pr-4 py-4 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-rose-300 bg-rose-50 text-rose-900' : 'border-slate-100'}`} placeholder="Ulangi password anda" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 mt-4">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>DAFTAR SEKARANG <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {/* --- FORM STEP 2: INPUT OTP --- */}
        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
                <p className="text-xs text-blue-800 font-medium leading-relaxed">
                    Kode verifikasi (OTP) telah dikirim ke: <br/>
                    <span className="font-black text-blue-900 text-sm">{formData.email}</span>
                </p>
                <p className="text-[10px] text-blue-400 mt-2">Cek Inbox / Spam folder Anda</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Kode OTP (6 Digit)</label>
              <input 
                type="text" 
                required 
                maxLength={6}
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Hanya angka
                className="block w-full text-center py-4 bg-white border-2 border-slate-200 rounded-2xl text-2xl font-black text-slate-900 tracking-[0.5em] focus:outline-none focus:border-blue-600 transition-all placeholder-slate-200" 
                placeholder="000000" 
                autoFocus
              />
            </div>

            <button type="submit" disabled={loading || otp.length < 6} className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 disabled:opacity-50">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>VERIFIKASI AKUN <CheckCircle className="w-4 h-4" /></>}
            </button>

            <button type="button" onClick={() => setStep(1)} className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest mt-4">
                ← Kembali / Ganti Email
            </button>
          </form>
        )}

        {/* LOGIN LINK (Hanya di Step 1) */}
        {step === 1 && (
          <div className="text-center pt-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Sudah punya akun? <Link href="/login" className="text-slate-900 ml-2 hover:underline">Login Disini</Link>
            </p>
          </div>
        )}

      </div>
    </div>
  );
}