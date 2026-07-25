const PRIORITY_RULES = {
  // 1. Technical SEO
  "HTTPS": {
    "priority": "Critical",
    "issue_name": "Insecure Connection (HTTPS Missing)",
    "description": "The website is serving content over HTTP or contains mixed secure/insecure content.",
    "seo_impact": "Google uses HTTPS as a ranking signal. Insecure sites are labeled 'Not Secure' by browsers, severely impacting trust and click-through rates.",
    "estimated_ranking_impact": "High",
    "estimated_fix_time": "1 hour",
    "difficulty": "Medium",
    "recommendation": "Install an SSL/TLS certificate, enforce server-wide HTTPS 301 redirects, and update all internal assets to load via https://."
  },
  "Canonical": {
    "priority": "High",
    "issue_name": "Missing or Invalid Canonical Tag",
    "description": "Canonical tag is either missing, points to a redirect loop, or doesn't match the audited page URL.",
    "seo_impact": "Canonical tags tell search engine spiders which URL is the master version, preventing duplicate content dilution and index fragmentation.",
    "estimated_ranking_impact": "High",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Implement a self-referencing canonical tag `<link rel=\"canonical\" href=\"YOUR_PAGE_URL\">` in the HTML `<head>`."
  },
  "Title": {
    "priority": "High",
    "issue_name": "Title Tag Issues",
    "description": "The title tag is missing, empty, too long (>60 characters), or too short (<10 characters).",
    "seo_impact": "Title tags are a primary metadata ranking factor. They dictate search result snippets and directly influence click-through rate.",
    "estimated_ranking_impact": "High",
    "estimated_fix_time": "15 mins",
    "difficulty": "Easy",
    "recommendation": "Create a unique, descriptive, keyword-rich title tag between 50 to 60 characters for this page."
  },
  "Meta Description": {
    "priority": "Medium",
    "issue_name": "Meta Description Issues",
    "description": "The meta description is missing, empty, or outside the optimal range (120-160 characters).",
    "seo_impact": "Meta descriptions provide the summary text in search snippets. A poorly optimized description lowers search relevance click rates.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "15 mins",
    "difficulty": "Easy",
    "recommendation": "Draft a compelling, descriptive meta description containing target keywords and a clear call-to-action under 160 characters."
  },
  "H1": {
    "priority": "High",
    "issue_name": "H1 Heading Missing",
    "description": "The page lacks a primary H1 heading element.",
    "seo_impact": "H1 headings define the core topic of a page. A missing H1 makes it difficult for search spiders to index page context accurately.",
    "estimated_ranking_impact": "High",
    "estimated_fix_time": "15 mins",
    "difficulty": "Easy",
    "recommendation": "Add a single, clear `<h1>` heading near the top of the body containing your page's primary search phrase."
  },
  "Multiple H1": {
    "priority": "Medium",
    "issue_name": "Multiple H1 Headings",
    "description": "The page has multiple `<h1>` tags defined.",
    "seo_impact": "Multiple H1s dilute target keyword strength and confuse search engines regarding the main topical theme.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "15 mins",
    "difficulty": "Easy",
    "recommendation": "Consolidate your headings so there is only one `<h1>` for the primary title. Convert secondary H1 headings to `<h2>` or `<h3>` tags."
  },
  "Heading Structure": {
    "priority": "Medium",
    "issue_name": "Invalid Heading Hierarchy",
    "description": "Heading tags are skipped or structured out of chronological order (e.g., H1 followed immediately by H3).",
    "seo_impact": "Invalid heading structures degrade site crawl accessibility and contextual outline readability for search crawlers.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Re-order your header elements so they cascade logical content depth (H1 -> H2 -> H3 -> H4)."
  },
  "Open Graph": {
    "priority": "Low",
    "issue_name": "Missing Open Graph Tags",
    "description": "Open Graph (og:title, og:image, og:description) properties are missing from HTML metadata.",
    "seo_impact": "OG tags do not directly boost organic search rankings but are crucial for visual formatting, engagement, and click-throughs when shared on social networks.",
    "estimated_ranking_impact": "Low",
    "estimated_fix_time": "15 mins",
    "difficulty": "Easy",
    "recommendation": "Integrate standard Open Graph meta tags into the page `<head>` to define custom titles, descriptions, and thumbnails for social embeds."
  },
  "Twitter Cards": {
    "priority": "Low",
    "issue_name": "Missing Twitter Card Metadata",
    "description": "Twitter card tags (twitter:card, twitter:title, twitter:description) are omitted.",
    "seo_impact": "Twitter card metadata defines rich-media snippet cards for shared links on X/Twitter, boosting referral traffic branding.",
    "estimated_ranking_impact": "Low",
    "estimated_fix_time": "15 mins",
    "difficulty": "Easy",
    "recommendation": "Add `<meta name=\"twitter:card\" content=\"summary_large_image\">` along with card title and description properties to the head."
  },
  "URL Length": {
    "priority": "Low",
    "issue_name": "Oversized URL Slug",
    "description": "The audited page URL path is extremely long or contains too many directory parameters.",
    "seo_impact": "Short, descriptive, clean URLs perform better in search result listings and improve human copy-paste accessibility.",
    "estimated_ranking_impact": "Low",
    "estimated_fix_time": "15 mins",
    "difficulty": "Easy",
    "recommendation": "Shorten directory structures, remove unnecessary dynamic queries, and optimize the page slug containing key target phrases."
  },

  // 2. On-Page SEO
  "Keyword in Title": {
    "priority": "High",
    "issue_name": "Target Keyword Missing in Title",
    "description": "The primary focus keyword was not found within the webpage title tag.",
    "seo_impact": "The title tag is the single most critical on-page SEO element. Lack of key terms in the title drastically limits top-page ranking possibilities.",
    "estimated_ranking_impact": "High",
    "estimated_fix_time": "15 mins",
    "difficulty": "Easy",
    "recommendation": "Revise the title tag to naturally place your primary keyword phrase close to the beginning of the text."
  },
  "Keyword in Meta Description": {
    "priority": "Medium",
    "issue_name": "Target Keyword Missing in Meta Description",
    "description": "The primary focus keyword was not detected inside the meta description tag.",
    "seo_impact": "Google bolds search terms matched in meta descriptions, drawing the eye and boosting click-through performance from search results.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "15 mins",
    "difficulty": "Easy",
    "recommendation": "Incorporate the focus keyword naturally inside the first sentence of your meta description."
  },
  "Keyword in H1": {
    "priority": "High",
    "issue_name": "Target Keyword Missing in H1 Heading",
    "description": "The primary focus keyword is omitted from the H1 heading tag.",
    "seo_impact": "Aligning your primary heading (H1) with the target search term signals strong content relevancy to crawler bots.",
    "estimated_ranking_impact": "High",
    "estimated_fix_time": "15 mins",
    "difficulty": "Easy",
    "recommendation": "Edit the page H1 heading to naturally contain the focus keyword to affirm content topical focus."
  },
  "Keyword in Content": {
    "priority": "Medium",
    "issue_name": "Low Focus Keyword Density",
    "description": "Primary keyword density in body content is insufficient or missing.",
    "seo_impact": "Search crawlers evaluate copy terms to assess topical authority. If keywords are missing from context body, page indexing relevance drops.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Integrate the primary target keyword naturally within the introductory paragraph and 2-3 times within subsequent subsections."
  },
  "Word Count": {
    "priority": "Low",
    "issue_name": "Thin Content Warning",
    "description": "The page copy contains a very low word count (thin content).",
    "seo_impact": "Search engines prioritize comprehensive, in-depth text content. Thin content pages struggle to establish domain authority and rank high.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "2 hours",
    "difficulty": "Medium",
    "recommendation": "Flesh out page content with relevant paragraphs, detailed user guides, or descriptive sections to exceed a 500+ word threshold."
  },

  // 3. Performance
  "Render-blocking resources": {
    "priority": "High",
    "issue_name": "Render-Blocking Stylesheets or Scripts",
    "description": "Synchronous CSS or JavaScript files in the HTML head are delaying initial layout layout rendering.",
    "seo_impact": "Render blocking increases First Contentful Paint (FCP) latencies, violating Core Web Vitals guidelines which directly penalize slow sites.",
    "estimated_ranking_impact": "High",
    "estimated_fix_time": "2 hours",
    "difficulty": "Hard",
    "recommendation": "Add `async` or `defer` attributes to scripts, inline critical styling elements, and split non-critical stylesheets."
  },
  "Missing lazy loading": {
    "priority": "Medium",
    "issue_name": "Offscreen Images Not Lazy Loaded",
    "description": "Oversized images below-the-fold are loaded immediately alongside primary assets.",
    "seo_impact": "Increases initial page weight and network overhead, delaying speed and interaction times (LCP/TBT).",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Configure `loading=\"lazy\"` attributes on all image markup definitions located below-the-fold."
  },
  "Large CSS files": {
    "priority": "Medium",
    "issue_name": "Oversized CSS Payloads",
    "description": "CSS stylesheet sizes exceed the recommended 100 KB threshold.",
    "seo_impact": "Bulky stylesheets delay rendering path processing, reducing mobile loading speeds.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "1 hour",
    "difficulty": "Medium",
    "recommendation": "Minify CSS code, prune unused structural frameworks, and bundle rules efficiently."
  },
  "Large JavaScript files": {
    "priority": "Medium",
    "issue_name": "Oversized JavaScript Payloads",
    "description": "JavaScript assets exceed the recommended 200 KB threshold.",
    "seo_impact": "Creates high main-thread parsing execution times, degrading Interaction to Next Paint (INP) speed metrics.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "2 hours",
    "difficulty": "Hard",
    "recommendation": "Apply tree-shaking, code splitting, minify scripts, and defer third-party script integrations."
  },
  "Unused CSS": {
    "priority": "Medium",
    "issue_name": "Excessive Unused CSS Rules",
    "description": "Stylesheets contain obsolete framework rules that aren't utilized on this page.",
    "seo_impact": "Wastes mobile bandwidth and stalls initial layout painting pathways.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "2 hours",
    "difficulty": "Hard",
    "recommendation": "Prune unused CSS styling parameters using tools like PurgeCSS or native script bundling splits."
  },
  "Unused JavaScript": {
    "priority": "Medium",
    "issue_name": "Excessive Unused JavaScript Code",
    "description": "Large scripts contain code branches that aren't executed during initial load.",
    "seo_impact": "Increases script compilation CPU time, stalling interactive responsiveness.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "3 hours",
    "difficulty": "Hard",
    "recommendation": "Split code libraries into dynamic modules that are only executed as needed."
  },
  "Missing compression": {
    "priority": "High",
    "issue_name": "Server Compression Disabled",
    "description": "Text assets are transferred over the network without GZIP or Brotli compression algorithms.",
    "seo_impact": "Uncompressed pages take up to 3x longer to download, degrading overall page speed indices.",
    "estimated_ranking_impact": "High",
    "estimated_fix_time": "30 mins",
    "difficulty": "Medium",
    "recommendation": "Enable Gzip or Brotli compression features on your hosting platform (Nginx, Apache, Node, or Cloudflare)."
  },
  "Missing browser caching": {
    "priority": "Medium",
    "issue_name": "Missing Browser Cache Policy",
    "description": "Static resources lack long-term HTTP cache-control directives.",
    "seo_impact": "Forces recurring site visitors to re-fetch unchanged files on subsequent visits, increasing latency.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "30 mins",
    "difficulty": "Medium",
    "recommendation": "Update server .htaccess/config files to append `Cache-Control: max-age=31536000` to static assets."
  },

  // 4. Image SEO
  "Broken Image": {
    "priority": "Critical",
    "issue_name": "Broken Image URL",
    "description": "Images embedded in the HTML return non-200 HTTP response codes.",
    "seo_impact": "Broken image tags degrade user interaction and serve as a negative quality signal for crawlers.",
    "estimated_ranking_impact": "High",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Locate the broken `<img>` element tags and update their source paths to active assets, or delete them."
  },
  "Missing ALT Text": {
    "priority": "High",
    "issue_name": "Image Missing Alt Attribute",
    "description": "Content images lack alt attributes entirely in their markup definition.",
    "seo_impact": "Search crawlers rely on ALT text to crawl and index images. Missing tags limit Google Image visibility and violate accessibility standards.",
    "estimated_ranking_impact": "High",
    "estimated_fix_time": "45 mins",
    "difficulty": "Easy",
    "recommendation": "Add a descriptive `alt` attribute describing the content or context of each `<img>` tag."
  },
  "Empty ALT Text": {
    "priority": "Medium",
    "issue_name": "Empty Alt Attribute",
    "description": "Images contain an empty alt attribute value (e.g. alt=\"\").",
    "seo_impact": "Provides no semantic keywords for image search engine spiders, limiting indexing relevancy.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Write brief, descriptive, keyword-aligned context text inside the empty alt attribute values."
  },
  "Duplicate ALT Text": {
    "priority": "Low",
    "issue_name": "Duplicate Image Alt Descriptions",
    "description": "Multiple unique images use identical alt text definitions.",
    "seo_impact": "Confuses search algorithms trying to differentiate unique images, reducing visual search relevance.",
    "estimated_ranking_impact": "Low",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Specify unique alternative texts matching the distinct content of each visual asset."
  },
  "Missing Layout Dimensions": {
    "priority": "Medium",
    "issue_name": "Missing Image Width/Height Properties",
    "description": "Image tags are missing explicit height and width attributes.",
    "seo_impact": "Omitting explicit dimensions triggers browser rendering layout shifts, degrading Core Web Vital CLS scores.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Add appropriate `width` and `height` properties in the CSS/HTML properties for all page image declarations."
  },
  "Image Format Support": {
    "priority": "Low",
    "issue_name": "Legacy Image Formats In Use",
    "description": "Images are served in bloated legacy formats (PNG, JPG) rather than next-generation formats.",
    "seo_impact": "Next-gen files are up to 70% smaller, providing a faster visual page render experience.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "1 hour",
    "difficulty": "Medium",
    "recommendation": "Convert image archives to modern formats (WebP/AVIF) and update the source URLs."
  },
  "Lazy Loading Check": {
    "priority": "Medium",
    "issue_name": "Lazy Loading Disabled",
    "description": "Content images do not use deferral lazy loading properties.",
    "seo_impact": "Increases initial page weight and delays interaction readiness.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Enforce `loading=\"lazy\"` globally on below-the-fold content images."
  },
  "Image Payload Size": {
    "priority": "Medium",
    "issue_name": "Oversized Image File Size",
    "description": "Image file payloads exceed the optimal 100 KB limit.",
    "seo_impact": "Increases initial visual paint latency, slowing down page interactive speed indices.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "1 hour",
    "difficulty": "Medium",
    "recommendation": "Compress your images using external tools (like TinyPNG or Squoosh) or leverage a dynamic CDN layer."
  },

  // 5. Link Analysis
  "Broken Internal Links": {
    "priority": "Critical",
    "issue_name": "Broken Internal Hyperlink",
    "description": "Internal links point to inactive page paths on the same domain (resulting in a 404 error).",
    "seo_impact": "Leaks page authority (PageRank), halts crawler navigation pathways, and spikes visitor bounce rates.",
    "estimated_ranking_impact": "High",
    "estimated_fix_time": "45 mins",
    "difficulty": "Easy",
    "recommendation": "Correct target internal URLs to point directly to active, indexable destination resources."
  },
  "Broken External Links": {
    "priority": "High",
    "issue_name": "Broken Outbound Link",
    "description": "Links pointing to external websites are broken (returning a non-200 HTTP status).",
    "seo_impact": "Linking to broken external assets signals poor site maintenance to search quality algorithms.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Audit external links, replace dead references with active resources, or remove the links entirely."
  },
  "Placeholder Link": {
    "priority": "Low",
    "issue_name": "Dummy Hyperlinks In Use",
    "description": "HTML anchors use placeholder parameters (e.g. href=\"#\").",
    "seo_impact": "Dummy links act as dead navigation blocks, degrading structural crawler flow quality.",
    "estimated_ranking_impact": "Low",
    "estimated_fix_time": "15 mins",
    "difficulty": "Easy",
    "recommendation": "Remove placeholder hashtag symbols and configure relative/absolute link paths."
  },
  "Insecure Outbound Links": {
    "priority": "Medium",
    "issue_name": "Insecure Outbound HTTP Hyperlink",
    "description": "Hyperlinks point to insecure HTTP locations on external sites.",
    "seo_impact": "Exposes users to insecure pathways, potentially triggering browsers warnings that affect engagement.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Modify external link URLs to use secure `https://` equivalents where available."
  },
  "Redirect Chains": {
    "priority": "High",
    "issue_name": "Redirect Chain Detected",
    "description": "Links go through multiple redirects before loading the target page.",
    "seo_impact": "Wastes search engine crawl budget, increases latency, and dilutes authority (PageRank) transfers.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "1 hour",
    "difficulty": "Medium",
    "recommendation": "Rewrite target hyperlink paths to point directly to the final destination URL."
  },
  "Orphan Pages": {
    "priority": "Low",
    "issue_name": "Orphaned Page Path",
    "description": "The URL path lacks incoming internal hyperlinks from the rest of the site.",
    "seo_impact": "Orphan pages are extremely hard for search engine spiders to find, crawl, and index.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "1 hour",
    "difficulty": "Medium",
    "recommendation": "Link to the orphaned URL contextually from related, indexable pages."
  },
  "Empty Anchors Check": {
    "priority": "Low",
    "issue_name": "Empty Link Anchor Text",
    "description": "Hyperlinks lack anchor texts or contain blank spaces.",
    "seo_impact": "Fails to supply anchor context, limiting semantic indexing quality.",
    "estimated_ranking_impact": "Low",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Add clear, descriptive link keyword descriptions inside the anchor tag."
  },
  "Generic Anchor Text": {
    "priority": "Low",
    "issue_name": "Generic Link Anchor Text",
    "description": "Hyperlinks use non-descriptive anchor text like 'click here' or 'read more'.",
    "seo_impact": "Misses the opportunity to pass keyword relevancy cues to search engines.",
    "estimated_ranking_impact": "Low",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Update anchor texts with descriptive keyword phrases describing the destination page topic."
  },

  // 6. Schema Structured Data
  "Valid Schema Markup": {
    "priority": "High",
    "issue_name": "Schema Structured Data Errors",
    "description": "Errors or warnings found in Schema structured data.",
    "seo_impact": "Invalid structured data prevents search engines from generating Rich Snippets for your search listings.",
    "estimated_ranking_impact": "High",
    "estimated_fix_time": "1 hour",
    "difficulty": "Medium",
    "recommendation": "Correct schema property fields to conform to Schema.org and validate using Google Schema validator tools."
  },

  // 7. Robots & Sitemap
  "Robots.txt Presence": {
    "priority": "Critical",
    "issue_name": "Robots.txt Missing or Inaccessible",
    "description": "The robots.txt file was not found at the website's root path.",
    "seo_impact": "Robots.txt directs search crawl behaviors. Its absence can lead to crawl budget waste or indexation of private assets.",
    "estimated_ranking_impact": "High",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Publish a robots.txt file to the website's root folder outlining crawl parameters."
  },
  "Robots.txt Syntax Check": {
    "priority": "High",
    "issue_name": "Robots.txt Syntax Errors",
    "description": "The robots.txt file contains invalid directives or formatting.",
    "seo_impact": "Syntax errors can cause search engine crawlers to misinterpret crawl instructions, leading to unwanted blocks or over-crawling.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Verify robots.txt directives syntax and format against industry standards."
  },
  "Robots.txt Indexation Bounds": {
    "priority": "Critical",
    "issue_name": "Robots.txt Block Warning",
    "description": "Robots.txt rules are blocking indexation of important sections.",
    "seo_impact": "Complete blocks tell search engines not to index pages, removing them entirely from search results.",
    "estimated_ranking_impact": "High",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Review and prune excessive 'Disallow:' parameters restricting crawl spider access."
  },
  "Robots.txt Sitemap Linkage": {
    "priority": "Low",
    "issue_name": "Sitemap Link Missing in Robots.txt",
    "description": "Robots.txt doesn't declare the XML sitemap URL.",
    "seo_impact": "Delays sitemap discovery by search engines during site crawl cycles.",
    "estimated_ranking_impact": "Low",
    "estimated_fix_time": "15 mins",
    "difficulty": "Easy",
    "recommendation": "Add a sitemap declaration line (e.g. Sitemap: https://yourdomain.com/sitemap.xml) to robots.txt."
  },
  "Sitemap Presence": {
    "priority": "Critical",
    "issue_name": "XML Sitemap Missing",
    "description": "An XML sitemap file was not found at the root path.",
    "seo_impact": "XML sitemaps help search engines locate and index deep page structures rapidly.",
    "estimated_ranking_impact": "High",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Generate an XML sitemap using a plugin/generator tool and publish it in the root public folder."
  },
  "Sitemap XML Validity": {
    "priority": "High",
    "issue_name": "Sitemap XML Syntax Errors",
    "description": "The sitemap XML structure contains syntax errors.",
    "seo_impact": "Invalid XML prevents search spiders from reading the sitemap, halting automated indexation updates.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "30 mins",
    "difficulty": "Medium",
    "recommendation": "Ensure sitemap code is syntactically sound and valid XML. Re-generate using verified tools."
  },
  "Sitemap Broken URLs Check": {
    "priority": "High",
    "issue_name": "Broken URLs in Sitemap",
    "description": "The XML sitemap contains links returning non-200 HTTP statuses.",
    "seo_impact": "Submitting broken URLs in sitemaps wastes crawl budget and signals poor site health.",
    "estimated_ranking_impact": "Medium",
    "estimated_fix_time": "30 mins",
    "difficulty": "Easy",
    "recommendation": "Remove any redirecting or dead URLs from the XML sitemap. Only include clean, 200 OK canonical pages."
  }
};

