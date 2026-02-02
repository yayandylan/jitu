import mongoose from "mongoose";

const PostHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: String, required: true },
  headline: String,
  caption: String,
  imageUrl: String,
  theme: String, // Label merah (misal: UPDATE TERKINI)
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.PostHistory || mongoose.model("PostHistory", PostHistorySchema);