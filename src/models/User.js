import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Nama harus diisi'] 
  },
  email: { 
    type: String, 
    required: [true, 'Email harus diisi'], 
    unique: true,
    lowercase: true 
  },
  password: { 
    type: String, 
    required: [true, 'Password harus diisi'], 
    select: false 
  },
  whatsapp: { 
    type: String, 
    default: '-' 
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  
  // --- SISTEM POIN ---
  credits: { 
    type: Number, 
    default: 0, // Default 0 (Bonus 500 diberikan setelah Verifikasi)
    min: 0 
  },

  // --- STATUS PREMIUM ---
  isPremium: { 
    type: Boolean, 
    default: false 
  },

  // --- SISTEM VERIFIKASI (BARU) ---
  isVerified: { 
    type: Boolean, 
    default: false // Default belum aktif
  },
  verificationCode: { 
    type: String // Menyimpan kode OTP 6 digit
  },
  verificationExpires: { 
    type: Date // Waktu kadaluarsa OTP
  },

  // --- PASSWORD RESET ---
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  createdAt: { 
    type: Date, 
    default: Date.now 
  },
}, { 
  collection: 'users' 
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;