// src/models/Order.js
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  address: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, // Match Product model name
      quantity: { type: Number, required: true },
      amount: { type: Number, required: true },
      status: { type: String, default: "Order Placed" },
      date: { type: Date, default: Date.now },
    },
  ],
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  paymentMethod: { type: String, default: "Card" },
  paymentStatus: { type: String, default: "Paid" },
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema, "orders");