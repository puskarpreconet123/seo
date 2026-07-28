const mongoose = require("mongoose");

const AutoContentSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true, index: true },
    title: { type: String, required: true },
    summary: { type: String, default: "" },
    body: { type: String, required: true },
    keywords: { type: String, default: "" },
    website: { type: String, default: "" },
    company: { type: String, default: "PRECONET Technology" },
    email: { type: String, default: "info@preconetindia.com" },
    phone: { type: String, default: "+919876543210" },
    address: { type: String, default: "Kolkata, India" },
    channels: {
      type: [String],
      default: ["micro_blogging", "articles", "press_releases", "social_booking", "rss_feeds", "guest_blogs"],
    },
    status: {
      type: String,
      enum: ["scheduled", "submitted", "failed"],
      default: "scheduled",
      index: true,
    },
    scheduledForSubmissionAt: { type: Date, required: true, index: true },
    submittedAt: { type: Date },
    backlinkJobId: { type: String, default: "" },
    submissionError: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.AutoContent || mongoose.model("AutoContent", AutoContentSchema);
