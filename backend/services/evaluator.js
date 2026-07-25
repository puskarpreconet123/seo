const axios = require('axios');
const https = require('https');

const agent = new https.Agent({
  rejectUnauthorized: false
});

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};

async function checkUrlStatus(url) {
  try {
    const response = await axios.get(url, {
      headers: BROWSER_HEADERS,
      timeout: 2500,
      httpsAgent: agent,
      maxRedirects: 3,
      validateStatus: () => true
    });
    return response.status;
  } catch (err) {
    return 0;
  }
}

async function runSeoEvaluation(crawlResult, seoData) {
  const passed = [];
  const warnings = [];
  const critical = [];

  const finalUrl = crawlResult.final_url || crawlResult.requested_url;
  let parsedUrl;
  try {
    parsedUrl = new URL(finalUrl);
  } catch (err) {
    parsedUrl = { scheme: 'http', protocol: 'http:', hostname: '', origin: finalUrl };
  }
  const baseDomainUrl = parsedUrl.origin || `${parsedUrl.protocol}//${parsedUrl.hostname}`;

  const asyncTasks = [];
  const asyncKeys = [];

  // 1. robots.txt
  const robotsUrl = `${baseDomainUrl}/robots.txt`;
  asyncTasks.push(checkUrlStatus(robotsUrl));
  asyncKeys.push("robots");

  // 2. sitemap.xml
  const sitemapUrl = `${baseDomainUrl}/sitemap.xml`;
  asyncTasks.push(checkUrlStatus(sitemapUrl));
  asyncKeys.push("sitemap");

  // 3. Unique internal and external links check (up to 10 each)
  const internalToCheck = (seoData.internal_links || []).slice(0, 10);
  const externalToCheck = (seoData.external_links || []).slice(0, 10);

  let verifiedLinksCount = 0;
  for (const link of internalToCheck) {
    if (link && link.startsWith("http")) {
      asyncTasks.push(checkUrlStatus(link));
      asyncKeys.push(`link_int:${link}`);
      verifiedLinksCount++;
    }
  }
  for (const link of externalToCheck) {
    if (link && link.startsWith("http")) {
      asyncTasks.push(checkUrlStatus(link));
      asyncKeys.push(`link_ext:${link}`);
      verifiedLinksCount++;
    }
  }

  // 4. Unique images check (up to 10)
  const imagesToCheck = Array.from(new Set((seoData.images || []).map(img => img.src).filter(Boolean))).slice(0, 10);
  let verifiedImagesCount = 0;
  for (const img of imagesToCheck) {
    if (img && img.startsWith("http")) {
      asyncTasks.push(checkUrlStatus(img));
      asyncKeys.push(`img:${img}`);
      verifiedImagesCount++;
    }
  }

  console.log(`[Evaluator] Executing ${asyncTasks.length} concurrent status checks...`);
  const asyncResults = await Promise.all(asyncTasks.map(p => p.catch(err => 0)));

  const asyncMap = {};
  for (let i = 0; i < asyncKeys.length; i++) {
    asyncMap[asyncKeys[i]] = asyncResults[i];
  }

  // 1. HTTPS Check
  const isHttps = (parsedUrl.protocol || '').toLowerCase().startsWith('https');
  if (isHttps) {
    passed.push({
      check: "HTTPS",
      message: "Website connection is secure (HTTPS)."
    });
  } else {
    critical.push({
      check: "HTTPS",
      message: "Insecure connection detected. Site must redirect HTTP traffic to secure HTTPS protocol."
    });
  }

  // 2. robots.txt Check
  const robotsStatus = asyncMap["robots"] || 0;
  if (robotsStatus >= 200 && robotsStatus < 400) {
    passed.push({
      check: "robots.txt",
      message: `robots.txt is accessible (HTTP status ${robotsStatus}).`
    });
  } else {
    warnings.push({
      check: "robots.txt",
      message: `robots.txt file is not present or inaccessible (HTTP status ${robotsStatus}) at: ${robotsUrl}. Search engine crawlers will index all pages by default.`
    });
  }

  // 3. sitemap.xml Check
  const sitemapStatus = asyncMap["sitemap"] || 0;
  if (sitemapStatus >= 200 && sitemapStatus < 400) {
    passed.push({
      check: "sitemap.xml",
      message: `sitemap.xml was successfully located (HTTP status ${sitemapStatus}).`
    });
  } else {
    warnings.push({
      check: "sitemap.xml",
      message: `sitemap.xml configuration is missing or returns status code ${sitemapStatus} at: ${sitemapUrl}.`
    });
  }

  // 4. Canonical Check
  const canonical = seoData.canonical;
  if (!canonical) {
    critical.push({
      check: "Canonical",
      message: "Canonical link tag is missing. This can lead to duplicate content index problems."
    });
  } else {
    const normalizeCanonical = (u) => (u || '').trim().replace(/\/+$/, '').toLowerCase();
    const canonicalNorm = normalizeCanonical(canonical);
    const finalUrlNorm = normalizeCanonical(finalUrl);
    if (canonicalNorm !== finalUrlNorm) {
      warnings.push({
        check: "Canonical",
        message: `Canonical URL (${canonical}) does not match current final URL (${finalUrl}). Trailing slash or casing differences can cause index fragmentation.`
      });
    } else {
      passed.push({
        check: "Canonical",
        message: "Canonical link tag matches current page URL correctly."
      });
    }
  }

  // 5. Missing / Sub-optimal Title Check
  const title = seoData.title;
  if (!title) {
    critical.push({
      check: "Missing Title",
      message: "Page title is missing or empty. Title is the most critical tag for search click rates."
    });
  } else {
    const titleLen = title.length;
    if (titleLen < 30 || titleLen > 60) {
      warnings.push({
        check: "Title Length",
        message: `Page title length (${titleLen} chars) is sub-optimal. Recommended length is 30-60 characters. Current: '${title}'.`
      });
    } else {
      passed.push({
        check: "Title",
        message: `Title tag is present and has optimal length (${titleLen} characters).`
      });
    }
  }

  // 6. Missing / Sub-optimal Meta Description Check
  const metaDesc = seoData.meta_description;
  if (!metaDesc) {
    critical.push({
      check: "Missing Meta Description",
      message: "Meta description tag is missing. Search engines might display arbitrary text snippets instead."
    });
  } else {
    const descLen = metaDesc.length;
    if (descLen < 120 || descLen > 160) {
      warnings.push({
        check: "Meta Description Length",
        message: `Meta description length (${descLen} chars) is sub-optimal. Recommended length is 120-160 characters.`
      });
    } else {
      passed.push({
        check: "Meta Description",
        message: `Meta description tag is present and has optimal length (${descLen} characters).`
      });
    }
  }

  // 7. Missing H1 Check
  const h1s = seoData.headings?.h1 || [];
  if (h1s.length === 0) {
    critical.push({
      check: "Missing H1",
      message: "H1 tag is missing. Page must have exactly one H1 tag expressing primary content."
    });
  } else {
    passed.push({
      check: "Missing H1",
      message: "H1 tag is present."
    });
  }

  // 8. Multiple H1 Check
  if (h1s.length > 1) {
    warnings.push({
      check: "Multiple H1",
      message: `Multiple H1 tags found (${h1s.length}). Having more than one H1 tag diluted keyword search weights.`
    });
  } else if (h1s.length === 1) {
    passed.push({
      check: "Multiple H1",
      message: "Exactly one H1 tag is present."
    });
  }

  // 9. Broken Links Check
  const brokenInternal = [];
  const brokenExternal = [];
  
  for (const [key, status] of Object.entries(asyncMap)) {
    if (key.startsWith("link_int:") && !(status >= 200 && status < 400)) {
      brokenInternal.push([key.replace("link_int:", ""), status]);
    } else if (key.startsWith("link_ext:") && !(status >= 200 && status < 400)) {
      brokenExternal.push([key.replace("link_ext:", ""), status]);
    }
  }

  if (brokenInternal.length > 0) {
    critical.push({
      check: "Broken Links",
      message: `Broken internal link(s) detected: ${brokenInternal[0][0]} returned status ${brokenInternal[0][1]}. Total broken internal links: ${brokenInternal.length}.`
    });
  } else if (brokenExternal.length > 0) {
    warnings.push({
      check: "Broken Links",
      message: `Broken external link(s) detected: ${brokenExternal[0][0]} returned status ${brokenExternal[0][1]}. Total broken external links: ${brokenExternal.length}.`
    });
  } else {
    passed.push({
      check: "Broken Links",
      message: `All checked links are active (successfully verified ${verifiedLinksCount} unique links).`
    });
  }

  // 10. Broken Images Check
  const brokenImages = [];
  for (const [key, status] of Object.entries(asyncMap)) {
    if (key.startsWith("img:") && !(status >= 200 && status < 400)) {
      brokenImages.push([key.replace("img:", ""), status]);
    }
  }

  if (brokenImages.length > 0) {
    critical.push({
      check: "Broken Images",
      message: `Broken image source detected: ${brokenImages[0][0]} returned status ${brokenImages[0][1]}. Total broken images: ${brokenImages.length}.`
    });
  } else {
    passed.push({
      check: "Broken Images",
      message: `All checked image source endpoints are active (successfully verified ${verifiedImagesCount} unique images).`
    });
  }

  // 11. Missing ALT Check
  const images = seoData.images || [];
  const missingAltCount = images.filter(img => !img.alt).length;
  if (missingAltCount > 0) {
    warnings.push({
      check: "Missing ALT",
      message: `Alt text attribute is missing or empty in ${missingAltCount} out of ${images.length} images.`
    });
  } else {
    passed.push({
      check: "Missing ALT",
      message: images.length > 0 ? `All ${images.length} image tags have alt text alternate descriptors.` : "No images found on page to audit."
    });
  }

  // 12. URL Length Check
  const urlLen = finalUrl.length;
  if (urlLen > 75) {
    warnings.push({
      check: "URL Length",
      message: `URL string length is too long (${urlLen} chars). Keep URLs under 75 characters for better display and index indexing.`
    });
  } else {
    passed.push({
      check: "URL Length",
      message: `URL length is within optimal bounds (${urlLen} characters).`
    });
  }

  // 13. Heading Structure Check
  const headingsData = seoData.headings || {};
  const levelsPresent = [];
  for (let i = 1; i <= 6; i++) {
    if ((headingsData[`h${i}`] || []).length > 0) {
      levelsPresent.push(i);
    }
  }
  const gaps = [];
  for (const lvl of levelsPresent) {
    if (lvl > 1 && !levelsPresent.includes(lvl - 1)) {
      gaps.push(`H${lvl}`);
    }
  }

  if (gaps.length > 0) {
    warnings.push({
      check: "Heading Structure",
      message: `Heading structure skips levels. Headings present: ${levelsPresent.map(x => `H${x}`).join(', ')}. Missing predecessor levels for: ${gaps.join(', ')}.`
    });
  } else {
    passed.push({
      check: "Heading Structure",
      message: "Heading elements follow a logical nested order (no skipped heading levels)."
    });
  }

  // 14. Open Graph Check
  const og = seoData.open_graph || {};
  if (Object.keys(og).length === 0) {
    warnings.push({
      check: "Open Graph",
      message: "Open Graph tags are missing. Adding og:title and og:image tags increases click rates on Facebook/LinkedIn."
    });
  } else {
    passed.push({
      check: "Open Graph",
      message: `Open Graph tags detected (found ${Object.keys(og).length} keys).`
    });
  }

  // 15. Twitter Cards Check
  const tc = seoData.twitter_card || {};
  if (Object.keys(tc).length === 0) {
    warnings.push({
      check: "Twitter Cards",
      message: "Twitter Card tags are missing. Adding them ensures correct page previews on Twitter/X."
    });
  } else {
    passed.push({
      check: "Twitter Cards",
      message: `Twitter Card tags detected (found ${Object.keys(tc).length} keys).`
    });
  }

  // 16. Schema / JSON-LD Check
  const schema = seoData.schema_json_ld || [];
  if (schema.length === 0) {
    warnings.push({
      check: "Schema",
      message: "JSON-LD schema structured data is missing. Add structured markup to gain rich search engine snippets."
    });
  } else {
    passed.push({
      check: "Schema",
      message: `Structured JSON-LD schema details present (found ${schema.length} blocks).`
    });
  }

  return { passed, warnings, critical };
}

