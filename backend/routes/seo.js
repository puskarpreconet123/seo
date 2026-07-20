const express = require("express");
const router = express.Router();
const SEORecord = require("../models/SEORecord");
const GBPRecord = require("../models/GBPRecord");
const seoScraper = require("../services/seoScraper");
const gbpService = require("../services/gbpService");
const aeoGeoService = require("../services/aeoGeoService");

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
    const rawDomain = req.query.domain ? req.query.domain.trim().toLowerCase() : "example.com";
    let domain = rawDomain;
    if (rawDomain.includes("://")) {
      try {
        domain = new URL(rawDomain).hostname;
      } catch (e) {
        domain = rawDomain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
      }
    } else {
      domain = rawDomain.split("/")[0];
    }
    if (domain.startsWith("www.")) {
      domain = domain.substring(4);
    }
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

    const isSeoStale = !seoRecord || 
                       seoRecord.updatedAt < oneDayAgo || 
                       !seoRecord.aeoGeo || 
                       !seoRecord.aeoGeo.scrapedUrls || 
                       seoRecord.aeoGeo.scrapedUrls.length === 0;
    const isGbpStale = !gbpRecord || gbpRecord.updatedAt < oneDayAgo;

    // 2. Fetch/update SEO details if stale
    if (isSeoStale) {
      console.log(`SEO metrics stale/missing for ${domain}. crawling...`);
      const crawlResults = await seoScraper.scrapeDomain(domain);
      const seededMetrics = getSeededSEOMetrics(domain, seed);
      const aeoGeoMetrics = {
        ...aeoGeoService.analyzeDomain(domain, crawlResults.html, crawlResults.combinedHtml),
        scrapedUrls: crawlResults.scrapedUrls || []
      };

      const recordData = {
        domain,
        authorityScore: crawlResults.authorityScore,
        technicalAudit: crawlResults.technicalAudit,
        ...seededMetrics,
        aeoGeo: aeoGeoMetrics,
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
      aeoGeo: seoRecord.aeoGeo || aeoGeoService.analyzeDomain(domain, null),
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

    let cleanDomain = domain.trim().toLowerCase();
    if (cleanDomain.includes("://")) {
      try {
        cleanDomain = new URL(cleanDomain).hostname;
      } catch (e) {
        cleanDomain = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
      }
    } else {
      cleanDomain = cleanDomain.split("/")[0];
    }
    if (cleanDomain.startsWith("www.")) {
      cleanDomain = cleanDomain.substring(4);
    }

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

// POST /api/seo-data/schema
router.post("/seo-data/schema", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const { OpenAI } = require("openai");
    let siteName = "this site";
    try {
      siteName = new URL(url.includes("://") ? url : `https://${url}`).hostname.replace("www.", "");
    } catch (e) {}

    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        schema: {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": `What is the primary service offered by ${siteName}?`,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "We provide search optimization, digital visibility analysis, and structural audits for modern search integrations."
              }
            }
          ]
        }
      });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Quick fetch to get title/description
    let pageTitle = "Unknown Title";
    let pageDescription = "Unknown Description";
    try {
      const axios = require("axios");
      const cheerio = require("cheerio");
      const response = await axios.get(url, { timeout: 3000 });
      const html = response.data;
      const $ = cheerio.load(html);
      pageTitle = $("title").text() || pageTitle;
      pageDescription = $('meta[name="description"]').attr("content") || pageDescription;
    } catch (e) {
      console.warn("Could not fetch URL for schema generation, using fallback data.");
    }

    const prompt = `
Generate a valid JSON-LD Structured Data schema (e.g. Article, FAQPage, or Organization) for the following webpage:
URL: ${url}
Title: ${pageTitle}
Description: ${pageDescription}

Return ONLY the raw JSON object for the schema. Do not include markdown formatting or <script> tags.
`;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const schema = JSON.parse(aiRes.choices[0].message.content);
    res.json({ schema });
  } catch (error) {
    console.error("Schema Generation Error:", error);
    res.status(500).json({ error: "Failed to generate schema" });
  }
});

