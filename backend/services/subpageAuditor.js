const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

const MAX_PAGES          = 100;    // Optimal cap on subpages to crawl
const MAX_QUEUE_SIZE     = 300;    // Prevent queue bloat
const CRAWL_CONCURRENCY  = 12;    // High concurrency for parallel fetches
const AUDIT_CONCURRENCY  = 15;    // High concurrency CPU audit
const REQUEST_TIMEOUT    = 4000;   // 4s per HTTP request
const SPIDER_TIMEOUT_MS  = 60000;  // 60s limit on BFS phase
const DELAY_MS           = 20;     // Fast delay between batches (ms)

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9"
};

const SKIP_EXT = /\.(png|jpg|jpeg|gif|svg|pdf|css|js|ico|woff|woff2|ttf|eot|mp4|mp3|webp|zip|tar|gz|xml|json|rss|atom|webm|ogg|avi|mov|dmg|exe|apk|ipa)$/i;

function normalizeHost(urlStr) {
  try {
    return new URL(urlStr).hostname.replace(/^www\./i, '').toLowerCase();
  } catch { return ''; }
}

function getOrigin(urlStr) {
  try {
    return new URL(urlStr).origin;
  } catch { return ''; }
}

function toVisitKey(url) {
  return url.replace(/\/$/, '').toLowerCase();
}

function resolveInternal(rawHref, pageUrl, baseHost) {
  if (!rawHref) return null;
  const stripped = rawHref.trim();
  if (
    !stripped ||
    stripped.startsWith('mailto:') ||
    stripped.startsWith('tel:') ||
    stripped.startsWith('javascript:') ||
    stripped.startsWith('#') ||
    stripped.startsWith('data:') ||
    stripped.startsWith('blob:')
  ) return null;

  try {
    const u = new URL(stripped, pageUrl);
    const linkHost = u.hostname.replace(/^www\./i, '').toLowerCase();
    if (linkHost !== baseHost) return null;   // external link
    u.hash = '';
    u.search = '';
    const clean = u.href.replace(/\/$/, '');
    if (SKIP_EXT.test(clean)) return null;    // static asset
    return clean;
  } catch { return null; }
}

function extractInternalLinks(html, pageUrl, baseHost) {
  const links = new Set();
  try {
    const $ = cheerio.load(html);
    $('a[href]').each((_, el) => {
      const resolved = resolveInternal($(el).attr('href'), pageUrl, baseHost);
      if (resolved) links.add(resolved);
    });
  } catch { /* ignore cheerio errors */ }
  return links;
}

async function fetchDisallowedPaths(origin) {
  const disallowed = new Set();
  try {
    const res = await axios.get(`${origin}/robots.txt`, {
      timeout: 3000,
      httpsAgent: agent,
      headers: BROWSER_HEADERS,
      validateStatus: () => true
    });
    if (res.status !== 200 || typeof res.data !== 'string') return disallowed;

    let inUserAgentAll = false;
    for (const rawLine of res.data.split('\n')) {
      const trimmed = rawLine.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      if (/^user-agent:\s*\*/i.test(trimmed)) {
        inUserAgentAll = true;
        continue;
      }
      if (/^user-agent:/i.test(trimmed)) {
        inUserAgentAll = false;
        continue;
      }
      if (inUserAgentAll && /^disallow:/i.test(trimmed)) {
        const path = trimmed.replace(/^disallow:\s*/i, '').split('#')[0].trim();
        if (path) disallowed.add(path);
      }
    }
  } catch { /* robots.txt is optional */ }
  return disallowed;
}

function isDisallowed(urlStr, disallowedPaths) {
  if (!disallowedPaths.size) return false;
  try {
    const pathname = new URL(urlStr).pathname;
    for (const prefix of disallowedPaths) {
      if (prefix === '/') return true;
      if (pathname === prefix || pathname.startsWith(prefix.endsWith('/') ? prefix : `${prefix}/`)) return true;
    }
  } catch { }
  return false;
}

