const { settings } = require('../config/settings');
const OpenAI = require('openai');

function generateLocalStructureSuggestions(baseUrl, seoData, detections) {
  const suggestions = [];

  const few = detections.few_internal_links || [];
  const orphans = detections.orphan_pages || [];
  const weak = detections.weak_anchor_text || [];
  const broken = detections.broken_internal_links || [];

  // 1. Broken links first
  for (const b of broken) {
    suggestions.push({
      source_page: baseUrl,
      target_page: b.target_url,
      recommended_anchor_text: "Updated Resource Link",
      reason: "Replace the broken link with a valid destination to prevent crawlers hitting dead endpoints.",
      priority: "High"
    });
  }

  // 2. Orphans
  for (const o of orphans) {
    const url = o.url;
    let slug = '';
    try {
      slug = new URL(url).pathname.replace(/^\/|\/$/g, '');
    } catch (e) {
      slug = url.replace(baseUrl, '').replace(/^\/|\/$/g, '');
    }
    let anchor = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (!anchor) anchor = "Special Features";

    suggestions.push({
      source_page: baseUrl,
      target_page: url,
      recommended_anchor_text: `Explore Our ${anchor}`,
      reason: `Integrate orphan page '${url}' into the site architecture to share PageRank and enable indexation.`,
      priority: "High"
    });
  }

  // 3. Pages with few links
  for (const f of few) {
    const url = f.url;
    let slug = '';
    try {
      slug = new URL(url).pathname.replace(/^\/|\/$/g, '');
    } catch (e) {
      slug = url.replace(baseUrl, '').replace(/^\/|\/$/g, '');
    }
    let anchor = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (!anchor) anchor = "Overview Services";

    suggestions.push({
      source_page: baseUrl,
      target_page: url,
      recommended_anchor_text: `Read about ${anchor}`,
      reason: `Strengthen topical authority of page '${url}' by adding an additional relevant internal reference.`,
      priority: "Medium"
    });
  }

  // 4. Weak anchors
  for (const w of weak) {
    const target = w.target_url;
    if (suggestions.some(s => s.target_page === target)) continue;

    let slug = '';
    try {
      slug = new URL(target).pathname.replace(/^\/|\/$/g, '');
    } catch (e) {
      slug = target.replace(baseUrl, '').replace(/^\/|\/$/g, '');
    }
    let anchor = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (!anchor) anchor = "Premium Solutions";

    suggestions.push({
      source_page: baseUrl,
      target_page: target,
      recommended_anchor_text: `Detailed Guide to ${anchor}`,
      reason: `Replace generic/empty anchor text ('${w.anchor_text || '[empty]'}') with semantic keywords describing the destination.`,
      priority: "Medium"
    });
  }

  // 5. Fallback suggestions
  if (suggestions.length === 0) {
    suggestions.push({
      source_page: baseUrl,
      target_page: `${baseUrl.replace(/\/$/, '')}/contact`,
      recommended_anchor_text: "Contact Our Technical SEO Team",
      reason: "Optimize crawl accessibility and user conversions by providing structured calls-to-action to contact points.",
      priority: "Low"
    });
  }

  return suggestions;
}

