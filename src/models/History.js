import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  // KUNCI UTAMA: Relasi ke User
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', // FIX: Huruf Besar 'User' agar sesuai dengan model User.js
    required: true 
  },
  
  // Jenis Tool (slug), misal: 'riset-produk', 'magic-ad-script'
  toolType: { 
    type: String, 
    required: true,
    index: true // Tambahkan index biar query pencarian cepat
  },
  
  // Judul riwayat (opsional, untuk tampilan di sidebar)
  title: { 
    type: String, 
    default: "Hasil Generate" 
  },
  
  // Input User (Disimpan fleksibel bisa string/object)
  inputData: { 
    type: mongoose.Schema.Types.Mixed, // 'Mixed' lebih aman untuk JSON dinamis
    required: true 
  },
  
  // Hasil Output AI
  resultData: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  }
}, { 
  timestamps: true // Otomatis membuat createdAt dan updatedAt
});

// FIX: Gunakan 'History' (Huruf Besar) agar konsisten satu aplikasi
export default mongoose.models.History || mongoose.model('History', HistorySchema);