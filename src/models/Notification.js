import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  // =================================================
  // 1. TARGET AUDIENCE (Siapa yang terima?)
  // =================================================
  target: { 
    type: String, 
    enum: ['all', 'user'], // 'all' = Broadcast ke semua, 'user' = Spesifik 1 orang
    required: true,
    default: 'user' 
  },
  
  // Jika target='user', field ini WAJIB diisi
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Relasi ke tabel User
    default: null 
  },

  // Jika target='all', field ini menentukan segmen (misal: Info khusus user Premium)
  targetGroup: { 
    type: String, 
    enum: ['all', 'free', 'premium'], 
    default: 'all' 
  },

  // =================================================
  // 2. KONTEN & RELASI
  // =================================================
  title: { 
    type: String, 
    required: [true, 'Judul notifikasi wajib diisi'] 
  },
  
  message: { 
    type: String, 
    required: [true, 'Pesan notifikasi wajib diisi'] 
  },
  
  link: { 
    type: String, 
    default: null 
  }, // Link redirect jika diklik (misal ke /site/billing)

  // Relasi ke Transaksi (Opsional, agar bisa diklik lari ke invoice)
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null 
  },

  // =================================================
  // 3. STYLING & STATUS
  // =================================================
  
  // Menentukan ICON apa yang muncul di UI
  category: {
    type: String,
    enum: ['billing', 'academy', 'promo', 'system', 'security'],
    default: 'system'
  },

  // Menentukan WARNA background/border (Hijau, Merah, Biru, Kuning)
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'danger'], 
    default: 'info' 
  },
  
  isRead: { 
    type: Boolean, 
    default: false 
  }, 
  
  // =================================================
  // 4. HOUSEKEEPING (Auto Delete)
  // =================================================
  // Jika diisi tanggal, notifikasi akan otomatis terhapus dari DB setelah tanggal tersebut
  expiresAt: { type: Date, default: null },

}, { 
  timestamps: true // Otomatis buat field createdAt & updatedAt
});

// --- PERFORMANCE INDEXING ---

// 1. Agar query notifikasi per user cepat (PENTING UNTUK DASHBOARD)
NotificationSchema.index({ userId: 1, createdAt: -1 });

// 2. Agar fitur Auto Delete (TTL) bekerja
// MongoDB akan otomatis menghapus dokumen jika waktu sekarang > expiresAt
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Cek apakah model sudah ada (untuk mencegah overwrite di Next.js)
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

export default Notification;