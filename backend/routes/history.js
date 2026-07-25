const { Router } = require('express');
const { collections, ObjectId } = require('../db/client.js');
const { generateCsvReport, generateHtmlReport, generatePdfReport } = require('../services/reportGenerator.js');

const router = Router();

function extractScores(results) {
  if (!results) return {};
  const r = results;
  const healthVal = r.health_score ?? r.seo_score;
  const techVal = r.technical_score ?? r.seo_score;
  return {
    seo_score: healthVal,
    performance_score: r.performance_report?.performance_score || null,
    onpage_score: r.onpage_report?.onpage_score || null,
    technical_score: techVal,
    image_score: r.image_seo_report?.image_seo_score || null,
    internal_link_score: r.link_analysis_report?.internal_link_score || null,
    external_link_score: r.link_analysis_report?.external_link_score || null,
    schema_score: r.schema_analysis_report?.schema_score || null,
    health_score: healthVal,
    desktop_score: r.desktop_score || null,
    mobile_score: r.mobile_score || null,
    average_overall_score: r.average_overall_score || null
  };
}

function auditToListItem(audit) {
  const scores = extractScores(audit.results || {});
  const createdAtStr = audit.createdAt ? new Date(audit.createdAt).toISOString() : new Date().toISOString();
  return {
    id: audit._id ? audit._id.toString() : audit.id,
    url: audit.url,
    status: audit.status,
    created_at: createdAtStr,
    ...scores
  };
}

