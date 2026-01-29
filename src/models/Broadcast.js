import mongoose from 'mongoose';

const BroadcastSchema = new mongoose.Schema({
  title: String,
  message: String,
  type: String, // info, warning, success
  targetGroup: { type: String, default: 'all' }, // all, premium, free
  sentToCount: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Broadcast || mongoose.model('Broadcast', BroadcastSchema);