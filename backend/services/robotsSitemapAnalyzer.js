const axios = require('axios');
const https = require('https');
const cheerio = require('cheerio');

const agent = new https.Agent({
  rejectUnauthorized: false
});

const VALID_DIRECTIVES = new Set([
  "user-agent", "allow", "disallow", "sitemap", "crawl-delay", "host", "clean-param"
]);

function editDistance(s1, s2) {
  if (Math.abs(s1.length - s2.length) > 2) return 99;
  if (!s1) return s2.length;
  if (!s2) return s1.length;
  
  let previousRow = Array.from({ length: s2.length + 1 }, (_, i) => i);
  for (let i = 0; i < s1.length; i++) {
    const currentRow = [i + 1];
    for (let j = 0; j < s2.length; j++) {
      const insertions = previousRow[j + 1] + 1;
      const deletions = currentRow[j] + 1;
      const substitutions = previousRow[j] + (s1[i] !== s2[j] ? 1 : 0);
      currentRow.push(Math.min(insertions, deletions, substitutions));
    }
    previousRow = currentRow;
  }
  return previousRow[previousRow.length - 1];
}

function validateRobotsSyntax(content) {
  const errors = [];
  const lines = content.split(/\r?\n/);

  for (let idx = 0; idx < lines.length; idx++) {
    const lineClean = lines[idx].trim();
    if (!lineClean || lineClean.startsWith("#")) continue;

    if (!lineClean.includes(":")) {
      errors.push(`Line ${idx + 1}: Missing ':' separator in directive list: '${lineClean}'`);
      continue;
    }

    const directive = lineClean.split(":", 1)[0].trim().toLowerCase();
    if (!VALID_DIRECTIVES.has(directive)) {
      let isTypo = false;
      let closestStd = "";
      for (const std of VALID_DIRECTIVES) {
        if (editDistance(directive, std) <= 2) {
          isTypo = true;
          closestStd = std;
          break;
        }
      }

      if (isTypo) {
        errors.push(`Line ${idx + 1}: Unknown directive '${directive}' found (possible typo for '${closestStd}').`);
      }
    }
  }
  return errors;
}

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
};

async function fetchUrlStatus(url) {
  try {
    const response = await axios.get(url, {
      headers: BROWSER_HEADERS,
      timeout: 5000,
      httpsAgent: agent,
      maxRedirects: 5,
      validateStatus: () => true
    });
    return [url, response.status, response.status < 400];
  } catch (err) {
    return [url, 0, false];
  }
}

async function parseSitemapXml(sitemapUrl, depth = 1, maxDepth = 3) {
  const result = {
    xml_valid: false,
    urls: [],
    nested_sitemaps: [],
    status_code: 0
  };

  if (depth > maxDepth) return result;

  try {
    const response = await axios.get(sitemapUrl, {
      timeout: 5000,
      httpsAgent: agent,
      validateStatus: () => true
    });
    
    result.status_code = response.status;
    if (response.status !== 200) return result;

    const $ = cheerio.load(response.data, { xmlMode: true });
    result.xml_valid = true;

    const isSitemapIndex = $('sitemapindex').length > 0;

    if (isSitemapIndex) {
      const nestedUrls = [];
      $('sitemap loc').each((_, el) => {
        const text = $(el).text().trim();
        if (text) nestedUrls.push(text);
      });
      result.nested_sitemaps = nestedUrls;

      const tasks = [];
      for (const nUrl of nestedUrls.slice(0, 5)) {
        try {
          const absNUrl = new URL(nUrl, sitemapUrl).href;
          tasks.push(parseSitemapXml(absNUrl, depth + 1, maxDepth));
        } catch (err) {}
      }

      const nestedResults = await Promise.all(tasks);
      for (const nr of nestedResults) {
        if (nr.xml_valid) {
          result.urls.push(...nr.urls);
        }
      }
    } else {
      $('url').each((_, el) => {
        const loc = $(el).find('loc').text().trim();
        const lastmod = $(el).find('lastmod').text().trim() || null;
        const priority = $(el).find('priority').text().trim() || null;
        const changefreq = $(el).find('changefreq').text().trim() || null;

        if (loc) {
          result.urls.push({ loc, lastmod, priority, changefreq });
        }
      });
    }
  } catch (err) {
    console.log(`[RobotsSitemap] Failed to parse sitemap XML for ${sitemapUrl}: ${err.message}`);
    result.xml_valid = false;
  }

  return result;
}

