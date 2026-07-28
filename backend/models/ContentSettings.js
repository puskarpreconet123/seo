const mongoose = require("mongoose");

const ContentSettingsSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    company: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    wordCountLimit: { type: Number, default: 1000 },
    targetKeywords: { type: [String], default: [] },
    preferredTone: { type: String, default: "Authoritative" },
    dailyQuota: { type: Number, default: 10 },
    autoFillRemaining: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ContentSettings || mongoose.model("ContentSettings", ContentSettingsSchema);
