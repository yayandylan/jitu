import mongoose from 'mongoose';

const VoucherSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['fixed', 'percent'], default: 'fixed' },
  value: { type: Number, required: true },
  limit: { type: Number, default: 0 }, // 0 berarti unlimited
  used: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Voucher || mongoose.model('Voucher', VoucherSchema);