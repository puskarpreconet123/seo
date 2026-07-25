const { chromium } = require('playwright');
const axios = require('axios');
const https = require('https');

const BROWSER_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function crawlUrl(url, timeoutMs = 30000) {
  let formattedUrl = (url || '').trim();
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = 'https://' + formattedUrl;
  }
  url = formattedUrl;

  const result = {
    success: false,
    requested_url: url,
    final_url: null,
    status_code: null,
    response_time_ms: 0.0,
    html: "",
    error_message: null
  };

  const startTime = Date.now();
  let playwrightSuccess = false;
  let browserInstance = null;

  try {
    console.log(`[Crawler] Launching Playwright Chromium for: ${url}`);
    browserInstance = await chromium.launch({
      headless: true,
      args: ["--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage"]
    });

    const context = await browserInstance.newContext({
      userAgent: BROWSER_USER_AGENT,
      viewport: { width: 1280, height: 800 },
      ignoreHTTPSErrors: true
    });

    const page = await context.newPage();
    
    // Set explicit navigations
    const response = await page.goto(url, {
      timeout: timeoutMs,
      waitUntil: "domcontentloaded"
    });

    const endTime = Date.now();

    if (response) {
      result.status_code = response.status();
      result.final_url = page.url();
      result.html = await page.content();
      result.response_time_ms = Math.round((endTime - startTime) * 100) / 100;
      result.success = response.status() < 400;
      if (!result.success) {
        result.error_message = `HTTP ${response.status()}: ${response.statusText()}`;
      }
      playwrightSuccess = true;
      console.log(`[Crawler] Playwright crawl succeeded for ${url} in ${result.response_time_ms}ms`);
    } else {
      result.error_message = "No response received from page navigation";
    }
  } catch (err) {
    console.warn(`[Crawler] Playwright navigation failed or timed out: ${err.message}. Falling back to Axios...`);
    result.error_message = `Playwright error: ${err.message}`;
  } finally {
    if (browserInstance) {
      await browserInstance.close();
    }
  }

  // Fallback to Axios
  if (!playwrightSuccess) {
    const startTimeFallback = Date.now();
    const agent = new https.Agent({ rejectUnauthorized: false });

    try {
      console.log(`[Crawler] Executing fallback Axios request for: ${url}`);
      const response = await axios.get(url, {
        headers: {
          "User-Agent": BROWSER_USER_AGENT,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Connection": "keep-alive"
        },
        timeout: timeoutMs,
        httpsAgent: agent,
        maxRedirects: 5,
        validateStatus: () => true
      });

      const endTimeFallback = Date.now();

      result.status_code = response.status;
      // Axios request history is used to resolve final url
      const history = response.request?.res?.responseUrl || url;
      result.final_url = history;
      result.response_time_ms = Math.round((endTimeFallback - startTimeFallback) * 100) / 100;
      result.html = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      result.success = response.status < 400;
      result.error_message = result.success ? null : `HTTP ${response.status}: ${response.statusText || 'Error'}`;

      console.log(`[Crawler] Fallback Axios crawl completed: ${url} -> ${result.final_url} [${result.status_code}] in ${result.response_time_ms}ms`);
    } catch (err) {
      const endTimeFallback = Date.now();
      result.response_time_ms = Math.round((endTimeFallback - startTimeFallback) * 100) / 100;
      result.error_message = `Axios crawl failed: ${err.message}`;
      console.error(`[Crawler] Fallback Axios crawl failed for ${url}: ${err.message}`);
    }
  }

  return result;
}

module.exports = { crawlUrl };

