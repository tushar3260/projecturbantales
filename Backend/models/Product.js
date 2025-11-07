import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  images: [String],
  videos: [String],
  stock: { type: Number, required: true },
  delivery: String,
  createdAt: { type: Date, default: Date.now }
});

// SAFE EXPORT! (Prevents overwrite error)
export default mongoose.models.Product || mongoose.model("Product", productSchema);
