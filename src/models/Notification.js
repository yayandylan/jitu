import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  // --- TARGET AUDIENCE ---
  target: { 
    type: String, 
    enum: ['all', 'user'], // 'all' = Broadcast, 'user' = Personal
    required: true,
    default: 'all' 
  },
  
  // --- SEGMENTASI (Khusus Broadcast) ---
  targetGroup: { 
    type: String, 
    enum: ['all', 'free', 'premium'], 
    default: 'all' 
  },

  // --- TARGET PERSONAL ---
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Pastikan Referensi Huruf Besar (User.js)
    default: null 
  },

  // --- RELASI TRANSAKSI ---
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction', // Pastikan Referensi Huruf Besar (Transaction.js)
    default: null 
  },

  // --- KONTEN ---
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: null }, 
  
  // Kategori (Menentukan Icon di UI)
  category: {
    type: String,
    enum: ['billing', 'academy', 'promo', 'system', 'security'],
    default: 'system'
  },

  // Tipe Styling (Menentukan Warna Background/Border)
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'danger'], 
    default: 'info' 
  },
  
  // --- STATUS ---
  isRead: { type: Boolean, default: false }, 
  
  // Tanggal Kadaluarsa (Auto Delete)
  expiresAt: { type: Date, default: null },

}, { 
  timestamps: true // Otomatis handle createdAt & updatedAt
});

// INDEXING PERFORMANCE
// 1. Agar load notifikasi user cepat
NotificationSchema.index({ userId: 1, createdAt: -1 });

// 2. TTL INDEX: Otomatis hapus dokumen jika expiresAt sudah lewat (Housekeeping)
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);