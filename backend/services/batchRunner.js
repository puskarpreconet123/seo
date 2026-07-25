const dbBatch = require('../db/batch.js');
const { crawlUrl } = require('./crawler.js');
const { parseSeoElements } = require('./parser.js');
const { runSeoEvaluation, calculateSeoScoreReport } = require('./evaluator.js');
const { runOnpageAnalysis } = require('./onpageAnalyzer.js');
const { runImageSeoAnalysis } = require('./imageAnalyzer.js');
const { runLinkAnalysis } = require('./linkAnalyzer.js');
const { runSchemaAnalysis } = require('./schemaAnalyzer.js');
const { runRobotsSitemapAnalysis } = require('./robotsSitemapAnalyzer.js');
const { runPerformanceAnalysis } = require('./performanceAnalyzer.js');
const { runPriorityEngine } = require('./priorityEngine.js');
const {
  generateAiSeoOptimizations,
  generateAiKeywordIdeas,
  generateAiContentOptimization,
  generateAiSeoActionPlan,
  runContentAnalysis
} = require('./ai.js');

async function runBatchWorker(batchId, manager) {
  console.log(`[BatchRunner] Starting batch worker for batch: ${batchId}`);

  try {
    // Update status to running
    await dbBatch.updateBatchJobStatus(batchId, "running");

    while (true) {
      // 1. Fetch current job state
      const job = await dbBatch.getBatchJob(batchId);
      if (!job) {
        console.warn(`[BatchRunner] Batch job ${batchId} not found. Exiting worker.`);
        break;
      }

      // Exit loop if status changed
      if (["paused", "cancelled", "completed"].includes(job.status)) {
        console.log(`[BatchRunner] Batch job ${batchId} status is '${job.status}'. Exiting worker loop.`);
        break;
      }

      // 2. Get next pending URL
      const urlRecord = await dbBatch.getNextPendingUrl(batchId);
      if (!urlRecord) {
        // No more pending URLs. Completed!
        await dbBatch.updateBatchJobStatus(batchId, "completed");
        console.log(`[BatchRunner] Batch job ${batchId} completed successfully.`);
        break;
      }

      const url = urlRecord.url;
      console.log(`[BatchRunner] Batch ${batchId}: Auditing URL: ${url}`);

      // Mark status as processing
      await dbBatch.updateUrlStatus(batchId, url, "processing");

      try {
        // 3. Perform Crawl
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
        let results = null;
        let seoActionPlan = null;
        let contentAnalysis = null;
        let healthScore = 0;
        let priorityIssues = [];

        if (crawlResult.success && crawlResult.html) {
          try {
            const baseUrl = crawlResult.final_url || url;
            seoData = parseSeoElements(crawlResult.html, baseUrl);

            const resultsTemp = { seo_data: seoData, requested_url: url };
            const h1s = seoData.headings?.h1 || [];
            const primaryH1 = h1s[0] || null;

            // Concurrency Group 1
            console.log(`[BatchRunner] Batch ${batchId} URL ${url}: Running Concurrency Group 1...`);
            const group1Results = await Promise.all([
              runSeoEvaluation(crawlResult, seoData).catch(err => {
                console.error(`Group 1 SEO eval failed:`, err);
                return { passed: [], warnings: [], critical: [] };
              }),
              runImageSeoAnalysis(seoData, baseUrl).catch(err => {
                console.error(`Group 1 Image SEO failed:`, err);
                return null;
              }),
              runLinkAnalysis(seoData, baseUrl).catch(err => {
                console.error(`Group 1 Link analysis failed:`, err);
                return null;
              }),
              runSchemaAnalysis(seoData).catch(err => {
                console.error(`Group 1 Schema analysis failed:`, err);
                return null;
              }),
              runRobotsSitemapAnalysis(baseUrl).catch(err => {
                console.error(`Group 1 Robots/Sitemap failed:`, err);
                return null;
              }),
              runPerformanceAnalysis(crawlResult.html, baseUrl, crawlResult.response_time_ms).catch(err => {
                console.error(`Group 1 Performance failed:`, err);
                return null;
              }),
              generateAiKeywordIdeas(seoData.title, seoData.meta_description, primaryH1, seoData.page_content).catch(err => {
                console.error(`Group 1 Keyword ideas failed:`, err);
                return null;
              }),
              runContentAnalysis(resultsTemp).catch(err => {
                console.error(`Group 1 Content analysis failed:`, err);
                return null;
              })
            ]);

            seoReport = group1Results[0];
            imageSeoReport = group1Results[1];
            linkAnalysisReport = group1Results[2];
            schemaAnalysisReport = group1Results[3];
            robotsSitemapReport = group1Results[4];
            performanceReport = group1Results[5];
            keywordIdeas = group1Results[6];
            contentAnalysis = group1Results[7];

            console.log(`[BatchRunner] Batch ${batchId} URL ${url}: Concurrency Group 1 complete.`);

            // Score calculation
            const scoreRes = calculateSeoScoreReport(seoReport);
            seoScore = scoreRes[0];
            issueSummary = scoreRes[1];
            technicalScore = seoScore;

            // Run Onpage
            onpageReport = runOnpageAnalysis(seoData, crawlResult);

            // Run Priority Engine
            const priorityInput = {
              success: crawlResult.success,
              requested_url: url,
              final_url: crawlResult.final_url || url,
              seo_data: seoData,
              seo_report: seoReport,
              seo_score: seoScore,
              onpage_report: onpageReport,
              image_seo_report: imageSeoReport,
              link_analysis_report: linkAnalysisReport,
              schema_analysis_report: schemaAnalysisReport,
              robots_sitemap_report: robotsSitemapReport,
              performance_report: performanceReport,
              content_analysis: contentAnalysis
            };

            const priorityRes = runPriorityEngine(priorityInput);
            healthScore = priorityRes.health_score;
            priorityIssues = priorityRes.priority_issues;

            // Concurrency Group 2
            console.log(`[BatchRunner] Batch ${batchId} URL ${url}: Running Concurrency Group 2...`);
            const group2Results = await Promise.all([
              generateAiSeoOptimizations(technicalScore, seoData, seoReport, priorityIssues).catch(err => {
                console.error(`Group 2 AI optimizations failed:`, err);
                return null;
              }),
              generateAiContentOptimization(seoData.title, seoData.meta_description, primaryH1, seoData.headings, seoData.page_content, seoReport).catch(err => {
                console.error(`Group 2 Content optimizations failed:`, err);
                return null;
              })
            ]);

            aiAnalysis = group2Results[0];
            aiContentOptimization = group2Results[1];
            console.log(`[BatchRunner] Batch ${batchId} URL ${url}: Concurrency Group 2 complete.`);

          } catch (err) {
            console.error(`[BatchRunner] Audit execution failed for URL ${url}:`, err);
          }
        }

        // Assemble results
        results = {
          success: crawlResult.success,
          requested_url: url,
          final_url: crawlResult.final_url || url,
          status_code: crawlResult.status_code,
          response_time_ms: crawlResult.response_time_ms,
          html: crawlResult.html,
          error_message: crawlResult.error_message,
          seo_data: seoData,
          seo_report: seoReport,
          seo_score: seoScore,
          issue_summary: issueSummary,
          ai_analysis: aiAnalysis,
          keyword_ideas: keywordIdeas,
          onpage_report: onpageReport,
          image_seo_report: imageSeoReport,
          link_analysis_report: linkAnalysisReport,
          schema_analysis_report: schemaAnalysisReport,
          robots_sitemap_report: robotsSitemapReport,
          performance_report: performanceReport,
          ai_content_optimization: aiContentOptimization,
          content_analysis: contentAnalysis
        };

        if (crawlResult.success) {
          results.health_score = healthScore;
          results.priority_issues = priorityIssues;
        } else {
          const priorityRes = runPriorityEngine(results);
          results.health_score = priorityRes.health_score;
          results.priority_issues = priorityRes.priority_issues;
        }

        results.seo_score = results.health_score;
        results.technical_score = technicalScore;

        // Action plan
        try {
          seoActionPlan = await generateAiSeoActionPlan(results);
        } catch (err) {
          console.error(`Error generating action plan in batch:`, err);
        }
        results.seo_action_plan = seoActionPlan;

        const status = crawlResult.success ? "completed" : "failed";
        const score = crawlResult.success ? results.health_score : null;
        const errMsg = crawlResult.error_message;

        await dbBatch.updateUrlResult(batchId, url, status, score, errMsg, results);
        console.log(`[BatchRunner] Batch ${batchId}: Finished URL ${url} status=${status} score=${score}`);

      } catch (err) {
        console.error(`[BatchRunner] Critical URL audit error in batch for ${url}:`, err);
        await dbBatch.updateUrlResult(batchId, url, "failed", null, err.message, null);
      }
    }
  } catch (err) {
    console.error(`[BatchRunner] Batch worker crashed for batch ${batchId}:`, err);
  } finally {
    manager.stopBatch(batchId);
    console.log(`[BatchRunner] Batch worker exited for batch: ${batchId}`);
  }
}

class BatchManager {
  constructor() {
    this.runningWorkers = new Map();
  }

  startBatch(batchId) {
    if (this.runningWorkers.has(batchId)) {
      console.log(`[BatchRunner] Batch ${batchId} is already running.`);
      return;
    }

    // Run background worker loop (without awaiting it)
    const workerPromise = runBatchWorker(batchId, this);
    this.runningWorkers.set(batchId, workerPromise);
    console.log(`[BatchRunner] Spawned background worker task for batch ${batchId}`);
  }

  stopBatch(batchId) {
    if (this.runningWorkers.has(batchId)) {
      this.runningWorkers.delete(batchId);
    }
  }
}

const batchManager = new BatchManager();

module.exports = { batchManager };