async function runRobotsSitemapAnalysis(baseUrl) {
  const passed = [];
  const warnings = [];
  const critical = [];
  const suggestions = [];

  let rootDomain = '';
  try {
    const parsedBase = new URL(baseUrl);
    rootDomain = parsedBase.origin;
  } catch (err) {
    rootDomain = baseUrl;
  }
  const robotsUrl = `${rootDomain}/robots.txt`;

  let robotsExists = false;
  let robotsSyntaxValid = true;
  let crawlDelaySec = null;
  const userAgents = [];
  let sitemapsDeclared = [];
  let isBlocked = false;
  let robotsErrors = [];
  let robotsScore = 100.0;
  let inWildcardBlock = false;

  try {
    const robotsResp = await axios.get(robotsUrl, {
      timeout: 5000,
      httpsAgent: agent,
      validateStatus: () => true
    });

    if (robotsResp.status === 200) {
      robotsExists = true;
      const content = robotsResp.data;

      robotsErrors = validateRobotsSyntax(content);
      if (robotsErrors.length > 0) {
        robotsSyntaxValid = false;
        robotsScore -= Math.min(30.0, robotsErrors.length * 10.0);
      }

      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const lineNoComment = line.split("#", 2)[0].trim();
        if (lineNoComment.toLowerCase().startsWith("sitemap:")) {
          const sPath = lineNoComment.slice("sitemap:".length).trim();
          if (sPath) {
            try {
              const absSUrl = new URL(sPath, rootDomain).href;
              if (!sitemapsDeclared.includes(absSUrl)) {
                sitemapsDeclared.push(absSUrl);
              }
            } catch (err) {}
          }
        }
        
        if (lineNoComment.toLowerCase().startsWith("user-agent:")) {
          const ua = lineNoComment.slice("user-agent:".length).trim();
          if (ua && !userAgents.includes(ua)) {
            userAgents.push(ua);
          }
          inWildcardBlock = (ua === "*");
        }

        if (!lineNoComment) {
          inWildcardBlock = false;
        }

        if (lineNoComment.toLowerCase().startsWith("crawl-delay:")) {
          const delay = parseFloat(lineNoComment.slice("crawl-delay:".length).trim());
          if (!isNaN(delay)) {
            crawlDelaySec = delay;
          }
        }

        if (inWildcardBlock && lineNoComment.toLowerCase() === "disallow: /") {
          isBlocked = true;
        }
      }

      if (isBlocked) {
        robotsScore -= 30.0;
      }
      if (crawlDelaySec && crawlDelaySec > 10) {
        robotsScore -= 10.0;
      }
      if (sitemapsDeclared.length === 0) {
        robotsScore -= 15.0;
      }
    } else {
      robotsScore = 0.0;
    }
  } catch (err) {
    console.log(`[RobotsSitemap] Failed to fetch robots.txt for audit: ${err.message}`);
    robotsScore = 0.0;
  }

  if (!robotsExists) {
    critical.push({
      check_name: "Robots.txt Presence",
      message: "Robots.txt was not found at the root domain. Crawlers need a robots.txt file to determine indexation bounds."
    });
  } else {
    passed.push({
      check_name: "Robots.txt Presence",
      message: "Robots.txt file found at the root domain."
    });
    if (!robotsSyntaxValid) {
      warnings.push({
        check_name: "Robots.txt Syntax Check",
        message: `Detected ${robotsErrors.length} syntax issue(s) in robots.txt. Directives must follow correct schemas.`
      });
    } else {
      passed.push({
        check_name: "Robots.txt Syntax Check",
        message: "Robots.txt directives use correct syntax structures."
      });
    }
    if (isBlocked) {
      critical.push({
        check_name: "Robots.txt Indexation Bounds",
        message: "The audited URL is blocked from being crawled by robots.txt directives (User-agent: *)."
      });
    } else {
      passed.push({
        check_name: "Robots.txt Indexation Bounds",
        message: "The audited URL is allowed to be crawled by wildcard user-agent rules."
      });
    }
    if (sitemapsDeclared.length === 0) {
      warnings.push({
        check_name: "Robots.txt Sitemap Linkage",
        message: "No XML sitemap linkage found in robots.txt. Declare sitemap paths to help search engines find indexable URLs."
      });
    } else {
      passed.push({
        check_name: "Robots.txt Sitemap Linkage",
        message: `Found ${sitemapsDeclared.length} XML sitemap(s) declared in robots.txt.`
      });
    }
  }

  let sitemapExists = false;
  let xmlValid = false;
  let urlCount = 0;
  const brokenUrls = [];
  let sitemapStatus = 0;
  let hasLastmod = false;
  let hasPriority = false;
  let hasChangefreq = false;
  let sitemapScore = 100.0;

  const sitemapUrlsToTest = sitemapsDeclared.length > 0 ? sitemapsDeclared : [`${rootDomain}/sitemap.xml`];
  const targetSitemapUrl = sitemapUrlsToTest[0];

  if (targetSitemapUrl) {
    const sitemapParseRes = await parseSitemapXml(targetSitemapUrl);
    sitemapStatus = sitemapParseRes.status_code;

    if (sitemapStatus === 200) {
      sitemapExists = true;
      xmlValid = sitemapParseRes.xml_valid;

      if (xmlValid) {
        const urlsList = sitemapParseRes.urls;
        urlCount = urlsList.length;

        if (urlCount > 0) {
          const lastmodCount = urlsList.filter(u => u.lastmod).length;
          const priorityCount = urlsList.filter(u => u.priority).length;
          const changefreqCount = urlsList.filter(u => u.changefreq).length;

          hasLastmod = (lastmodCount / urlCount) >= 0.8;
          hasPriority = (priorityCount / urlCount) >= 0.8;
          hasChangefreq = (changefreqCount / urlCount) >= 0.8;

          const sampleUrls = urlsList.slice(0, 5).map(u => {
            try { return new URL(u.loc, targetSitemapUrl).href; } catch (e) { return null; }
          }).filter(Boolean);

          const chkResults = await Promise.all(sampleUrls.map(u => fetchUrlStatus(u)));
          for (const cr of chkResults) {
            const [u, code, isOk] = cr;
            if (!isOk) {
              brokenUrls.push(u);
            }
          }

          if (brokenUrls.length > 0) {
            sitemapScore -= Math.min(45.0, brokenUrls.length * 15.0);
          }
          if (!hasLastmod) sitemapScore -= 10.0;
          if (!hasPriority) sitemapScore -= 10.0;
          if (!hasChangefreq) sitemapScore -= 10.0;
          if (urlCount > 50000) sitemapScore -= 10.0;
        } else {
          sitemapScore -= 20.0;
        }
      } else {
        sitemapScore -= 40.0;
      }
    } else {
      sitemapScore = 0.0;
    }
  } else {
    sitemapScore = 0.0;
  }

  if (!sitemapExists) {
    critical.push({
      check_name: "Sitemap Presence",
      message: "No valid XML sitemap found or sitemap returned a failed HTTP status code. Sitemaps are vital for indexability."
    });
  } else {
    passed.push({
      check_name: "Sitemap Presence",
      message: `XML Sitemap found at '${targetSitemapUrl}' (HTTP status ${sitemapStatus}).`
    });
    if (!xmlValid) {
      critical.push({
        check_name: "Sitemap XML Validity",
        message: "XML sitemap is malformed or invalid. Search engines cannot crawl broken XML structures."
      });
    } else {
      passed.push({
        check_name: "Sitemap XML Validity",
        message: "XML sitemap is correctly formatted and parsed successfully."
      });
      if (urlCount === 0) {
        warnings.push({
          check_name: "Sitemap URL Count",
          message: "XML sitemap contains 0 URLs. Populating sitemaps is required to submit pages for indexing."
        });
      } else {
        passed.push({
          check_name: "Sitemap URL Count",
          message: `XML sitemap contains ${urlCount} page URL declarations.`
        });
        if (brokenUrls.length > 0) {
          critical.push({
            check_name: "Sitemap Broken URLs Check",
            message: `Sitemap audit checked a sample and detected ${brokenUrls.length} broken URL(s) (returning >= 400 or timeouts).`
          });
        } else {
          passed.push({
            check_name: "Sitemap Broken URLs Check",
            message: "Verified a sample of URLs in the sitemap; all returned healthy status codes."
          });
        }
        if (!hasLastmod) {
          warnings.push({
            check_name: "Sitemap Last Modified Header",
            message: "Less than 80% of URLs in the sitemap declare <lastmod> values. Add modified dates to inform crawlers of content updates."
          });
        }
        if (!hasPriority) {
          warnings.push({
            check_name: "Sitemap URL Priority",
            message: "Less than 80% of URLs in the sitemap declare <priority> headers. Set priority tags to organize crawling priority."
          });
        }
        if (!hasChangefreq) {
          warnings.push({
            check_name: "Sitemap Change Frequency",
            message: "Less than 80% of URLs in the sitemap declare <changefreq> metadata. Set changefreq values to direct crawler refresh schedules."
          });
        }
      }
    }
  }

  if (!robotsExists) {
    suggestions.push("Create a valid robots.txt file at your root domain to direct crawler boundaries.");
  } else {
    if (robotsErrors.length > 0) {
      suggestions.push(`Correct the ${robotsErrors.length} syntax directives or invalid lines identified in your robots.txt.`);
    }
    if (isBlocked) {
      suggestions.push("Audited page URL is currently blocked! Adjust disallow directives in robots.txt if this page should be indexable.");
    }
    if (sitemapsDeclared.length === 0) {
      suggestions.push("Declare the absolute URL path of your sitemap index or sitemap file directly inside robots.txt.");
    }
  }

  if (!sitemapExists) {
    suggestions.push("Build and publish a standard XML sitemap (at /sitemap.xml or declared inside robots.txt) listing indexable pages.");
  } else {
    if (!xmlValid) {
      suggestions.push("Rebuild sitemap XML payload; resolve invalid node nesting or unescaped characters in locations.");
    } else {
      if (brokenUrls.length > 0) {
        suggestions.push(`Remove or replace the ${brokenUrls.length} broken URLs in the sitemap sample returning 4xx/5xx errors.`);
      }
      if (!hasLastmod) {
        suggestions.push("Populate the `<lastmod>` date node for all URLs in sitemap to help engines detect changes.");
      }
      if (!hasPriority) {
        suggestions.push("Add relative crawling priorities (`<priority>` tags from 0.0 to 1.0) to sitemap entries.");
      }
      if (!hasChangefreq) {
        suggestions.push("Add `<changefreq>` (always, daily, weekly, etc.) values to direct index refresh intervals.");
      }
    }
  }

  if (suggestions.length === 0) {
    suggestions.push("Incredible! Both robots.txt and sitemap records are fully populated, structurally valid, and fully optimized.");
  }

  return {
    robots_report: {
      exists: robotsExists,
      syntax_valid: robotsSyntaxValid,
      crawl_delay: crawlDelaySec,
      user_agents: userAgents,
      sitemaps_declared: sitemapsDeclared,
      is_audited_url_blocked: isBlocked,
      syntax_errors: robotsErrors,
      score: Math.max(0, Math.min(100, Math.floor(robotsScore)))
    },
    sitemap_report: {
      exists: sitemapExists,
      xml_valid: xmlValid,
      url_count: urlCount,
      broken_urls: brokenUrls,
      status_code: sitemapStatus,
      has_lastmod: hasLastmod,
      has_priority: hasPriority,
      has_changefreq: hasChangefreq,
      score: Math.max(0, Math.min(100, Math.floor(sitemapScore)))
    },
    passed,
    warnings,
    critical,
    optimization_suggestions: suggestions
  };
}

module.exports = { runRobotsSitemapAnalysis };

