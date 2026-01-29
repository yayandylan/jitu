import mongoose from 'mongoose';

const ToolConfigSchema = new mongoose.Schema({
  // --- IDENTITAS ---
  slug: { 
    type: String, 
    required: true, 
    unique: true,
    index: true,
    lowercase: true, // Otomatis jadi huruf kecil (cegah: 'Riset' & 'riset' dianggap beda)
    trim: true       // Hapus spasi tak sengaja di depan/belakang
  },
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { type: String },
  
  // --- UI CONFIGURATION ---
  icon: { type: String }, 
  badge: { type: String, default: null }, 
  category: { 
    type: String, 
    default: 'TOOLS UTAMA',
    uppercase: true // Konsisten: 'TOOLS UTAMA', bukan 'Tools Utama'
  },

  // --- BUSINESS LOGIC ---
  creditCost: { 
    type: Number, 
    required: true, 
    default: 50,
    min: [0, 'Harga poin tidak boleh minus!'] // Proteksi dasar
  },
  aiModel: { 
    type: String, 
    required: true, 
    default: 'openai/gpt-4o-mini' 
  },
  
  // --- ANALYTICS (Snapshot HPP) ---
  costPerToken: { 
    type: Number, 
    default: 0 
  }, 
  
  isActive: { 
    type: Boolean, 
    default: true 
  },
}, 
{ 
  // OTOMATIS membuat createdAt & updatedAt tanpa perlu middleware manual
  timestamps: true 
});

// Pencegahan error "OverwriteModelError" saat Hot Reload di Next.js
export default mongoose.models.ToolConfig || mongoose.model('ToolConfig', ToolConfigSchema);