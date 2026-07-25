const cheerio = require('cheerio');

function parseSeoElements(html, baseUrl) {
  if (!html) {
    return {
      title: null,
      meta_description: null,
      canonical: null,
      headings: {
        h1: [], h2: [], h3: [], h4: [], h5: [], h6: []
      },
      images: [],
      internal_links: [],
      external_links: [],
      detailed_links: [],
      open_graph: {},
      twitter_card: {},
      schema_json_ld: [],
      microdata: [],
      rdfa: [],
      word_count: 0,
      page_content: ""
    };
  }

  const $ = cheerio.load(html);

  // Helper to resolve URLs
  function resolveUrl(src) {
    if (!src) return "";
    try {
      return new URL(src.trim(), baseUrl).href;
    } catch (e) {
      return src;
    }
  }

  // 1. Title (Target head > title specifically to avoid SVG body icon title tags)
  const headTitle = $('head > title').first();
  const titleTag = headTitle.length > 0 ? headTitle : $('title').first();
  const title = titleTag.length > 0 ? titleTag.text().trim().replace(/\s+/g, ' ') : null;

  // 2. Meta Description
  const descTag = $('meta[name="description"]').first().length > 0
    ? $('meta[name="description"]').first()
    : $('meta[property="description"]').first();
  const metaDescription = descTag.length > 0 ? (descTag.attr('content') || '').trim() : null;

  // 3. Canonical Link
  const canonicalTag = $('link[rel="canonical"]').first();
  const canonicalRaw = canonicalTag.length > 0 ? (canonicalTag.attr('href') || '').trim() : null;
  const canonical = canonicalRaw ? resolveUrl(canonicalRaw) : null;

  // 4. Headings (H1-H6)
  const headings = {};
  for (let i = 1; i <= 6; i++) {
    const tagName = `h${i}`;
    const tagTexts = [];
    $(tagName).each((_, el) => {
      const txt = $(el).text().trim();
      if (txt) tagTexts.push(txt);
    });
    headings[tagName] = tagTexts;
  }

  // 5. Images and Alt text
  const images = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src');
    if (src) {
      const resolvedSrc = resolveUrl(src);
      const altVal = $(el).attr('alt');
      images.push({
        src: resolvedSrc,
        alt: altVal !== undefined ? altVal.trim() : "",
        has_alt_attr: altVal !== undefined,
        width: $(el).attr('width') || null,
        height: $(el).attr('height') || null,
        loading: $(el).attr('loading') || null
      });
    }
  });

  // 6. Links (Internal vs External)
  let baseDomain = "";
  try {
    baseDomain = new URL(baseUrl).hostname.toLowerCase();
  } catch (err) {}

  const internalLinks = new Set();
  const externalLinks = new Set();
  const detailedLinks = [];

  $('a').each((idx, el) => {
    const href = $(el).attr('href');
    const rel = $(el).attr('rel') || "";

    let anchorText = $(el).text().trim();
    if (!anchorText) {
      const nestedAlts = [];
      $(el).find('img').each((_, imgEl) => {
        const alt = $(imgEl).attr('alt');
        if (alt) nestedAlts.push(alt.trim());
      });
      if (nestedAlts.length > 0) {
        anchorText = nestedAlts.join(" ");
      }
    }

    if (href === undefined) {
      detailedLinks.push({
        href: "",
        raw_href: "",
        text: anchorText || "",
        rel: "",
        is_external: false,
        has_href: false
      });
      return;
    }

    const hrefStrip = href.trim();
    const resolvedHref = resolveUrl(hrefStrip);

    let hrefDomain = "";
    try {
      if (resolvedHref) {
        hrefDomain = new URL(resolvedHref).hostname.toLowerCase();
      }
    } catch (err) {}

    const isExternal = !!(hrefDomain && hrefDomain !== baseDomain);

    detailedLinks.push({
      href: resolvedHref,
      raw_href: hrefStrip,
      text: anchorText || "",
      rel,
      is_external: isExternal,
      has_href: true
    });

    if (!hrefStrip) return;

    if (
      hrefStrip.startsWith("mailto:") ||
      hrefStrip.startsWith("tel:") ||
      hrefStrip.startsWith("javascript:") ||
      hrefStrip.startsWith("#") ||
      hrefStrip.startsWith("//#") ||
      hrefStrip.startsWith("void(0)")
    ) {
      return;
    }

    if (!hrefDomain || hrefDomain === baseDomain) {
      internalLinks.add(resolvedHref);
    } else {
      externalLinks.add(resolvedHref);
    }
  });

  // 7. Open Graph (OG) Tags
  const openGraph = {};
  $('meta').each((_, el) => {
    const propAttr = $(el).attr('property') || $(el).attr('name');
    if (propAttr && propAttr.startsWith("og:")) {
      const content = ($(el).attr('content') || '').trim();
      openGraph[propAttr] = content;
    }
  });

  // 8. Twitter Card Tags
  const twitterCard = {};
  $('meta').each((_, el) => {
    const nameAttr = $(el).attr('name') || $(el).attr('property');
    if (nameAttr && nameAttr.startsWith("twitter:")) {
      const content = ($(el).attr('content') || '').trim();
      twitterCard[nameAttr] = content;
    }
  });

  // 9. Schema / JSON-LD
  const schemaJsonLd = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const content = $(el).html();
    if (content) {
      try {
        const data = JSON.parse(content.trim());
        if (Array.isArray(data)) {
          schemaJsonLd.push(...data);
        } else {
          schemaJsonLd.push(data);
        }
      } catch (err) {
        console.warn(`[Parser] Failed to parse JSON-LD script content: ${err.message}`);
      }
    }
  });

  // 9b. Microdata
  const microdata = [];
  $('[itemscope]').each((_, el) => {
    const itemtypeUrl = $(el).attr('itemtype') || "";
    const typeName = itemtypeUrl.split('/').pop() || "";
    
    const props = {};
    $(el).find('[itemprop]').each((_, childEl) => {
      const parentScope = $(childEl).closest('[itemscope]');
      if (parentScope[0] === el) {
        const propName = $(childEl).attr('itemprop');
        let propVal = "";
        
        const tagName = childEl.name || childEl.tagName || "";
        const tagLower = tagName.toLowerCase();

        if (tagLower === "meta") {
          propVal = $(childEl).attr('content') || "";
        } else if (tagLower === "a" || tagLower === "link") {
          propVal = $(childEl).attr('href') || "";
        } else if (["img", "audio", "video", "iframe"].includes(tagLower)) {
          propVal = $(childEl).attr('src') || "";
        } else if (tagLower === "time") {
          propVal = $(childEl).attr('datetime') || "";
        } else {
          propVal = $(childEl).text().trim();
        }

        if (propName) {
          props[propName] = propVal;
        }
      }
    });

    if (typeName || Object.keys(props).length > 0) {
      microdata.push({
        "@type": typeName,
        properties: props,
        format: "Microdata"
      });
    }
  });

  // 9c. RDFa
  const rdfa = [];
  $('[typeof]').each((_, el) => {
    const typeofVal = $(el).attr('typeof') || "";
    const typeName = typeofVal.split(':').pop().split('/').pop() || "";

    const props = {};
    $(el).find('[property]').each((_, childEl) => {
      const parentType = $(childEl).closest('[typeof]');
      if (parentType[0] === el) {
        const propName = $(childEl).attr('property') || "";
        const propNameClean = propName.split(':').pop() || "";

        let propVal = "";
        const tagName = childEl.name || childEl.tagName || "";
        const tagLower = tagName.toLowerCase();

        if ($(childEl).attr('content') !== undefined) {
          propVal = $(childEl).attr('content') || "";
        } else if ((tagLower === "a" || tagLower === "link") && $(childEl).attr('href') !== undefined) {
          propVal = $(childEl).attr('href') || "";
        } else if (["img", "audio", "video"].includes(tagLower) && $(childEl).attr('src') !== undefined) {
          propVal = $(childEl).attr('src') || "";
        } else {
          propVal = $(childEl).text().trim();
        }

        if (propNameClean) {
          props[propNameClean] = propVal;
        }
      }
    });

    if (typeName || Object.keys(props).length > 0) {
      rdfa.push({
        "@type": typeName,
        properties: props,
        format: "RDFa"
      });
    }
  });

  // 10. Word Count
  const wordHtml = html;
  const word$ = cheerio.load(wordHtml);
  word$('script, style, meta, noscript, iframe, svg, header, footer, nav, aside, [role="navigation"], [role="banner"], [role="contentinfo"]').remove();
  const text = word$('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const pageContent = text.slice(0, 5000);

  return {
    title,
    meta_description: metaDescription,
    canonical,
    headings,
    images,
    internal_links: Array.from(internalLinks).sort(),
    external_links: Array.from(externalLinks).sort(),
    detailed_links: detailedLinks,
    open_graph: openGraph,
    twitter_card: twitterCard,
    schema_json_ld: schemaJsonLd,
    microdata,
    rdfa,
    word_count: wordCount,
    page_content: pageContent
  };
}

module.exports = { parseSeoElements };

