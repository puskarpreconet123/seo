function safeGetNested(dct, ...keys) {
  if (!dct || typeof dct !== 'object') return null;
  let curr = dct;
  for (const key of keys) {
    if (!curr || typeof curr !== 'object') return null;
    curr = curr[key];
    if (curr === undefined || curr === null) return null;
  }
  return curr;
}

function compileCategory(name, items) {
  const completed = items.filter(x => x.status === "Completed").length;
  return {
    category_name: name,
    items,
    completed_count: completed,
    total_count: items.length
  };
}

async function runChecklistGeneration(results) {
  const requestedUrl = results.requested_url || "https://example.com";
  const finalUrl = results.final_url || requestedUrl;
  const seoData = results.seo_data || {};
  
  const seoReport = results.seo_report || {};
  const onpageReport = results.onpage_report || {};
  const contentAnalysis = results.content_analysis || {};
  const imageSeoReport = results.image_seo_report || {};
  const schemaAnalysisReport = results.schema_analysis_report || {};
  const robotsSitemapReport = results.robots_sitemap_report || {};
  const performanceReport = results.performance_report || {};
  const linkAnalysisReport = results.link_analysis_report || {};

  const categories = [];

  // 1. Technical SEO
  const techItems = [];
  
  // HTTPS
  const isHttps = requestedUrl.startsWith("https://") || finalUrl.startsWith("https://");
  techItems.push({
    name: "HTTPS/SSL Security",
    status: isHttps ? "Completed" : "Not Completed",
    recommendation: isHttps ? "Site is secured over HTTPS using SSL." : "Secure site with HTTPS and configure redirection from HTTP.",
    priority: isHttps ? "Low" : "High"
  });

  // Robots.txt
  const hasRobots = safeGetNested(robotsSitemapReport, "robots_report", "exists") ?? true;
  techItems.push({
    name: "Robots.txt File Configuration",
    status: hasRobots ? "Completed" : "Not Completed",
    recommendation: hasRobots ? "Robots.txt is correctly configured." : "Create a robots.txt file at the site root to guide search crawlers.",
    priority: hasRobots ? "Low" : "High"
  });

  // Sitemap
  const hasSitemap = safeGetNested(robotsSitemapReport, "sitemap_report", "exists") ?? true;
  const sitemapValid = safeGetNested(robotsSitemapReport, "sitemap_report", "xml_valid") ?? true;
  const isSitemapOk = hasSitemap && sitemapValid;
  techItems.push({
    name: "XML Sitemap",
    status: isSitemapOk ? "Completed" : "Not Completed",
    recommendation: isSitemapOk ? "XML sitemap exists and is valid." : "Create and submit a valid sitemap.xml to Google Search Console.",
    priority: isSitemapOk ? "Low" : "High"
  });

  // Canonical
  const canonical = seoData.canonical;
  const hasCanonical = !!canonical;
  techItems.push({
    name: "Canonical Tag Configuration",
    status: hasCanonical ? "Completed" : "Not Completed",
    recommendation: hasCanonical ? `Canonical tag is correctly declared: ${canonical}` : "Add a canonical link tag to avoid index duplicate issues.",
    priority: hasCanonical ? "Low" : "Medium"
  });

  // Indexability
  const isBlocked = safeGetNested(robotsSitemapReport, "robots_report", "is_audited_url_blocked") || 
                    (String(seoData.meta_description || "").toLowerCase().includes("noindex"));
  techItems.push({
    name: "Search Engine Indexability",
    status: isBlocked ? "Not Completed" : "Completed",
    recommendation: isBlocked ? "Ensure no meta noindex tags or blocking robots rules block crawlers." : "Page indexation is not blocked by search engines.",
    priority: isBlocked ? "High" : "Low"
  });

  categories.push(compileCategory("Technical SEO", techItems));

  // 2. On Page SEO
  const onpageItems = [];
  
  // Title
  const title = seoData.title || "";
  const titleLen = title.length;
  const titleOk = titleLen >= 30 && titleLen <= 60;
  onpageItems.push({
    name: "Page Title Length (30-60 chars)",
    status: titleOk ? "Completed" : "Not Completed",
    recommendation: titleOk ? `Page title length is optimal (${titleLen} chars).` : `Optimize title length (currently ${titleLen} chars). Target 30-60 characters.`,
    priority: titleOk ? "Low" : "Medium"
  });

  // Meta Description
  const desc = seoData.meta_description || "";
  const descLen = desc.length;
  const descOk = descLen >= 50 && descLen <= 160;
  onpageItems.push({
    name: "Meta Description Length (50-160 chars)",
    status: descOk ? "Completed" : "Not Completed",
    recommendation: descOk ? `Meta description length is optimal (${descLen} chars).` : `Optimize meta description length (currently ${descLen} chars). Target 50-160 characters.`,
    priority: descOk ? "Low" : "Medium"
  });

  // H1
  const h1s = seoData.headings?.h1 || [];
  const h1Ok = h1s.length === 1;
  onpageItems.push({
    name: "Single H1 Header Tag",
    status: h1Ok ? "Completed" : "Not Completed",
    recommendation: h1Ok ? "Exactly one H1 tag is configured." : `Configure exactly one H1 header tag. Found ${h1s.length} H1 tags.`,
    priority: h1Ok ? "Low" : "High"
  });

  // Subheadings (H2/H3)
  const h2s = seoData.headings?.h2 || [];
  const hasSubheadings = h2s.length > 0;
  onpageItems.push({
    name: "H2/H3 Subheadings Structure",
    status: hasSubheadings ? "Completed" : "Not Completed",
    recommendation: hasSubheadings ? "Subheadings exist to structure content." : "Structure layout hierarchy by adding H2 subheading elements.",
    priority: hasSubheadings ? "Low" : "Low"
  });

  // URL Slug
  let cleanSlug = true;
  try {
    const pathStr = new URL(finalUrl).pathname;
    if (pathStr.includes("_") || pathStr.includes("%") || /[A-Z]/.test(pathStr)) {
      cleanSlug = false;
    }
  } catch (err) {}
  onpageItems.push({
    name: "Friendly URL Slug",
    status: cleanSlug ? "Completed" : "Not Completed",
    recommendation: cleanSlug ? "URL slug is SEO friendly." : "Optimize URL slug to contain only lowercase letters and hyphens.",
    priority: cleanSlug ? "Low" : "Medium"
  });

  categories.push(compileCategory("On Page SEO", onpageItems));

  // 3. Content SEO
  const contentItems = [];
  
  // Word Count
  let wordCount = seoData.word_count || 0;
  if (!wordCount && seoData.page_content) {
    wordCount = seoData.page_content.split(/\s+/).filter(Boolean).length;
  }
  const wordCountOk = wordCount >= 300;
  contentItems.push({
    name: "Content Word Count (>= 300)",
    status: wordCountOk ? "Completed" : "Not Completed",
    recommendation: wordCountOk ? `Page has a solid word count (${wordCount} words).` : `Expand thin content. Current word count is ${wordCount}. Target >= 300 words.`,
    priority: wordCountOk ? "Low" : "Medium"
  });

  // Readability
  const readabilityScore = safeGetNested(results, "content_analysis", "detections", "low_readability", "score") ?? 70;
  const readabilityOk = readabilityScore >= 60;
  contentItems.push({
    name: "Content Readability",
    status: readabilityOk ? "Completed" : "Not Completed",
    recommendation: readabilityOk ? `Flesch Reading Ease score is readable (${readabilityScore}).` : `Improve readability score (${readabilityScore}). Use simpler sentence structures.`,
    priority: readabilityOk ? "Low" : "Low"
  });

  // Semantic Keyword Coverage
  const semanticScore = safeGetNested(results, "content_analysis", "detections", "low_semantic_coverage", "score") ?? 75;
  const semanticOk = semanticScore >= 60;
  contentItems.push({
    name: "Semantic Topical Coverage",
    status: semanticOk ? "Completed" : "Not Completed",
    recommendation: semanticOk ? "Content covers key related topics well." : "Add related LSI keyword concepts to enrich content depth.",
    priority: semanticOk ? "Low" : "Medium"
  });

  // Duplicate Paragraphs
  const duplicateParagraphs = safeGetNested(results, "content_analysis", "detections", "duplicate_paragraphs") || [];
  const hasDuplicates = duplicateParagraphs.length > 0;
  contentItems.push({
    name: "Unique Content (No Duplicate Text)",
    status: hasDuplicates ? "Not Completed" : "Completed",
    recommendation: hasDuplicates ? "Rewrite repetitive or copy-pasted paragraph blocks." : "No duplicate paragraph text blocks detected.",
    priority: hasDuplicates ? "Medium" : "Low"
  });

  // Heading keyword stuffing
  const weakHeadings = safeGetNested(results, "content_analysis", "detections", "weak_headings") || [];
  const hasWeakHeadings = weakHeadings.length > 0;
  contentItems.push({
    name: "Optimal Headings (No Keyword Stuffing)",
    status: hasWeakHeadings ? "Not Completed" : "Completed",
    recommendation: hasWeakHeadings ? "Refactor unnatural keyword-stuffed headings." : "Heading tag content is natural and user friendly.",
    priority: hasWeakHeadings ? "Low" : "Low"
  });

  categories.push(compileCategory("Content SEO", contentItems));

  // 4. Image SEO
  const imageItems = [];
  
  const missingAlt = safeGetNested(results, "image_seo_report", "statistics", "missing_alt_count") ?? 0;
  imageItems.push({
    name: "Image Alt Attributes",
    status: missingAlt === 0 ? "Completed" : "Not Completed",
    recommendation: missingAlt === 0 ? "All image elements have ALT attributes." : `Add descriptive ALT attributes to the ${missingAlt} missing images.`,
    priority: missingAlt === 0 ? "Low" : "High"
  });

  const largeImgs = safeGetNested(results, "image_seo_report", "statistics", "large_images_count") ?? 0;
  imageItems.push({
    name: "Optimized Image Payloads",
    status: largeImgs === 0 ? "Completed" : "Not Completed",
    recommendation: largeImgs === 0 ? "All images are compressed and optimized." : `Compress the ${largeImgs} heavy images that exceed 100KB.`,
    priority: largeImgs === 0 ? "Low" : "Medium"
  });

  const brokenImgs = safeGetNested(results, "image_seo_report", "statistics", "broken_images_count") ?? 0;
  imageItems.push({
    name: "Broken Image Elements",
    status: brokenImgs === 0 ? "Completed" : "Not Completed",
    recommendation: brokenImgs === 0 ? "No broken image assets detected." : `Replace or remove the ${brokenImgs} broken image links.`,
    priority: brokenImgs === 0 ? "Low" : "High"
  });

  categories.push(compileCategory("Image SEO", imageItems));

  // 5. Schema
  const schemaItems = [];
  
  const jsonLdCount = safeGetNested(results, "schema_analysis_report", "statistics", "json_ld") ?? 0;
  schemaItems.push({
    name: "JSON-LD Schema Markup",
    status: jsonLdCount > 0 ? "Completed" : "Not Completed",
    recommendation: jsonLdCount > 0 ? "JSON-LD schema structured data is declared." : "Add JSON-LD structure metadata to support rich snippets.",
    priority: jsonLdCount > 0 ? "Low" : "Medium"
  });

  const schemaScore = safeGetNested(results, "schema_analysis_report", "schema_score") ?? 100;
  const schemaValid = schemaScore >= 80;
  schemaItems.push({
    name: "Valid Schema Syntax",
    status: schemaValid ? "Completed" : "Not Completed",
    recommendation: schemaValid ? "Structured schema elements are validated syntax-wise." : "Resolve syntax warnings and errors in your schema declarations.",
    priority: schemaValid ? "Low" : "High"
  });

  const schemaEntities = safeGetNested(results, "schema_analysis_report", "items") || [];
  const hasRecommended = schemaEntities.some(item => 
    ["Organization", "WebSite", "Article", "Product"].includes(item.schema_type)
  );
  schemaItems.push({
    name: "Recommended Schema Entity Types",
    status: hasRecommended ? "Completed" : "Not Completed",
    recommendation: hasRecommended ? "Recommended entity types (e.g. Website) are declared." : "Configure recommended schema entities (Organization, Website, or Article).",
    priority: hasRecommended ? "Low" : "Medium"
  });

  categories.push(compileCategory("Schema", schemaItems));

  // 6. Performance
  const perfItems = [];
  
  const fcp = safeGetNested(results, "performance_report", "metrics", "fcp_ms") ?? 1200;
  const fcpOk = fcp <= 2500;
  perfItems.push({
    name: "First Contentful Paint (FCP <= 2.5s)",
    status: fcpOk ? "Completed" : "Not Completed",
    recommendation: fcpOk ? `FCP paint time is fast (${fcp} ms).` : `Improve FCP (${fcp} ms). Optimize render-blocking CSS/JS resources.`,
    priority: fcpOk ? "Low" : "Medium"
  });

  const lcp = safeGetNested(results, "performance_report", "metrics", "lcp_ms") ?? 1800;
  const lcpOk = lcp <= 3000;
  perfItems.push({
    name: "Largest Contentful Paint (LCP <= 3.0s)",
    status: lcpOk ? "Completed" : "Not Completed",
    recommendation: lcpOk ? `LCP loading time is optimal (${lcp} ms).` : `Improve LCP (${lcp} ms). Defer offscreen images and preload critical elements.`,
    priority: lcpOk ? "Low" : "High"
  });

  const cls = safeGetNested(results, "performance_report", "metrics", "cls") ?? 0.05;
  const clsOk = cls <= 0.1;
  perfItems.push({
    name: "Cumulative Layout Shift (CLS <= 0.1)",
    status: clsOk ? "Completed" : "Not Completed",
    recommendation: clsOk ? `CLS layout shifts are minimal (${cls}).` : `Improve CLS (${cls}). Set explicit height and width on dynamic frames.`,
    priority: clsOk ? "Low" : "High"
  });

  const ttfb = safeGetNested(results, "performance_report", "metrics", "ttfb_ms") ?? 300;
  const ttfbOk = ttfb <= 800;
  perfItems.push({
    name: "Time To First Byte (TTFB <= 800ms)",
    status: ttfbOk ? "Completed" : "Not Completed",
    recommendation: ttfbOk ? `TTFB latency is within target (${ttfb} ms).` : `Improve TTFB server latency (${ttfb} ms). Enable edge-caching.`,
    priority: ttfbOk ? "Low" : "Medium"
  });

  const loadTime = safeGetNested(results, "performance_report", "metrics", "page_load_time_ms") ?? 2200;
  const loadTimeOk = loadTime <= 4000;
  perfItems.push({
    name: "Page Load Time (<= 4.0s)",
    status: loadTimeOk ? "Completed" : "Not Completed",
    recommendation: loadTimeOk ? `Total page load time is optimal (${loadTime} ms).` : `Reduce heavy payloads to lower load time (${loadTime} ms).`,
    priority: loadTimeOk ? "Low" : "Medium"
  });

  categories.push(compileCategory("Performance", perfItems));

  // 7. Links
  const linkItems = [];
  
  const brokenLinks = (safeGetNested(results, "link_analysis_report", "internal_stats", "broken_count") ?? 0) + 
                      (safeGetNested(results, "link_analysis_report", "external_stats", "broken_count") ?? 0);
  linkItems.push({
    name: "Dead/Broken Internal & External Links",
    status: brokenLinks === 0 ? "Completed" : "Not Completed",
    recommendation: brokenLinks === 0 ? "No broken links found." : `Fix the ${brokenLinks} dead links returning error status codes.`,
    priority: brokenLinks === 0 ? "Low" : "High"
  });

  const redirectChainsCount = (safeGetNested(results, "link_analysis_report", "redirect_chains") || []).length;
  linkItems.push({
    name: "Redirect Chains Optimization",
    status: redirectChainsCount === 0 ? "Completed" : "Not Completed",
    recommendation: redirectChainsCount === 0 ? "No redirect chain links found." : `Point links directly to destinations to resolve ${redirectChainsCount} redirect chains.`,
    priority: redirectChainsCount === 0 ? "Low" : "Medium"
  });

  const emptyAnchorsCount = (safeGetNested(results, "link_analysis_report", "empty_anchors") || []).length;
  linkItems.push({
    name: "Descriptive Link Anchors (No Empty Anchors)",
    status: emptyAnchorsCount === 0 ? "Completed" : "Not Completed",
    recommendation: emptyAnchorsCount === 0 ? "All links have descriptive anchor values." : `Add descriptive texts to the ${emptyAnchorsCount} links with empty anchors.`,
    priority: emptyAnchorsCount === 0 ? "Low" : "Medium"
  });

  const duplicateAnchorsCount = (safeGetNested(results, "link_analysis_report", "duplicate_anchors") || []).length;
  linkItems.push({
    name: "Unique Anchor Destinations",
    status: duplicateAnchorsCount === 0 ? "Completed" : "Not Completed",
    recommendation: duplicateAnchorsCount === 0 ? "Anchor texts are distinct per destination." : "Vary anchor text phrasing for distinct URL pages to prevent cannibalization.",
    priority: duplicateAnchorsCount === 0 ? "Low" : "Low"
  });

  categories.push(compileCategory("Links", linkItems));

  // Overall progress
  const totalCompleted = categories.reduce((acc, cat) => acc + cat.completed_count, 0);
  const totalItems = categories.reduce((acc, cat) => acc + cat.total_count, 0);
  const totalProgressPercent = totalItems > 0 ? Math.floor((totalCompleted / totalItems) * 100) : 0;

  return {
    categories,
    total_progress_percent: totalProgressPercent
  };
}

module.exports = { runChecklistGeneration };
