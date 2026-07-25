const url = require('url');

const ONPAGE_WEIGHTS = {
  "Title Length":             8.0,
  "Meta Description Length":  6.0,
  "URL Structure":            5.0,
  "H1 Count":                 8.0,
  "H2 Hierarchy":             4.0,
  "Heading Order":            4.0,
  "Keyword in Title":         10.0,
  "Keyword in H1":            8.0,
  "Keyword in First Para":    6.0,
  "Keyword Density":          5.0,
  "Content Length":           8.0,
  "Thin Content":             6.0,
  "Duplicate Title":          5.0,
  "Duplicate Meta":           4.0,
  "Duplicate H1":             4.0,
  "Internal Links":           6.0,
  "External Links":           3.0,
  "Anchor Text Quality":      5.0,
};

function extractPrimaryKeyword(seoData) {
  const h1s = seoData.headings?.h1 || [];
  const title = seoData.title || "";

  const candidate = h1s[0] || title;
  if (!candidate) return "";

  const stopwords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "to", "of",
    "and", "or", "in", "on", "at", "for", "with", "by", "from",
    "this", "that", "it", "be", "as", "at", "so", "if", "but"
  ]);

  const words = (candidate.toLowerCase().match(/[a-zA-Z]{3,}/g) || []);
  const keywords = words.filter(w => !stopwords.has(w)).slice(0, 3);
  return keywords.length > 0 ? keywords.join(" ") : candidate.toLowerCase().slice(0, 30);
}

function kwInText(keyword, text) {
  if (!keyword || !text) return false;
  const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(escaped, 'i');
  if (regex.test(text)) return true;
  const kwWords = keyword.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (kwWords.length >= 2) {
    const textLower = text.toLowerCase();
    const matchCount = kwWords.filter(w => textLower.includes(w)).length;
    return matchCount >= Math.ceil(kwWords.length * 0.6);
  }
  return false;
}

function keywordDensity(keyword, content) {
  if (!keyword || !content) return 0.0;
  const words = content.toLowerCase().split(/\s+/).filter(Boolean);
  const total = words.length;
  if (total === 0) return 0.0;
  
  const kwWords = keyword.toLowerCase().split(/\s+/).filter(Boolean);
  if (kwWords.length === 0) return 0.0;

  let count = 0;
  for (let i = 0; i <= words.length - kwWords.length; i++) {
    let match = true;
    for (let j = 0; j < kwWords.length; j++) {
      if (words[i + j] !== kwWords[j]) {
        match = false;
        break;
      }
    }
    if (match) count++;
  }
  return Math.round((count / total) * 100 * 100) / 100;
}

