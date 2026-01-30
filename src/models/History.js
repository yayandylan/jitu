import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  // 1. Relasi ke User (Wajib index agar query per user cepat)
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // Pastikan di User.js exportnya: mongoose.model('User', ...)
    required: true,
    index: true 
  },
  
  // 2. Jenis Tool (Contoh: 'riset-produk', 'analisis-iklan')
  toolType: { 
    type: String, 
    required: true,
    index: true 
  },
  
  // 3. Judul (Untuk tampilan di Sidebar)
  title: { 
    type: String, 
    default: "Tanpa Judul" 
  },
  
  // 4. Input User (Fleksibel: bisa simpan object skill, ide, angka, dll)
  inputData: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  
  // 5. Output AI (Fleksibel: bisa string Markdown atau JSON)
  resultData: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },

  // 6. Fitur Tambahan (Opsional: untuk filter favorit nanti)
  isFavorite: {
    type: Boolean,
    default: false
  }

}, { 
  timestamps: true // Otomatis field: createdAt, updatedAt
});

// PENTING: Cek mongoose.models terlebih dahulu untuk mencegah error "OverwriteModelError"
// saat hot-reload di Next.js (Development Mode)
const History = mongoose.models.History || mongoose.model('History', HistorySchema);

export default History;