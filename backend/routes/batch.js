const { Router } = require('express');
const multer = require('multer');
const { v4 as uuidv4 } = require('uuid');
const dbBatch = require('../db/batch.js');
const { batchManager } = require('../services/batchRunner.js');

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const URL_REGEX = /^https?:\/\/(?:(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z]{2,6}\.?|[a-z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[/?]\S+)$/i;

function validateUrl(url) {
  return URL_REGEX.test(url);
}

async function parseAndExtractUrls(urlsText, file) {
  const rawUrls = [];

  if (urlsText) {
    const lines = urlsText.split(/\r?\n/);
    for (const line of lines) {
      const cleaned = line.trim();
      if (cleaned) rawUrls.push(cleaned);
    }
  }

  if (file) {
    const contentStr = file.buffer.toString('utf8');
    const filename = (file.originalname || "").toLowerCase();
    
    if (filename.endsWith('.csv')) {
      const lines = contentStr.split(/\r?\n/);
      for (const line of lines) {
        const cells = line.split(',');
        for (const cell of cells) {
          const cellClean = cell.trim().replace(/^["']|["']$/g, '');
          if (cellClean.toLowerCase().startsWith("http://") || cellClean.toLowerCase().startsWith("https://") || validateUrl(cellClean)) {
            rawUrls.push(cellClean);
          }
        }
      }
    } else {
      const lines = contentStr.split(/\r?\n/);
      for (const line of lines) {
        const cleaned = line.trim();
        if (cleaned) rawUrls.push(cleaned);
      }
    }
  }

  const seen = new Set();
  const validUrls = [];
  for (const url of rawUrls) {
    let normalized = url.trim().replace(/^["']|["']$/g, '');
    if (!normalized.toLowerCase().startsWith("http://") && !normalized.toLowerCase().startsWith("https://")) {
      normalized = "http://" + normalized;
    }
    if (validateUrl(normalized) && !seen.has(normalized)) {
      seen.add(normalized);
      validUrls.push(normalized);
    }
  }
  return validUrls;
}

router.post('/create', upload.single('file'), async (req, res) => {
  const urlsText = req.body.urls_text;
  const file = req.file;

  try {
    const urls = await parseAndExtractUrls(urlsText, file);
    if (urls.length === 0) {
      return res.status(400).json({
        detail: "No valid URLs found. Make sure URLs start with http:// or https://"
      });
    }

    const batchId = uuidv4();
    console.info(`[BatchRouter] Creating batch ${batchId} with ${urls.length} URLs`);

    const batchJob = await dbBatch.createBatchJob(batchId, urls);
    batchManager.startBatch(batchId);

    res.json(batchJob);
  } catch (err) {
    console.error(`Failed to create batch:`, err);
    res.status(500).json({ detail: `Failed to create batch job: ${err.message}` });
  }
});

router.get('', async (req, res) => {
  const limit = parseInt(req.query.limit || '50', 10);
  try {
    const jobs = await dbBatch.listBatchJobs(limit);
    res.json(jobs);
  } catch (err) {
    console.error(`Failed to list batch jobs:`, err);
    res.status(500).json({ detail: "Could not retrieve batch history." });
  }
});

router.get('/:batch_id', async (req, res) => {
  const { batch_id } = req.params;
  try {
    const job = await dbBatch.getBatchJob(batch_id);
    if (!job) {
      return res.status(404).json({ detail: "Batch job not found." });
    }
    res.json(job);
  } catch (err) {
    console.error(`Failed to get batch job ${batch_id}:`, err);
    res.status(400).json({ detail: "Invalid batch ID format or database error." });
  }
});

router.get('/:batch_id/results', async (req, res) => {
  const { batch_id } = req.params;
  try {
    const job = await dbBatch.getBatchJob(batch_id);
    if (!job) {
      return res.status(404).json({ detail: "Batch job not found." });
    }
    const urls = await dbBatch.getBatchUrls(batch_id);
    res.json(urls);
  } catch (err) {
    console.error(`Failed to get batch results ${batch_id}:`, err);
    res.status(500).json({ detail: "Could not retrieve batch URL results." });
  }
});

router.get('/:batch_id/full', async (req, res) => {
  const { batch_id } = req.params;
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ detail: "Query parameter 'url' is required." });
  }

  try {
    const result = await dbBatch.getUrlFullResult(batch_id, url);
    if (!result) {
      return res.status(404).json({ detail: "Full results for the specified URL and batch not found." });
    }
    res.json(result);
  } catch (err) {
    console.error(`Failed to get URL audit detail:`, err);
    res.status(500).json({ detail: "Failed to fetch audit results." });
  }
});

router.post('/:batch_id/pause', async (req, res) => {
  const { batch_id } = req.params;
  try {
    const job = await dbBatch.getBatchJob(batch_id);
    if (!job) {
      return res.status(404).json({ detail: "Batch job not found." });
    }
    if (!["pending", "running"].includes(job.status)) {
      return res.status(400).json({ detail: `Cannot pause a batch job in '${job.status}' state.` });
    }

    await dbBatch.updateBatchJobStatus(batch_id, "paused");
    console.info(`Batch ${batch_id} marked as paused.`);
    res.json({ success: true, message: "Batch paused. The runner will stop after completing the current URL crawl." });
  } catch (err) {
    console.error(`Failed to pause batch ${batch_id}:`, err);
    res.status(500).json({ detail: `Failed to pause batch: ${err.message}` });
  }
});

router.post('/:batch_id/resume', async (req, res) => {
  const { batch_id } = req.params;
  try {
    const job = await dbBatch.getBatchJob(batch_id);
    if (!job) {
      return res.status(404).json({ detail: "Batch job not found." });
    }
    if (job.status !== "paused") {
      return res.status(400).json({ detail: `Cannot resume a batch job in '${job.status}' state. It must be paused.` });
    }

    batchManager.startBatch(batch_id);
    res.json({ success: true, message: "Batch resumed." });
  } catch (err) {
    console.error(`Failed to resume batch ${batch_id}:`, err);
    res.status(500).json({ detail: `Failed to resume batch: ${err.message}` });
  }
});

router.post('/:batch_id/cancel', async (req, res) => {
  const { batch_id } = req.params;
  try {
    const job = await dbBatch.getBatchJob(batch_id);
    if (!job) {
      return res.status(404).json({ detail: "Batch job not found." });
    }
    if (["completed", "cancelled"].includes(job.status)) {
      return res.status(400).json({ detail: `Cannot cancel a batch job that is already '${job.status}'.` });
    }

    await dbBatch.cancelBatchJob(batch_id);
    console.info(`Batch ${batch_id} has been cancelled.`);
    res.json({ success: true, message: "Batch cancelled. All pending audits have been skipped." });
  } catch (err) {
    console.error(`Failed to cancel batch ${batch_id}:`, err);
    res.status(500).json({ detail: `Failed to cancel batch: ${err.message}` });
  }
});

router.get('/:batch_id/export', async (req, res) => {
  const { batch_id } = req.params;
  try {
    const job = await dbBatch.getBatchJob(batch_id);
    if (!job) {
      return res.status(404).json({ detail: "Batch job not found." });
    }

    const urls = await dbBatch.getBatchUrls(batch_id);
    
    // Set headers for download
    res.setHeader("Content-Disposition", `attachment; filename=batch_results_${batch_id}.csv`);
    res.setHeader("Content-Type", "text/csv");

    // CSV header row
    res.write("URL,Status,SEO Score,Performance Score,On-Page Score,Image SEO Score,Internal Link Score,External Link Score,Schema Score,Error Message\n");

    for (const u of urls) {
      const urlStr = u.url;
      const status = u.status;
      const errMsg = u.error_message || "";
      
      let seo = "";
      let perf = "";
      let onpage = "";
      let image = "";
      let intl = "";
      let extl = "";
      let schema = "";

      if (status === "completed") {
        const fullRes = await dbBatch.getUrlFullResult(batch_id, urlStr);
        if (fullRes) {
          seo = fullRes.seo_score ?? "";
          perf = fullRes.performance_report?.performance_score ?? "";
          onpage = fullRes.onpage_report?.onpage_score ?? "";
          image = fullRes.image_seo_report?.image_seo_score ?? "";
          intl = fullRes.link_analysis_report?.internal_link_score ?? "";
          extl = fullRes.link_analysis_report?.external_link_score ?? "";
          schema = fullRes.schema_analysis_report?.schema_score ?? "";
        }
      }

      function escapeCsv(val) {
        const str = String(val ?? "");
        if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }

      res.write(`${escapeCsv(urlStr)},${status},${seo},${perf},${onpage},${image},${intl},${extl},${schema},${escapeCsv(errMsg)}\n`);
    }

    res.end();
  } catch (err) {
    console.error(`Failed to export batch ${batch_id}:`, err);
    res.status(500).json({ detail: `Export failed: ${err.message}` });
  }
});

module.exports = router;
