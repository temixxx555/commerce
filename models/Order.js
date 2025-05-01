import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "user" },
  address: { type: String, required: true, ref: "address" }, // Address at top level
  items: [
    {
      product: { type: String, required: true, ref: "product" },
      quantity: { type: Number, required: true },
      amount: { type: Number, required: false }, // Optional, calculated in backend
      status: { type: String, default: "Order Placed" },
      date: { type: Number, default: Date.now },
    },
  ],
});

const Orderd = mongoose.models.orderd || mongoose.model("orderd", orderSchema);
export default Orderd;