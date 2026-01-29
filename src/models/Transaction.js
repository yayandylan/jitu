import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  // 1. RELASI USER (Wajib Huruf Besar 'User' agar connect ke User.js)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  
  // 2. TIPE & JUMLAH POIN
  type: { 
    type: String, 
    enum: ['in', 'out'], // 'in' = Topup, 'out' = Pakai Tool
    required: true 
  },
  amount: { type: Number, required: true }, // Jumlah Poin (+/-)
  
  // 3. STATUS & INFO
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed'], 
    default: 'pending' 
  },
  description: { type: String, required: true },

  // --- FIELD KHUSUS TOP UP (Money In) ---
  price: { type: Number },        // Total Rupiah yang harus dibayar (termasuk kode unik)
  uniqueCode: { type: Number },   // 3 digit kode unik (misal: 123)
  packageName: { type: String },  // Nama Paket (misal: Starter Pack)
  voucherCode: { type: String },  // Kode voucher jika pakai

  // --- FIELD KHUSUS AI USAGE (Money Out) ---
  toolSlug: { type: String },     // Slug tool yang dipakai (misal: magic-ad-script)
  actualCost: { type: Number, default: 0 }, // HPP Real (Modal API OpenRouter dalam Rupiah)
  result: { type: String },       // (Opsional) Ringkasan hasil generate

}, { 
  timestamps: true // Otomatis handle createdAt & updatedAt
});

// FIX: Gunakan 'Transaction' (Huruf Besar) agar konsisten
export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);