const PRIORITY_ORDER = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };

function classifyIssue(category, severity, checkName, message) {
  let rule = PRIORITY_RULES[checkName];

  if (!rule && checkName) {
    const nameMap = {
      "internal links": null, // prevent false-positive matching with "Broken Internal Links"
      "external links": null, // prevent false-positive matching with "Broken External Links"
      "h1 count": "H1",
      "h2 hierarchy": "Heading Structure",
      "heading order": "Heading Structure",
      "keyword in first para": "Keyword in Content",
      "keyword density": "Keyword in Content",
      "content length": "Word Count",
      "thin content": "Word Count",
      "duplicate title": "Title",
      "duplicate meta": "Meta Description",
      "duplicate h1": "Multiple H1",
      "url structure": "URL Length"
    };

    const mappedKey = nameMap[checkName.toLowerCase()];
    if (mappedKey !== undefined) {
      if (mappedKey !== null) {
        rule = PRIORITY_RULES[mappedKey];
      }
    } else {
      // Substring fallback
      for (const key of Object.keys(PRIORITY_RULES)) {
        const keyLower = key.toLowerCase();
        const checkLower = checkName.toLowerCase();
        if (keyLower.includes(checkLower) || checkLower.includes(keyLower)) {
          rule = PRIORITY_RULES[key];
          break;
        }
      }
    }
  }

  if (rule) {
    const issue = { ...rule, category };
    if (severity === "Passed") {
      issue.priority = "Low";
    }
    return issue;
  }

  // Dynamic fallback classification
  let priority = "Low";
  let rankingImpact = "Low";
  let fixTime = "30 mins";
  let difficulty = "Easy";
  let seoImpact = "Minor suggestion for SEO improvement.";
  let recommendation = `Examine detail: ${message}.`;

  if (severity === "Critical") {
    priority = "High";
    rankingImpact = "High";
    fixTime = "2 hours";
    difficulty = "Medium";
    seoImpact = "Critical issue that impacts search crawlability and visual presentation.";
    recommendation = `Audit HTML settings and resolve the issue: ${message}.`;
  } else if (severity === "Warning") {
    priority = "Medium";
    rankingImpact = "Medium";
    fixTime = "1 hour";
    difficulty = "Easy";
    seoImpact = "Warning issue that limits maximum optimization and ranking capacity.";
    recommendation = `Review webpage configuration to address the warning: ${message}.`;
  }

  return {
    priority,
    issue_name: checkName || `Unclassified ${category} Issue`,
    description: message,
    seo_impact: seoImpact,
    estimated_ranking_impact: rankingImpact,
    estimated_fix_time: fixTime,
    difficulty,
    recommendation,
    category
  };
}

