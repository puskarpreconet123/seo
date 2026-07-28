const mongoose = require("mongoose");

const ContentStatsSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true, unique: true, index: true },
    totalGeneratedCount: { type: Number, default: 0 },
    totalSubmittedCount: { type: Number, default: 0 },
    totalWipedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ContentStats || mongoose.model("ContentStats", ContentStatsSchema);
