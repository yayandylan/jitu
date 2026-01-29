import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  // KUNCI UTAMA: Menyimpan ID user agar riwayat tidak tertukar
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'user', 
    required: true 
  },
  // Untuk membedakan ini history dari tool mana (Riset, Copywriting, dll)
  toolType: { 
    type: String, 
    required: true 
  },
  // Judul untuk ditampilkan di sidebar (misal: Nama Produk)
  title: { 
    type: String, 
    default: "Hasil Generate" 
  },
  // Data yang diinput user (disimpan dalam bentuk Object agar fleksibel)
  inputData: { 
    type: Object, 
    required: true 
  },
  // Hasil generate dari AI (bisa String atau Object)
  resultData: { 
    type: Object, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pencegahan error "OverwriteModelError" di Next.js (Hot Reload)
const History = mongoose.models.history || mongoose.model('history', HistorySchema);

export default History;