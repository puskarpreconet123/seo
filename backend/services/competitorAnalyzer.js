const axios = require('axios');
const { prisma } = require('../db/client.js');
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
const { settings } = require('../config/settings');
const OpenAI = require('openai');

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
};

async function checkRobotsAllowance(url) {
  try {
    const parsed = new URL(url);
    const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`;

    const res = await axios.get(robotsUrl, {
      headers: BROWSER_HEADERS,
      timeout: 5000,
      validateStatus: () => true
    });

    if (res.status === 200) {
      const lines = res.data.split(/\r?\n/);
      let inWildcardSection = false;
      const path = parsed.pathname + parsed.search;

      for (const line of lines) {
        const clean = line.trim().replace(/#.*/, '').trim();
        if (!clean) continue;

        const parts = clean.split(':');
        const key = parts[0].trim().toLowerCase();
        const value = parts.slice(1).join(':').trim();

        if (key === 'user-agent') {
          inWildcardSection = (value === '*');
        } else if (inWildcardSection) {
          if (key === 'disallow') {
            if (!value) continue;
            const regexStr = '^' + value
              .replace(/[-[\]{}()+.,^$|#\s]/g, '\\$&')
              .replace(/\*/g, '.*')
              .replace(/\?/g, '.');
            const regex = new RegExp(regexStr);
            if (regex.test(path)) {
              console.log(`Robots.txt check for ${url}: disallowed`);
              return false;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Failed to fetch/parse robots.txt for ${url}: ${err.message}. Defaulting to true (allowed).`);
  }
  return true;
}