function harvestFailedChecks(results) {
  const issues = [];

  function addIfFailed(cat, sev, name, msg) {
    if (!sev || !name) return;
    const s = sev.toLowerCase();
    if (s === "critical" || s === "warning") {
      const severity = s === "critical" ? "Critical" : "Warning";
      issues.push([cat, severity, name, msg]);
    }
  }

  // 1. Technical SEO
  const techReport = results.seo_report || {};
  for (const item of techReport.critical || []) {
    addIfFailed("Technical SEO", "Critical", item.check, item.message);
  }
  for (const item of techReport.warnings || []) {
    addIfFailed("Technical SEO", "Warning", item.check, item.message);
  }

  // 2. On-Page SEO
  const onpageReport = results.onpage_report || {};
  for (const item of onpageReport.critical || []) {
    addIfFailed("On-Page SEO", "Critical", item.check_name, item.message);
  }
  for (const item of onpageReport.warnings || []) {
    addIfFailed("On-Page SEO", "Warning", item.check_name, item.message);
  }

  // 3. Performance
  const perfReport = results.performance_report || {};
  for (const item of perfReport.issues || []) {
    addIfFailed("Performance", item.severity, item.check_name, item.message);
  }

  // 4. Image SEO
  const imgReport = results.image_seo_report || {};
  for (const item of imgReport.critical || []) {
    addIfFailed("Image SEO", "Critical", item.check_name, item.message);
  }
  for (const item of imgReport.warnings || []) {
    addIfFailed("Image SEO", "Warning", item.check_name, item.message);
  }

  // 5. Link Analysis
  const linkReport = results.link_analysis_report || {};
  for (const item of linkReport.critical || []) {
    addIfFailed("Link Analysis", "Critical", item.check_name, item.message);
  }
  for (const item of linkReport.warnings || []) {
    addIfFailed("Link Analysis", "Warning", item.check_name, item.message);
  }

  // 6. Schema Structured Data
  const schemaReport = results.schema_analysis_report || {};
  for (const item of schemaReport.critical || []) {
    addIfFailed("Schema Markup", "Critical", item.check_name || "Schema Validity Check", item.message);
  }
  for (const item of schemaReport.warnings || []) {
    addIfFailed("Schema Markup", "Warning", item.check_name || "Schema Validity Check", item.message);
  }

  // 7. Robots & Sitemap
  const robotsSitemapReport = results.robots_sitemap_report || {};
  for (const item of robotsSitemapReport.critical || []) {
    addIfFailed("Robots & Sitemap", "Critical", item.check_name, item.message);
  }
  for (const item of robotsSitemapReport.warnings || []) {
    addIfFailed("Robots & Sitemap", "Warning", item.check_name, item.message);
  }

  return issues;
}

