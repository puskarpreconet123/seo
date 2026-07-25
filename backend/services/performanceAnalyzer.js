const axios = require('axios');
const https = require('https');
const cheerio = require('cheerio');

const agent = new https.Agent({
  rejectUnauthorized: false
});

const LARGE_CSS_LIBS = ["bootstrap", "font-awesome", "fontawesome", "bulma", "foundation", "animate.css"];
const LARGE_JS_LIBS = ["jquery", "react-dom", "angular", "vue", "lodash", "d3", "bootstrap.bundle", "bootstrap.min.js"];

async function runPerformanceAnalysis(html, baseUrl, responseTimeMs) {
  if (!html) {
    return {
      performance_score: 100,
      metrics: {
        page_load_time_ms: responseTimeMs,
        fcp_ms: responseTimeMs,
        lcp_ms: responseTimeMs,
        cls: 0.0,
        inp_ms: 0.0,
        ttfb_ms: responseTimeMs
      },
      issues: [],
      recommendations: []
    };
  }

  const $ = cheerio.load(html);
  
  let baseDomain = '';
  try {
    baseDomain = new URL(baseUrl).hostname.toLowerCase();
  } catch (err) {}

  const renderBlockingCss = [];
  const renderBlockingJs = [];
  const cssUrls = new Set();
  const jsUrls = new Set();

  function resolveAssetUrl(src) {
    if (!src) return null;
    try {
      const resolved = new URL(src.trim(), baseUrl).href;
      if (resolved !== baseUrl && !resolved.startsWith("javascript:")) {
        return resolved;
      }
    } catch (err) {}
    return null;
  }

  // Scan head resources
  $('head link').each((_, el) => {
    const rel = $(el).attr('rel') || '';
    if (rel.toLowerCase().includes('stylesheet')) {
      const href = $(el).attr('href');
      const resolved = resolveAssetUrl(href);
      if (resolved) {
        cssUrls.add(resolved);
        const media = ($(el).attr('media') || '').toLowerCase();
        const disabled = $(el).attr('disabled') !== undefined;
        if (media !== 'print' && !disabled) {
          renderBlockingCss.push(resolved);
        }
      }
    }
  });

  $('head script').each((_, el) => {
    const src = $(el).attr('src');
    const resolved = resolveAssetUrl(src);
    if (resolved) {
      jsUrls.add(resolved);
      const isAsync = $(el).attr('async') !== undefined;
      const isDefer = $(el).attr('defer') !== undefined;
      if (!isAsync && !isDefer) {
        renderBlockingJs.push(resolved);
      }
    }
  });

  // Scan body links/scripts
  $('body link').each((_, el) => {
    const rel = $(el).attr('rel') || '';
    if (rel.toLowerCase().includes('stylesheet')) {
      const href = $(el).attr('href');
      const resolved = resolveAssetUrl(href);
      if (resolved) {
        cssUrls.add(resolved);
      }
    }
  });

  $('body script').each((_, el) => {
    const src = $(el).attr('src');
    const resolved = resolveAssetUrl(src);
    if (resolved) {
      jsUrls.add(resolved);
    }
  });

  // Image layout dimensions (CLS) & lazy loading
  const images = $('img');
  let missingLazyCount = 0;
  let missingDimensionsCount = 0;

  images.each((idx, el) => {
    const src = $(el).attr('src');
    if (!src) return;

    const width = $(el).attr('width');
    const height = $(el).attr('height');
    const style = $(el).attr('style') || "";
    const hasStyleDim = style.toLowerCase().includes("width") || style.toLowerCase().includes("height");

    if (!width && !height && !hasStyleDim) {
      missingDimensionsCount++;
    }

    if (idx >= 2) {
      const loading = ($(el).attr('loading') || '').toLowerCase();
      if (loading !== 'lazy') {
        missingLazyCount++;
      }
    }
  });

  // Concurrently audit a subset of CSS/JS (up to 4 of each)
  const cssToFetch = Array.from(cssUrls).slice(0, 4);
  const jsToFetch = Array.from(jsUrls).slice(0, 4);
  const assetsToCheck = [...cssToFetch, ...jsToFetch];

  console.log(`[Performance] Auditing ${assetsToCheck.length} static assets...`);
  const assetResults = {};

  const tasks = [];
  const taskUrls = [];

  for (const url of assetsToCheck) {
    let isInternal = false;
    try {
      const parsedAsset = new URL(url);
      isInternal = !parsedAsset.hostname || parsedAsset.hostname.toLowerCase() === baseDomain;
    } catch (err) {}

    if (isInternal) {
      tasks.push(
        axios.get(url, {
          timeout: 3000,
          httpsAgent: agent,
          validateStatus: () => true
        })
      );
      taskUrls.push(url);
    } else {
      // External CDN logic
      const isLarge = LARGE_CSS_LIBS.some(lib => url.toLowerCase().includes(lib)) || 
                      LARGE_JS_LIBS.some(lib => url.toLowerCase().includes(lib));
      assetResults[url] = {
        size_kb: isLarge ? 120.0 : 45.0,
        compressed: true,
        cached: true,
        external: true
      };
    }
  }

  if (tasks.length > 0) {
    const responses = await Promise.all(tasks.map(p => p.catch(err => ({ status: 500, headers: {}, data: '' }))));
    for (let i = 0; i < taskUrls.length; i++) {
      const url = taskUrls[i];
      const resp = responses[i];

      if (resp.status >= 400) {
        assetResults[url] = {
          size_kb: 50.0,
          compressed: true,
          cached: true,
          failed: true
        };
      } else {
        const encoding = (resp.headers["content-encoding"] || "").toLowerCase();
        const compressed = ["gzip", "br", "deflate"].some(enc => encoding.includes(enc));

        const len = resp.headers["content-length"];
        const sizeBytes = len ? parseInt(len, 10) : (typeof resp.data === 'string' ? resp.data.length : 0);
        const sizeKb = Math.round((sizeBytes / 1024) * 100) / 100;

        const cacheControl = (resp.headers["cache-control"] || "").toLowerCase();
        const expires = resp.headers["expires"];
        let hasCache = false;
        if (cacheControl) {
          if (!["no-store", "no-cache", "max-age=0"].some(term => cacheControl.includes(term))) {
            hasCache = true;
          }
        } else if (expires) {
          hasCache = true;
        }

        assetResults[url] = {
          size_kb: sizeKb,
          compressed,
          cached: hasCache,
          external: false
        };
      }
    }
  }

  let largeCssCount = 0;
  let largeJsCount = 0;
  let missingCompressionCount = 0;
  let missingCachingCount = 0;
  let unusedCssFlag = false;
  let unusedJsFlag = false;
  let totalCssKb = 0.0;
  let totalJsKb = 0.0;

  for (const url of cssUrls) {
    const meta = assetResults[url] || { size_kb: 35.0, compressed: true, cached: true };
    const size = meta.size_kb || 35.0;
    totalCssKb += size;
    if (size > 100.0) largeCssCount++;
    if (!meta.compressed) missingCompressionCount++;
    if (!meta.cached) missingCachingCount++;
    if (size > 100.0 || LARGE_CSS_LIBS.some(lib => url.toLowerCase().includes(lib))) {
      unusedCssFlag = true;
    }
  }

  for (const url of jsUrls) {
    const meta = assetResults[url] || { size_kb: 45.0, compressed: true, cached: true };
    const size = meta.size_kb || 45.0;
    totalJsKb += size;
    if (size > 200.0) largeJsCount++;
    if (!meta.compressed) missingCompressionCount++;
    if (!meta.cached) missingCachingCount++;
    if (size > 150.0 || LARGE_JS_LIBS.some(lib => url.toLowerCase().includes(lib))) {
      unusedJsFlag = true;
    }
  }

  const issues = [];
  if (renderBlockingCss.length > 0 || renderBlockingJs.length > 0) {
    issues.push({
      check_name: "Render-blocking resources",
      message: `Found ${renderBlockingCss.length} stylesheets and ${renderBlockingJs.length} scripts in the head blocking initial render.`,
      severity: "critical"
    });
  }

  if (missingLazyCount > 0) {
    const totalBelowFold = Math.max(1, images.length - 2);
    const pct = Math.floor((missingLazyCount / totalBelowFold) * 100);
    issues.push({
      check_name: "Missing lazy loading",
      message: `Detected ${missingLazyCount} images without lazy loading (about ${pct}% of below-the-fold images).`,
      severity: "warning"
    });
  }

  if (largeCssCount > 0) {
    issues.push({
      check_name: "Large CSS files",
      message: `Found ${largeCssCount} CSS files exceeding the recommended 100 KB threshold.`,
      severity: "warning"
    });
  }

  if (largeJsCount > 0) {
    issues.push({
      check_name: "Large JavaScript files",
      message: `Found ${largeJsCount} JavaScript files exceeding the recommended 200 KB threshold.`,
      severity: "critical"
    });
  }

  if (unusedCssFlag) {
    issues.push({
      check_name: "Unused CSS",
      message: "Potential unused CSS classes detected in oversized files or large structural libraries.",
      severity: "warning"
    });
  }

  if (unusedJsFlag) {
    issues.push({
      check_name: "Unused JavaScript",
      message: "Potential unused JavaScript or modules found in large client bundles or dependency files.",
      severity: "warning"
    });
  }

  if (missingCompressionCount > 0) {
    issues.push({
      check_name: "Missing compression",
      message: `Found ${missingCompressionCount} stylesheet/script assets serving without gzip or Brotli compression.`,
      severity: "critical"
    });
  }

  if (missingCachingCount > 0) {
    issues.push({
      check_name: "Missing browser caching",
      message: `Found ${missingCachingCount} static style or script assets missing Cache-Control headers.`,
      severity: "warning"
    });
  }

  const recommendations = [];
  if (renderBlockingCss.length > 0 || renderBlockingJs.length > 0) {
    recommendations.push("Eliminate render-blocking resources by deferring non-critical CSS/JS, using async/defer attributes on script tags, or preloading critical assets.");
  }
  if (missingLazyCount > 0) {
    recommendations.push("Add `loading=\"lazy\"` attributes to below-the-fold images to improve initial viewport rendering speeds.");
  }
  if (largeCssCount > 0 || unusedCssFlag) {
    recommendations.push("Reduce stylesheet payloads by minifying CSS, removing unused classes, or splitting layouts based on page templates.");
  }
  if (largeJsCount > 0 || unusedJsFlag) {
    recommendations.push("Decrease JavaScript file weight using modern code-splitting, tree-shaking dead code, and minifying bundle contents.");
  }
  if (missingCompressionCount > 0) {
    recommendations.push("Enable GZIP or Brotli compression on your web server for all text-based assets (HTML, CSS, JS).");
  }
  if (missingCachingCount > 0) {
    recommendations.push("Configure long-term cache lifetimes (e.g., Cache-Control: max-age=31536000) for static assets like CSS, JS, and images.");
  }
  if (missingDimensionsCount > 0) {
    recommendations.push("Specify explicit `width` and `height` attributes on images to reserve space and prevent layout shifts.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Excellent performance metrics! Continue monitoring page asset counts as content increases.");
  }

  let score = 100;
  if (renderBlockingCss.length > 0 || renderBlockingJs.length > 0) score -= 15;
  if (missingLazyCount > 0) score -= 10;
  if (largeCssCount > 0) score -= 10;
  if (largeJsCount > 0) score -= 15;
  if (unusedCssFlag) score -= 10;
  if (unusedJsFlag) score -= 15;
  if (missingCompressionCount > 0) score -= 15;
  if (missingCachingCount > 0) score -= 10;

  const finalScore = Math.max(0, Math.min(100, score));

  // Dynamic CWV timing estimates
  const ttfb = Math.round(responseTimeMs * 100) / 100;
  const fcpCalc = ttfb + 300.0 + (renderBlockingCss.length * 120.0) + (renderBlockingJs.length * 150.0);
  const fcp = Math.round(Math.max(ttfb + 150.0, fcpCalc) * 100) / 100;
  const lcpImgFactor = Math.min(1200.0, images.length * 60.0);
  const lcp = Math.round(Math.max(fcp + 100.0, fcp + 300.0 + lcpImgFactor) * 100) / 100;

  const clsCalc = 0.01 + (missingDimensionsCount * 0.035);
  const cls = Math.round(Math.min(0.8, clsCalc) * 1000) / 1000;

  const inpCalc = 45.0 + (renderBlockingJs.length * 30.0) + (largeJsCount * 45.0);
  const inp = Math.round(Math.min(500.0, inpCalc) * 100) / 100;

  const loadTimeCalc = ttfb + (totalCssKb * 3.5) + (totalJsKb * 4.5) + (images.length * 55.0);
  const pageLoadTime = Math.round(Math.max(lcp, Math.min(8000.0, loadTimeCalc)) * 100) / 100;

  return {
    performance_score: finalScore,
    metrics: {
      page_load_time_ms: pageLoadTime,
      fcp_ms: fcp,
      lcp_ms: lcp,
      cls,
      inp_ms: inp,
      ttfb_ms: ttfb
    },
    issues,
    recommendations
  };
}

module.exports = { runPerformanceAnalysis };
