const mongoose = require("mongoose");

const AiVisibilityAuditSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true, lowercase: true, index: true },
    brandName: { type: String, required: true },
    competitors: { type: [String], default: [] },
    niche: { type: String, required: true, lowercase: true, trim: true, index: true },
    prompts: { type: mongoose.Schema.Types.Mixed, required: true },
    overallScores: { type: mongoose.Schema.Types.Mixed, required: true },
    shareOfVoice: { type: mongoose.Schema.Types.Mixed, required: true },
    modelBreakdown: { type: mongoose.Schema.Types.Mixed, required: true },
    recommendations: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.AiVisibilityAudit || mongoose.model("AiVisibilityAudit", AiVisibilityAuditSchema);
