import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: String,
  price: Number,
  image: String,
  qty: Number,
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    orderStatus: {
      type: String,
      enum: ["Placed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned", "Pending"],
      default: "Pending",
    },
    paymentMethod: String,
    paymentStatus: String,
    totalAmount: Number,
    deliveredAt: Date,
    trackingInfo: String,
    name: String,
    mobile: String,
    address: String,
    instructions: String,
    returnReason: String,
    returnStatus: String, // "Requested", "Pickup Scheduled", etc.
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
