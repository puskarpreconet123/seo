const axios = require('axios');
const https = require('https');
const cheerio = require('cheerio');

const agent = new https.Agent({
  rejectUnauthorized: false
});

const GENERIC_ANCHOR_TERMS = new Set([
  "click here", "read more", "learn more", "here", "link", "go", "website",
  "visit", "visit this page", "more", "info", "information", "click", "this",
  "view", "details", "check it out", "url", "button", "page", "source"
]);

async function fetchSitemapUrls(baseUrl) {
  try {
    const parsedUrl = new URL(baseUrl);
    const sitemapUrl = `${parsedUrl.origin}/sitemap.xml`;
    const response = await axios.get(sitemapUrl, {
      timeout: 4000,
      httpsAgent: agent,
      validateStatus: () => true
    });
    
    if (response.status === 200) {
      const $ = cheerio.load(response.data, { xmlMode: true });
      const locs = [];
      $('loc').each((_, el) => {
        const text = $(el).text().trim();
        if (text) locs.push(text);
      });
      return Array.from(new Set(locs));
    }
  } catch (err) {
    console.log(`[LinkAnalyzer] Failed to fetch sitemap for orphan check: ${err.message}`);
  }
  return [];
}

async function checkLinkMetadata(url) {
  const result = {
    url,
    status_code: 0,
    final_url: url,
    redirect_count: 0,
    history: [],
    success: false
  };

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return result;
  }

  try {
    const response = await axios.get(url, {
      timeout: 4000,
      httpsAgent: agent,
      maxRedirects: 5,
      validateStatus: () => true
    });
    
    result.status_code = response.status;
    result.final_url = response.request?.res?.responseUrl || url;
    const historyUrls = (response.history || []).map(r => r.request?.res?.responseUrl || r.config?.url).filter(Boolean);
    result.redirect_count = historyUrls.length;
    result.history = historyUrls;
    result.success = response.status < 400;
    return result;
  } catch (err) {
    try {
      const response = await axios.head(url, {
        timeout: 3000,
        httpsAgent: agent,
        maxRedirects: 5,
        validateStatus: () => true
      });
      result.status_code = response.status;
      result.final_url = response.request?.res?.responseUrl || url;
      const historyUrls = (response.history || []).map(r => r.request?.res?.responseUrl || r.config?.url).filter(Boolean);
      result.redirect_count = historyUrls.length;
      result.history = historyUrls;
      result.success = response.status < 400;
      return result;
    } catch (e) {
      return result;
    }
  }
}

