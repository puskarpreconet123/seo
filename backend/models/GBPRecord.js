const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  author: String,
  rating: Number,
  text: String,
  time: String,
  reply: { type: String, default: null },
});

const LocalKeywordSchema = new mongoose.Schema({
  keyword: String,
  rank: Number,
  searchVolume: Number,
});

const ImpressionsHistorySchema = new mongoose.Schema({
  month: String,
  maps: Number,
  search: Number,
});

const GBPRecordSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true, unique: true, lowercase: true, trim: true },
    businessName: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    impressions: {
      total: { type: Number, default: 0 },
      maps: { type: Number, default: 0 },
      search: { type: Number, default: 0 },
      history: [ImpressionsHistorySchema],
    },
    interactions: {
      total: { type: Number, default: 0 },
      calls: { type: Number, default: 0 },
      messages: { type: Number, default: 0 },
      bookings: { type: Number, default: 0 },
      websiteClicks: { type: Number, default: 0 },
    },
    localKeywords: [LocalKeywordSchema],
    recentReviews: [ReviewSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("GBPRecord", GBPRecordSchema);
