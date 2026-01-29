"use client";

import { useState } from 'react';
import { Image as ImageIcon, Loader2, Download, Sparkles, Wallet, Monitor, BookOpen, AppWindow, Grid } from 'lucide-react';

export default function GenerateImagePage() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('square');
  const [productType, setProductType] = useState('ebook'); // Default Ebook
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    setImageUrl('');

    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio, productType }), // Kirim Tipe Produk
      });

      const data = await res.json();
      
      if (res.status === 402) {
        alert("Poin tidak cukup! Topup dulu bosku.");
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.message);
      
      setImageUrl(data.result);

    } catch (err) {
      alert("Gagal: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Pilihan Jenis Produk
  const productTypes = [
    { id: 'ebook', label: 'E-Book / PDF', icon: <BookOpen className="w-4 h-4"/>, desc: 'Tampilan buku 3D / Tablet' },
    { id: 'course', label: 'Kursus Online', icon: <Monitor className="w-4 h-4"/>, desc: 'Tampilan Laptop & Video' },
    { id: 'software', label: 'Software / SaaS', icon: <AppWindow className="w-4 h-4"/>, desc: 'Dashboard UI Futuristik' },
    { id: 'template', label: 'Aset Desain', icon: <Grid className="w-4 h-4"/>, desc: 'Grid Layout Estetik' },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ImageIcon className="w-8 h-8 text-purple-600" />
          Generate Gambar Produk Digital
        </h1>
        <p className="text-gray-500 mt-2">
          Buat mockup 3D realistis untuk E-Book, Kursus, atau Software Anda dalam hitungan detik.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: INPUT */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <form onSubmit={handleGenerate} className="space-y-6">
              
              {/* 1. Pilih Jenis Produk */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Jenis Produk Digital</label>
                <div className="grid grid-cols-1 gap-3">
                  {productTypes.map((type) => (
                    <div 
                      key={type.id}
                      onClick={() => setProductType(type.id)}
                      className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-all ${productType === type.id ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500' : 'hover:bg-gray-50 border-gray-200'}`}
                    >
                      <div className={`p-2 rounded-full ${productType === type.id ? 'bg-purple-200 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                        {type.icon}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${productType === type.id ? 'text-purple-900' : 'text-gray-700'}`}>{type.label}</p>
                        <p className="text-xs text-gray-500">{type.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Prompt */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tentang Produk Anda</label>
                <textarea
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none h-28 text-sm"
                  placeholder={
                    productType === 'ebook' ? "Contoh: Buku panduan diet keto, cover warna hijau segar, ada gambar alpukat." : 
                    productType === 'course' ? "Contoh: Kelas coding website, nuansa teknologi biru gelap, ada kode program di layar." :
                    "Deskripsikan produk Anda..."
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                />
              </div>

              {/* 3. Aspect Ratio */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ukuran Gambar</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setAspectRatio('square')} className={`p-2 border rounded-lg text-xs font-medium ${aspectRatio === 'square' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'hover:bg-gray-50'}`}>Square (1:1)</button>
                  <button type="button" onClick={() => setAspectRatio('portrait')} className={`p-2 border rounded-lg text-xs font-medium ${aspectRatio === 'portrait' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'hover:bg-gray-50'}`}>Story (9:16)</button>
                  <button type="button" onClick={() => setAspectRatio('landscape')} className={`p-2 border rounded-lg text-xs font-medium ${aspectRatio === 'landscape' ? 'bg-purple-100 border-purple-500 text-purple-700' : 'hover:bg-gray-50'}`}>Web (16:9)</button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sedang Merender 3D...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Mockup
                    <span className="bg-purple-800 text-xs py-0.5 px-2 rounded-full text-purple-100 ml-1 flex items-center gap-1">
                      <Wallet className="w-3 h-3"/> -100
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: HASIL GAMBAR */}
        <div className="lg:col-span-2">
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 min-h-[600px] flex items-center justify-center bg-checkered">
            {loading ? (
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">AI Sedang Membuat Mockup...</h3>
                <p className="text-gray-500 text-sm">Menambahkan efek lighting studio & 3D render.</p>
              </div>
            ) : imageUrl ? (
              <div className="relative group w-full h-full flex flex-col items-center">
                <img 
                  src={imageUrl} 
                  alt="Hasil Mockup AI" 
                  className="rounded-lg shadow-2xl max-h-[600px] object-contain"
                />
                
                <div className="mt-6 flex gap-4">
                  <a href={imageUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                    <ImageIcon className="w-5 h-5" />
                    Lihat Full HD
                  </a>
                  <button onClick={() => window.open(imageUrl, '_blank')} className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-700 transition-colors shadow-lg">
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <Monitor className="w-20 h-20 mx-auto mb-4 opacity-20" />
                <p>Pilih jenis produk di kiri untuk memulai.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}