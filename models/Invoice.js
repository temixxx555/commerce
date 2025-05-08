import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true },
  sessionId: { type: String, required: true },
  userId: { type: String, required: true, ref: "user" },
  amount: { type: Number, required: true },
  status: { type: String, required: true },
  created: { type: Number, required: true },
  invoiceUrl: { type: String, required: true }, // Store hosted_invoice_url
});

const Invoice = mongoose.models.invoice || mongoose.model("invoice", invoiceSchema);
export default Invoice;