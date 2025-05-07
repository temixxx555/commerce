import mongoose from "mongoose";

const detailsSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "user" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  number: { type: String, required: true },
});

const Detail =
  mongoose.models.contact || mongoose.model("contact", detailsSchema);

export default Detail;
