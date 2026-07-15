const mongoose = require("mongoose");

const KeywordSchema = new mongoose.Schema({
  keyword: String,
  position: Number,
  volume: Number,
  trafficPercent: Number,
  kd: Number,
  intent: String,
});

const TrafficTrendSchema = new mongoose.Schema({
  month: String,
  organic: Number,
  paid: Number,
});

const AuditIssueSchema = new mongoose.Schema({
  type: { type: String, enum: ["error", "warning", "notice"] },
  message: String,
});

const SEORecordSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    authorityScore: { type: Number, default: 0 },
    organicTraffic: { type: Number, default: 0 },
    organicTrafficGrowth: { type: Number, default: 0 },
    paidTraffic: { type: Number, default: 0 },
    paidTrafficGrowth: { type: Number, default: 0 },
    backlinks: { type: Number, default: 0 },
    backlinksGrowth: { type: Number, default: 0 },
    referringDomains: { type: Number, default: 0 },
    organicKeywords: { type: Number, default: 0 },
    organicKeywordsDistribution: {
      top3: { type: Number, default: 0 },
      top10: { type: Number, default: 0 },
      top20: { type: Number, default: 0 },
      top50: { type: Number, default: 0 },
      top100: { type: Number, default: 0 },
    },
    trafficTrend: [TrafficTrendSchema],
    topKeywords: [KeywordSchema],
    technicalAudit: {
      healthScore: { type: Number, default: 100 },
      errors: { type: Number, default: 0 },
      warnings: { type: Number, default: 0 },
      notices: { type: Number, default: 0 },
      topIssues: [AuditIssueSchema],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SEORecord", SEORecordSchema);
