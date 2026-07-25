const { chromium } = require('playwright');

function escapeXml(val) {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function harvestChecks(results) {
  const checks = [];

  // 1. Technical SEO
  const techReport = results.seo_report || {};
  for (const item of techReport.critical || []) {
    checks.push(["Technical SEO", "Critical", item.check || item.check_name || "", item.message || ""]);
  }
  for (const item of techReport.warnings || []) {
    checks.push(["Technical SEO", "Warning", item.check || item.check_name || "", item.message || ""]);
  }
  for (const item of techReport.passed || []) {
    checks.push(["Technical SEO", "Passed", item.check || item.check_name || "", item.message || ""]);
  }

  // 2. On-Page SEO
  const onpageReport = results.onpage_report || {};
  for (const item of onpageReport.critical || []) {
    checks.push(["On-Page SEO", "Critical", item.check || item.check_name || "", item.message || ""]);
  }
  for (const item of onpageReport.warnings || []) {
    checks.push(["On-Page SEO", "Warning", item.check || item.check_name || "", item.message || ""]);
  }
  for (const item of onpageReport.passed || []) {
    checks.push(["On-Page SEO", "Passed", item.check || item.check_name || "", item.message || ""]);
  }

  // 3. Performance
  const perfReport = results.performance_report || {};
  for (const item of perfReport.issues || []) {
    const sev = item.severity === "critical" ? "Critical" : "Warning";
    checks.push(["Performance", sev, item.check || item.check_name || "", item.message || ""]);
  }
  const failedPerfChecks = new Set((perfReport.issues || []).map(i => i.check_name));
  const perfPassedChecks = [
    ["Render-blocking resources", "No render-blocking stylesheets or scripts in the head."],
    ["Missing lazy loading", "Images are configured to lazy load correctly."],
    ["Large CSS files", "All CSS files are within optimal size limits (< 100 KB)."],
    ["Large JavaScript files", "All JavaScript bundles are within optimal size limits (< 200 KB)."],
    ["Unused CSS", "Stylesheets are lean and free of significant unused rules."],
    ["Unused JavaScript", "JavaScript payloads are optimized without large unused modules."],
    ["Missing compression", "Text assets use GZIP or Brotli compression."],
    ["Missing browser caching", "Static resources utilize long-term caching policies."]
  ];
  for (const [name, msg] of perfPassedChecks) {
    if (!failedPerfChecks.has(name)) {
      checks.push(["Performance", "Passed", name, msg]);
    }
  }

  // 4. Image SEO
  const imgReport = results.image_seo_report || {};
  for (const item of imgReport.critical || []) {
    checks.push(["Image SEO", "Critical", item.check || item.check_name || "", item.message || ""]);
  }
  for (const item of imgReport.warnings || []) {
    checks.push(["Image SEO", "Warning", item.check || item.check_name || "", item.message || ""]);
  }
  for (const item of imgReport.passed || []) {
    checks.push(["Image SEO", "Passed", item.check || item.check_name || "", item.message || ""]);
  }

  // 5. Link Analysis
  const linkReport = results.link_analysis_report || {};
  for (const item of linkReport.critical || []) {
    checks.push(["Link Analysis", "Critical", item.check || item.check_name || "", item.message || ""]);
  }
  for (const item of linkReport.warnings || []) {
    checks.push(["Link Analysis", "Warning", item.check || item.check_name || "", item.message || ""]);
  }
  for (const item of linkReport.passed || []) {
    checks.push(["Link Analysis", "Passed", item.check || item.check_name || "", item.message || ""]);
  }

  // 6. Schema Markup
  const schemaReport = results.schema_analysis_report || {};
  for (const item of schemaReport.critical || []) {
    checks.push(["Schema Markup", "Critical", item.check || item.check_name || "Schema Validity Check", item.message || ""]);
  }
  for (const item of schemaReport.warnings || []) {
    checks.push(["Schema Markup", "Warning", item.check || item.check_name || "Schema Validity Check", item.message || ""]);
  }
  for (const item of schemaReport.passed || []) {
    checks.push(["Schema Markup", "Passed", item.check || item.check_name || "Schema Validity Check", item.message || ""]);
  }

  // 7. Robots & Sitemap
  const robotsSitemapReport = results.robots_sitemap_report || {};
  for (const item of robotsSitemapReport.critical || []) {
    checks.push(["Robots & Sitemap", "Critical", item.check || item.check_name || "", item.message || ""]);
  }
  for (const item of robotsSitemapReport.warnings || []) {
    checks.push(["Robots & Sitemap", "Warning", item.check || item.check_name || "", item.message || ""]);
  }
  for (const item of robotsSitemapReport.passed || []) {
    checks.push(["Robots & Sitemap", "Passed", item.check || item.check_name || "", item.message || ""]);
  }

  return checks;
}

function generateCsvReport(results) {
  const rows = [];
  
  const url = results.requested_url || "N/A";
  const finalUrl = results.final_url || "N/A";
  const statusCode = results.status_code || "N/A";
  const resTime = results.response_time_ms || "N/A";
  const healthScore = results.health_score ?? results.seo_score ?? "N/A";
  const technicalScore = results.technical_score ?? results.seo_score ?? "N/A";
  
  const perf = results.performance_report?.performance_score ?? "N/A";
  const onpage = results.onpage_report?.onpage_score ?? "N/A";
  const image = results.image_seo_report?.image_seo_score ?? "N/A";
  const intl = results.link_analysis_report?.internal_link_score ?? "N/A";
  const extl = results.link_analysis_report?.external_link_score ?? "N/A";
  const schema = results.schema_analysis_report?.schema_score ?? "N/A";

  const mobile = results.mobile || {};
  const desktop = results.desktop || {};
  const mMetrics = mobile.metrics || {};
  const dMetrics = desktop.metrics || {};

  rows.push(["SEO Audit Metadata", "Value"]);
  rows.push(["Audited URL", url]);
  rows.push(["Final URL", finalUrl]);
  rows.push(["HTTP Status Code", statusCode]);
  rows.push(["Response Time", resTime !== "N/A" ? `${resTime} ms` : "N/A"]);
  rows.push(["Overall Health Score", healthScore]);
  rows.push(["Technical SEO Score", technicalScore]);
  rows.push(["Performance Score", perf]);
  rows.push(["On-Page Score", onpage]);
  rows.push(["Image SEO Score", image]);
  rows.push(["Internal Link Score", intl]);
  rows.push(["External Link Score", extl]);
  rows.push(["Schema Score", schema]);

  rows.push(["Desktop Score Average", results.desktop_score ?? "N/A"]);
  rows.push(["Desktop Performance", desktop.performance ?? "N/A"]);
  rows.push(["Desktop SEO", desktop.seo ?? "N/A"]);
  rows.push(["Desktop Accessibility", desktop.accessibility ?? "N/A"]);
  rows.push(["Desktop Best Practices", desktop.best_practices ?? "N/A"]);
  rows.push(["Desktop FCP", dMetrics.first_contentful_paint ?? "N/A"]);
  rows.push(["Desktop LCP", dMetrics.largest_contentful_paint ?? "N/A"]);
  rows.push(["Desktop Speed Index", dMetrics.speed_index ?? "N/A"]);
  rows.push(["Desktop TBT", dMetrics.total_blocking_time ?? "N/A"]);
  rows.push(["Desktop CLS", dMetrics.cumulative_layout_shift ?? "N/A"]);
  rows.push(["Desktop Interactive", dMetrics.interactive ?? "N/A"]);

  rows.push(["Mobile Score Average", results.mobile_score ?? "N/A"]);
  rows.push(["Mobile Performance", mobile.performance ?? "N/A"]);
  rows.push(["Mobile SEO", mobile.seo ?? "N/A"]);
  rows.push(["Mobile Accessibility", mobile.accessibility ?? "N/A"]);
  rows.push(["Mobile Best Practices", mobile.best_practices ?? "N/A"]);
  rows.push(["Mobile FCP", mMetrics.first_contentful_paint ?? "N/A"]);
  rows.push(["Mobile LCP", mMetrics.largest_contentful_paint ?? "N/A"]);
  rows.push(["Mobile Speed Index", mMetrics.speed_index ?? "N/A"]);
  rows.push(["Mobile TBT", mMetrics.total_blocking_time ?? "N/A"]);
  rows.push(["Mobile CLS", mMetrics.cumulative_layout_shift ?? "N/A"]);
  rows.push(["Mobile Interactive", mMetrics.interactive ?? "N/A"]);
  rows.push([]);

  rows.push(["Category", "Severity", "Check Name", "Details/Message"]);
  
  const checks = harvestChecks(results);
  for (const [cat, sev, name, msg] of checks) {
    rows.push([cat, sev, name, msg]);
  }

  // Action plan
  const actionPlan = results.seo_action_plan;
  if (actionPlan) {
    rows.push([]);
    rows.push(["PERSONALIZED SEO ACTION PLAN"]);
    rows.push(["Estimated SEO Improvement", actionPlan.estimated_seo_improvement || "N/A"]);
    rows.push(["Estimated Completion Time", actionPlan.estimated_completion_time || "N/A"]);
    rows.push([]);
    rows.push(["Task Group", "Priority", "Task Title", "Timeframe", "Details / Guide"]);

    const groups = [
      ["Today", actionPlan.today || []],
      ["This Week", actionPlan.this_week || []],
      ["This Month", actionPlan.this_month || []],
      ["Quick Wins", actionPlan.quick_wins || []],
      ["High Impact Tasks", actionPlan.high_impact_tasks || []],
      ["Long Term Improvements", actionPlan.long_term_improvements || []]
    ];

    for (const [groupName, tasks] of groups) {
      for (const task of tasks) {
        rows.push([
          groupName,
          task.priority || "N/A",
          task.title || "N/A",
          task.estimated_time || "N/A",
          task.description || "N/A"
        ]);
      }
    }
  }

  // Content analysis
  const contentAnalysis = results.content_analysis;
  if (contentAnalysis) {
    const detections = contentAnalysis.detections || {};
    const generations = contentAnalysis.generations || {};
    rows.push([]);
    rows.push(["CONTENT ANALYSIS & OPTIMIZER"]);
    const thin = detections.thin_content || {};
    rows.push(["Word Count", thin.word_count || "N/A", "Thin Content Detected", thin.is_detected ? "Yes" : "No"]);
    const rd = detections.low_readability || {};
    rows.push(["Readability Score", rd.score || "N/A", "Readability Level", rd.level || "N/A"]);
    const sc = detections.low_semantic_coverage || {};
    rows.push(["Semantic Coverage Score", sc.score || "N/A", "Semantic Status", sc.status || "N/A"]);
    rows.push([]);
    rows.push(["Content Issues", "Value"]);
    for (const topic of detections.missing_topics || []) {
      rows.push(["Missing Topic", topic]);
    }
    for (const kw of detections.missing_keywords || []) {
      rows.push(["Missing Keyword", kw]);
    }
    for (const gap of sc.gaps || []) {
      rows.push(["Semantic Gap", gap]);
    }
    rows.push([]);
    rows.push(["Content Generation Suggestions", "Detail"]);
    for (const s of generations.topic_suggestions || []) {
      rows.push(["Topic Suggestion", s]);
    }
    for (const idea of generations.missing_content_ideas || []) {
      rows.push(["Content Idea", idea.title || "", idea.outline || ""]);
    }
    for (const faq of generations.faq_suggestions || []) {
      rows.push(["FAQ Question", faq.question || "", faq.answer || ""]);
    }
    for (const h of generations.additional_headings || []) {
      rows.push(["Suggested Heading", h.tag || "", h.text || ""]);
    }
  }

  // Escape CSV values
  return rows.map(r => r.map(val => {
    const str = String(val ?? "");
    if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }).join(",")).join("\n");
}

function generateHtmlReport(results, formattedDate) {
  const url = results.requested_url || "N/A";
  const finalUrl = results.final_url || "N/A";
  const statusCode = results.status_code || "N/A";
  const resTime = results.response_time_ms || "N/A";
  
  const seoScore = results.seo_score || 0;
  const techScore = results.technical_score ?? results.seo_score ?? 0;
  const perfScore = results.performance_report?.performance_score ?? 0;
  const onpageScore = results.onpage_report?.onpage_score ?? 0;
  const healthScore = results.health_score ?? seoScore;

  const priorityIssues = results.priority_issues || [];
  const criticalCount = priorityIssues.filter(c => c.priority === "Critical").length;
  const highCount = priorityIssues.filter(c => c.priority === "High").length;
  const medCount = priorityIssues.filter(c => c.priority === "Medium").length;
  const lowCount = priorityIssues.filter(c => c.priority === "Low").length;

  const aiAnalysis = results.ai_analysis || {};
  const aiContent = results.ai_content_optimization || {};
  const actionPlan = results.seo_action_plan;
  const contentAnalysis = results.content_analysis;

  function formatListItems(lst) {
    if (!lst || lst.length === 0) return "<li>None suggested</li>";
    return lst.map(x => `<li>${escapeXml(x)}</li>`).join("");
  }

  function formatActionPlanTasks(tasks) {
    if (!tasks || tasks.length === 0) return "<li>No actions</li>";
    return tasks.map(t => `<li style='margin-bottom: 8px; font-size: 12px; color: var(--text-main);'><strong>${escapeXml(t.title)}</strong>: ${escapeXml(t.description)}</li>`).join("");
  }

  function formatActionPlanBullets(tasks) {
    if (!tasks || tasks.length === 0) return "<li>No actions suggested</li>";
    return tasks.map(t => `<li style='margin-bottom: 6px; font-size: 13px;'><strong>${escapeXml(t.title)}</strong> (${t.priority} | ${t.estimated_time}): ${escapeXml(t.description)}</li>`).join("");
  }

  function formatContentDetectionList(items) {
    if (!items || items.length === 0) return "<li>None detected.</li>";
    return items.map(item => `<li>${escapeXml(item.title || item)}</li>`).join("");
  }

  function formatFaqList(faqs) {
    if (!faqs || faqs.length === 0) return "<li>No FAQ suggestions.</li>";
    return faqs.map(faq => `<li><strong>Q: ${escapeXml(faq.question)}</strong><br>A: ${escapeXml(faq.answer)}</li>`).join("");
  }

  let issueRowsHtml = "";
  if (priorityIssues.length > 0) {
    for (const item of priorityIssues) {
      const prio = item.priority;
      const badgeClass = prio === "Critical" ? "badge-danger" : prio === "High" ? "badge-warning" : prio === "Medium" ? "badge-success" : "badge-info";
      const diffClass = item.difficulty === "Hard" ? "badge-danger" : item.difficulty === "Medium" ? "badge-warning" : "badge-success";
      
      issueRowsHtml += `
      <tr>
        <td><span class="badge ${badgeClass}">${prio}</span></td>
        <td><strong>${escapeXml(item.category)}</strong></td>
        <td>
          <strong>${escapeXml(item.issue_name)}</strong><br/>
          <span style="font-size: 11px; opacity: 0.85; display: inline-block; margin-top: 2px;">${escapeXml(item.description)}</span><br/>
          <span style="font-size: 11.5px; color: var(--indigo); font-weight: 500; display: inline-block; margin-top: 4px;"><strong>SEO Impact:</strong> ${escapeXml(item.seo_impact)}</span><br/>
          <span style="font-size: 12px; color: var(--emerald); font-weight: 600; display: inline-block; margin-top: 2px;"><strong>Action Directive:</strong> ${escapeXml(item.recommendation)}</span>
        </td>
        <td><span class="badge ${diffClass}">${escapeXml(item.difficulty)}</span></td>
        <td>${escapeXml(item.estimated_fix_time)}</td>
      </tr>
      `;
    }
  } else {
    const checks = harvestChecks(results);
    for (const [cat, sev, name, msg] of checks) {
      const badgeClass = sev === "Critical" ? "badge-danger" : sev === "Warning" ? "badge-warning" : "badge-success";
      issueRowsHtml += `
      <tr>
        <td><span class="badge ${badgeClass}">${sev}</span></td>
        <td><strong>${escapeXml(cat)}</strong></td>
        <td><strong>${escapeXml(name)}</strong><br/>${escapeXml(msg)}</td>
        <td><span class="badge bg-secondary">-</span></td>
        <td>-</td>
      </tr>
      `;
    }
  }

  // Beautiful modern dashboard theme matching the guidelines
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO Technical Audit Report — ${escapeXml(url)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0b0f19;
            --card-bg: rgba(17, 24, 39, 0.75);
            --card-border: rgba(255, 255, 255, 0.08);
            --text-main: #f3f4f6;
            --text-secondary: #9ca3af;
            --indigo: #6366f1;
            --violet: #8b5cf6;
            --emerald: #10b981;
            --amber: #f59e0b;
            --rose: #rose;
            --rose: #ef4444;
            --cyan: #06b6d4;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-main);
            line-height: 1.6;
            padding: 40px 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
        }
        header {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 30px;
            backdrop-filter: blur(12px);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }
        .header-title h1 {
            font-size: 24px;
            font-weight: 800;
            background: linear-gradient(to right, #a5b4fc, #c084fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 5px;
        }
        .header-title p {
            font-size: 13px;
            color: var(--text-secondary);
        }
        .score-box {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .score-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            border: 4px solid var(--emerald);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 800;
            color: var(--text-main);
            box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
        }
        .card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 30px;
            backdrop-filter: blur(10px);
        }
        .card-title {
            font-size: 16px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--indigo);
            margin-bottom: 18px;
            border-left: 4px solid var(--indigo);
            padding-left: 10px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .info-item {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 10px;
            padding: 12px 16px;
        }
        .info-item label {
            display: block;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            color: var(--text-secondary);
            margin-bottom: 4px;
        }
        .info-item span {
            font-size: 13px;
            font-weight: 600;
            word-break: break-all;
        }
        .stats-row {
            display: flex;
            gap: 15px;
            margin-bottom: 25px;
            flex-wrap: wrap;
        }
        .stat-card {
            flex: 1;
            min-width: 120px;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            font-weight: 600;
        }
        .stat-card.red { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); color: var(--rose); }
        .stat-card.yellow { background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); color: var(--amber); }
        .stat-card.cyan { background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.25); color: var(--cyan); }
        .stat-card.blue { background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.25); color: #818cf8; }
        .stat-card .value { font-size: 28px; font-weight: 800; }
        .stat-card .label { font-size: 10px; text-transform: uppercase; margin-top: 2px; }
        
        .ai-glow-card {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%);
            border: 1px solid rgba(139, 92, 246, 0.2);
            position: relative;
        }
        .ai-title {
            color: var(--violet);
            border-left-color: var(--violet);
        }
        .visual-bars {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-top: 20px;
        }
        .bar-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            font-size: 13px;
        }
        .bar-label {
            width: 180px;
            font-weight: 600;
            color: var(--text-secondary);
        }
        .bar-track {
            flex-grow: 1;
            height: 12px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.02);
        }
        .bar-fill {
            height: 100%;
            border-radius: 6px;
        }
        .bar-val {
            width: 70px;
            text-align: right;
            font-weight: 700;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        th, td {
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 13px;
        }
        th {
            color: var(--text-secondary);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
        }
        .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .badge-danger { background: rgba(239, 68, 68, 0.15); color: var(--rose); border: 1px solid rgba(239, 68, 68, 0.3); }
        .badge-warning { background: rgba(245, 158, 11, 0.15); color: var(--amber); border: 1px solid rgba(245, 158, 11, 0.3); }
        .badge-success { background: rgba(16, 185, 129, 0.15); color: var(--emerald); border: 1px solid rgba(16, 185, 129, 0.3); }
        .badge-info { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
        
        ul {
            padding-left: 20px;
            margin-top: 10px;
        }
        li {
            margin-bottom: 6px;
            font-size: 13px;
            color: rgba(255, 255, 255, 0.85);
        }
        footer {
            text-align: center;
            color: var(--text-secondary);
            font-size: 12px;
            margin-top: 50px;
            border-top: 1px solid var(--card-border);
            padding-top: 20px;
        }
        @media print {
            body { background: #fff; color: #000; padding: 0; }
            .card { background: #fff; border: 1px solid #ddd; break-inside: avoid; color: #000; }
            .info-item { background: #f8fafc; border: 1px solid #eee; }
            .stat-card.red { background: #fef2f2; color: #b91c1c; }
            .stat-card.yellow { background: #fffbeb; color: #92400e; }
            .stat-card.cyan { background: #ecfeff; color: #0891b2; }
            .stat-card.blue { background: #e0e7ff; color: #4338ca; }
            th, td { border-bottom: 1px solid #ddd; color: #000; }
            li { color: #333; }
            header { color: #000; border: 1px solid #ddd; background: none; }
            .score-circle { color: #000; box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- HEADER -->
        <header>
            <div class="header-title">
                <h1>🔍 SEO Priority & Diagnostics Report</h1>
                <p>Website: <strong>${escapeXml(url)}</strong></p>
                <p>Generated: <strong>${escapeXml(formattedDate)}</strong></p>
            </div>
            <div class="score-box">
                <div style="text-align: right;">
                    <div style="font-size: 10px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Health Score</div>
                    <div style="font-size: 12px; font-weight: 600;">Weighted Optimization</div>
                </div>
                <div class="score-circle">${healthScore}</div>
            </div>
        </header>

        <!-- WEBSITE DETAILS -->
        <div class="card">
            <div class="card-title">📊 Website Information</div>
            <div class="info-grid">
                <div class="info-item"><label>Audited URL</label><span>${escapeXml(url)}</span></div>
                <div class="info-item"><label>Final Destination</label><span>${escapeXml(finalUrl)}</span></div>
                <div class="info-item"><label>HTTP Status Code</label><span>${statusCode}</span></div>
                <div class="info-item"><label>Response Speed</label><span>${resTime} ms</span></div>
            </div>
        </div>

        <!-- EXECUTIVE SUMMARY -->
        <div class="card">
            <div class="card-title">📝 SEO Priority Summary Dashboard</div>
            <div class="stats-row">
                <div class="stat-card red"><div class="value">${criticalCount}</div><div class="label">Critical Issues</div></div>
                <div class="stat-card yellow"><div class="value">${highCount}</div><div class="label">High Priority</div></div>
                <div class="stat-card cyan"><div class="value">${medCount}</div><div class="label">Medium Priority</div></div>
                <div class="stat-card blue"><div class="value">${lowCount}</div><div class="label">Low Priority</div></div>
            </div>
            <div style="font-size: 14px; margin-top: 15px;">
                <p>An automated technical audit has crawled and processed <strong>${escapeXml(url)}</strong>, scoring a Technical SEO rating of <strong>${techScore}/100</strong>, Performance Speed at <strong>${perfScore}/100</strong>, and On-Page Content structure at <strong>${onpageScore}/100</strong>. The overall calculated Website Health Score is <strong>${healthScore}/100</strong> based on ${priorityIssues.length} classified issues.</p>
            </div>
        </div>

        <!-- CHARTS / SVG METRIC BARS -->
        <div class="card">
            <div class="card-title">📈 Scores Dashboard</div>
            <div class="visual-bars">
                ${[
                  ["Technical SEO Health", techScore],
                  ["On-Page Content Health", onpageScore],
                  ["Desktop Score Average", results.desktop_score ?? 0],
                  ["Mobile Score Average", results.mobile_score ?? 0],
                  ["Desktop Performance Strategy", results.desktop?.performance ?? 0],
                  ["Mobile Performance Strategy", results.mobile?.performance ?? 0],
                  ["Desktop SEO Strategy", results.desktop?.seo ?? 0],
                  ["Mobile SEO Strategy", results.mobile?.seo ?? 0],
                  ["Desktop Accessibility Strategy", results.desktop?.accessibility ?? 0],
                  ["Mobile Accessibility Strategy", results.mobile?.accessibility ?? 0],
                  ["Desktop Best Practices Strategy", results.desktop?.best_practices ?? 0],
                  ["Mobile Best Practices Strategy", results.mobile?.best_practices ?? 0],
                  ["Image Optimization", results.image_seo_report?.image_seo_score ?? 0],
                  ["Internal Links Audit", results.link_analysis_report?.internal_link_score ?? 0],
                  ["External Links Audit", results.link_analysis_report?.external_link_score ?? 0],
                  ["Schema Structured Data", results.schema_analysis_report?.schema_score ?? 0]
                ].map(([lbl, val]) => `
                <div class="bar-item">
                    <div class="bar-label">${lbl}</div>
                    <div class="bar-track">
                        <div class="bar-fill" style="width: ${val}%; background-color: ${val >= 90 ? 'var(--emerald)' : val >= 50 ? 'var(--amber)' : 'var(--rose)'};"></div>
                    </div>
                    <div class="bar-val">${val}/100</div>
                </div>
                `).join("")}
            </div>
        </div>

        <!-- AI ADVISOR INSIGHTS -->
        ${aiAnalysis.explanation ? `
        <div class="card ai-glow-card">
            <div class="card-title ai-title">🤖 AI Advisor Recommendations (GPT-4o)</div>
            <div style="font-size: 13px; margin-bottom: 15px;">
                <strong>Priority Action:</strong> <span class="badge badge-danger">${escapeXml(aiAnalysis.priority || 'N/A').toUpperCase()}</span>
                <p style="margin-top: 8px; font-weight: 500;">${escapeXml(aiAnalysis.explanation)}</p>
            </div>
            <strong>Actionable Directives:</strong>
            <ul>
                ${formatListItems(aiAnalysis.recommendations)}
            </ul>
        </div>
        ` : ""}

        <!-- AI CONTENT OPTIMIZATION -->
        ${aiContent.better_seo_title ? `
        <div class="card">
            <div class="card-title">✨ AI Content Strategy Recommendations</div>
            <div class="info-grid" style="grid-template-columns: 1fr; margin-bottom: 20px;">
                <div class="info-item"><label>Suggested Page Title</label><span>${escapeXml(aiContent.better_seo_title)}</span></div>
                <div class="info-item"><label>Suggested Meta Description</label><span>${escapeXml(aiContent.better_meta_description)}</span></div>
            </div>
            <div style="margin-bottom: 15px;">
                <strong>Missing Topics to Cover:</strong>
                <ul>
                    ${formatListItems(aiContent.missing_topics)}
                </ul>
            </div>
            <div>
                <strong>Content Improvement Tips:</strong>
                <ul>
                    ${formatListItems(aiContent.content_improvement_tips)}
                </ul>
            </div>
        </div>
        ` : ""}

        <!-- DETAILED ISSUES & CHECKS -->
        <div class="card">
            <div class="card-title">🔍 Prioritized Issues & Fix Directives</div>
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th style="width: 110px;">Priority</th>
                            <th style="width: 140px;">Category</th>
                            <th>Issue & Action Plan</th>
                            <th style="width: 100px;">Difficulty</th>
                            <th style="width: 100px;">Fix Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${issueRowsHtml}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- PERSONALIZED SEO ACTION PLAN -->
        ${actionPlan ? `
        <div class="card">
            <div class="card-title">📋 Personalized SEO Action Plan</div>
            <div style="margin-bottom: 20px; font-size: 14px;">
                <strong>Estimated SEO Improvement:</strong> <span class="badge badge-success" style="font-size: 11px; padding: 4px 10px;">${escapeXml(actionPlan.estimated_seo_improvement)}</span>
                <span style="margin-left: 20px;"><strong>Estimated Completion Time:</strong> <strong>${escapeXml(actionPlan.estimated_completion_time)}</strong></span>
            </div>
            
            <div class="info-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 25px;">
                <div class="info-item" style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.15);">
                    <div style="font-weight: 700; color: var(--rose); text-transform: uppercase; font-size: 11px; margin-bottom: 8px;">📅 Action: Today</div>
                    <ul style="padding-left: 15px; margin-top: 5px; list-style-type: square;">
                        ${formatActionPlanTasks(actionPlan.today)}
                    </ul>
                </div>
                <div class="info-item" style="background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.15);">
                    <div style="font-weight: 700; color: var(--amber); text-transform: uppercase; font-size: 11px; margin-bottom: 8px;">📅 Action: This Week</div>
                    <ul style="padding-left: 15px; margin-top: 5px; list-style-type: square;">
                        ${formatActionPlanTasks(actionPlan.this_week)}
                    </ul>
                </div>
                <div class="info-item" style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.15);">
                    <div style="font-weight: 700; color: var(--emerald); text-transform: uppercase; font-size: 11px; margin-bottom: 8px;">📅 Action: This Month</div>
                    <ul style="padding-left: 15px; margin-top: 5px; list-style-type: square;">
                        ${formatActionPlanTasks(actionPlan.this_month)}
                    </ul>
                </div>
            </div>
            
            <div style="margin-bottom: 20px; font-size: 13.5px;">
                <strong>⚡ Quick Wins:</strong>
                <ul style="margin-top: 8px; padding-left: 20px;">
                    ${formatActionPlanBullets(actionPlan.quick_wins)}
                </ul>
            </div>
            
            <div style="margin-bottom: 20px; font-size: 13.5px;">
                <strong>🚀 High Impact Tasks:</strong>
                <ul style="margin-top: 8px; padding-left: 20px;">
                    ${formatActionPlanBullets(actionPlan.high_impact_tasks)}
                </ul>
            </div>
            
            <div style="font-size: 13.5px;">
                <strong>📈 Long Term Improvements:</strong>
                <ul style="margin-top: 8px; padding-left: 20px;">
                    ${formatActionPlanBullets(actionPlan.long_term_improvements)}
                </ul>
            </div>
        </div>
        ` : ""}

        <!-- CONTENT ANALYZER & OPTIMIZER -->
        ${contentAnalysis ? `
        <div class="card">
            <div class="card-title">🧠 Content Analyzer & Optimizer</div>
            <div class="info-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
                <div class="info-item" style="text-align:center;">
                    <div style="font-size: 28px; font-weight: 800; color: var(--indigo);">${contentAnalysis.detections?.low_readability?.score ?? 'N/A'}</div>
                    <div style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary);">Readability Score</div>
                    <div style="font-size: 12px; margin-top: 4px;">${escapeXml(contentAnalysis.detections?.low_readability?.level || '')}</div>
                </div>
                <div class="info-item" style="text-align:center;">
                    <div style="font-size: 28px; font-weight: 800; color: var(--indigo);">${contentAnalysis.detections?.low_semantic_coverage?.score ?? 'N/A'}</div>
                    <div style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary);">Semantic Coverage</div>
                    <div style="font-size: 12px; margin-top: 4px;">${escapeXml(contentAnalysis.detections?.low_semantic_coverage?.status || '')}</div>
                </div>
                <div class="info-item" style="text-align:center;">
                    <div style="font-size: 28px; font-weight: 800; color: ${contentAnalysis.detections?.thin_content?.is_detected ? 'var(--rose)' : 'var(--emerald)'};">${contentAnalysis.detections?.thin_content?.word_count ?? 'N/A'}</div>
                    <div style="font-size: 11px; text-transform: uppercase; color: var(--text-secondary);">Word Count</div>
                    <div style="font-size: 12px; margin-top: 4px;">${contentAnalysis.detections?.thin_content?.is_detected ? 'Thin Content ⚠️' : 'Good Content'}</div>
                </div>
            </div>
            <div class="info-grid" style="grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div class="info-item">
                    <div style="font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; color: var(--text-secondary);">🔍 Missing Topics</div>
                    <ul style="padding-left: 16px; font-size: 12px; margin: 0;">
                        ${formatContentDetectionList(contentAnalysis.detections?.missing_topics)}
                    </ul>
                </div>
                <div class="info-item">
                    <div style="font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; color: var(--text-secondary);">🔑 Missing Keywords</div>
                    <ul style="padding-left: 16px; font-size: 12px; margin: 0;">
                        ${formatContentDetectionList(contentAnalysis.detections?.missing_keywords)}
                    </ul>
                </div>
                <div class="info-item">
                    <div style="font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; color: var(--text-secondary);">📋 Topic Suggestions</div>
                    <ul style="padding-left: 16px; font-size: 12px; margin: 0;">
                        ${formatContentDetectionList(contentAnalysis.generations?.topic_suggestions)}
                    </ul>
                </div>
                <div class="info-item">
                    <div style="font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 8px; color: var(--text-secondary);">❓ FAQ Suggestions</div>
                    <ul style="padding-left: 16px; font-size: 12px; margin: 0; list-style: none;">
                        ${formatFaqList(contentAnalysis.generations?.faq_suggestions)}
                    </ul>
                </div>
            </div>
        </div>
        ` : ""}

        <!-- FOOTER -->
        <footer>
            <p>Report Compiled by AI SEO Audit Tool. Copyright &copy; 2026. All rights reserved.</p>
        </footer>
    </div>
</body>
</html>`;
}

async function generatePdfReport(results, formattedDate) {
  const html = generateHtmlReport(results, formattedDate);
  
  console.log("[ReportGenerator] Printing PDF report using Playwright headless page...");
  let browserInstance = null;
  try {
    browserInstance = await chromium.launch({
      headless: true,
      args: ["--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage"]
    });

    const page = await browserInstance.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
        right: '0.5in'
      },
      printBackground: true
    });

    return pdfBuffer;
  } finally {
    if (browserInstance) {
      await browserInstance.close();
    }
  }
}

module.exports = { generateCsvReport, generateHtmlReport, generatePdfReport };
