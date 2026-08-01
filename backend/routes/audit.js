const express = require('express');
const router = express.Router();
const { crawlUrl } = require('../services/crawler.js');
const { parseSeoElements } = require('../services/parser.js');
const { runSeoEvaluation, calculateSeoScoreReport } = require('../services/evaluator.js');
const { runOnpageAnalysis } = require('../services/onpageAnalyzer.js');
const { runImageSeoAnalysis } = require('../services/imageAnalyzer.js');
const { runLinkAnalysis } = require('../services/linkAnalyzer.js');
const { runSchemaAnalysis } = require('../services/schemaAnalyzer.js');
const { runRobotsSitemapAnalysis } = require('../services/robotsSitemapAnalyzer.js');
const { runPerformanceAnalysis } = require('../services/performanceAnalyzer.js');
const { runPriorityEngine } = require('../services/priorityEngine.js');
const { runStructureAnalysis } = require('../services/structureAnalyzer.js');
const { runChecklistGeneration } = require('../services/checklistGenerator.js');
const { executePageSpeedAudits } = require('../services/pagespeedService.js');
const { runSubpageAudit } = require('../services/subpageAuditor.js');
const {
  generateAiSeoOptimizations,
  generateAiKeywordIdeas,
  generateAiContentOptimization,
  generateAiSeoActionPlan,
  runContentAnalysis
} = require('../services/ai.js');