async function auditSingleUrl(url) {
  // 1. Create trace record in DB
  const newAudit = await prisma.audit.create({
    data: {
      url: url,
      status: "pending"
    }
  });

  const newAuditId = newAudit.id;
  console.info(`Competitor Audit: Created trace record ${newAuditId} for ${url}`);

  // 2. Crawl
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
  let seoActionPlan = null;

  if (crawlResult.success && crawlResult.html) {
    try {
      const baseUrl = crawlResult.final_url || url;
      seoData = parseSeoElements(crawlResult.html, baseUrl);
      console.info(`Competitor Audit ${url}: Successfully extracted SEO elements.`);

      crawlResult.seo_data = seoData;

      const resultsTemp = { seo_data: seoData, requested_url: url };
      const h1s = seoData.headings?.h1 || [];
      const primaryH1 = h1s[0] || null;

      // Concurrency Group 1
      console.info(`Competitor Audit ${url}: Starting Concurrency Group 1...`);
      const group1Results = await Promise.all([
        runSeoEvaluation(crawlResult, seoData).catch(err => {
          console.error(`Comp Audit Group 1 SEO eval failed:`, err);
          return { passed: [], warnings: [], critical: [] };
        }),
        runImageSeoAnalysis(seoData, baseUrl).catch(err => {
          console.error(`Comp Audit Group 1 Image SEO failed:`, err);
          return null;
        }),
        runLinkAnalysis(seoData, baseUrl).catch(err => {
          console.error(`Comp Audit Group 1 Link analysis failed:`, err);
          return null;
        }),
        runSchemaAnalysis(seoData).catch(err => {
          console.error(`Comp Audit Group 1 Schema analysis failed:`, err);
          return null;
        }),
        runRobotsSitemapAnalysis(baseUrl).catch(err => {
          console.error(`Comp Audit Group 1 Robots/Sitemap failed:`, err);
          return null;
        }),
        runPerformanceAnalysis(crawlResult.html, baseUrl, crawlResult.response_time_ms).catch(err => {
          console.error(`Comp Audit Group 1 Performance failed:`, err);
          return null;
        }),
        generateAiKeywordIdeas(seoData.title, seoData.meta_description, primaryH1, seoData.page_content).catch(err => {
          console.error(`Comp Audit Group 1 Keyword ideas failed:`, err);
          return null;
        }),
        runContentAnalysis(resultsTemp).catch(err => {
          console.error(`Comp Audit Group 1 Content analysis failed:`, err);
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
      console.info(`Competitor Audit ${url}: Concurrency Group 1 complete.`);

      const scoreRes = calculateSeoScoreReport(seoReport);
      seoScore = scoreRes[0];
      issueSummary = scoreRes[1];
      technicalScore = seoScore;

      onpageReport = runOnpageAnalysis(seoData, crawlResult);

      // Concurrency Group 2
      console.info(`Competitor Audit ${url}: Starting Concurrency Group 2...`);
      const group2Results = await Promise.all([
        generateAiSeoOptimizations(seoScore, seoData, seoReport).catch(err => {
          console.error(`Comp Audit Group 2 AI opts failed:`, err);
          return null;
        }),
        generateAiContentOptimization(seoData.title, seoData.meta_description, primaryH1, seoData.headings, seoData.page_content, seoReport).catch(err => {
          console.error(`Comp Audit Group 2 Content opts failed:`, err);
          return null;
        })
      ]);

      aiAnalysis = group2Results[0];
      aiContentOptimization = group2Results[1];
      console.info(`Competitor Audit ${url}: Concurrency Group 2 complete.`);

    } catch (err) {
      console.error(`Competitor Audit processing phase failed for ${url}:`, err);
    }
  }

  crawlResult.seo_data = seoData;
  crawlResult.seo_report = seoReport;
  crawlResult.seo_score = seoScore;
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

  // Health Score / Priority Engine
  const priorityRes = runPriorityEngine(crawlResult);
  crawlResult.health_score = priorityRes.health_score;
  crawlResult.priority_issues = priorityRes.priority_issues;
  crawlResult.seo_score = priorityRes.health_score;

  // Concurrency Group 3: Action plan
  try {
    seoActionPlan = await generateAiSeoActionPlan(crawlResult);
  } catch (err) {
    console.error(`Competitor Audit Action plan failed for ${url}:`, err);
  }
  crawlResult.seo_action_plan = seoActionPlan;

  // 4. Save results back to database
  const finalStatus = crawlResult.success ? "completed" : "failed";
  await prisma.audit.update({
    where: { id: newAuditId },
    data: {
      status: finalStatus,
      results: crawlResult
    }
  });

  console.info(`Competitor Audit: Updated trace record ${newAuditId} as ${finalStatus}`);
  return crawlResult;
}

function compareMetrics(primary, competitor) {
  function getVal(d, ...keys) {
    let curr = d;
    for (const k of keys) {
      if (!curr || typeof curr !== 'object') return null;
      curr = curr[k];
      if (curr === undefined || curr === null) return null;
    }
    return curr;
  }

  function highWinner(p, c) {
    if (p === null && c === null) return "tie";
    if (p === null) return "competitor";
    if (c === null) return "primary";
    return p > c ? "primary" : (p < c ? "competitor" : "tie");
  }

  function lowWinner(p, c) {
    if (p === null && c === null) return "tie";
    if (p === null) return "competitor";
    if (c === null) return "primary";
    return p < c ? "primary" : (p > c ? "competitor" : "tie");
  }

  const pSeo = getVal(primary, "seo_score") ?? 0;
  const pPerf = getVal(primary, "performance_report", "performance_score") ?? 0;
  const pOnpage = getVal(primary, "onpage_report", "onpage_score") ?? 0;
  const pTech = getVal(primary, "technical_score") ?? getVal(primary, "seo_score") ?? 0;

  const pImagesCount = (getVal(primary, "seo_data", "images") || []).length;
  const pImagesMissingAlt = getVal(primary, "image_seo_report", "statistics", "missing_alt_count") ?? 0;
  const pImagesScore = getVal(primary, "image_seo_report", "image_seo_score") ?? 0;

  const pInternalCount = (getVal(primary, "seo_data", "internal_links") || []).length;
  const pInternalScore = getVal(primary, "link_analysis_report", "internal_link_score") ?? 0;

  const pExternalCount = (getVal(primary, "seo_data", "external_links") || []).length;
  const pExternalScore = getVal(primary, "link_analysis_report", "external_link_score") ?? 0;

  const pSchemaScore = getVal(primary, "schema_analysis_report", "schema_score") ?? 0;
  const pSchemaLd = getVal(primary, "schema_analysis_report", "statistics", "json_ld") ?? 0;
  const pSchemaMd = getVal(primary, "schema_analysis_report", "statistics", "microdata") ?? 0;

  const pTitle = getVal(primary, "seo_data", "title");
  const pDesc = getVal(primary, "seo_data", "meta_description");
  const pCanonical = getVal(primary, "seo_data", "canonical");
  const pH1 = getVal(primary, "seo_data", "headings", "h1") || [];

  const cSeo = getVal(competitor, "seo_score") ?? 0;
  const cPerf = getVal(competitor, "performance_report", "performance_score") ?? 0;
  const cOnpage = getVal(competitor, "onpage_report", "onpage_score") ?? 0;
  const cTech = getVal(competitor, "technical_score") ?? getVal(competitor, "seo_score") ?? 0;

  const cImagesCount = (getVal(competitor, "seo_data", "images") || []).length;
  const cImagesMissingAlt = getVal(competitor, "image_seo_report", "statistics", "missing_alt_count") ?? 0;
  const cImagesScore = getVal(competitor, "image_seo_report", "image_seo_score") ?? 0;

  const cInternalCount = (getVal(competitor, "seo_data", "internal_links") || []).length;
  const cInternalScore = getVal(competitor, "link_analysis_report", "internal_link_score") ?? 0;

  const cExternalCount = (getVal(competitor, "seo_data", "external_links") || []).length;
  const cExternalScore = getVal(competitor, "link_analysis_report", "external_link_score") ?? 0;

  const cSchemaScore = getVal(competitor, "schema_analysis_report", "schema_score") ?? 0;
  const cSchemaLd = getVal(competitor, "schema_analysis_report", "statistics", "json_ld") ?? 0;
  const cSchemaMd = getVal(competitor, "schema_analysis_report", "statistics", "microdata") ?? 0;

  const cTitle = getVal(competitor, "seo_data", "title");
  const cDesc = getVal(competitor, "seo_data", "meta_description");
  const cCanonical = getVal(competitor, "seo_data", "canonical");
  const cH1 = getVal(competitor, "seo_data", "headings", "h1") || [];

  return {
    seo_score: { primary: pSeo, competitor: cSeo, winner: highWinner(pSeo, cSeo) },
    performance_score: { primary: pPerf, competitor: cPerf, winner: highWinner(pPerf, cPerf) },
    onpage_score: { primary: pOnpage, competitor: cOnpage, winner: highWinner(pOnpage, cOnpage) },
    technical_score: { primary: pTech, competitor: cTech, winner: highWinner(pTech, cTech) },

    images: {
      primary_count: pImagesCount, competitor_count: cImagesCount, winner_count: "tie",
      primary_missing_alt: pImagesMissingAlt, competitor_missing_alt: cImagesMissingAlt, winner_alt: lowWinner(pImagesMissingAlt, cImagesMissingAlt),
      primary_score: pImagesScore, competitor_score: cImagesScore, winner_score: highWinner(pImagesScore, cImagesScore)
    },
    internal_links: {
      primary_count: pInternalCount, competitor_count: cInternalCount, winner_count: "tie",
      primary_score: pInternalScore, competitor_score: cInternalScore, winner_score: highWinner(pInternalScore, cInternalScore)
    },
    external_links: {
      primary_count: pExternalCount, competitor_count: cExternalCount, winner_count: "tie",
      primary_score: pExternalScore, competitor_score: cExternalScore, winner_score: highWinner(pExternalScore, cExternalScore)
    },
    schema: {
      primary_score: pSchemaScore, competitor_score: cSchemaScore, winner_score: highWinner(pSchemaScore, cSchemaScore),
      primary_ld: pSchemaLd, competitor_ld: cSchemaLd,
      primary_md: pSchemaMd, competitor_md: cSchemaMd
    },
    meta_tags: {
      primary_title: pTitle || "Missing Title", competitor_title: cTitle || "Missing Title",
      primary_title_len: pTitle ? pTitle.length : 0, competitor_title_len: cTitle ? cTitle.length : 0,
      primary_desc: pDesc || "Missing Description", competitor_desc: cDesc || "Missing Description",
      primary_desc_len: pDesc ? pDesc.length : 0, competitor_desc_len: cDesc ? cDesc.length : 0,
      primary_canonical: pCanonical || "Missing Canonical Tag", competitor_canonical: cCanonical || "Missing Canonical Tag",
      winner_meta: (pTitle && pDesc && pCanonical) && !(cTitle && cDesc && cCanonical) ? "primary" : ((cTitle && cDesc && cCanonical) && !(pTitle && pDesc && pCanonical) ? "competitor" : "tie")
    },
    heading_structure: {
      primary_h1_present: pH1.length > 0, competitor_h1_present: cH1.length > 0,
      primary_h1_text: pH1[0] || "(No H1 Tag)", competitor_h1_text: cH1[0] || "(No H1 Tag)",
      primary_h2_count: (getVal(primary, "seo_data", "headings", "h2") || []).length, competitor_h2_count: (getVal(competitor, "seo_data", "headings", "h2") || []).length,
      primary_h3_count: (getVal(primary, "seo_data", "headings", "h3") || []).length, competitor_h3_count: (getVal(competitor, "seo_data", "headings", "h3") || []).length,
      winner_headings: highWinner(pH1.length, cH1.length)
    }
  };
}

function generateMockCompetitorComparison(primary, competitor, comparisonData) {
  const pUrl = primary.requested_url || "Primary Site";
  const cUrl = competitor.requested_url || "Competitor Site";

  const pScore = comparisonData.seo_score.primary;
  const cScore = comparisonData.seo_score.competitor;
  const winnerOverall = comparisonData.seo_score.winner;

  let winnerReason = "";
  if (winnerOverall === "primary") {
    winnerReason = `The Primary site (${pUrl}) wins overall with a stronger technical SEO score of ${pScore} compared to the Competitor site's score of ${cScore}. The primary site maintains better tag structures and link structures.`;
  } else if (winnerOverall === "competitor") {
    winnerReason = `The Competitor site (${cUrl}) wins overall with a technical SEO score of ${cScore} versus the Primary site's score of ${pScore}. The competitor site demonstrates better optimizations across indexability and loading speeds.`;
  } else {
    winnerReason = `Both websites ended in a technical tie with matching SEO scores of ${pScore}/100. Each site excels in separate elements while leaving room for improvements.`;
  }

  const betterSeoPractices = [];
  if (comparisonData.performance_score.winner === "primary") {
    betterSeoPractices.push(`Primary site has optimized page performance speeds (${comparisonData.performance_score.primary}/100).`);
  } else if (comparisonData.performance_score.winner === "competitor") {
    betterSeoPractices.push(`Competitor site maintains faster page load metrics (${comparisonData.performance_score.competitor}/100).`);
  }

  if (comparisonData.images.winner_alt === "primary") {
    betterSeoPractices.push("Primary site has higher alternate image description compliance (fewer missing alt tags).");
  } else if (comparisonData.images.winner_alt === "competitor") {
    betterSeoPractices.push("Competitor site exhibits better alternate tag configurations for search image indexers.");
  }

  if (comparisonData.schema.winner_score === "primary") {
    betterSeoPractices.push("Primary site features advanced Schema structured markup, facilitating rich snippets.");
  } else if (comparisonData.schema.winner_score === "competitor") {
    betterSeoPractices.push("Competitor site deploys richer JSON-LD schema definitions.");
  }

  if (betterSeoPractices.length === 0) {
    betterSeoPractices.push(
      "Both sites maintain clean canonical tags defining search boundaries.",
      "Title and Meta Description tags are largely present on both platforms.",
      "Heading structures deploy logical layout boundaries for screen readers."
    );
  }

  const missingElementsPrimary = [];
  const missingElementsCompetitor = [];

  if (!comparisonData.heading_structure.primary_h1_present) {
    missingElementsPrimary.push("Primary H1 Heading Tag (Critical for defining core page context).");
  }
  if (!comparisonData.heading_structure.competitor_h1_present) {
    missingElementsCompetitor.push("Competitor H1 Heading Tag (Omitted from page markup).");
  }

  if (comparisonData.meta_tags.primary_title_len === 0) {
    missingElementsPrimary.push("Primary HTML `<title>` tag.");
  }
  if (comparisonData.meta_tags.competitor_title_len === 0) {
    missingElementsCompetitor.push("Competitor HTML `<title>` tag.");
  }

  if (comparisonData.meta_tags.primary_desc_len === 0) {
    missingElementsPrimary.push("Primary Meta Description tag (limits CTR click rates).");
  }
  if (comparisonData.meta_tags.competitor_desc_len === 0) {
    missingElementsCompetitor.push("Competitor Meta Description tag.");
  }

  if (!primary.seo_data?.canonical) {
    missingElementsPrimary.push("Primary Canonical Tag (Could cause duplicate content penalties).");
  }
  if (!competitor.seo_data?.canonical) {
    missingElementsCompetitor.push("Competitor Canonical Tag.");
  }

  if (comparisonData.schema.primary_score === 0) {
    missingElementsPrimary.push("JSON-LD or Microdata structured Schema markings.");
  }
  if (comparisonData.schema.competitor_score === 0) {
    missingElementsCompetitor.push("JSON-LD or Microdata structured Schema markings.");
  }

  if (missingElementsPrimary.length === 0) missingElementsPrimary.push("No major missing technical elements found on the primary site.");
  if (missingElementsCompetitor.length === 0) missingElementsCompetitor.push("No major missing technical elements found on the competitor site.");

  const suggestionsToOutperform = [];
  if (comparisonData.performance_score.competitor > comparisonData.performance_score.primary) {
    suggestionsToOutperform.push(`Optimize page performance from ${comparisonData.performance_score.primary} to match/exceed competitor's speed of ${comparisonData.performance_score.competitor}. Defer non-critical scripts and minify HTML assets.`);
  } else {
    suggestionsToOutperform.push("Further improve TTFB (Time to First Byte) latency metrics by leveraging distributed CDN caching.");
  }

  if (comparisonData.images.primary_missing_alt > 0) {
    suggestionsToOutperform.push(`Add alt attributes to the ${comparisonData.images.primary_missing_alt} images currently missing alternative text, especially if competitor (${comparisonData.images.competitor_missing_alt} missing) is outperforming in Image SEO.`);
  }

  if (comparisonData.schema.primary_score < 80) {
    suggestionsToOutperform.push("Expand structured schema coverage by injecting rich JSON-LD configurations like Organization, WebSite, and local business information tags.");
  }

  if (!comparisonData.heading_structure.primary_h1_present) {
    suggestionsToOutperform.push("Inject a single H1 tag at the top of the body layout containing your target primary keyword.");
  } else if (comparisonData.heading_structure.primary_h2_count < comparisonData.heading_structure.competitor_h2_count) {
    suggestionsToOutperform.push("Create additional descriptive subheadings (H2/H3 elements) to match the semantic topical outline density of the competitor's site.");
  }

  suggestionsToOutperform.push("Conduct semantic keyword expansion to enrich content with related terms found on competitor page outlines.");
  suggestionsToOutperform.push("Build internal anchor networks pointing towards your main auditing pages to raise contextual visibility.");

  return {
    winner_overall: winnerOverall,
    winner_reason: winnerReason,
    better_seo_practices: betterSeoPractices,
    missing_elements_primary: missingElementsPrimary,
    missing_elements_competitor: missingElementsCompetitor,
    suggestions_to_outperform: suggestionsToOutperform
  };
}

async function generateCompetitorComparisonAi(primary, competitor, comparisonData) {
  const apiKey = settings.openaiApiKey;
  const isMock = !apiKey || apiKey === "your_openai_api_key_here" || apiKey.trim() === "";

  if (isMock) {
    console.warn("OPENAI_API_KEY is not configured or placeholder. Using competitor local simulation fallback.");
    return generateMockCompetitorComparison(primary, competitor, comparisonData);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const systemInstruction = (
      "You are an elite competitive intelligence SEO analyst. Compare the technical and content SEO metrics of the Primary Website and the Competitor Website.\n" +
      "You must output a JSON object containing exactly the following properties:\n" +
      "1. 'winner_overall': A string indicating who wins overall ('primary', 'competitor', or 'tie').\n" +
      "2. 'winner_reason': A brief paragraph explaining why the winner was chosen based on their strengths and weaknesses.\n" +
      "3. 'better_seo_practices': A list of 3-5 specific SEO best practices observed on either site (e.g. 'Primary site uses Schema markup effectively', 'Competitor site maintains optimal page load speed').\n" +
      "4. 'missing_elements_primary': A list of SEO elements present on the competitor site but missing or poorly implemented on the primary site.\n" +
      "5. 'missing_elements_competitor': A list of SEO elements present on the primary site but missing or poorly implemented on the competitor site.\n" +
      "6. 'suggestions_to_outperform': A list of 4-6 highly specific, actionable, and prioritize-ordered steps for the Primary website to implement to outperform the Competitor website."
    );

    const userContent = (
      `Primary Webpage: ${primary.requested_url}\n` +
      `Competitor Webpage: ${competitor.requested_url}\n` +
      `Side-By-Side Comparison Raw Data:\n${JSON.stringify(comparisonData, null, 2)}`
    );

    console.info("Sending competitor comparison completions request to OpenAI (model: gpt-4o)...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userContent }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 800
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    const requiredKeys = ["winner_overall", "winner_reason", "better_seo_practices", "missing_elements_primary", "missing_elements_competitor", "suggestions_to_outperform"];
    for (const key of requiredKeys) {
      if (!(key in parsed)) {
        throw new Error(`OpenAI JSON competitor response is missing required property: ${key}`);
      }
    }
    return parsed;

  } catch (err) {
    console.error(`OpenAI competitor comparison generation failed: ${err.message}. Falling back to simulation.`);
    return generateMockCompetitorComparison(primary, competitor, comparisonData);
  }
}

module.exports = { checkRobotsAllowance, auditSingleUrl, compareMetrics, generateCompetitorComparisonAi };
