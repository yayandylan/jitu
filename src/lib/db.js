import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// 1. Validasi URI yang lebih detail
if (!MONGODB_URI) {
  throw new Error('⚠️ ERROR: MONGODB_URI tidak ditemukan di Environment Variables Vercel!');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Tambahkan timeout agar tidak menggantung lama jika koneksi gagal
      connectTimeoutMS: 10000, 
    };

    console.log("⏳ Mencoba menyambungkan ke MongoDB...");
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      // Cek apakah kita terkoneksi ke database yang benar
      const dbName = mongoose.connection.name;
      console.log(`✅ Terkoneksi ke Database: ${dbName}`);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("❌ Gagal menyambung ke MongoDB:", e.message);
    throw e;
  }

  return cached.conn;
}

export default connectDB;