router.post('/analyze', async (req, res) => {
  const { url, crawl_subpages = false } = req.body;

  if (!url) {
    return res.status(400).json({ detail: "Url is required." });
  }

  console.info(`[AuditRouter] Starting crawl for URL: ${url} (crawl_subpages=${crawl_subpages})`);
  const crawlResult = await crawlUrl(url);

  let seoData = null;
  let seoReport = null;
  let seoScore = null;
  let technicalScore = null;
  let issueSummary = null;
  let aiAnalysis = null;
  let keywordIdeas = null;
  let onpageReport = null;
  let imageSeoReport = null;
  let linkAnalysisReport = null;
  let schemaAnalysisReport = null;
  let robotsSitemapReport = null;
  let performanceReport = null;
  let aiContentOptimization = null;
  let contentAnalysis = null;
  let structureAnalysis = null;
  let seoChecklist = null;
  let seoActionPlan = null;
  let healthScore = 0;
  let priorityIssues = [];
  let cleanedSubpageReport = null;

  if (crawlResult.success && crawlResult.html) {
    console.info(`[AuditRouter] Crawl succeeded. Commencing HTML DOM parsing...`);
    try {
      const baseUrl = crawlResult.final_url || url;
      seoData = parseSeoElements(crawlResult.html, baseUrl);
      console.info("[AuditRouter] Successfully extracted SEO metadata, tags, and links.");

      crawlResult.seo_data = seoData;

      const resultsTemp = { seo_data: seoData, requested_url: url };
      const h1s = seoData.headings?.h1 || [];
      const primaryH1 = h1s[0] || null;

      // Concurrency Group 1
      console.info("[AuditRouter] Starting Concurrency Group 1 tasks...");
      const group1Results = await Promise.all([
        runSeoEvaluation(crawlResult, seoData).catch(err => {
          console.error("[AuditRouter] SEO evaluation failed:", err);
          return { passed: [], warnings: [], critical: [] };
        }),
        runImageSeoAnalysis(seoData, baseUrl).catch(err => {
          console.error("[AuditRouter] Image SEO analysis failed:", err);
          return null;
        }),
        runLinkAnalysis(seoData, baseUrl).catch(err => {
          console.error("[AuditRouter] Link analysis failed:", err);
          return null;
        }),
        runSchemaAnalysis(seoData).catch(err => {
          console.error("[AuditRouter] Schema analysis failed:", err);
          return null;
        }),
        runRobotsSitemapAnalysis(baseUrl).catch(err => {
          console.error("[AuditRouter] Robots/Sitemap analysis failed:", err);
          return null;
        }),
        runPerformanceAnalysis(crawlResult.html, baseUrl, crawlResult.response_time_ms).catch(err => {
          console.error("[AuditRouter] Performance analysis failed:", err);
          return null;
        }),
        generateAiKeywordIdeas(seoData.title, seoData.meta_description, primaryH1, seoData.page_content).catch(err => {
          console.error("[AuditRouter] AI keyword ideas failed:", err);
          return null;
        }),
        runContentAnalysis(resultsTemp).catch(err => {
          console.error("[AuditRouter] Content analysis failed:", err);
          return null;
        }),
        executePageSpeedAudits(baseUrl, { ...resultsTemp, response_time_ms: crawlResult.response_time_ms }).catch(err => {
          console.error("[AuditRouter] Parallel PageSpeed/Lighthouse strategy audits failed:", err);
          return null;
        }),
        crawl_subpages ? runSubpageAudit(baseUrl, seoData).catch(err => {
          console.error("[AuditRouter] Subpage auditing failed:", err);
          return null;
        }) : Promise.resolve(null)
      ]);

      seoReport = group1Results[0];
      imageSeoReport = group1Results[1];
      linkAnalysisReport = group1Results[2];
      schemaAnalysisReport = group1Results[3];
      robotsSitemapReport = group1Results[4];
      performanceReport = group1Results[5];
      keywordIdeas = group1Results[6];
      contentAnalysis = group1Results[7];
      const pagespeedReport = group1Results[8];
      const subpageAuditReport = group1Results[9];

      if (subpageAuditReport) {
        cleanedSubpageReport = {
          ...subpageAuditReport,
          audited_subpages: Array.isArray(subpageAuditReport.audited_subpages)
            ? subpageAuditReport.audited_subpages.map(({ html, ...rest }) => rest)
            : []
        };
      }
      crawlResult.subpage_audit_report = cleanedSubpageReport;
      console.info("[AuditRouter] Concurrency Group 1 complete.");

      // Calculate base score
      const scoreRes = calculateSeoScoreReport(seoReport);
      seoScore = scoreRes[0];
      issueSummary = scoreRes[1];
      technicalScore = seoScore;

      // Run Onpage
      onpageReport = runOnpageAnalysis(seoData, crawlResult);

      // Assemble temporary payload for Priority Engine
      crawlResult.seo_report = seoReport;
      crawlResult.seo_score = seoScore;
      crawlResult.issue_summary = issueSummary;
      crawlResult.onpage_report = onpageReport;
      crawlResult.image_seo_report = imageSeoReport;
      crawlResult.link_analysis_report = linkAnalysisReport;
      crawlResult.schema_analysis_report = schemaAnalysisReport;
      crawlResult.robots_sitemap_report = robotsSitemapReport;
      crawlResult.performance_report = performanceReport;
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

      const rawSeoScore = Math.round((technicalScore + (m.seo || 0) + (d.seo || 0)) / 3);

      crawlResult.seo_score = rawSeoScore;
      crawlResult.health_score = averageOverallScore;
      crawlResult.desktop_score = desktopAvg;
      crawlResult.mobile_score = mobileAvg;
      crawlResult.average_overall_score = averageOverallScore;

      const priorityRes = runPriorityEngine(crawlResult);
      healthScore = averageOverallScore;
      priorityIssues = priorityRes.priority_issues;
      crawlResult.priority_issues = priorityIssues;

      // Concurrency Group 2
      console.info("[AuditRouter] Starting Concurrency Group 2 tasks...");
      const group2Results = await Promise.all([
        generateAiSeoOptimizations(technicalScore, seoData, seoReport, priorityIssues).catch(err => {
          console.error("[AuditRouter] AI optimizations failed:", err);
          return null;
        }),
        generateAiContentOptimization(seoData.title, seoData.meta_description, primaryH1, seoData.headings, seoData.page_content, seoReport).catch(err => {
          console.error("[AuditRouter] AI Content Optimization failed:", err);
          return null;
        })
      ]);

      aiAnalysis = group2Results[0];
      aiContentOptimization = group2Results[1];
      console.info("[AuditRouter] Concurrency Group 2 complete.");

      crawlResult.ai_analysis = aiAnalysis;
      crawlResult.ai_content_optimization = aiContentOptimization;
      crawlResult.keyword_ideas = keywordIdeas;

      // Concurrency Group 3
      console.info("[AuditRouter] Starting Concurrency Group 3 tasks...");
      const group3Results = await Promise.all([
        generateAiSeoActionPlan(crawlResult).catch(err => {
          console.error("[AuditRouter] AI Action Plan failed:", err);
          return null;
        }),
        runStructureAnalysis(crawlResult).catch(err => {
          console.error("[AuditRouter] Structure analysis failed:", err);
          return null;
        }),
        runChecklistGeneration(crawlResult).catch(err => {
          console.error("[AuditRouter] Checklist generation failed:", err);
          return null;
        })
      ]);

      seoActionPlan = group3Results[0];
      structureAnalysis = group3Results[1];
      seoChecklist = group3Results[2];
      console.info("[AuditRouter] Concurrency Group 3 complete.");

    } catch (err) {
      console.error("[AuditRouter] HTML parsing, evaluation, or AI generation failed:", err);
    }
  }

  // Populate results
  crawlResult.seo_data = seoData;
  crawlResult.seo_report = seoReport;
  crawlResult.technical_score = technicalScore;
  crawlResult.issue_summary = issueSummary;
  crawlResult.ai_analysis = aiAnalysis;
  crawlResult.keyword_ideas = keywordIdeas;
  crawlResult.onpage_report = onpageReport;
  crawlResult.image_seo_report = imageSeoReport;
  crawlResult.link_analysis_report = linkAnalysisReport;
  crawlResult.schema_analysis_report = schemaAnalysisReport;
  crawlResult.robots_sitemap_report = robotsSitemapReport;
  crawlResult.performance_report = performanceReport;
  crawlResult.ai_content_optimization = aiContentOptimization;
  crawlResult.content_analysis = contentAnalysis;
  crawlResult.structure_analysis = structureAnalysis;
  crawlResult.seo_checklist = seoChecklist;

  if (!crawlResult.seo_action_plan) {
    crawlResult.seo_action_plan = seoActionPlan;
  }

  // Deduplicate subpage audit report if present
  if (crawlResult.subpage_audit_report && Array.isArray(crawlResult.subpage_audit_report.audited_subpages)) {
    const seenSub = new Set();
    const cleanSubpages = [];
    for (const p of crawlResult.subpage_audit_report.audited_subpages) {
      const normUrl = (p.url || '').replace(/\/$/, '').toLowerCase();
      if (normUrl && !seenSub.has(normUrl)) {
        seenSub.add(normUrl);
        cleanSubpages.push(p);
      }
    }
    crawlResult.subpage_audit_report.audited_subpages = cleanSubpages;
    crawlResult.subpage_audit_report.subpages_crawled_count = cleanSubpages.length;
  }

  // Persist to MongoDB audits collection
  try {
    const { collections } = require('../db/client');
    const auditsColl = collections.audits();
    if (auditsColl) {
      const auditRecord = {
        url: crawlResult.requested_url || url,
        status: crawlResult.success ? "completed" : "failed",
        createdAt: new Date(),
        results: crawlResult
      };
      const insertRes = await auditsColl.insertOne(auditRecord);
      crawlResult.id = insertRes.insertedId.toString();
      console.log(`[AuditRouter] Audit stored in MongoDB with ID: ${crawlResult.id}`);
    }
  } catch (dbErr) {
    console.warn(`[AuditRouter] MongoDB persistence warning: ${dbErr.message}`);
  }

  res.json(crawlResult);
});

module.exports = router;

