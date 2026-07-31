const mongoose = require("mongoose");

const BrandPreferenceSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true, lowercase: true, index: true },
    brandName: { type: String, required: true },
    competitors: { type: [String], default: [] },
    prompt: { type: String, required: true, lowercase: true, trim: true, index: true },
    results: { type: mongoose.Schema.Types.Mixed, required: true },
    summary: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.BrandPreference || mongoose.model("BrandPreference", BrandPreferenceSchema);
