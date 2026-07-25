const { Router } = require('express');
const {
  checkRobotsAllowance,
  auditSingleUrl,
  compareMetrics,
  generateCompetitorComparisonAi
} = require('../services/competitorAnalyzer.js');

const router = Router();

router.post('/compare', async (req, res) => {
  const { primary_url, competitor_url } = req.body;

  if (!primary_url || !competitor_url) {
    return res.status(400).json({ detail: "Both 'primary_url' and 'competitor_url' are required." });
  }

  console.info(`[CompetitorRouter] Comparing primary: ${primary_url} with competitor: ${competitor_url}`);

  try {
    // 1. Robots.txt allowance check
    const [primaryAllowed, competitorAllowed] = await Promise.all([
      checkRobotsAllowance(primary_url),
      checkRobotsAllowance(competitor_url)
    ]);

    if (!primaryAllowed) {
      return res.status(403).json({
        detail: `Scraping restricted by robots.txt rules for primary URL: ${primary_url}`
      });
    }

    if (!competitorAllowed) {
      return res.status(403).json({
        detail: `Scraping restricted by robots.txt rules for competitor URL: ${competitor_url}`
      });
    }

    // 2. Concurrently execute audits for both URLs
    console.info(`[CompetitorRouter] Running concurrent audits...`);
    const [primaryResult, competitorResult] = await Promise.all([
      auditSingleUrl(primary_url),
      auditSingleUrl(competitor_url)
    ]);

    if (!primaryResult.success) {
      return res.status(400).json({
        detail: `Failed to crawl primary website: ${primaryResult.error_message || 'Unknown error'}`
      });
    }

    if (!competitorResult.success) {
      return res.status(400).json({
        detail: `Failed to crawl competitor website: ${competitorResult.error_message || 'Unknown error'}`
      });
    }

    // 3. Side-by-side comparison calculation
    console.info(`[CompetitorRouter] Calculating comparisons...`);
    const comparisonData = compareMetrics(primaryResult, competitorResult);

    // 4. Generate AI insights
    console.info(`[CompetitorRouter] Fetching AI competition recommendations...`);
    const aiInsights = await generateCompetitorComparisonAi(primaryResult, competitorResult, comparisonData);

    res.json({
      primary_audit: primaryResult,
      competitor_audit: competitorResult,
      comparison_data: comparisonData,
      ai_insights: aiInsights
    });

  } catch (err) {
    console.error(`[CompetitorRouter] Comparison failed:`, err);
    res.status(500).json({ detail: `Failed to compare websites: ${err.message}` });
  }
});

module.exports = router;
