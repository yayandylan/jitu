import mongoose from 'mongoose';

const GlobalSettingSchema = new mongoose.Schema({
  // Kita pakai ID statis biar cuma ada 1 settingan di seluruh aplikasi
  _id: { type: String, default: 'config_utama' },
  
  pricePerPoint: {
    type: Number,
    required: true,
    default: 100 // Default harga awal
  },
  
  minimumTopup: {
    type: Number,
    default: 10000 // Minimal topup Rp 10.000
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Cek biar gak compile ulang modelnya kalau udah ada
export default mongoose.models.GlobalSetting || mongoose.model('GlobalSetting', GlobalSettingSchema);