async function pLimit(tasks, concurrency) {
  const results = new Array(tasks.length).fill(null);
  let idx = 0;

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      try {
        results[i] = await tasks[i]();
      } catch (err) {
        console.warn(`[SubpageAuditor] Task ${i} failed:`, err.message);
        results[i] = null;
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

async function fetchPage(url) {
  const t0 = Date.now();
  try {
    const res = await axios.get(url, {
      timeout: REQUEST_TIMEOUT,
      httpsAgent: agent,
      headers: BROWSER_HEADERS,
      validateStatus: () => true,
      maxRedirects: 5,
      decompress: true
    });
    const responseTimeMs = Date.now() - t0;
    const contentType = res.headers?.['content-type'] || '';

    if (!contentType.includes('text/html') && !contentType.includes('text/plain') && typeof res.data !== 'string') {
      return null;
    }

    const finalUrl = res.request?.res?.responseUrl ||
                     res.request?.responseURL ||
                     url;

    return {
      html: typeof res.data === 'string' ? res.data : null,
      statusCode: res.status,
      finalUrl,
      responseTimeMs
    };
  } catch { return null; }
}

async function spiderSite(baseUrl, seoData) {
  const origin    = getOrigin(baseUrl);
  const baseHost  = normalizeHost(baseUrl);
  const baseKey   = toVisitKey(baseUrl);

  const visited = new Set([baseKey]);
  const queue   = [];
  const crawled = [];

  const spiderStart = Date.now();

  console.info(`[SubpageAuditor] ── BFS spider started: ${baseUrl}`);

  const seedLinks = new Set();

  (seoData?.internal_links || []).forEach(href => {
    const r = resolveInternal(href, baseUrl, baseHost);
    if (r && toVisitKey(r) !== baseKey) seedLinks.add(r);
  });

  (seoData?.detailed_links || []).forEach(lnk => {
    if (!lnk.is_external && lnk.href) {
      const r = resolveInternal(lnk.href, baseUrl, baseHost);
      if (r && toVisitKey(r) !== baseKey) seedLinks.add(r);
    }
  });

  const sitemapFetchedUrls = new Set();

  const tryFetchSitemap = async (sitemapUrl, depth = 0) => {
    if (depth > 3) return;
    try {
      const res = await axios.get(sitemapUrl, {
        timeout: 5000, httpsAgent: agent,
        headers: BROWSER_HEADERS, validateStatus: () => true
      });
      if (res.status !== 200 || typeof res.data !== 'string') return;

      if (/<sitemapindex/i.test(res.data)) {
        const childMatches = (res.data.match(/<loc>(.*?)<\/loc>/gi) || [])
          .map(m => m.replace(/<\/?loc>/gi, '').trim())
          .filter(u => /sitemap.*\.xml/i.test(u))
          .slice(0, 15);
        await Promise.all(childMatches.map(u => tryFetchSitemap(u, depth + 1)));
      } else {
        const locMatches = res.data.match(/<loc>(.*?)<\/loc>/gi) || [];
        locMatches.forEach(m => {
          const loc = m.replace(/<\/?loc>/gi, '').trim();
          const r = resolveInternal(loc, baseUrl, baseHost);
          if (r && toVisitKey(r) !== baseKey) sitemapFetchedUrls.add(r);
        });
      }
    } catch { }
  };

  await Promise.all([
    tryFetchSitemap(`${origin}/sitemap.xml`),
    tryFetchSitemap(`${origin}/sitemap_index.xml`),
    tryFetchSitemap(`${origin}/sitemap-index.xml`),
  ]);

  sitemapFetchedUrls.forEach(u => seedLinks.add(u));

  console.info(`[SubpageAuditor] Seed phase: ${seedLinks.size} URLs (from homepage links + sitemaps)`);

  for (const url of seedLinks) {
    const key = toVisitKey(url);
    if (!visited.has(key)) {
      visited.add(key);
      queue.push(url);
    }
  }

  if (queue.length === 0) {
    console.info(`[SubpageAuditor] No seeds found — probing common paths concurrently...`);
    const commonPaths = [
      '/about', '/about-us', '/contact', '/contact-us', '/blog', '/news',
      '/articles', '/services', '/products', '/pricing', '/faq', '/team',
      '/careers', '/jobs', '/privacy', '/privacy-policy', '/terms',
      '/terms-of-service', '/help', '/support', '/resources', '/portfolio'
    ];
    const probeTasks = commonPaths.map(p => async () => {
      const testUrl = `${origin}${p}`;
      const key = toVisitKey(testUrl);
      if (visited.has(key)) return;
      const fetched = await fetchPage(testUrl);
      if (fetched && fetched.statusCode >= 200 && fetched.statusCode < 300) {
        if (!visited.has(key)) {
          visited.add(key);
          queue.push(testUrl);
        }
      }
    });
    await pLimit(probeTasks, CRAWL_CONCURRENCY);
    console.info(`[SubpageAuditor] Common path probe found ${queue.length} reachable pages.`);
  }

  const disallowedPaths = await fetchDisallowedPaths(origin);
  if (disallowedPaths.size > 0) {
    console.info(`[SubpageAuditor] robots.txt: ${disallowedPaths.size} disallowed path(s) will be skipped.`);
  }

  const crawledKeys = new Set();

  while (
    queue.length > 0 &&
    crawled.length < MAX_PAGES &&
    (Date.now() - spiderStart) < SPIDER_TIMEOUT_MS
  ) {
    const remaining  = MAX_PAGES - crawled.length;
    const batchSize  = Math.min(CRAWL_CONCURRENCY, remaining, queue.length);
    const batch      = queue.splice(0, batchSize);

    const batchTasks = batch.map(url => async () => {
      if (isDisallowed(url, disallowedPaths)) {
        console.info(`[SubpageAuditor] Skipping disallowed: ${url}`);
        return null;
      }

      const fetched = await fetchPage(url);
      if (!fetched) return null;

      const finalKey = toVisitKey(fetched.finalUrl);
      if (!visited.has(finalKey) && finalKey !== baseKey) {
        visited.add(finalKey);
      }

      if (fetched.html && queue.length < MAX_QUEUE_SIZE) {
        const foundLinks = extractInternalLinks(fetched.html, fetched.finalUrl, baseHost);
        for (const link of foundLinks) {
          const key = toVisitKey(link);
          if (
            !visited.has(key) &&
            key !== baseKey &&
            !isDisallowed(link, disallowedPaths) &&
            queue.length < MAX_QUEUE_SIZE
          ) {
            visited.add(key);
            queue.push(link);
          }
        }
      }

      return {
        url: fetched.finalUrl || url,
        originalUrl: url,
        html: fetched.html,
        statusCode: fetched.statusCode,
        responseTimeMs: fetched.responseTimeMs
      };
    });

    const batchResults = await pLimit(batchTasks, CRAWL_CONCURRENCY);

    for (const r of batchResults) {
      if (r && r.url) {
        const cKey = toVisitKey(r.url);
        if (!crawledKeys.has(cKey)) {
          crawledKeys.add(cKey);
          crawled.push(r);
        }
      }
    }

    const elapsed = Math.round((Date.now() - spiderStart) / 1000);
    console.info(`[SubpageAuditor] BFS: crawled=${crawled.length} queue=${queue.length} visited=${visited.size} elapsed=${elapsed}s`);

    if (queue.length > 0 && crawled.length < MAX_PAGES) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  const totalElapsed = Math.round((Date.now() - spiderStart) / 1000);
  const hitTimeout = (Date.now() - spiderStart) >= SPIDER_TIMEOUT_MS;
  console.info(
    `[SubpageAuditor] BFS complete. pages=${crawled.length} visited=${visited.size} elapsed=${totalElapsed}s` +
    (hitTimeout ? ' [TIMEOUT]' : '')
  );

  return crawled;
}

function auditCrawledPage(pageData) {
  if (!pageData) return null;
  const { url, html, statusCode, responseTimeMs = 0 } = pageData;

  const report = {
    url,
    status_code: statusCode || 0,
    response_time_ms: responseTimeMs,
    success: statusCode >= 200 && statusCode < 400,
    score: 100,
    title: null,
    meta_description: null,
    h1_count: 0,
    h2_count: 0,
    images_missing_alt: 0,
    canonical: null,
    word_count: 0,
    internal_links_count: 0,
    issues: []
  };

  if (statusCode >= 400) {
    report.score = 0;
    report.issues.push(`HTTP ${statusCode}: Page returned an error`);
    return report;
  }

  if (!html || typeof html !== 'string') {
    report.score = 0;
    report.issues.push('No HTML content received');
    return report;
  }

  const $ = cheerio.load(html);

  report.title = $('head > title').first().text().trim() || $('title').first().text().trim() || null;
  if (!report.title) {
    report.score -= 20;
    report.issues.push('Missing <title> tag');
  } else if (report.title.length < 10 || report.title.length > 70) {
    report.score -= 5;
    report.issues.push(`Title length (${report.title.length} chars) — recommended 10–70`);
  }

  report.meta_description = $('meta[name="description" i]').attr('content')?.trim() || null;
  if (!report.meta_description) {
    report.score -= 15;
    report.issues.push('Missing meta description');
  } else if (report.meta_description.length < 50 || report.meta_description.length > 165) {
    report.score -= 5;
    report.issues.push(`Meta description (${report.meta_description.length} chars) — recommended 50–165`);
  }

  report.h1_count = $('h1').length;
  report.h2_count = $('h2').length;
  if (report.h1_count === 0) {
    report.score -= 15;
    report.issues.push('Missing H1 heading');
  } else if (report.h1_count > 1) {
    report.score -= 5;
    report.issues.push(`Multiple H1 headings (${report.h1_count}) — only one recommended`);
  }
  if (report.h2_count === 0) {
    report.score -= 5;
    report.issues.push('No H2 headings — poor content structure');
  }

  $('img').each((_, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined || !alt.trim()) report.images_missing_alt++;
  });
  if (report.images_missing_alt > 0) {
    report.score -= Math.min(15, report.images_missing_alt * 3);
    report.issues.push(`${report.images_missing_alt} image(s) missing ALT text`);
  }

  report.canonical = $('link[rel="canonical" i]').attr('href')?.trim() || null;
  if (!report.canonical) {
    report.score -= 10;
    report.issues.push('Missing canonical tag');
  }

  const $c = cheerio.load(html);
  $c('script, style, noscript, iframe, svg, header, footer, nav, aside, [role="navigation"], [role="banner"]').remove();
  const bodyText   = $c('body').text().replace(/\s+/g, ' ').trim();
  report.word_count = bodyText.split(/\s+/).filter(Boolean).length;
  if (report.word_count < 300) {
    report.score -= 10;
    report.issues.push(`Thin content — only ${report.word_count} words (300+ recommended)`);
  }

  let pageHostname = '';
  try { pageHostname = new URL(url).hostname; } catch { }

  report.internal_links_count = $('a[href]').filter((_, el) => {
    const href = $(el).attr('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
    if (!href.startsWith('http')) return true;
    try {
      return new URL(href).hostname.replace(/^www\./i, '') === pageHostname.replace(/^www\./i, '');
    } catch { return false; }
  }).length;

  const viewport = $('meta[name="viewport" i]').attr('content');
  if (!viewport) {
    report.score -= 5;
    report.issues.push('Missing viewport meta — page may not be mobile-friendly');
  }

  const ogTitle = $('meta[property="og:title"]').attr('content');
  if (!ogTitle) {
    report.score -= 3;
    report.issues.push('Missing og:title Open Graph tag');
  }

  if (responseTimeMs > 2000) {
    report.score -= 5;
    report.issues.push(`Slow response time (${responseTimeMs}ms — target < 2000ms)`);
  }

  report.score = Math.max(0, Math.min(100, report.score));
  return report;
}

async function runSubpageAudit(baseUrl, seoData, timeoutMs = 180000) {
  console.info(`[SubpageAuditor] ====== Starting site-wide crawl: ${baseUrl} ======`);

  const auditWithTimeout = new Promise(async (resolve, reject) => {
    try {
      const crawledPages = await spiderSite(baseUrl, seoData);
      console.info(`[SubpageAuditor] Spider done. Auditing ${crawledPages.length} pages...`);

      const auditTasks   = crawledPages.map(page => () => Promise.resolve(auditCrawledPage(page)));
      const auditResults = await pLimit(auditTasks, AUDIT_CONCURRENCY);

      const seenUrlMap = new Map();
      const pages = [];
      
      auditResults.filter(Boolean).forEach((p) => {
        const uKey = toVisitKey(p.url || '');
        if (uKey && !seenUrlMap.has(uKey)) {
          seenUrlMap.set(uKey, true);
          // Retain the crawled HTML in memory (to be combined in router and stripped before DB insertion)
          const crawled = crawledPages.find(c => c && toVisitKey(c.url) === uKey);
          p.html = crawled ? crawled.html : null;
          pages.push(p);
        }
      });
      
      let totalScore = 0, missingTitles = 0, missingDescs = 0, missingH1s = 0,
          totalMissingAlt = 0, brokenSubpages = 0;

      pages.forEach(p => {
        totalScore      += p.score;
        if (!p.success)          brokenSubpages++;
        if (!p.title)            missingTitles++;
        if (!p.meta_description) missingDescs++;
        if (p.h1_count === 0)    missingH1s++;
        totalMissingAlt += p.images_missing_alt;
      });

      const averageScore = pages.length > 0 ? Math.round(totalScore / pages.length) : 100;
      console.info(`[SubpageAuditor] ====== Audit complete: ${pages.length} pages | avg score: ${averageScore} ======`);

      resolve({
        subpages_crawled_count: pages.length,
        average_subpage_score: averageScore,
        summary_issues: {
          broken_subpages_count:      brokenSubpages,
          missing_title_count:        missingTitles,
          missing_description_count:  missingDescs,
          missing_h1_count:           missingH1s,
          total_missing_alt_images:   totalMissingAlt
        },
        audited_subpages: pages
      });
    } catch (err) {
      reject(err);
    }
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Subpage audit timed out after ${timeoutMs / 1000}s`)), timeoutMs)
  );

  return Promise.race([auditWithTimeout, timeoutPromise]);
}

module.exports = { runSubpageAudit };
