// src/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "user" }, // Changed ref to "User" (uppercase, assuming User model)
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  image: { type: Array, required: true },
  category: { type: String, required: true },
  date: { type: Number, required: true },
});

export default mongoose.models.Product || mongoose.model("Product", productSchema, "products");