async function runLinkAnalysis(seoData, baseUrl) {
  const detailedLinks = seoData.detailed_links || [];
  
  const passed = [];
  const warnings = [];
  const critical = [];

  const validLinks = detailedLinks.filter(lnk => lnk.href && lnk.href.startsWith("http"));
  const internalValid = validLinks.filter(lnk => !lnk.is_external);
  const externalValid = validLinks.filter(lnk => lnk.is_external);

  const uniqueInternalUrls = Array.from(new Set(internalValid.map(lnk => lnk.href))).slice(0, 15);
  const uniqueExternalUrls = Array.from(new Set(externalValid.map(lnk => lnk.href))).slice(0, 15);
  const urlsToCheck = [...uniqueInternalUrls, ...uniqueExternalUrls];

  console.log(`[LinkAnalyzer] Auditing ${urlsToCheck.length} unique URLs and fetching sitemap...`);
  const [checkResults, sitemapUrls] = await Promise.all([
    Promise.all(urlsToCheck.map(url => checkLinkMetadata(url))),
    fetchSitemapUrls(baseUrl)
  ]);

  const urlResultsMap = {};
  for (let i = 0; i < urlsToCheck.length; i++) {
    urlResultsMap[urlsToCheck[i]] = checkResults[i];
  }

  let internalBrokenCount = 0;
  let internalRedirectCount = 0;
  let internalNofollowCount = 0;
  let internalRedirectChainCount = 0;
  
  let externalBrokenCount = 0;
  let externalRedirectCount = 0;
  let externalNofollowCount = 0;
  let externalRedirectChainCount = 0;
  let externalHttpCount = 0;
  let externalHttpsCount = 0;

  const orphanLinks = [];
  const emptyAnchors = [];
  const duplicateAnchorsMap = {};
  const genericAnchors = [];
  const redirectChains = [];

  for (const lnk of detailedLinks) {
    const txt = (lnk.text || "").trim().toLowerCase();
    const href = lnk.href;
    if (txt && href) {
      if (!duplicateAnchorsMap[txt]) {
        duplicateAnchorsMap[txt] = new Set();
      }
      duplicateAnchorsMap[txt].add(href);
    }
  }

  let placeholderCount = 0;
  let baseDomain = '';
  try {
    baseDomain = new URL(baseUrl).hostname.toLowerCase();
  } catch (err) {}

  for (let idx = 0; idx < detailedLinks.length; idx++) {
    const lnk = detailedLinks[idx];
    const href = lnk.href || "";
    const rawHref = lnk.raw_href || "";
    const text = (lnk.text || "").trim();
    const rel = lnk.rel || "";
    const isExternal = lnk.is_external || false;
    const hasHref = lnk.has_href !== undefined ? lnk.has_href : true;

    const isPlaceholder = !hasHref || ["", "#", "javascript:void(0)", "javascript:void(0);"].includes(rawHref) || rawHref.startsWith("javascript:");
    if (isPlaceholder) {
      placeholderCount++;
      if (text) {
        warnings.push({
          check_name: "Placeholder Link",
          message: `Link #${idx + 1} uses a non-functional href ('${rawHref || '[None]'}') with anchor text '${text.slice(0, 50)}'. This may be a JavaScript-powered navigation element — verify it's accessible to crawlers.`
        });
      } else {
        critical.push({
          check_name: "Placeholder Link",
          message: `Link #${idx + 1} is a non-functional or empty placeholder with no anchor text (href='${rawHref || '[None]'}'). This hurts crawlability.`
        });
      }
    }

    if (hasHref && !text) {
      emptyAnchors.push({
        href,
        index: idx + 1
      });
    }

    if (text && GENERIC_ANCHOR_TERMS.has(text.toLowerCase())) {
      genericAnchors.push({
        text,
        href,
        index: idx + 1
      });
    }

    if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      continue;
    }

    const meta = urlResultsMap[href] || {
      status_code: 200,
      final_url: href,
      redirect_count: 0,
      history: [],
      success: true
    };

    const isBroken = !meta.success || meta.status_code === 0 || meta.status_code >= 400;
    const isRedirect = meta.redirect_count > 0 || (meta.status_code >= 300 && meta.status_code < 400);
    const isChain = meta.redirect_count > 1;

    if (isChain) {
      redirectChains.push({
        url: href,
        redirect_count: meta.redirect_count,
        history: meta.history,
        status_code: meta.status_code
      });
    }

    if (isExternal) {
      if (isBroken) externalBrokenCount++;
      if (isRedirect) externalRedirectCount++;
      if (isChain) externalRedirectChainCount++;
      if (rel.toLowerCase().includes("nofollow")) externalNofollowCount++;
      
      if (href.startsWith("https://")) {
        externalHttpsCount++;
      } else if (href.startsWith("http://")) {
        externalHttpCount++;
      }
    } else {
      if (isBroken) internalBrokenCount++;
      if (isRedirect) internalRedirectCount++;
      if (isChain) internalRedirectChainCount++;
      if (rel.toLowerCase().includes("nofollow")) internalNofollowCount++;
    }
  }

  const duplicateAnchorsList = [];
  for (const [txt, urls] of Object.entries(duplicateAnchorsMap)) {
    if (urls.size > 1) {
      duplicateAnchorsList.push({
        text: txt,
        urls: Array.from(urls).sort(),
        count: urls.size
      });
    }
  }

  let internalDuplicatesCount = 0;
  for (const item of duplicateAnchorsList) {
    const hasInternal = item.urls.some(u => {
      const match = detailedLinks.find(l => l.href === u);
      return match && !match.is_external;
    });
    if (hasInternal) {
      internalDuplicatesCount++;
    }
  }

  const allPageHrefs = new Set(detailedLinks.map(l => l.href).filter(Boolean));
  for (const sUrl of sitemapUrls) {
    if (!allPageHrefs.has(sUrl) && sUrl !== baseUrl) {
      try {
        const sDomain = new URL(sUrl).hostname.toLowerCase();
        if (sDomain === baseDomain) {
          orphanLinks.push(sUrl);
        }
      } catch (err) {}
    }
  }

  let internalScore = 100.0;
  const totalInternal = detailedLinks.filter(l => !l.is_external).length;
  if (totalInternal > 0) {
    internalScore -= Math.min(45.0, internalBrokenCount * 15.0);
    internalScore -= Math.min(15.0, internalRedirectCount * 5.0);
    internalScore -= Math.min(20.0, redirectChains.filter(rc => {
      try {
        const hostname = new URL(rc.url).hostname.toLowerCase();
        return !hostname || hostname === baseDomain;
      } catch (err) { return true; }
    }).length * 10.0);
    internalScore -= Math.min(15.0, emptyAnchors.filter(ea => allPageHrefs.has(ea.href)).length * 5.0);
    internalScore -= Math.min(15.0, genericAnchors.length * 5.0);
    internalScore -= Math.min(15.0, internalDuplicatesCount * 5.0);
    internalScore -= Math.min(15.0, placeholderCount * 5.0);
    internalScore -= Math.min(15.0, internalNofollowCount * 5.0);
    internalScore -= Math.min(10.0, orphanLinks.length * 2.0);
  }
  const internalLinkScore = Math.max(0, Math.min(100, Math.floor(internalScore)));

  let externalScore = 100.0;
  const totalExternal = detailedLinks.filter(l => l.is_external).length;
  if (totalExternal > 0) {
    externalScore -= Math.min(45.0, externalBrokenCount * 15.0);
    externalScore -= Math.min(15.0, externalRedirectCount * 5.0);
    externalScore -= Math.min(20.0, redirectChains.filter(rc => {
      try {
        const hostname = new URL(rc.url).hostname.toLowerCase();
        return hostname && hostname !== baseDomain;
      } catch (err) { return false; }
    }).length * 10.0);
    const extPoorAnchors = emptyAnchors.filter(ea => externalValid.some(ev => ev.href === ea.href)).length + 
                           genericAnchors.filter(ga => externalValid.some(ev => ev.href === ga.href)).length;
    externalScore -= Math.min(15.0, extPoorAnchors * 5.0);
    externalScore -= Math.min(30.0, externalHttpCount * 10.0);
  }
  const externalLinkScore = Math.max(0, Math.min(100, Math.floor(externalScore)));

  if (totalInternal === 0) {
    warnings.push({
      check_name: "Internal Link Presence",
      message: "No internal links found on this page. Adding internal links is highly recommended to distribute PageRank."
    });
  } else {
    passed.push({
      check_name: "Internal Link Presence",
      message: `Found ${totalInternal} internal links on the page.`
    });
    if (internalBrokenCount > 0) {
      critical.push({
        check_name: "Broken Internal Links",
        message: `Detected ${internalBrokenCount} broken internal links. These lead to 4xx/5xx or connectivity errors.`
      });
    } else {
      passed.push({
        check_name: "Broken Internal Links",
        message: "All checked internal links are healthy and responsive."
      });
    }
    if (internalRedirectCount > 0) {
      warnings.push({
        check_name: "Internal Link Redirects",
        message: `Found ${internalRedirectCount} redirected internal links. Point links directly to final destination URLs to conserve crawl budget.`
      });
    }
    if (internalNofollowCount > 0) {
      warnings.push({
        check_name: "Nofollow Internal Links",
        message: `Found ${internalNofollowCount} internal links with rel='nofollow'. Internal links should normally be crawlable by search engines.`
      });
    }
  }

  if (totalExternal === 0) {
    warnings.push({
      check_name: "External Link Presence",
      message: "No outbound external links found. Linking to high-quality, authoritative external sources helps build credibility."
    });
  } else {
    passed.push({
      check_name: "External Link Presence",
      message: `Found ${totalExternal} outbound external links.`
    });
    if (externalBrokenCount > 0) {
      critical.push({
        check_name: "Broken External Links",
        message: `Detected ${externalBrokenCount} broken outbound external links. Remove or replace these dead endpoints.`
      });
    } else {
      passed.push({
        check_name: "Broken External Links",
        message: "All checked external links are healthy."
      });
    }
    if (externalHttpCount > 0) {
      critical.push({
        check_name: "Insecure Outbound Links",
        message: `Found ${externalHttpCount} insecure HTTP links pointing to external sites. Outbound links should use secure HTTPS protocol.`
      });
    } else {
      passed.push({
        check_name: "Insecure Outbound Links",
        message: "All outbound links point to secure HTTPS destinations."
      });
    }
    if (externalRedirectCount > 0) {
      warnings.push({
        check_name: "External Link Redirects",
        message: `Found ${externalRedirectCount} redirected external links. Consider updating them to their final destination URLs.`
      });
    }
  }

  if (redirectChains.length > 0) {
    critical.push({
      check_name: "Redirect Chains",
      message: `Detected ${redirectChains.length} redirect chain(s) (links with 2+ consecutive redirects). Consolidate these links.`
    });
  } else {
    passed.push({
      check_name: "Redirect Chains",
      message: "No link redirect chains (2+ redirects) were detected."
    });
  }

  if (orphanLinks.length > 0) {
    warnings.push({
      check_name: "Orphan Pages",
      message: `Found ${orphanLinks.length} pages in the sitemap that are not linked from this page. Add internal links to these pages.`
    });
  }

  if (emptyAnchors.length > 0) {
    critical.push({
      check_name: "Empty Anchors Check",
      message: `Detected ${emptyAnchors.length} empty anchors (links with no clickable text/alt description). This hurts accessibility and keyword indexing.`
    });
  } else {
    passed.push({
      check_name: "Empty Anchors Check",
      message: "All hyperlink elements on the page have valid anchor text or image alt descriptions."
    });
  }

  if (genericAnchors.length > 0) {
    warnings.push({
      check_name: "Generic Anchor Text",
      message: `Found ${genericAnchors.length} generic anchor texts (e.g. 'click here', 'read more'). Replace them with descriptive keyword-rich phrases.`
    });
  } else {
    passed.push({
      check_name: "Generic Anchor Text",
      message: "Anchor texts are descriptive and avoid low-quality generic words."
    });
  }

  if (duplicateAnchorsList.length > 0) {
    warnings.push({
      check_name: "Duplicate Anchor Contexts",
      message: `Found ${duplicateAnchorsList.length} duplicate anchor texts pointing to multiple different target URLs. This can cause cannibalization.`
    });
  } else {
    passed.push({
      check_name: "Duplicate Anchor Contexts",
      message: "Anchor texts uniquely point to single target destinations."
    });
  }

  const suggestions = [];
  if (internalBrokenCount > 0 || externalBrokenCount > 0) {
    suggestions.push(`Repair the ${internalBrokenCount + externalBrokenCount} broken links returning non-success HTTP status codes.`);
  }
  if (externalHttpCount > 0) {
    suggestions.push(`Update the ${externalHttpCount} insecure HTTP links to HTTPS schemes to preserve connection security.`);
  }
  if (redirectChains.length > 0) {
    suggestions.push(`Consolidate the ${redirectChains.length} redirect chain(s) to avoid unnecessary HTTP latency for crawlers.`);
  }
  if (emptyAnchors.length > 0) {
    suggestions.push(`Add descriptive anchor text or nested image alt text to the ${emptyAnchors.length} empty hyperlink elements.`);
  }
  if (genericAnchors.length > 0) {
    suggestions.push(`Optimize the ${genericAnchors.length} generic link phrases (e.g. 'click here') into keyword-rich anchor texts.`);
  }
  if (orphanLinks.length > 0) {
    suggestions.push(`Add internal links to the ${orphanLinks.length} orphan pages listed in the sitemap to integrate them into the site architecture.`);
  }
  if (internalNofollowCount > 0) {
    suggestions.push(`Remove the rel='nofollow' attribute from the ${internalNofollowCount} internal links to allow correct PageRank distribution.`);
  }

  if (suggestions.length === 0) {
    suggestions.push("Incredible! Your links structure, anchor texts, security schemes, and page redirects are fully optimized.");
  }

  return {
    internal_link_score: internalLinkScore,
    external_link_score: externalLinkScore,
    internal_stats: {
      total_count: totalInternal,
      broken_count: internalBrokenCount,
      redirected_count: internalRedirectCount,
      nofollow_count: internalNofollowCount,
      http_count: 0,
      https_count: totalInternal - internalNofollowCount
    },
    external_stats: {
      total_count: totalExternal,
      broken_count: externalBrokenCount,
      redirected_count: externalRedirectCount,
      nofollow_count: externalNofollowCount,
      http_count: externalHttpCount,
      https_count: externalHttpsCount
    },
    passed,
    warnings,
    critical,
    orphan_links: orphanLinks,
    empty_anchors: emptyAnchors,
    duplicate_anchors: duplicateAnchorsList,
    generic_anchors: genericAnchors,
    redirect_chains: redirectChains,
    optimization_suggestions: suggestions
  };
}

module.exports = { runLinkAnalysis };