const CHECK_WEIGHTS = {
  "HTTPS": 10.0,
  "robots.txt": 5.0,
  "sitemap.xml": 5.0,
  "Canonical": 10.0,
  "Title": 15.0,
  "Meta Description": 10.0,
  "H1": 10.0,
  "Multiple H1": 5.0,
  "Broken Links": 10.0,
  "Broken Images": 5.0,
  "Missing ALT": 5.0,
  "URL Length": 2.0,
  "Heading Structure": 3.0,
  "Open Graph": 3.0,
  "Twitter Cards": 2.0,
  "Schema": 5.0
};

function calculateSeoScoreReport(report) {
  let score = 100.0;

  function getBaseCheck(checkName) {
    if (!checkName) return "";
    const name = checkName.toLowerCase();
    if (name.includes("title")) return "Title";
    if (name.includes("meta description")) return "Meta Description";
    if (name.includes("missing h1")) return "H1";
    return checkName;
  }

  for (const item of report.critical || []) {
    const base = getBaseCheck(item.check);
    const weight = CHECK_WEIGHTS[base] || 0.0;
    score -= weight;
  }

  for (const item of report.warnings || []) {
    const base = getBaseCheck(item.check);
    const weight = CHECK_WEIGHTS[base] || 0.0;
    score -= (weight * 0.5);
  }

  const finalScore = Math.max(0, Math.min(100, Math.floor(score + 0.5)));

  const criticalIssues = (report.critical || []).map(item => `[CRITICAL] ${item.check}: ${item.message}`);
  const warningIssues = (report.warnings || []).map(item => `[WARNING] ${item.check}: ${item.message}`);

  const issueSummary = {
    critical_count: (report.critical || []).length,
    warning_count: (report.warnings || []).length,
    issues: [...criticalIssues, ...warningIssues]
  };

  return [finalScore, issueSummary];
}

module.exports = {
  runSeoEvaluation,
  calculateSeoScoreReport
};