function runPriorityEngine(results) {
  // 1. Harvest failed checks
  const rawIssues = harvestFailedChecks(results);

  // 2. Classify issues
  const prioritizedIssues = [];
  const seenChecks = new Set();

  for (const [cat, sev, name, msg] of rawIssues) {
    const checkKey = `${cat}:${name}`;
    if (seenChecks.has(checkKey)) continue;
    seenChecks.add(checkKey);

    const issueMeta = classifyIssue(cat, sev, name, msg);
    prioritizedIssues.push(issueMeta);
  }

  // 3. Sort prioritized issues
  prioritizedIssues.sort((a, b) => {
    const valA = PRIORITY_ORDER[a.priority] || 0;
    const valB = PRIORITY_ORDER[b.priority] || 0;
    return valB - valA;
  });

  // 4. Calculate Overall Health Score (0-100) using scaled weights
  let totalScore = 0.0;
  let totalWeight = 0.0;

  function addComponent(score, weight) {
    if (score !== undefined && score !== null) {
      totalScore += score * weight;
      totalWeight += weight;
    }
  }

  addComponent(results.seo_score, 25.0);
  addComponent(results.onpage_report?.onpage_score, 25.0);
  addComponent(results.performance_report?.performance_score, 20.0);
  
  if (results.link_analysis_report) {
    const linkScore = ((results.link_analysis_report.internal_link_score || 100) +
                       (results.link_analysis_report.external_link_score || 100)) / 2.0;
    addComponent(linkScore, 15.0);
  }

  addComponent(results.schema_analysis_report?.schema_score, 5.0);
  addComponent(results.image_seo_report?.image_seo_score, 5.0);

  if (results.robots_sitemap_report) {
    const rsScore = ((results.robots_sitemap_report.robots_report?.score || 100) +
                     (results.robots_sitemap_report.sitemap_report?.score || 100)) / 2.0;
    addComponent(rsScore, 5.0);
  }

  let healthScore = 0;
  if (totalWeight > 0) {
    healthScore = Math.max(0, Math.min(100, Math.round(totalScore / totalWeight)));
  }

  return {
    health_score: healthScore,
    priority_issues: prioritizedIssues
  };
}

module.exports = { runPriorityEngine };