// POST /api/seo-data/geo-fixes
router.post("/seo-data/geo-fixes", async (req, res) => {
  const { url, fixType } = req.body;
  if (!url || !fixType) return res.status(400).json({ error: "URL and fixType are required" });

  try {
    const { OpenAI } = require("openai");
    if (!process.env.OPENAI_API_KEY) {
      return res.json({ suggestion: `<!-- Mock AI copywriting fix for ${fixType} -->\n<p>Add some concrete statistics or trust badges here to optimize for search visibility!</p>` });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    let pageText = "Content unavailable";
    try {
      const axios = require("axios");
      const cheerio = require("cheerio");
      const response = await axios.get(url, { timeout: 3000 });
      const html = response.data;
      const $ = cheerio.load(html);
      $("script, style, noscript, iframe, svg").remove();
      pageText = $("body").text().substring(0, 5000); // 5000 chars is plenty of context for a fix
    } catch (e) {
      console.warn("Could not fetch URL for geo fixes generation.");
    }

    const prompt = `
You are a Generative Engine Optimization (GEO) expert. We are trying to fix the following issue on this page: "${fixType}".
URL: ${url}
Context Text: ${pageText}

Provide a short, actionable copywriting snippet (using HTML tags if necessary) that the user can inject into their page to solve this GEO issue. Return ONLY a JSON object with this structure: { "suggestion": "<your snippet>" }.
`;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(aiRes.choices[0].message.content);
    res.json({ suggestion: parsed.suggestion });
  } catch (error) {
    console.error("GEO Fixes Generation Error:", error);
    res.status(500).json({ error: "Failed to generate GEO fixes" });
  }
});

// POST /api/seo-data/aeo-fixes
router.post("/seo-data/aeo-fixes", async (req, res) => {
  const { url, fixType } = req.body;
  if (!url || !fixType) return res.status(400).json({ error: "URL and fixType are required" });

  try {
    let siteName = "this site";
    try {
      siteName = new URL(url.includes("://") ? url : `https://${url}`).hostname.replace("www.", "");
    } catch (e) {}

    const { OpenAI } = require("openai");
    if (!process.env.OPENAI_API_KEY) {
      let mockSuggestion = "";
      if (fixType === "title") {
        mockSuggestion = `<!-- Suggestion for optimizing title -->\n<title>Expert Digital Services & SEO Diagnostics | ${siteName}</title>`;
      } else if (fixType === "h1") {
        mockSuggestion = `<!-- Suggestion for single H1 tag -->\n<h1>Empower Your Digital Growth with Advanced Search Intelligence</h1>`;
      } else {
        mockSuggestion = `<!-- Recommended Structured Layout (List/Table) -->\n<ul>\n  <li><strong>Core Service:</strong> Real-time SEO auditing & diagnostics</li>\n  <li><strong>Features:</strong> Answer Engine Optimization integrations & maps visibility</li>\n  <li><strong>Performance:</strong> Accelerated search tracking & backlinks optimization</li>\n</ul>`;
      }
      return res.json({ suggestion: mockSuggestion });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    let pageText = "Content unavailable";
    try {
      const axios = require("axios");
      const cheerio = require("cheerio");
      const response = await axios.get(url, { timeout: 3000 });
      const html = response.data;
      const $ = cheerio.load(html);
      $("script, style, noscript, iframe, svg").remove();
      pageText = $("body").text().substring(0, 5000);
    } catch (e) {
      console.warn("Could not fetch URL for aeo fixes generation.");
    }

    let fixDescription = "";
    if (fixType === "title") {
      fixDescription = "Generate an optimized, concise <title> tag (under 60 characters) suitable for Answer Engines and users.";
    } else if (fixType === "h1") {
      fixDescription = "Generate a single high-impact <h1> tag that describes the page value proposition clearly.";
    } else {
      fixDescription = "Generate a clean HTML structured list (<ul>/<li>) or HTML comparison table (<table>) comparing key services or features of this site to improve readability for LLM scrapers.";
    }

    const prompt = `
You are an Answer Engine Optimization (AEO) expert. We are trying to optimize the following component: "${fixType}".
URL: ${url}
Context Text: ${pageText}
Task: ${fixDescription}

Provide the code snippet (using proper HTML tags) that the user can inject into their page. Return ONLY a JSON object with this structure: { "suggestion": "<your code snippet>" }. Do not include extra markdown around the JSON object.
`;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(aiRes.choices[0].message.content);
    res.json({ suggestion: parsed.suggestion });
  } catch (error) {
    console.error("AEO Fixes Generation Error:", error);
    res.status(500).json({ error: "Failed to generate AEO fixes" });
  }
});

module.exports = router;
