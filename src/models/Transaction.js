import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  // Relasi ke user (pastikan 'user' kecil sesuai model user.js)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  
  // Jumlah poin (Topup = positif, AI = pengeluaran)
  amount: { type: Number, required: true },
  
  // Tipe transaksi: 'in' untuk isi saldo, 'out' untuk penggunaan AI
  type: { type: String, enum: ['in', 'out'], required: true },
  
  description: { type: String, required: true },
  
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed', 'completed'], 
    default: 'pending' 
  },

  // Metadata tambahan untuk fitur AI
  result: { type: String }, 
  toolSlug: { type: String },

  // --- DATA KEUANGAN ---
  totalPrice: { type: Number },     // Harga jual ke user (untuk topup)
  pricePerPoint: { type: Number },  // Rate poin saat transaksi terjadi
  
  // BARU: Biaya modal asli dari OpenRouter (dalam Rupiah)
  actualCost: { type: Number, default: 0 }, 

  createdAt: { type: Date, default: Date.now }
});

// Pendaftaran model dengan nama 'transaction' (huruf kecil)
export default mongoose.models.transaction || mongoose.model('transaction', TransactionSchema);