const axios = require('axios');
const { prisma } = require('../db/client.js');

const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

// Safe PageSpeed online V5 fetcher
async function fetchSingleStrategy(url, strategy) {
  const apiKey = process.env.PAGESPEED_API_KEY || '';
  const keyParam = apiKey ? `&key=${apiKey}` : '';
  const categories = ['performance', 'seo', 'accessibility', 'best-practices'];
  const categoryParams = categories.map(c => `category=${c}`).join('&');
  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}&${categoryParams}${keyParam}`;

  console.info(`[PageSpeed] Launching API call for strategy '${strategy}': ${url}`);
  
  const response = await axios.get(apiUrl, {
    timeout: 7000, // 7 seconds timeout for Google Lighthouse API before fast fallback
    validateStatus: () => true
  });

  if (response.status !== 200) {
    throw new Error(`Google API returned status ${response.status}: ${response.statusText || 'Error'}`);
  }

  const data = response.data;
  const lh = data?.lighthouseResult;
  if (!lh) {
    throw new Error(`Invalid Lighthouse payload structure from Google API`);
  }

  // Parse scores
  const getScore = (cat) => {
    const val = lh.categories?.[cat]?.score;
    return val !== undefined && val !== null ? Math.round(val * 100) : 0;
  };

  // Parse CWV/Lighthouse metrics
  const getAuditNumeric = (auditId) => {
    const val = lh.audits?.[auditId]?.numericValue;
    return val !== undefined && val !== null ? Math.round(val * 10) / 10 : 0.0;
  };

  // Convert FCP, LCP, SI, Interactive from ms to seconds
  const fcp = getAuditNumeric('first-contentful-paint') / 1000;
  const lcp = getAuditNumeric('largest-contentful-paint') / 1000;
  const si = getAuditNumeric('speed-index') / 1000;
  const tbt = getAuditNumeric('total-blocking-time'); // keep TBT in ms
  const cls = lh.audits?.[`cumulative-layout-shift`]?.numericValue ?? 0.0;
  const interactive = getAuditNumeric('interactive') / 1000;

  // Extract recommendations/audits that failed (score < 0.9)
  const recommendations = [];
  const audits = lh.audits || {};
  for (const [auditId, audit] of Object.entries(audits)) {
    if (audit.score !== null && audit.score < 0.9 && audit.title) {
      const cleanDesc = (audit.description || "").replace(/\[(.*?)\]\(.*?\)/g, '$1');
      recommendations.push({
        id: auditId,
        title: audit.title,
        description: cleanDesc,
        score: audit.score,
        displayValue: audit.displayValue || null
      });
    }
  }

  return {
    success: true,
    performance: getScore('performance'),
    seo: getScore('seo'),
    accessibility: getScore('accessibility'),
    best_practices: getScore('best-practices'),
    metrics: {
      first_contentful_paint: Math.round(fcp * 10) / 10,
      largest_contentful_paint: Math.round(lcp * 10) / 10,
      speed_index: Math.round(si * 10) / 10,
      total_blocking_time: Math.round(tbt),
      cumulative_layout_shift: Math.round(cls * 100) / 100,
      interactive: Math.round(interactive * 10) / 10
    },
    recommendations,
    raw_json: data
  };
}

// Generate realistic simulated scores when the PageSpeed API is unreachable
function generateLocalFallback(url, strategy, localAuditResult) {
  console.warn(`[PageSpeed] Generating local fallback metrics for ${strategy}: ${url}`);

  const isMobile = strategy === 'mobile';
  
  // Base Performance calculated dynamically from page crawl response time
  const responseTime = localAuditResult?.response_time_ms || 450;
  let calculatedPerf = 96;
  if (responseTime > 2500) {
    calculatedPerf = Math.max(12, 96 - Math.round((responseTime - 2500) / 100) - 30);
  } else if (responseTime > 450) {
    calculatedPerf = 96 - Math.round((responseTime - 450) / 35);
  }

  // Base SEO calculated dynamically from tags presence
  const seoData = localAuditResult?.seo_data || {};
  let calculatedSeo = 98;
  if (!seoData.title) calculatedSeo -= 20;
  else if (seoData.title.length < 15 || seoData.title.length > 65) calculatedSeo -= 5;
  if (!seoData.meta_description) calculatedSeo -= 20;
  if (!seoData.headings?.h1 || seoData.headings.h1.length === 0) calculatedSeo -= 15;
  
  const basePerf = calculatedPerf;
  const baseSeo = calculatedSeo;
  const baseOnpage = localAuditResult?.onpage_report?.onpage_score ?? 85;
  
  // Calculate relative device scores
  let performance = basePerf;
  let seo = Math.round((baseSeo + baseOnpage) / 2);
  let accessibility = 92;
  let best_practices = 96;

  if (isMobile) {
    // Mobile performance and SEO scores are typically lower due to throttling & tap targets
    performance = Math.max(10, Math.round(basePerf * 0.72 - 6));
    seo = Math.max(20, Math.round(seo * 0.88 - 4));
    accessibility = Math.max(45, accessibility - 8);
    best_practices = Math.max(50, best_practices - 5);
  } else {
    performance = Math.max(15, Math.round(basePerf * 0.95));
  }

  // Generate simulated Core Web Vitals
  const fcpBase = (responseTime + 250) / 1000;
  
  let first_contentful_paint = isMobile ? fcpBase * 2.2 + 0.4 : fcpBase * 0.9 + 0.1;
  let largest_contentful_paint = isMobile ? first_contentful_paint * 1.5 + 0.8 : first_contentful_paint * 1.1 + 0.2;
  let speed_index = isMobile ? largest_contentful_paint * 1.2 : largest_contentful_paint * 0.9;
  let total_blocking_time = isMobile ? 260 : 25;
  let cumulative_layout_shift = isMobile ? 0.16 : 0.01;
  let interactive = isMobile ? largest_contentful_paint * 1.3 : largest_contentful_paint * 1.0;

  // Format decimal precisions
  first_contentful_paint = Math.round(first_contentful_paint * 10) / 10;
  largest_contentful_paint = Math.round(largest_contentful_paint * 10) / 10;
  speed_index = Math.round(speed_index * 10) / 10;
  interactive = Math.round(interactive * 10) / 10;
  cumulative_layout_shift = Math.round(cumulative_layout_shift * 100) / 100;

  // Local fallback recommendations list
  const recommendations = [];
  if (isMobile) {
    recommendations.push({
      title: "Configure tap targets size",
      description: "Tap targets are too small or close together. Set touch points to 48x48px.",
      score: 0.7
    });
    recommendations.push({
      title: "Defer offscreen images",
      description: "Mobile load speeds suffer from high initial payloads. Utilize lazy loading.",
      score: 0.6,
      displayValue: "Potential savings of 1.2s"
    });
    recommendations.push({
      title: "Reduce JavaScript execution time",
      description: "Mobile CPU speed is slower. Optimize heavy main-thread scripts.",
      score: 0.5,
      displayValue: "280ms blocking"
    });
  } else {
    recommendations.push({
      title: "Eliminate render-blocking resources",
      description: "Defer loading non-critical stylesheets/scripts to let page paint sooner.",
      score: 0.8,
      displayValue: "0.4s savings"
    });
    recommendations.push({
      title: "Serve images in modern formats",
      description: "Convert static PNG/JPG assets to WebP/AVIF formats.",
      score: 0.75
    });
  }

  return {
    success: false, // Indicates fallback
    performance,
    seo,
    accessibility,
    best_practices,
    metrics: {
      first_contentful_paint,
      largest_contentful_paint,
      speed_index,
      total_blocking_time,
      cumulative_layout_shift,
      interactive
    },
    recommendations,
    raw_json: { fallback: true, strategy, generated_at: new Date() }
  };
}

async function executePageSpeedAudits(url, localAuditResult = null) {
  console.info(`[PageSpeedService] Initiating Lighthouse audits for: ${url}`);
  
  // 1. Caching check: Query database for a completed audit within the last hour
  try {
    const urlVariants = [url];
    try {
      const parsed = new URL(url);
      const withSlash = parsed.origin + parsed.pathname + (parsed.pathname.endsWith('/') ? '' : '/');
      const withoutSlash = parsed.origin + parsed.pathname + (parsed.pathname.endsWith('/') ? parsed.pathname.slice(0, -1) : '');
      urlVariants.push(parsed.href, withSlash, withoutSlash);
    } catch (_) {
      urlVariants.push(`http://${url}`, `https://${url}`, `http://${url}/`, `https://${url}/`);
    }

    const uniqueVariants = Array.from(new Set(urlVariants));

    const recentAudit = await prisma.audit.findFirst({
      where: {
        url: { in: uniqueVariants },
        status: "completed",
        createdAt: {
          gte: new Date(Date.now() - CACHE_DURATION_MS)
        },
        performanceMobile: { not: null },
        performanceDesktop: { not: null }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (recentAudit) {
      console.info(`[PageSpeedService] Serving cached audits from DB for: ${url} (Audit ID: ${recentAudit.id})`);
      return {
        mobile: {
          performance: recentAudit.performanceMobile,
          seo: recentAudit.seoMobile,
          accessibility: recentAudit.accessibilityMobile,
          best_practices: recentAudit.bestPracticesMobile,
          metrics: {
            first_contentful_paint: recentAudit.firstContentfulPaintMobile,
            largest_contentful_paint: recentAudit.largestContentfulPaintMobile,
            speed_index: recentAudit.speedIndexMobile,
            total_blocking_time: recentAudit.totalBlockingTimeMobile,
            cumulative_layout_shift: recentAudit.cumulativeLayoutShiftMobile,
            interactive: recentAudit.interactiveMobile
          },
          recommendations: recentAudit.results?.pagespeed?.mobile?.recommendations || [],
          success: true,
          cached: true
        },
        desktop: {
          performance: recentAudit.performanceDesktop,
          seo: recentAudit.seoDesktop,
          accessibility: recentAudit.accessibilityDesktop,
          best_practices: recentAudit.bestPracticesDesktop,
          metrics: {
            first_contentful_paint: recentAudit.firstContentfulPaintDesktop,
            largest_contentful_paint: recentAudit.largestContentfulPaintDesktop,
            speed_index: recentAudit.speedIndexDesktop,
            total_blocking_time: recentAudit.totalBlockingTimeDesktop,
            cumulative_layout_shift: recentAudit.cumulativeLayoutShiftDesktop,
            interactive: recentAudit.interactiveDesktop
          },
          recommendations: recentAudit.results?.pagespeed?.desktop?.recommendations || [],
          success: true,
          cached: true
        }
      };
    }
  } catch (err) {
    console.error(`[PageSpeedService] Database cache check failed:`, err.message);
  }

  // 2. Parallel Lighthouse Analysis execution (Mobile & Desktop)
  const auditTasks = [
    fetchSingleStrategy(url, 'mobile').catch(err => {
      console.error(`[PageSpeedService] Mobile strategy failed: ${err.message}`);
      return generateLocalFallback(url, 'mobile', localAuditResult);
    }),
    fetchSingleStrategy(url, 'desktop').catch(err => {
      console.error(`[PageSpeedService] Desktop strategy failed: ${err.message}`);
      return generateLocalFallback(url, 'desktop', localAuditResult);
    })
  ];

  const [mobileResult, desktopResult] = await Promise.all(auditTasks);

  // 3. Set custom warning headers if either failed
  const warnings = [];
  if (!mobileResult.success && mobileResult.raw_json?.fallback) {
    warnings.push("Mobile strategy API failed; serving simulated fallback diagnostics.");
  }
  if (!desktopResult.success && desktopResult.raw_json?.fallback) {
    warnings.push("Desktop strategy API failed; serving simulated fallback diagnostics.");
  }

  return {
    mobile: mobileResult,
    desktop: desktopResult,
    warnings
  };
}

module.exports = { executePageSpeedAudits };
