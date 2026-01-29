import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // --- SISTEM POIN JITU DIGITAL ---
  credits: { 
    type: Number, 
    default: 500, // Bonus pendaftaran otomatis
    min: 0 // Menjaga agar saldo tidak minus
  },

  // --- STATUS PREMIUM (FREEMIUM LOGIC) ---
  // False = User Baru (Hanya bisa akses Riset Produk)
  // True = User Top Up (Bisa akses semua tools)
  isPremium: { 
    type: Boolean, 
    default: false 
  },
  // ---------------------------------------

  // --- PASSWORD RESET ---
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  createdAt: { type: Date, default: Date.now },
});

// PENTING: Gunakan 'user' (huruf kecil) agar sinkron dengan ref di model Transaction
const User = mongoose.models.user || mongoose.model('user', UserSchema);
export default User;