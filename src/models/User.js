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
    lowercase: true // Memastikan email tersimpan huruf kecil semua agar tidak duplikat
  },
  password: { 
    type: String, 
    required: [true, 'Password harus diisi'], 
    select: false // Password tidak akan ikut terpanggil saat kita melakukan query biasa (aman)
  },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  
  // --- SISTEM POIN JITU DIGITAL ---
  credits: { 
    type: Number, 
    default: 500, // Bonus pendaftaran otomatis
    min: 0 
  },

  // --- STATUS PREMIUM (FREEMIUM LOGIC) ---
  isPremium: { 
    type: Boolean, 
    default: false 
  },

  // --- PASSWORD RESET ---
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  createdAt: { 
    type: Date, 
    default: Date.now 
  },
}, { 
  // PENTING: Mengunci nama koleksi agar tetap 'users' (jamak) 
  // Ini mencegah Mongoose membuat tabel baru bernama 'user' (tunggal) saat redeploy
  collection: 'users' 
});

// Penanganan Error "OverwriteModelError" saat Next.js melakukan Hot Reload
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;

//testing