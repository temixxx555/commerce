import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  address: { type: String, required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
      amount: { type: Number, required: true },
      status: { type: String, default: "Order Placed" },
      date: { type: Date, default: Date.now },
    },
  ],
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: "Pending" },
  invoiceId: { type: String }, // Add invoiceId field
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);