const express = require("express");
const router = express.Router();
const SEORecord = require("../models/SEORecord");
const GBPRecord = require("../models/GBPRecord");
const seoScraper = require("../services/seoScraper");
const gbpService = require("../services/gbpService");

/**
 * Helper to generate stable keywords and traffic statistics for any domain
 */
const getSeededSEOMetrics = (domain, seed) => {
  const multiplier = 0.5 + (seed % 10) / 10;
  const formatNumber = (num) => Math.round(num * multiplier);

  return {
    organicTraffic: formatNumber(124500),
    organicTrafficGrowth: Math.round(((seed % 15) - 5) * 10) / 10,
    paidTraffic: formatNumber(12800),
    paidTrafficGrowth: Math.round(((seed % 20) - 10) * 10) / 10,
    backlinks: formatNumber(385000),
    backlinksGrowth: Math.round(((seed % 8) + 1) * 10) / 10,
    referringDomains: formatNumber(8200),
    organicKeywords: formatNumber(18600),
    organicKeywordsDistribution: {
      top3: formatNumber(620),
      top10: formatNumber(2480),
      top20: formatNumber(4120),
      top50: formatNumber(7100),
      top100: formatNumber(4280),
    },
    trafficTrend: [
      { month: "Jan", organic: formatNumber(110000), paid: formatNumber(10500) },
      { month: "Feb", organic: formatNumber(115000), paid: formatNumber(11000) },
      { month: "Mar", organic: formatNumber(112000), paid: formatNumber(10800) },
      { month: "Apr", organic: formatNumber(120000), paid: formatNumber(12000) },
      { month: "May", organic: formatNumber(126000), paid: formatNumber(13100) },
      { month: "Jun", organic: formatNumber(124500), paid: formatNumber(12800) },
    ],
    topKeywords: [
      { keyword: `${domain.split(".")[0]} review`, position: 1, volume: 5400, trafficPercent: 12.4, kd: 18, intent: "Navigational" },
      { keyword: "best digital tools 2026", position: 3, volume: 12000, trafficPercent: 8.2, kd: 45, intent: "Commercial" },
      { keyword: "how to optimize website speed", position: 5, volume: 22000, trafficPercent: 6.5, kd: 68, intent: "Informational" },
      { keyword: "affordable seo agency near me", position: 2, volume: 8500, trafficPercent: 5.8, kd: 39, intent: "Transactional" },
      { keyword: "seo tools checklist", position: 4, volume: 3200, trafficPercent: 4.1, kd: 28, intent: "Informational" },
      { keyword: "google business listing optimization", position: 6, volume: 15000, trafficPercent: 3.9, kd: 52, intent: "Commercial" },
      { keyword: "backlink strategies for local sites", position: 8, volume: 1800, trafficPercent: 2.1, kd: 41, intent: "Informational" },
      { keyword: "what is domain authority", position: 10, volume: 45000, trafficPercent: 1.8, kd: 75, intent: "Informational" },
    ],
  };
};

