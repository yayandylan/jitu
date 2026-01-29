import mongoose from 'mongoose';

const GlobalSettingSchema = new mongoose.Schema({
  // ID Statis: Agar cuma ada 1 dokumen setting di database
  _id: { type: String, default: 'config_utama' },
  
  pricePerPoint: {
    type: Number,
    required: true,
    default: 100 // Harga Default jika belum disetting
  },
  
  minimumTopup: {
    type: Number,
    default: 10000 
  },

  maintenanceMode: {
    type: Boolean,
    default: false
  }
}, { timestamps: true }); // Otomatis buat createdAt & updatedAt

// Prevent Overwrite Model
export default mongoose.models.GlobalSetting || mongoose.model('GlobalSetting', GlobalSettingSchema);