const express = require("express");
const router = express.Router();
const SEORecord = require("../models/SEORecord");
const GBPRecord = require("../models/GBPRecord");
const BrandPreference = require("../models/BrandPreference");
const AiVisibilityAudit = require("../models/AiVisibilityAudit");
const gbpService = require("../services/gbpService");
const aeoGeoService = require("../services/aeoGeoService");

// Deep audit service imports
const { crawlUrl } = require("../services/crawler.js");
const { parseSeoElements } = require("../services/parser.js");
const { runSeoEvaluation, calculateSeoScoreReport } = require("../services/evaluator.js");
const { runOnpageAnalysis } = require("../services/onpageAnalyzer.js");
const { runImageSeoAnalysis } = require("../services/imageAnalyzer.js");
const { runLinkAnalysis } = require("../services/linkAnalyzer.js");
const { runSchemaAnalysis } = require("../services/schemaAnalyzer.js");
const { runRobotsSitemapAnalysis } = require("../services/robotsSitemapAnalyzer.js");
const { runPriorityEngine } = require("../services/priorityEngine.js");
const { runStructureAnalysis } = require("../services/structureAnalyzer.js");
const { runChecklistGeneration } = require("../services/checklistGenerator.js");
const { executePageSpeedAudits } = require("../services/pagespeedService.js");
const { runSubpageAudit } = require("../services/subpageAuditor.js");
const {
  generateAiSeoOptimizations,
  generateAiKeywordIdeas,
  generateAiContentOptimization,
  generateAiSeoActionPlan,
  runContentAnalysis
} = require("../services/ai.js");

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
  const startTime = Date.now();
  console.log(`\n--------------------------------------------------`);
  console.log(`[PIPELINE START] Processing SEO Analysis Pipeline...`);

  try {
    // PIPELINE STEP 1: Input Normalization
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
    console.log(`[Pipeline Step 1/6] Domain normalized: "${domain}" (raw input: "${rawDomain}")`);

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

    // PIPELINE STEP 2: Database Retrieval
    console.log(`[Pipeline Step 2/6] Checking database cache (MongoDB / Memory)...`);
    if (global.useMemoryDb) {
      seoRecord = global.memoryDb.seoRecords.get(domain);
      gbpRecord = global.memoryDb.gbpRecords.get(domain);
      console.log(`[Pipeline Step 2/6] Retrieved from Memory DB: SEO Record=${!!seoRecord}, GBP Record=${!!gbpRecord}`);
    } else {
      seoRecord = await SEORecord.findOne({ domain });
      gbpRecord = await GBPRecord.findOne({ domain });
      console.log(`[Pipeline Step 2/6] Retrieved from MongoDB: SEO Record=${!!seoRecord}, GBP Record=${!!gbpRecord}`);
    }

    const forceRefresh = req.query.force === 'true' || req.query.refresh === 'true';
    const isSeoStale = forceRefresh ||
                       !seoRecord || 
                       seoRecord.updatedAt < oneDayAgo || 
                       !seoRecord.aeoGeo || 
                       !seoRecord.aeoGeo.scrapedUrls || 
                       seoRecord.aeoGeo.scrapedUrls.length === 0;
    const isGbpStale = forceRefresh || !gbpRecord || gbpRecord.updatedAt < oneDayAgo;

    console.log(`[Pipeline Step 2/6] Audit Stale Evaluation: SEO Stale=${isSeoStale}, GBP Stale=${isGbpStale}, ForceRefresh=${forceRefresh}`);

    // PIPELINE STEP 3 & 4: Deep Web Crawl & Intelligence Processing
    if (isSeoStale) {
      console.log(`[Pipeline Step 3/6] Initiating live web crawl & diagnostic audit for https://${domain}...`);
      const targetUrl = `https://${domain}`;
      const crawlResult = await crawlUrl(targetUrl);

      let fullAudit = null;
      let technicalAudit = null;
      let schemaAnalysisReport = null;
      let combinedHtml = "";
      let cleanedSubpageReport = null;

      if (crawlResult.success && crawlResult.html) {
        console.log(`[Pipeline Step 4/6] Crawl succeeded (${crawlResult.html.length} bytes). Running analytical engines...`);
        try {
          const baseUrl = crawlResult.final_url || targetUrl;
          const seoData = parseSeoElements(crawlResult.html, baseUrl);
          crawlResult.seo_data = seoData;

          const resultsTemp = { seo_data: seoData, requested_url: targetUrl };
          const h1s = seoData.headings?.h1 || [];
          const primaryH1 = h1s[0] || null;

          console.log(`[Pipeline Step 4/6] Executing parallel SEO analysis modules...`);
          const group1Results = await Promise.all([
            runSeoEvaluation(crawlResult, seoData).catch(() => ({ passed: [], warnings: [], critical: [] })),
            runImageSeoAnalysis(seoData, baseUrl).catch(() => null),
            runLinkAnalysis(seoData, baseUrl).catch(() => null),
            runSchemaAnalysis(seoData).catch(() => null),
            runRobotsSitemapAnalysis(baseUrl).catch(() => null),
            generateAiKeywordIdeas(seoData.title, seoData.meta_description, primaryH1, seoData.page_content).catch(() => null),
            runContentAnalysis(resultsTemp).catch(() => null),
            executePageSpeedAudits(baseUrl, { ...resultsTemp, response_time_ms: crawlResult.response_time_ms }).catch(() => null),
            runSubpageAudit(baseUrl, seoData).catch(() => null)
          ]);

          const seoReport = group1Results[0];
          const imageSeoReport = group1Results[1];
          const linkAnalysisReport = group1Results[2];
          schemaAnalysisReport = group1Results[3];
          const robotsSitemapReport = group1Results[4];
          const keywordIdeas = group1Results[5];
          const contentAnalysis = group1Results[6];
          const pagespeedReport = group1Results[7];
          const subpageAuditReport = group1Results[8];

          combinedHtml = crawlResult.html || "";
          if (subpageAuditReport) {
            if (Array.isArray(subpageAuditReport.audited_subpages)) {
              subpageAuditReport.audited_subpages.forEach(p => {
                if (p.html) combinedHtml += "\n" + p.html;
              });
            }
            cleanedSubpageReport = {
              ...subpageAuditReport,
              audited_subpages: Array.isArray(subpageAuditReport.audited_subpages)
                ? subpageAuditReport.audited_subpages.map(({ html, ...rest }) => rest)
                : []
            };
          }
          crawlResult.subpage_audit_report = cleanedSubpageReport;

          const [seoScore, issueSummary] = calculateSeoScoreReport(seoReport);
          const onpageReport = runOnpageAnalysis(seoData, crawlResult);

          crawlResult.seo_report = seoReport;
          crawlResult.seo_score = seoScore;
          crawlResult.issue_summary = issueSummary;
          crawlResult.onpage_report = onpageReport;
          crawlResult.image_seo_report = imageSeoReport;
          crawlResult.link_analysis_report = linkAnalysisReport;
          crawlResult.schema_analysis_report = schemaAnalysisReport;
          crawlResult.robots_sitemap_report = robotsSitemapReport;
          crawlResult.content_analysis = contentAnalysis;

          const defaultPageSpeed = {
            mobile: { performance: 50, seo: 50, accessibility: 50, best_practices: 50, metrics: {}, recommendations: [], success: false },
            desktop: { performance: 50, seo: 50, accessibility: 50, best_practices: 50, metrics: {}, recommendations: [], success: false }
          };

          const psData = pagespeedReport || defaultPageSpeed;
          crawlResult.pagespeed = psData;
          crawlResult.mobile = psData.mobile;
          crawlResult.desktop = psData.desktop;

          const m = psData.mobile || {};
          const d = psData.desktop || {};
          const mobileAvg = Math.round(((m.performance || 0) + (m.seo || 0) + (m.accessibility || 0) + (m.best_practices || 0)) / 4);
          const desktopAvg = Math.round(((d.performance || 0) + (d.seo || 0) + (d.accessibility || 0) + (d.best_practices || 0)) / 4);
          const averageOverallScore = Math.round(((m.performance || 0) + (m.seo || 0) + (m.accessibility || 0) + (m.best_practices || 0) +
                                       (d.performance || 0) + (d.seo || 0) + (d.accessibility || 0) + (d.best_practices || 0)) / 8);

          const rawSeoScore = Math.round((seoScore + (m.seo || 0) + (d.seo || 0)) / 3);

          crawlResult.seo_score = rawSeoScore;
          crawlResult.health_score = averageOverallScore;
          crawlResult.desktop_score = desktopAvg;
          crawlResult.mobile_score = mobileAvg;
          crawlResult.average_overall_score = averageOverallScore;

          const priorityRes = runPriorityEngine(crawlResult);
          crawlResult.priority_issues = priorityRes.priority_issues;

          console.log(`[Pipeline Step 4/6] Executing AI optimizations & plan generators...`);
          const group2Results = await Promise.all([
            generateAiSeoOptimizations(seoScore, seoData, seoReport, priorityRes.priority_issues).catch(() => null),
            generateAiContentOptimization(seoData.title, seoData.meta_description, primaryH1, seoData.headings, seoData.page_content, seoReport).catch(() => null)
          ]);

          crawlResult.ai_analysis = group2Results[0];
          crawlResult.ai_content_optimization = group2Results[1];
          crawlResult.keyword_ideas = keywordIdeas;

          const group3Results = await Promise.all([
            generateAiSeoActionPlan(crawlResult).catch(() => null),
            runStructureAnalysis(crawlResult).catch(() => null),
            runChecklistGeneration(crawlResult).catch(() => null)
          ]);

          crawlResult.seo_action_plan = group3Results[0];
          crawlResult.structure_analysis = group3Results[1];
          crawlResult.seo_checklist = group3Results[2];

          fullAudit = crawlResult;
          technicalAudit = {
            healthScore: averageOverallScore,
            criticals: (onpageReport?.critical || []).length,
            warnings: (onpageReport?.warnings || []).length,
            passed: (onpageReport?.passed || []).length,
            topIssues: priorityRes.priority_issues.slice(0, 5)
          };
          console.log(`[Pipeline Step 4/6] Calculated Scores -> Health: ${averageOverallScore}, SEO Score: ${rawSeoScore}, Desktop: ${desktopAvg}, Mobile: ${mobileAvg}`);
        } catch (err) {
          console.error("[Pipeline Step 4/6] Deep audit processing failed:", err);
        }
      }

      // Lightweight fallback if Playwright fails
      if (!fullAudit) {
        console.warn(`[Pipeline Step 3/6] Deep crawl returned no audit. Crawl failed.`);
        return res.status(400).json({ 
          error: crawlResult.error_message || "Could not fetch or verify the domain. Please check if the domain is accessible." 
        });
      }

      const seededMetrics = getSeededSEOMetrics(domain, seed);
      const aeoGeoMetrics = {
        ...aeoGeoService.analyzeDomain(domain, fullAudit?.html || null, combinedHtml, schemaAnalysisReport || fullAudit?.schema_analysis_report),
        scrapedUrls: fullAudit?.subpage_audit_report?.audited_subpages?.map(p => p.url) || [`https://${domain}`]
      };

      const recordData = {
        domain,
        authorityScore: fullAudit?.authority_score || 35,
        technicalAudit: technicalAudit,
        schemaAnalysisReport: schemaAnalysisReport || fullAudit?.schema_analysis_report,
        fullAudit: fullAudit,
        ...seededMetrics,
        aeoGeo: aeoGeoMetrics,
        updatedAt: new Date(),
      };

      // PIPELINE STEP 5: MongoDB Persistence
      console.log(`[Pipeline Step 5/6] Persisting SEO record to MongoDB...`);
      if (global.useMemoryDb) {
        global.memoryDb.seoRecords.set(domain, recordData);
        seoRecord = recordData;
        console.log(`[Pipeline Step 5/6] Saved to Memory DB successfully.`);
      } else {
        if (seoRecord) {
          seoRecord = await SEORecord.findOneAndUpdate({ domain }, recordData, { new: true });
          console.log(`[Pipeline Step 5/6] Updated existing MongoDB document for "${domain}".`);
        } else {
          seoRecord = new SEORecord(recordData);
          await seoRecord.save();
          console.log(`[Pipeline Step 5/6] Saved new MongoDB document for "${domain}".`);
        }
      }
    }

    // GBP Details
    if (isGbpStale) {
      console.log(`[Pipeline Step 5/6] Fetching/updating GBP profile data for ${domain}...`);
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

    // PIPELINE STEP 6: Payload Formatting & Response
    console.log(`[Pipeline Step 6/6] Assembly of full dashboard payload for domain "${seoRecord.domain}"...`);
    const formattedData = {
      domain: seoRecord.domain,
      lastUpdated: seoRecord.updatedAt ? new Date(seoRecord.updatedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }) : "Recently",
      schema_analysis_report: seoRecord.schemaAnalysisReport,
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
        fullAudit: seoRecord.fullAudit
      },
      aeoGeo: seoRecord.aeoGeo || aeoGeoService.analyzeDomain(domain, null, null, seoRecord.schemaAnalysisReport || seoRecord.fullAudit?.schema_analysis_report),
      gbp: gbpRecord ? {
        businessName: gbpRecord.businessName,
        rating: gbpRecord.rating,
        reviewsCount: gbpRecord.reviewsCount,
        impressions: gbpRecord.impressions,
        interactions: gbpRecord.interactions,
        localKeywords: gbpRecord.localKeywords,
        recentReviews: gbpRecord.recentReviews,
      } : null,
    };

    const duration = Date.now() - startTime;
    console.log(`[PIPELINE SUCCESS] Analysis complete for "${domain}" in ${duration}ms.`);
    console.log(`--------------------------------------------------\n`);

    return res.json(formattedData);
  } catch (err) {
    console.error("[PIPELINE ERROR] Failed during SEO data processing pipeline:", err);
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

// POST /api/seo-data/brand-preference
router.post("/seo-data/brand-preference", async (req, res) => {
  const { domain, brandName, competitors = [], prompt } = req.body;
  if (!domain || !brandName || !prompt) {
    return res.status(400).json({ error: "domain, brandName, and prompt are required" });
  }

  // Sanitizing inputs
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0].toLowerCase();
  const cleanCompetitors = Array.isArray(competitors)
    ? competitors.map(c => c.trim()).filter(Boolean)
    : [];

  try {
    const cleanPrompt = prompt.trim().toLowerCase();

    // Check MongoDB cache first
    const cachedResult = await BrandPreference.findOne({
      domain: cleanDomain,
      prompt: cleanPrompt
    });

    if (cachedResult) {
      console.log(`[BrandPreference] Returning cached result for domain: ${cleanDomain}, prompt: "${prompt}"`);
      return res.json({
        results: cachedResult.results,
        summary: cachedResult.summary
      });
    }

    const { OpenAI } = require("openai");
    const hasKey = !!process.env.OPENAI_API_KEY;

    if (!hasKey) {
      return res.status(500).json({ error: "An error occurred on either our side or your network (Missing OpenAI API Key Configuration)." });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const apiPrompt = `
You are a Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO) diagnostic tool.
We are analyzing how different LLMs rank, recommend, and cite a specific target brand versus its competitors for a given search query/prompt.

Target Brand: "${brandName}" (Domain: "${cleanDomain}")
Competitor Brands: ${cleanCompetitors.map(c => `"${c}"`).join(", ") || "None specified (Please dynamically identify the top 5-6 direct competitor companies/agencies of the same type in this niche to compare against)"}
User Search Query/Prompt: "${prompt}"

Your job is to simulate responses from 5 different LLM architectures and analyze how the target brand performs in each. The 5 models are:
1. "ChatGPT (GPT-4o)" (Persona: Highly detailed, structured, conversational list or comparison with clear pros and cons).
2. "Google Gemini" (Persona: Direct answer format, bullet points, emphasizing search-engine layout and recommendations, highly structured tables).
3. "Claude 3.5 Sonnet" (Persona: Academic, objective, thorough, analytical, deeply explaining the nuances of each option).
4. "Perplexity AI" (Persona: Synthesized web search result with numbered inline citations like [1], [2], referencing sources directly, listing brand links).
5. "Meta LLaMA 3" (Persona: Casual, helpful, direct, summarizes recommendations quickly).

For each model, you must produce:
1. The simulated response (markdown formatted, around 120-200 words).
2. An array of brand mentions (for both the target brand and any competitor brands mentioned). If no competitor brands were specified, you must dynamically identify the top 4-5 direct competitor brands of the same type (e.g. custom web dev/marketing agencies for Preconet, NOT DIY platforms or freelance marketplaces) for this brand in its industry and perform the comparison against them. For each brand, specify:
   - Name
   - Sentiment (positive, neutral, or negative)
   - Rank (1, 2, 3, etc. or null if not recommended in a list)
   - Score (0 to 100 based on prominence and recommendation strength)
   - Reason (short description of why the model ranked it this way or commented on it)
3. The visibilityScore for the target brand in this model (0 to 100).
4. Actionable recommendations (specific advice on what the target brand can optimize on its website to be ranked #1 or cited first by this model, e.g. "Add a comparison table matching the query", "Increase EEAT credentials", etc.).
5. Simulated citation URLs (at least 1-2 URLs matching the brand's domain if cited, plus competitors' or third-party links).

Also, provide an overall "summary" object containing:
- "winner": The brand that is overall most preferred across the models for this query.
- "marketInsights": A short summary of why the competitors succeeded or how the target brand is positioned.

Format the output strictly as a JSON object with this shape:
{
  "results": [
    {
      "model": "ChatGPT (GPT-4o)",
      "response": "...",
      "visibilityScore": 85,
      "brandMentions": [
        { "name": "BrandName", "sentiment": "positive"|"neutral"|"negative", "rank": 1, "score": 85, "reason": "..." }
      ],
      "citations": ["url1", "url2"],
      "recommendations": "..."
    }
  ],
  "summary": {
    "winner": "...",
    "marketInsights": "..."
  }
}

Do not return any other text, markdown blocks, or code blocks outside the JSON. Return only the JSON object.
`;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: apiPrompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(aiRes.choices[0].message.content);

    // Save result to cache
    try {
      const newCache = new BrandPreference({
        domain: cleanDomain,
        brandName,
        competitors: cleanCompetitors,
        prompt: cleanPrompt,
        results: parsed.results,
        summary: parsed.summary
      });
      await newCache.save();
      console.log(`[BrandPreference] Cached new result for domain: ${cleanDomain}, prompt: "${prompt}"`);
    } catch (saveErr) {
      console.warn("[BrandPreference] Failed to save cache to MongoDB:", saveErr.message);
    }

    return res.json(parsed);
  } catch (error) {
    console.error("Brand Preference API Error:", error);
    return res.status(500).json({ error: "An error occurred on either our side or your network: " + error.message });
  }
});

// GET /api/seo-data/ai-visibility-audit/latest
router.get("/seo-data/ai-visibility-audit/latest", async (req, res) => {
  const { domain } = req.query;
  if (!domain) {
    return res.status(400).json({ error: "domain is required" });
  }
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0].toLowerCase();
  
  try {
    const latest = await AiVisibilityAudit.findOne({ domain: cleanDomain }).sort({ createdAt: -1 });
    if (!latest) {
      return res.json(null);
    }
    return res.json({
      niche: latest.niche,
      brandName: latest.brandName,
      competitors: latest.competitors,
      prompts: latest.prompts,
      overallScores: latest.overallScores,
      shareOfVoice: latest.shareOfVoice,
      modelBreakdown: latest.modelBreakdown,
      recommendations: latest.recommendations
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/seo-data/ai-visibility-audit
router.post("/seo-data/ai-visibility-audit", async (req, res) => {
  const { domain, brandName, competitors = [], niche } = req.body;
  if (!domain || !brandName || !niche) {
    return res.status(400).json({ error: "domain, brandName, and niche are required" });
  }

  // Sanitizing inputs
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0].toLowerCase();
  const cleanCompetitors = Array.isArray(competitors)
    ? competitors.map(c => c.trim()).filter(Boolean)
    : [];

  try {
    const cleanNiche = niche.trim().toLowerCase();

    // Check MongoDB cache first
    const cachedResult = await AiVisibilityAudit.findOne({
      domain: cleanDomain,
      niche: cleanNiche
    });

    if (cachedResult) {
      console.log(`[AiVisibilityAudit] Returning cached result for domain: ${cleanDomain}, niche: "${niche}"`);
      return res.json({
        prompts: cachedResult.prompts,
        overallScores: cachedResult.overallScores,
        shareOfVoice: cachedResult.shareOfVoice,
        modelBreakdown: cachedResult.modelBreakdown,
        recommendations: cachedResult.recommendations
      });
    }

    const { OpenAI } = require("openai");
    const hasKey = !!process.env.OPENAI_API_KEY;

    if (!hasKey) {
      return res.status(500).json({ error: "An error occurred on either our side or your network (Missing OpenAI API Key Configuration)." });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const apiPrompt = `
You are a Generative Engine Optimization (GEO) audit engine.
Your task is to perform an AI Visibility Audit for a brand versus its competitors across a specific business niche.

Target Brand Name: "${brandName}" (Domain: "${cleanDomain}")
Competitor Brand Names: ${cleanCompetitors.map(c => `"${c}"`).join(", ") || "None specified (Please dynamically identify the top 4-5 direct competitor companies/agencies of the same type in this niche to compare against)"}
Business Niche/Keywords: "${niche}"

First, generate 5 typical conversational prompts that customers in this niche would ask search engines / LLMs to find service companies or agencies (avoid generic DIY platforms like Wix/Shopify, or freelance marketplaces like Toptal/Upwork). If the niche relates to web development/marketing agencies (like the target brand), ensure the prompts focus on finding custom web development or marketing companies/agencies (e.g. "What are the best custom web development companies...", "Compare digital marketing agencies..."). Assign a simulated monthly search volume (between 500 and 5000) to each prompt.

Then, simulate the search results across 4 main LLMs:
1. "ChatGPT (GPT-4o)"
2. "Google Gemini"
3. "Claude 3.5 Sonnet"
4. "Perplexity AI"

For each of the 5 prompts and each of the 4 LLMs, determine if the target brand and competitor brands are mentioned. For each brand mention, evaluate:
- Is it "cited" (mentioned with a website link/URL), "mentioned" (text mention without a link), or "none" (not recommended/mentioned)?
- What is the recommended rank (1, 2, 3, or null if not ranked)?
- What is the sentiment (positive, neutral, or negative)?

Using these details, calculate:
1. A prompt-level visibility score for each brand:
   Score = Base Mention Score * Rank Factor * Sentiment Factor
   - Base Mention Score: cited = 100, mentioned = 40, none = 0
   - Rank Factor: rank 1 = 1.0, rank 2 = 0.8, rank 3 = 0.6, no rank/general mention = 0.4
   - Sentiment Factor: positive = 1.0, neutral = 0.5, negative = 0.0

2. The weighted overall visibility score (0-100) for each brand across all 5 prompts, weighted by the prompt search volumes.
   If the target brand is relatively unknown/small (like "Preconet India" or "Preconet") and the competitor brands (like "Ahrefs", "Semrush", or others) are well known, be realistic: the target brand should receive a very low or 0 visibility score if the LLM would not realistically recommend it.

3. The competitor Share of Voice (SOV) percentage for each brand:
   SOV = Brand Visibility Score / (Sum of all Brands' Visibility Scores) * 100.
   Ensure that the SOV percentages sum to 100% (or represent the portion among these compared brands).
   If competitor brands were not specified in the input, dynamically identify the top 2-3 direct competitor companies/agencies of the same type in this niche (ensure they match the business type of the target brand—for example, if the target is a custom development/marketing agency, pick similar development agencies/companies, NOT SaaS software tools, DIY website builders like Wix/Shopify, or freelance platforms like Toptal/Upwork), compare the target brand against them, and include them in the prompts, overallScores, and shareOfVoice lists.

4. A list of 5 optimization recommendations for the target brand to increase its visibility in these models.

Format the output strictly as a JSON object with this shape:
{
  "prompts": [
    {
      "query": "...",
      "volume": 1200,
      "brandPerformance": [
        {
          "brand": "BrandName",
          "status": "cited" | "mentioned" | "none",
          "rank": 1 | 2 | 3 | null,
          "sentiment": "positive" | "neutral" | "negative",
          "score": 85
        }
      ]
    }
  ],
  "overallScores": [
    {
      "brand": "BrandName",
      "visibilityScore": 45,
      "citationRate": 60,
      "mentionRate": 80
    }
  ],
  "shareOfVoice": [
    {
      "brand": "BrandName",
      "sov": 45.2
    }
  ],
  "modelBreakdown": {
    "ChatGPT": 35,
    "Gemini": 40,
    "Claude": 20,
    "Perplexity": 50
  },
  "recommendations": [
    "..."
  ]
}

Do not return any other text, markdown blocks, or code blocks outside the JSON. Return only the JSON object.
`;

    const aiRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: apiPrompt }],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(aiRes.choices[0].message.content);

    // Save result to cache
    try {
      const newCache = new AiVisibilityAudit({
        domain: cleanDomain,
        brandName,
        competitors: cleanCompetitors,
        niche: cleanNiche,
        prompts: parsed.prompts,
        overallScores: parsed.overallScores,
        shareOfVoice: parsed.shareOfVoice,
        modelBreakdown: parsed.modelBreakdown,
        recommendations: parsed.recommendations
      });
      await newCache.save();
      console.log(`[AiVisibilityAudit] Cached new result for domain: ${cleanDomain}, niche: "${niche}"`);
    } catch (saveErr) {
      console.warn("[AiVisibilityAudit] Failed to save cache to MongoDB:", saveErr.message);
    }

    return res.json(parsed);
  } catch (error) {
    console.error("AI Visibility Audit API Error:", error);
    return res.status(500).json({ error: "An error occurred on either our side or your network: " + error.message });
  }
});

module.exports = router;
