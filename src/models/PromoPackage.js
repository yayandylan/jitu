import mongoose from 'mongoose';

const PromoPackageSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Contoh: Starter Pack
  basePoints: { type: Number, required: true }, // 1000
  bonusPoints: { type: Number, default: 0 }, // 100
  price: { type: Number, required: true }, // 25000
  
  // UI Decorators (Opsional)
  isPopular: { type: Boolean, default: false },
  icon: { type: String, default: 'Zap' }, 
  
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 } // Untuk urutan tampil di UI
}, { timestamps: true });

export default mongoose.models.PromoPackage || mongoose.model('PromoPackage', PromoPackageSchema);