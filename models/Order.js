import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "user" },
  address: { type: String, required: true, ref: "address" },
  items: [
    {
      product: { type: String, required: true, ref: "product" },
      quantity: { type: Number, required: true },
      amount: { type: Number, required: false },
      status: { type: String, default: "Order Placed" },
      date: { type: Number, default: Date.now },
    },
  ],
  sessionId: { type: String, unique: true }, // Added to match webhook usage
});

let Orderd;
try {
  Orderd = mongoose.models.orderd || mongoose.model("orderd", orderSchema);
} catch (err) {
  console.error("Orderd - Model registration error:", err.message);
  Orderd = mongoose.model("orderd", orderSchema);
}
export default Orderd;