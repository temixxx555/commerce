// src/models/ProcessedSession.js
import mongoose from "mongoose";

const ProcessedSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.ProcessedSession ||
  mongoose.model("ProcessedSession", ProcessedSessionSchema);