function runOnpageAnalysis(seoData, crawlResult) {
  const passed = [];
  const warnings = [];
  const critical = [];

  let score = 100.0;

  function _pass(check, msg) {
    passed.push({ check_name: check, message: msg });
  }

  function _warn(check, msg) {
    const weight = ONPAGE_WEIGHTS[check] || 0.0;
    score -= weight * 0.5;
    warnings.push({ check_name: check, message: msg });
  }

  function _crit(check, msg) {
    const weight = ONPAGE_WEIGHTS[check] || 0.0;
    score -= weight;
    critical.push({ check_name: check, message: msg });
  }

  const title = seoData.title || "";
  const metaDesc = seoData.meta_description || "";
  const headings = seoData.headings || { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
  const h1s = headings.h1 || [];
  const h2s = headings.h2 || [];
  const internalLinks = seoData.internal_links || [];
  const externalLinks = seoData.external_links || [];
  const wordCount = seoData.word_count || 0;
  const pageContent = seoData.page_content || "";
  const finalUrl = crawlResult.final_url || crawlResult.requested_url || "";

  const primaryKeyword = extractPrimaryKeyword(seoData);
  console.log(`[OnPage] Primary keyword detected: '${primaryKeyword}'`);

  // 1. Title Length
  const titleLen = title.length;
  if (!title) {
    _crit("Title Length", "Page title is missing — a critical on-page SEO element.");
  } else if (titleLen < 30) {
    _warn("Title Length", `Title too short (${titleLen} chars). Aim for 30–60 characters. Current: '${title}'`);
  } else if (titleLen > 60) {
    _warn("Title Length", `Title too long (${titleLen} chars). May be truncated in SERPs. Aim for 30–60 characters.`);
  } else {
    _pass("Title Length", `Title length is optimal (${titleLen} chars, within 30–60 range).`);
  }

  // 2. Meta Description Length
  const descLen = metaDesc.length;
  if (!metaDesc) {
    _crit("Meta Description Length", "Meta description is missing — search engines may auto-generate poor snippets.");
  } else if (descLen < 120) {
    _warn("Meta Description Length", `Meta description too short (${descLen} chars). Aim for 120–160 characters for full SERP display.`);
  } else if (descLen > 160) {
    _warn("Meta Description Length", `Meta description too long (${descLen} chars). Will be cut off in SERPs. Keep under 160 characters.`);
  } else {
    _pass("Meta Description Length", `Meta description length is optimal (${descLen} chars).`);
  }

  // 3. URL Structure
  let path = "/";
  let query = "";
  try {
    const parsed = new URL(finalUrl);
    path = parsed.pathname;
    query = parsed.search;
  } catch (err) {}

  const urlIssues = [];
  if (path.includes("_")) {
    urlIssues.push("underscores detected (use hyphens instead)");
  }
  if (/[A-Z]/.test(path)) {
    urlIssues.push("uppercase letters detected (use lowercase)");
  }
  if (query) {
    urlIssues.push(`query parameters present (?${query.slice(1, 41)})`);
  }
  if (finalUrl.length > 100) {
    urlIssues.push(`URL very long (${finalUrl.length} chars, aim <100)`);
  }

  if (urlIssues.length > 0) {
    _warn("URL Structure", `URL structure issues: ${urlIssues.join("; ")}. Clean URLs improve crawlability and CTR.`);
  } else {
    _pass("URL Structure", "URL structure is clean — lowercase, hyphenated, no query parameters.");
  }

  // 4. H1 Count
  const h1Count = h1s.length;
  if (h1Count === 0) {
    _crit("H1 Count", "No H1 tag found. Every page must have exactly one H1 expressing the main topic.");
  } else if (h1Count > 1) {
    _warn("H1 Count", `Multiple H1 tags found (${h1Count}). Use exactly one H1 to maintain clear topical focus.`);
  } else {
    _pass("H1 Count", `Exactly one H1 tag found: '${h1s[0].slice(0, 60)}'.`);
  }

  // 5. H2 Hierarchy
  if (h1Count >= 1 && h2s.length === 0) {
    _warn("H2 Hierarchy", "No H2 headings found. Use H2 tags to organize content into sections for better scannability.");
  } else if (h1Count >= 1) {
    _pass("H2 Hierarchy", `H2 headings present (${h2s.length} found) — content is organized into sections.`);
  } else {
    _warn("H2 Hierarchy", "Cannot verify H2 hierarchy — H1 tag is missing.");
  }

  // 6. Heading Order
  const levelsPresent = [];
  for (let i = 1; i <= 6; i++) {
    if ((headings[`h${i}`] || []).length > 0) {
      levelsPresent.push(i);
    }
  }
  const skipped = [];
  for (const lvl of levelsPresent) {
    if (lvl > 1 && !levelsPresent.includes(lvl - 1)) {
      skipped.push(`H${lvl}`);
    }
  }

  if (skipped.length > 0) {
    _warn("Heading Order", `Heading hierarchy skips levels — ${skipped.join(", ")} used without parent level. Present: ${levelsPresent.map(x => `H${x}`).join(", ")}.`);
  } else {
    _pass("Heading Order", "Heading tags follow a logical H1→H2→H3 sequential order (no skipped levels).");
  }

  // 7. Keyword in Title
  if (!primaryKeyword) {
    _warn("Keyword in Title", "Could not extract a primary keyword to verify title placement.");
  } else if (kwInText(primaryKeyword, title)) {
    _pass("Keyword in Title", `Primary keyword '${primaryKeyword}' found in page title.`);
  } else {
    _crit("Keyword in Title", `Primary keyword '${primaryKeyword}' is NOT in the page title. Add it near the beginning for best SEO impact.`);
  }

  // 8. Keyword in H1
  const h1Text = h1s.join(" ");
  if (!primaryKeyword) {
    _warn("Keyword in H1", "Could not extract a primary keyword to verify H1 placement.");
  } else if (kwInText(primaryKeyword, h1Text)) {
    _pass("Keyword in H1", `Primary keyword '${primaryKeyword}' found in H1 tag.`);
  } else {
    _crit("Keyword in H1", `Primary keyword '${primaryKeyword}' not found in H1. H1 should clearly reflect the target keyword.`);
  }

  // 9. Keyword in First Paragraph
  const firstPara = pageContent.slice(0, 500);
  if (!primaryKeyword) {
    _warn("Keyword in First Para", "Could not extract a primary keyword to verify first paragraph placement.");
  } else if (kwInText(primaryKeyword, firstPara)) {
    _pass("Keyword in First Para", `Primary keyword '${primaryKeyword}' appears in the first paragraph — good early signal for search engines.`);
  } else {
    _warn("Keyword in First Para", `Primary keyword '${primaryKeyword}' not found in the first 500 characters. Use the keyword early in the content.`);
  }

  // 10. Keyword Density
  const density = primaryKeyword ? keywordDensity(primaryKeyword, pageContent) : 0.0;
  if (density === 0.0 && primaryKeyword) {
    _warn("Keyword Density", `Keyword '${primaryKeyword}' has 0% density — not found in page content. Include it naturally throughout the text.`);
  } else if (density < 0.5) {
    _warn("Keyword Density", `Keyword density for '${primaryKeyword}' is very low (${density}%). Aim for 1–3% for natural optimization.`);
  } else if (density > 4.0) {
    _warn("Keyword Density", `Keyword density for '${primaryKeyword}' is high (${density}%). Over-optimization may trigger spam filters.`);
  } else {
    _pass("Keyword Density", `Keyword density for '${primaryKeyword}' is healthy at ${density}% (optimal range: 1–3%).`);
  }

  // 11. Content Length + 15. Thin Content (combined)
  if (wordCount < 150) {
    _crit("Content Length", `Extremely thin content — only ${wordCount} words. Google considers pages under 300 words low-quality. Aim for 600+ words.`);
    _crit("Thin Content", `Page is classified as thin content (${wordCount} words). Thin pages rarely rank well in competitive searches.`);
  } else if (wordCount < 300) {
    _warn("Content Length", `Content is thin (${wordCount} words). 300 words is the minimum; aim for 600–1200+ for competitive topics.`);
    _warn("Thin Content", `Content borderline thin (${wordCount} words). Consider expanding with useful, relevant information.`);
  } else if (wordCount < 600) {
    _warn("Content Length", `Content length is adequate but modest (${wordCount} words). 600+ words perform better for competitive keywords.`);
    _pass("Thin Content", `Content meets minimum quality threshold (${wordCount} words, above 300-word minimum).`);
  } else {
    _pass("Content Length", `Content length is strong (${wordCount} words) — above 600-word threshold for solid SEO coverage.`);
    _pass("Thin Content", `Content is substantial (${wordCount} words) — not classified as thin content.`);
  }

  // 12. Duplicate Title Detection
  const genericTitles = new Set(["home", "index", "untitled", "page", "welcome", "default", "new page"]);
  if (genericTitles.has(title.toLowerCase().trim())) {
    _crit("Duplicate Title", `Generic/default title detected: '${title}'. Pages with identical or generic titles compete against each other in SERPs.`);
  } else if (titleLen > 0) {
    _pass("Duplicate Title", `Title appears unique and descriptive: '${title.slice(0, 60)}'.`);
  } else {
    _warn("Duplicate Title", "Cannot verify title uniqueness — title is missing.");
  }

  // 13. Duplicate Meta Description Detection
  const genericMetas = new Set(["", "description", "meta description", "page description"]);
  const uniqueWordsCount = new Set(metaDesc.toLowerCase().split(/\s+/)).size;
  if (genericMetas.has(metaDesc.toLowerCase().trim()) || (metaDesc && uniqueWordsCount < 5)) {
    _crit("Duplicate Meta", `Meta description appears generic or very repetitive: '${metaDesc.slice(0, 80)}'. Write a unique, compelling description for each page.`);
  } else if (metaDesc) {
    _pass("Duplicate Meta", "Meta description appears unique and descriptive.");
  } else {
    _warn("Duplicate Meta", "Cannot verify meta description uniqueness — meta description is missing.");
  }

  // 14. Duplicate H1
  if (h1s.length > 1) {
    const uniqueH1s = new Set(h1s.map(h => h.toLowerCase().trim()));
    if (uniqueH1s.size < h1s.length) {
      _crit("Duplicate H1", `Duplicate H1 content found — ${h1s.length - uniqueH1s.size} identical H1(s) detected. Each page must have one unique H1.`);
    } else {
      _warn("Duplicate H1", `Multiple H1 tags found (${h1s.length}) with different content — consolidate into one H1.`);
    }
  } else if (h1s.length === 1) {
    _pass("Duplicate H1", `One unique H1 found: '${h1s[0].slice(0, 60)}'.`);
  } else {
    _warn("Duplicate H1", "No H1 tag present — cannot verify H1 uniqueness.");
  }

  // 16. Internal Links
  const intCount = internalLinks.length;
  if (intCount === 0) {
    _warn("Internal Links", "No static internal links found on this page. Many SaaS apps use JavaScript-based navigation. Verify internal links exist in the rendered output.");
  } else if (intCount < 3) {
    _warn("Internal Links", `Only ${intCount} internal link(s) found. Add at least 3–5 relevant internal links to strengthen site architecture.`);
  } else {
    _pass("Internal Links", `Good internal linking — ${intCount} internal links found, supporting page authority distribution.`);
  }

  // 17. External Links
  const extCount = externalLinks.length;
  if (extCount === 0) {
    _warn("External Links", "No external links found. Linking to authoritative external sources adds credibility and context for search engines.");
  } else {
    _pass("External Links", `${extCount} external link(s) found — outbound links to authoritative sources boost topical relevance.`);
  }

  // 18. Anchor Text Quality
  const badAnchors = ["click here", "read more", "here", "this", "link", "more", "learn more", "visit"];
  let badCount = 0;
  for (const bad of badAnchors) {
    let pos = pageContent.toLowerCase().indexOf(bad);
    while (pos !== -1) {
      badCount++;
      pos = pageContent.toLowerCase().indexOf(bad, pos + 1);
    }
  }
  const totalLinks = intCount + extCount;

  if (totalLinks === 0) {
    _warn("Anchor Text Quality", "No links found — anchor text quality cannot be assessed.");
  } else if (badCount > 5) {
    _warn("Anchor Text Quality", `Generic anchor text patterns detected ${badCount} times (e.g., 'click here', 'read more'). Use descriptive, keyword-rich anchor text for all links.`);
  } else {
    _pass("Anchor Text Quality", `Anchor text appears descriptive — low occurrence (${badCount}) of generic patterns like 'click here'.`);
  }

  const finalScore = Math.max(0, Math.min(100, Math.floor(score + 0.5)));

  console.log(`[OnPage] Analysis complete. Score: ${finalScore} | Passed: ${passed.length} | Warnings: ${warnings.length} | Critical: ${critical.length}`);

  return {
    onpage_score: finalScore,
    primary_keyword: primaryKeyword,
    passed,
    warnings,
    critical
  };
}

module.exports = { runOnpageAnalysis };

