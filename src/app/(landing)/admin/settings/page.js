"use client";

import { useState, useEffect } from 'react';
import { Save, Settings, DollarSign, CreditCard, Loader2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State Form
  const [price, setPrice] = useState(100);
  const [minTopup, setMinTopup] = useState(10000);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) {
        setPrice(data.settings.pricePerPoint);
        setMinTopup(data.settings.minimumTopup || 10000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pricePerPoint: Number(price),
          minimumTopup: Number(minTopup)
        }),
      });
      
      if (res.ok) {
        alert("✅ Harga berhasil diperbarui!");
      } else {
        alert("❌ Gagal update harga.");
      }
    } catch (err) {
      alert("Error server.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
          <p className="text-gray-500 text-sm">Atur harga poin dan konfigurasi pembayaran.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* HARGA PER POIN */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Harga Per 1 Poin (Rupiah)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 font-bold">Rp</span>
                </div>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-10 w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
                  placeholder="100"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Jika diisi 100, maka user bayar Rp 100.000 dapat 1.000 Poin.
              </p>
            </div>

            {/* MINIMAL TOPUP */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Minimal Topup (Rupiah)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={minTopup}
                  onChange={(e) => setMinTopup(e.target.value)}
                  className="pl-10 w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg"
                  placeholder="10000"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Batas minimum user boleh transfer.
              </p>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Simpan Perubahan
                </>
              )}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}