router.get('', async (req, res) => {
  const limit = parseInt(req.query.limit || '50', 10);
  try {
    const auditsColl = collections.audits();
    if (!auditsColl) {
      return res.json([]);
    }
    const audits = await auditsColl.find({ status: "completed" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
    res.json(audits.map(auditToListItem));
  } catch (err) {
    console.error(`Failed to list audit history:`, err);
    res.status(500).json({ detail: "Could not retrieve audit history." });
  }
});

router.get('/:audit_id', async (req, res) => {
  const { audit_id } = req.params;
  try {
    const auditsColl = collections.audits();
    if (!auditsColl) {
      return res.status(404).json({ detail: "Audit not found." });
    }
    let query = { _id: audit_id };
    try { query = { _id: new ObjectId(audit_id) }; } catch (e) {}

    const audit = await auditsColl.findOne(query);
    if (!audit) {
      return res.status(404).json({ detail: "Audit not found." });
    }
    res.json(auditToListItem(audit));
  } catch (err) {
    console.error(`Failed to fetch audit ${audit_id}:`, err);
    res.status(400).json({ detail: "Invalid audit ID format or database error." });
  }
});

router.get('/:audit_id/full', async (req, res) => {
  const { audit_id } = req.params;
  try {
    const auditsColl = collections.audits();
    if (!auditsColl) {
      return res.status(404).json({ detail: "Audit results not found." });
    }
    let query = { _id: audit_id };
    try { query = { _id: new ObjectId(audit_id) }; } catch (e) {}

    const audit = await auditsColl.findOne(query);
    if (!audit || !audit.results) {
      return res.status(404).json({ detail: "Audit results not found." });
    }
    res.json(audit.results);
  } catch (err) {
    console.error(`Failed to fetch full audit ${audit_id}:`, err);
    res.status(400).json({ detail: "Invalid audit ID format or database error." });
  }
});

router.delete('/:audit_id', async (req, res) => {
  const { audit_id } = req.params;
  try {
    const auditsColl = collections.audits();
    if (!auditsColl) {
      return res.status(404).json({ detail: "Audit not found." });
    }
    let query = { _id: audit_id };
    try { query = { _id: new ObjectId(audit_id) }; } catch (e) {}

    await auditsColl.deleteOne(query);
    res.json({ success: true, message: `Audit ${audit_id} deleted successfully.` });
  } catch (err) {
    console.error(`Failed to delete audit ${audit_id}:`, err);
    res.status(404).json({ detail: "Audit not found." });
  }
});

router.post('/compare', async (req, res) => {
  const { audit_id_a, audit_id_b } = req.body;

  if (!audit_id_a || !audit_id_b) {
    return res.status(400).json({ detail: "Both audit_id_a and audit_id_b are required." });
  }

  try {
    const [auditA, auditB] = await Promise.all([
      prisma.audit.findUnique({ where: { id: audit_id_a } }),
      prisma.audit.findUnique({ where: { id: audit_id_b } })
    ]);

    if (!auditA) {
      return res.status(404).json({ detail: `Audit A (${audit_id_a}) not found.` });
    }
    if (!auditB) {
      return res.status(404).json({ detail: `Audit B (${audit_id_b}) not found.` });
    }

    const resA = auditA.results || {};
    const resB = auditB.results || {};

    const SCORE_DEFS = [
      ["SEO Score", "seo_score", null],
      ["Performance Score", "performance_score", "performance_report"],
      ["On-Page Score", "onpage_score", "onpage_report"],
      ["Image SEO Score", "image_score", "image_seo_report"],
      ["Internal Link Score", "internal_link_score", "link_analysis_report"],
      ["External Link Score", "external_link_score", "link_analysis_report"],
      ["Schema Score", "schema_score", "schema_analysis_report"]
    ];

    function getScore(results, scoreKey, parentKey) {
      if (!parentKey) {
        return results[scoreKey];
      }
      const parent = results[parentKey] || {};
      const fieldMap = {
        performance_score: "performance_score",
        onpage_score: "onpage_score",
        image_score: "image_seo_score",
        internal_link_score: "internal_link_score",
        external_link_score: "external_link_score",
        schema_score: "schema_score"
      };
      return parent[fieldMap[scoreKey] || scoreKey];
    }

    const scores = [];
    let totalImproved = 0;
    let totalWorse = 0;

    for (const [label, scoreKey, parentKey] of SCORE_DEFS) {
      const before = getScore(resA, scoreKey, parentKey) ?? null;
      const after = getScore(resB, scoreKey, parentKey) ?? null;

      let status = "unavailable";
      let diff = null;

      if (before !== null && after !== null) {
        diff = after - before;
        if (diff > 0) {
          status = "improved";
          totalImproved++;
        } else if (diff < 0) {
          status = "worse";
          totalWorse++;
        } else {
          status = "unchanged";
        }
      }

      scores.push({ label, before, after, diff, status });
    }

    function extractIssues(results, bucket) {
      const seoReport = results.seo_report || {};
      return seoReport[bucket] || [];
    }

    function diffIssues(issuesA, issuesB) {
      function makeKey(item) {
        return `${item.check || item.check_name || ''}::${item.message || ''}`;
      }

      const mapA = new Map(issuesA.map(i => [makeKey(i), i]));
      const mapB = new Map(issuesB.map(i => [makeKey(i), i]));

      const fixed = [];
      const newItems = [];
      const persisted = [];

      for (const [key, item] of mapA.entries()) {
        if (!mapB.has(key)) {
          fixed.push({ check: item.check || item.check_name || "", message: item.message || "" });
        } else {
          persisted.push({ check: item.check || item.check_name || "", message: item.message || "" });
        }
      }

      for (const [key, item] of mapB.entries()) {
        if (!mapA.has(key)) {
          newItems.push({ check: item.check || item.check_name || "", message: item.message || "" });
        }
      }

      return { fixed, new: newItems, persisted };
    }

    const criticalA = extractIssues(resA, "critical");
    const criticalB = extractIssues(resB, "critical");
    const warningsA = extractIssues(resA, "warnings");
    const warningsB = extractIssues(resB, "warnings");

    const criticalDiff = diffIssues(criticalA, criticalB);
    const warningsDiff = diffIssues(warningsA, warningsB);

    let verdict = "unchanged";
    if (totalImproved > totalWorse) {
      verdict = "improved";
    } else if (totalWorse > totalImproved) {
      verdict = "worse";
    }

    res.json({
      audit_a: auditToListItem(auditA),
      audit_b: auditToListItem(auditB),
      scores,
      critical_diff: criticalDiff,
      warnings_diff: warningsDiff,
      overall_verdict: verdict
    });

  } catch (err) {
    console.error(`Failed to compare audits:`, err);
    res.status(500).json({ detail: "Database transaction or calculation failed." });
  }
});

router.get('/:audit_id/export', async (req, res) => {
  const { audit_id } = req.params;
  const format = (req.query.format || 'pdf').toLowerCase();

  try {
    const audit = await prisma.audit.findUnique({
      where: { id: audit_id }
    });

    if (!audit) {
      return res.status(404).json({ detail: "Audit not found." });
    }
    if (!audit.results) {
      return res.status(404).json({ detail: "Audit results not found." });
    }

    const results = audit.results;
    let domain = "domain";
    try {
      const parsedUrl = new URL(results.requested_url || "http://domain");
      domain = parsedUrl.hostname.replace(/[^a-zA-Z0-9.-]/g, "_");
    } catch (_) {}

    const auditDate = audit.createdAt;
    const formattedDate = auditDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');

    if (format === 'json') {
      res.setHeader("Content-Disposition", `attachment; filename=seo_report_${domain}.json`);
      res.setHeader("Content-Type", "application/json");
      return res.send(JSON.stringify(results, null, 2));
    }

    if (format === 'csv') {
      const csvData = generateCsvReport(results);
      res.setHeader("Content-Disposition", `attachment; filename=seo_report_${domain}.csv`);
      res.setHeader("Content-Type", "text/csv");
      return res.send(csvData);
    }

    if (format === 'html') {
      const htmlData = generateHtmlReport(results, formattedDate);
      res.setHeader("Content-Disposition", `attachment; filename=seo_report_${domain}.html`);
      res.setHeader("Content-Type", "text/html");
      return res.send(htmlData);
    }

    if (format === 'pdf') {
      const pdfBuffer = await generatePdfReport(results, formattedDate);
      res.setHeader("Content-Disposition", `attachment; filename=seo_report_${domain}.pdf`);
      res.setHeader("Content-Type", "application/pdf");
      return res.send(pdfBuffer);
    }

    res.status(400).json({ detail: `Unsupported format '${format}'. Choose from: pdf, html, json, csv` });

  } catch (err) {
    console.error(`Failed to export audit report:`, err);
    res.status(500).json({ detail: `Export failed: ${err.message}` });
  }
});

module.exports = router;
