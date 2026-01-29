import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  // --- TARGET AUDIENCE ---
  target: { 
    type: String, 
    enum: ['all', 'user'], // 'all' untuk Broadcast, 'user' untuk Notif Personal
    default: 'all' 
  },
  
  // --- SEGMENTASI AUDIENS ---
  targetGroup: { 
    type: String, 
    enum: ['all', 'free', 'premium'], 
    default: 'all' 
  },

  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null // Diisi jika target = 'user'
  },

  // --- KONEKSI FITUR (TAMBAHAN PENTING) ---
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null // Berguna untuk notif "Top Up Berhasil"
  },

  // --- KONTEN ---
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: null }, 
  
  // Kategori untuk membedakan ikon di UI (Academy, Billing, System, Promo)
  category: {
    type: String,
    enum: ['billing', 'academy', 'promo', 'system'],
    default: 'system'
  },

  // --- TAMPILAN ---
  type: { 
    type: String, 
    enum: ['info', 'success', 'warning', 'danger'], 
    default: 'info' 
  },
  
  // --- STATUS & LIVE TIME ---
  isRead: { type: Boolean, default: false }, 
  
  // Masa berlaku notifikasi (Misal: Notif promo hangus dalam 3 hari)
  expiresAt: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now }
});

// Indexing agar pencarian notifikasi per user lebih cepat
NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);