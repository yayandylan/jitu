import mongoose from 'mongoose';

const PromoPackageSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Contoh: Pro Advertiser
  basePoints: { type: Number, required: true }, // 5000
  bonusPoints: { type: Number, default: 0 }, // 1000
  price: { type: Number, required: true }, // 125000
  icon: { type: String, default: 'Zap' }, // Nama icon Lucide
  color: { type: String, default: 'bg-blue-50 text-blue-600' }, 
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 } // Untuk urutan tampil
}, { timestamps: true });

export default mongoose.models.PromoPackage || mongoose.model('PromoPackage', PromoPackageSchema);