async function runStructureAnalysis(results) {
  const apiKey = settings.openaiApiKey;
  const isMock = !apiKey || apiKey === "your_openai_api_key_here" || apiKey.trim() === "";

  const requestedUrl = results.requested_url || "https://example.com";
  const finalUrl = results.final_url || requestedUrl;
  const seoData = results.seo_data || {};
  const detailedLinks = seoData.detailed_links || [];
  const linkReport = results.link_analysis_report || {};

  // 1. Programmatic Detections
  // A. Few internal links
  const internalLinks = detailedLinks.filter(l => !l.is_external && l.href);
  const linkCounts = {};
  for (const l of internalLinks) {
    const href = l.href;
    linkCounts[href] = (linkCounts[href] || 0) + 1;
  }

  const fewInternalLinks = [];
  for (const [url, count] of Object.entries(linkCounts)) {
    if (count === 1) {
      fewInternalLinks.push({
        url,
        incoming_count: count,
        message: "Page is only linked once from the audited page, limiting search indexing visibility."
      });
    }
  }

  // B. Orphan Pages
  const orphanUrls = linkReport.orphan_links || [];
  const orphanPages = orphanUrls.map(url => ({
    url,
    message: "Orphan page detected. Present in sitemap but has no internal incoming links from this page."
  }));

  // C. Weak Anchor Text
  const weakAnchorText = [];
  for (const ea of linkReport.empty_anchors || []) {
    weakAnchorText.push({
      source_url: finalUrl,
      target_url: ea.href || "(unknown)",
      anchor_text: "",
      reason: "Anchor text is completely empty (no clickable text or alt description)."
    });
  }
  for (const ga of linkReport.generic_anchors || []) {
    weakAnchorText.push({
      source_url: finalUrl,
      target_url: ga.href || "(unknown)",
      anchor_text: ga.text || "",
      reason: `Generic anchor text ('${ga.text}') used. Replace with descriptive, keyword-rich phrases.`
    });
  }

  // D. Duplicate Anchor Text
  const duplicateAnchors = (linkReport.duplicate_anchors || []).map(da => ({
    anchor_text: da.text || "",
    target_urls: da.urls || [],
    message: `Duplicate anchor text used for ${da.count} different URLs. May cause search keyword cannibalization.`
  }));

  // E. Broken Internal Links
  const brokenInternalLinks = [];
  const hasBrokenInternal = (linkReport.critical || []).some(crit => 
    (crit.check_name || '').toLowerCase().includes("broken internal")
  );
  if (hasBrokenInternal) {
    for (const l of internalLinks) {
      brokenInternalLinks.push({
        source_url: finalUrl,
        target_url: l.href,
        status_code: 404,
        message: "Broken internal link detected."
      });
    }
  }

  const detections = {
    few_internal_links: fewInternalLinks,
    orphan_pages: orphanPages,
    weak_anchor_text: weakAnchorText,
    duplicate_anchor_text: duplicateAnchors,
    broken_internal_links: brokenInternalLinks
  };

  // 2. Link Graph Building
  const nodes = [];
  const edges = [];
  const seenNodes = new Set();

  let rootLabel = '';
  try {
    rootLabel = seoData.title || new URL(finalUrl).hostname;
  } catch (e) {
    rootLabel = seoData.title || finalUrl;
  }

  // Root Node
  nodes.push({
    id: finalUrl,
    label: rootLabel,
    type: "root"
  });
  seenNodes.add(finalUrl);

  // Target Nodes and Edges
  for (const l of detailedLinks) {
    const href = l.href;
    if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      continue;
    }

    const isExternal = l.is_external || false;
    if (isExternal) continue;

    let nodeType = "internal";
    const isBroken = brokenInternalLinks.some(b => b.target_url === href);
    const isWeak = weakAnchorText.some(w => w.target_url === href);

    if (isBroken) {
      nodeType = "broken";
    } else if (isWeak) {
      nodeType = "weak";
    }

    if (!seenNodes.has(href)) {
      let label = href.replace(finalUrl, '').replace(/^\/|\/$/g, '');
      if (!label) label = "home";
      nodes.push({
        id: href,
        label: label.length > 30 ? label.slice(0, 30) + "..." : label,
        type: nodeType
      });
      seenNodes.add(href);
    }

    let status = "valid";
    if (isBroken) {
      status = "broken";
    } else if (isWeak) {
      status = "weak";
    }

    edges.push({
      source: finalUrl,
      target: href,
      label: l.text || "[empty]",
      status
    });
  }

  // Add Orphans
  for (const op of orphanPages) {
    const url = op.url;
    if (!seenNodes.has(url)) {
      let label = url.replace(finalUrl, '').replace(/^\/|\/$/g, '');
      nodes.push({
        id: url,
        label: label.length > 30 ? label.slice(0, 30) + "..." : label,
        type: "orphan"
      });
      seenNodes.add(url);
    }
  }

  const graph = { nodes, edges };

  // 3. Suggestions Generation
  let suggestions = [];

  if (isMock) {
    console.warn("[Structure] Using local structure suggestions fallback.");
    suggestions = generateLocalStructureSuggestions(finalUrl, seoData, detections);
  } else {
    try {
      const openai = new OpenAI({ apiKey: apiKey });
      const inputSummary = {
        url: finalUrl,
        title: seoData.title,
        description: seoData.meta_description,
        headings: seoData.headings || {},
        internal_urls: Object.keys(linkCounts),
        orphan_urls: orphanUrls,
        detections: {
          few_internal_links: fewInternalLinks.map(i => i.url),
          orphan_pages: orphanPages.map(i => i.url),
          weak_anchor_text: weakAnchorText.map(i => i.target_url),
          broken_internal_links: brokenInternalLinks.map(i => i.target_url)
        }
      };

      console.info("[Structure] Querying OpenAI for structural link auditing suggestions...");
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: (
              "You are an expert technical SEO site architect. Analyze the provided site crawl variables and sitemap data. " +
              "You must output a valid JSON object containing exactly one root property 'suggestions', which is a list of objects. " +
              "Each object represents an internal linking recommendation and must have exactly the following properties:\n" +
              "- 'source_page': The URL of the page that should contain the link.\n" +
              "- 'target_page': The URL of the target page to link to.\n" +
              "- 'recommended_anchor_text': The descriptive, keyword-rich anchor text to use for the link.\n" +
              "- 'reason': Rationale explaining why linking these pages improves topical relevance, crawl paths, or distributes authority.\n" +
              "- 'priority': Fix priority ('High', 'Medium', 'Low') based on severity.\n" +
              "Derive suggestions from the detected orphan pages, few internal links, and weak anchor texts."
            )
          },
          {
            role: "user",
            content: `Webpage Crawl & Structure Summary:\n${JSON.stringify(inputSummary, null, 2)}`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1000
      });

      const resultObj = JSON.parse(response.choices[0].message.content || '{}');
      suggestions = resultObj.suggestions || [];
    } catch (err) {
      console.error(`[Structure] OpenAI audit failed: ${err.message}. Falling back to local rules.`);
      suggestions = generateLocalStructureSuggestions(finalUrl, seoData, detections);
    }
  }

  return {
    detections,
    suggestions,
    graph
  };
}

module.exports = { runStructureAnalysis };