// GET /api/seo-data?domain=<domain>
router.get("/seo-data", async (req, res) => {
  try {
    const domain = req.query.domain ? req.query.domain.trim().toLowerCase() : "example.com";
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const hashString = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash);
    };
    const seed = hashString(domain);

    let seoRecord = null;
    let gbpRecord = null;

    if (global.useMemoryDb) {
      // Memory DB Lookup
      seoRecord = global.memoryDb.seoRecords.get(domain);
      gbpRecord = global.memoryDb.gbpRecords.get(domain);
    } else {
      // MongoDB Lookup
      seoRecord = await SEORecord.findOne({ domain });
      gbpRecord = await GBPRecord.findOne({ domain });
    }

    const isSeoStale = !seoRecord || seoRecord.updatedAt < oneDayAgo;
    const isGbpStale = !gbpRecord || gbpRecord.updatedAt < oneDayAgo;

    // 2. Fetch/update SEO details if stale
    if (isSeoStale) {
      console.log(`SEO metrics stale/missing for ${domain}. crawling...`);
      const crawlResults = await seoScraper.scrapeDomain(domain);
      const seededMetrics = getSeededSEOMetrics(domain, seed);

      const recordData = {
        domain,
        authorityScore: crawlResults.authorityScore,
        technicalAudit: crawlResults.technicalAudit,
        ...seededMetrics,
        updatedAt: new Date(),
      };

      if (global.useMemoryDb) {
        global.memoryDb.seoRecords.set(domain, recordData);
        seoRecord = recordData;
      } else {
        if (seoRecord) {
          seoRecord = await SEORecord.findOneAndUpdate({ domain }, recordData, { new: true });
        } else {
          seoRecord = new SEORecord(recordData);
          await seoRecord.save();
        }
      }
    }

    // 3. Fetch/update GBP details if stale
    if (isGbpStale) {
      console.log(`GBP details stale/missing for ${domain}. Fetching details...`);
      const profileData = await gbpService.getBusinessProfileData(domain);
      
      const recordData = {
        domain,
        ...profileData,
        updatedAt: new Date(),
      };

      // Preserve replies
      const replyMap = new Map();
      if (gbpRecord) {
        gbpRecord.recentReviews.forEach((r) => {
          if (r.reply) replyMap.set(r.author, r.reply);
        });
      }
      recordData.recentReviews.forEach((r) => {
        if (replyMap.has(r.author)) {
          r.reply = replyMap.get(r.author);
        }
      });

      if (global.useMemoryDb) {
        global.memoryDb.gbpRecords.set(domain, recordData);
        gbpRecord = recordData;
      } else {
        if (gbpRecord) {
          gbpRecord = await GBPRecord.findOneAndUpdate({ domain }, recordData, { new: true });
        } else {
          gbpRecord = new GBPRecord(recordData);
          await gbpRecord.save();
        }
      }
    }

    // 4. Combine and send payload
    const formattedData = {
      domain: seoRecord.domain,
      lastUpdated: seoRecord.updatedAt.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      website: {
        authorityScore: seoRecord.authorityScore,
        organicTraffic: seoRecord.organicTraffic,
        organicTrafficGrowth: seoRecord.organicTrafficGrowth,
        paidTraffic: seoRecord.paidTraffic,
        paidTrafficGrowth: seoRecord.paidTrafficGrowth,
        backlinks: seoRecord.backlinks,
        backlinksGrowth: seoRecord.backlinksGrowth,
        referringDomains: seoRecord.referringDomains,
        organicKeywords: seoRecord.organicKeywords,
        organicKeywordsDistribution: seoRecord.organicKeywordsDistribution,
        trafficTrend: seoRecord.trafficTrend,
        topKeywords: seoRecord.topKeywords,
        technicalAudit: seoRecord.technicalAudit,
      },
      gbp: {
        businessName: gbpRecord.businessName,
        rating: gbpRecord.rating,
        reviewsCount: gbpRecord.reviewsCount,
        impressions: gbpRecord.impressions,
        interactions: gbpRecord.interactions,
        localKeywords: gbpRecord.localKeywords,
        recentReviews: gbpRecord.recentReviews,
      },
    };

    return res.json(formattedData);
  } catch (err) {
    console.error("GET /api/seo-data error:", err);
    return res.status(500).json({ error: "Failed to gather SEO intelligence data" });
  }
});

// POST /api/seo-data/gbp/reply
router.post("/seo-data/gbp/reply", async (req, res) => {
  try {
    const { domain, author, replyText } = req.body;

    if (!domain || !author || !replyText) {
      return res.status(400).json({ error: "Missing required parameters (domain, author, replyText)" });
    }

    const cleanDomain = domain.trim().toLowerCase();

    if (global.useMemoryDb) {
      const gbpRecord = global.memoryDb.gbpRecords.get(cleanDomain);
      if (!gbpRecord) {
        return res.status(404).json({ error: "GBP record not found" });
      }

      const review = gbpRecord.recentReviews.find((r) => r.author === author);
      if (!review) {
        return res.status(404).json({ error: "Review matching author not found" });
      }

      // Update in memory
      review.reply = replyText;
      global.memoryDb.gbpRecords.set(cleanDomain, gbpRecord);

      return res.json({ success: true, recentReviews: gbpRecord.recentReviews });
    }

    // MongoDB Mode
    const gbpRecord = await GBPRecord.findOne({ domain: cleanDomain });
    if (!gbpRecord) {
      return res.status(404).json({ error: "Google Business Profile record not found for domain" });
    }

    const review = gbpRecord.recentReviews.find((r) => r.author === author);
    if (!review) {
      return res.status(404).json({ error: "Customer review matching author not found" });
    }

    // Post to Google API if client credentials are set
    await gbpService.replyToReview(review._id, replyText);

    // Save locally in DB
    review.reply = replyText;
    await gbpRecord.save();

    return res.json({ success: true, recentReviews: gbpRecord.recentReviews });
  } catch (err) {
    console.error("POST /api/seo-data/gbp/reply error:", err);
    return res.status(500).json({ error: "Failed to submit customer review response" });
  }
});

module.exports = router;
