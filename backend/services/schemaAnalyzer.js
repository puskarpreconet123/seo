const SCHEMA_RULES = {
  "Organization": {
    "required": ["name"],
    "recommended": ["url", "logo", "contactPoint", "sameAs"]
  },
  "LocalBusiness": {
    "required": ["name", "address"],
    "recommended": ["telephone", "priceRange", "image", "geo", "openingHours"]
  },
  "Article": {
    "required": ["headline", "author", "publisher"],
    "recommended": ["image", "datePublished", "dateModified", "mainEntityOfPage"]
  },
  "BlogPosting": {
    "required": ["headline", "author", "publisher"],
    "recommended": ["image", "datePublished", "dateModified"]
  },
  "FAQPage": {
    "required": ["mainEntity"],
    "recommended": []
  },
  "BreadcrumbList": {
    "required": ["itemListElement"],
    "recommended": []
  },
  "Product": {
    "required": ["name"],
    "recommended": ["offers", "review", "aggregateRating", "image", "description", "brand"]
  },
  "Review": {
    "required": ["itemReviewed", "author"],
    "recommended": ["reviewRating", "reviewBody", "publisher"]
  },
  "Event": {
    "required": ["name", "startDate", "location"],
    "recommended": ["endDate", "offers", "image", "description", "performer"]
  },
  "Person": {
    "required": ["name"],
    "recommended": ["jobTitle", "worksFor", "sameAs", "image", "url"]
  },
  "WebSite": {
    "required": ["name", "url"],
    "recommended": ["potentialAction"]
  },
  "SoftwareApplication": {
    "required": ["name", "applicationCategory", "operatingSystem"],
    "recommended": ["offers", "aggregateRating", "screenshot", "url", "description", "featureList", "softwareVersion"]
  },
  "WebApplication": {
    "required": ["name", "applicationCategory"],
    "recommended": ["offers", "aggregateRating", "url", "description", "browserRequirements", "screenshot"]
  }
};

const LOWERCASE_RULES = {};
for (const [key, val] of Object.entries(SCHEMA_RULES)) {
  LOWERCASE_RULES[key.toLowerCase()] = { originalKey: key, ...val };
}

function normalizeJsonLd(data, seen = new Set()) {
  const items = [];

  if (Array.isArray(data)) {
    for (const subItem of data) {
      items.push(...normalizeJsonLd(subItem, seen));
    }
    return items;
  }

  if (data && typeof data === 'object') {
    // Avoid circular loops
    if (seen.has(data)) return items;
    seen.add(data);

    if (data["@graph"]) {
      items.push(...normalizeJsonLd(data["@graph"], seen));
    }

    const typeVal = data["@type"];
    if (typeVal) {
      const typeName = Array.isArray(typeVal) ? String(typeVal[0]) : String(typeVal);
      if (typeName) {
        const typeNameClean = typeName.split(":").pop().split("/").pop();
        const properties = {};
        for (const [k, v] of Object.entries(data)) {
          if (!k.startsWith("@")) {
            properties[k] = v;
          }
        }
        items.push({
          schema_type: typeNameClean,
          format: "JSON-LD",
          properties
        });
        return items; // Stop nesting traversal for this entity
      }
    }

    for (const [k, v] of Object.entries(data)) {
      if (k !== "@graph" && v && typeof v === 'object') {
        items.push(...normalizeJsonLd(v, seen));
      }
    }
  }

  return items;
}

function isPropertyPresent(props, field) {
  if (!(field in props)) return false;
  const val = props[field];
  if (val === null || val === undefined) return false;
  if (typeof val === 'string' && val.trim() === '') return false;
  if (Array.isArray(val) && val.length === 0) return false;
  if (typeof val === 'object' && Object.keys(val).length === 0) return false;
  return true;
}

async function runSchemaAnalysis(seoData) {
  const schemaJsonLd = seoData.schema_json_ld || [];
  const microdata = seoData.microdata || [];
  const rdfa = seoData.rdfa || [];

  const normalizedItems = [];

  // JSON-LD
  normalizedItems.push(...normalizeJsonLd(schemaJsonLd));

  // Microdata
  for (const md of microdata) {
    const t = md["@type"] || "";
    if (t) {
      const tClean = t.split(":").pop().split("/").pop();
      normalizedItems.push({
        schema_type: tClean,
        format: "Microdata",
        properties: md.properties || {}
      });
    }
  }

  // RDFa
  for (const rd of rdfa) {
    const t = rd["@type"] || "";
    if (t) {
      const tClean = t.split(":").pop().split("/").pop();
      normalizedItems.push({
        schema_type: tClean,
        format: "RDFa",
        properties: rd.properties || {}
      });
    }
  }

  const jsonLdCount = normalizedItems.filter(item => item.format === "JSON-LD").length;
  const microdataCount = normalizedItems.filter(item => item.format === "Microdata").length;
  const rdfaCount = normalizedItems.filter(item => item.format === "RDFa").length;

  const statistics = {
    json_ld: jsonLdCount,
    microdata: microdataCount,
    rdfa: rdfaCount
  };

  let schemaScore = 100.0;
  const items = [];

  const passed = [];
  const warnings = [];
  const critical = [];

  let missingRequiredCount = 0;
  let missingRecommendedCount = 0;
  let structureErrorCount = 0;

  const detectedFormats = new Set();
  if (jsonLdCount > 0) detectedFormats.add("JSON-LD");
  if (microdataCount > 0) detectedFormats.add("Microdata");
  if (rdfaCount > 0) detectedFormats.add("RDFa");

  if (normalizedItems.length === 0) {
    schemaScore = 0.0;
    critical.push({
      check_name: "Structured Data Presence",
      message: "No JSON-LD, Microdata, or RDFa structured schemas found on this page. Search engines rely on structured data for rich snippet integration."
    });
  } else {
    passed.push({
      check_name: "Structured Data Presence",
      message: `Detected ${normalizedItems.length} schema structured data entities utilizing ${Array.from(detectedFormats).sort().join(', ')} format(s).`
    });
  }

  for (let idx = 0; idx < normalizedItems.length; idx++) {
    const rawItem = normalizedItems[idx];
    const st = rawItem.schema_type;
    const fmt = rawItem.format;
    const props = rawItem.properties;

    const itemPassed = [];
    const itemWarnings = [];
    const itemCritical = [];
    let isValid = true;

    const stLower = st ? st.toLowerCase() : "";
    if (stLower in LOWERCASE_RULES) {
      const rules = LOWERCASE_RULES[stLower];
      const origType = rules.originalKey;

      // Required properties
      for (const req of rules.required) {
        if (isPropertyPresent(props, req)) {
          itemPassed.push(`Required property '${req}' is present.`);
        } else {
          isValid = false;
          missingRequiredCount++;
          const errMsg = `Required property '${req}' is missing or empty.`;
          itemCritical.push(errMsg);
          critical.push({
            check_name: "Missing Schema Required Property",
            message: `${origType} (${fmt} #${idx + 1}) is missing required property '${req}'.`
          });
        }
      }

      // Recommended properties
      for (const rec of rules.recommended) {
        if (isPropertyPresent(props, rec)) {
          itemPassed.push(`Recommended property '${rec}' is present.`);
        } else {
          missingRecommendedCount++;
          const errMsg = `Recommended property '${rec}' is missing.`;
          itemWarnings.push(errMsg);
          warnings.push({
            check_name: "Missing Schema Recommended Property",
            message: `${origType} (${fmt} #${idx + 1}) is missing recommended property '${rec}'.`
          });
        }
      }

      // Custom Structural validation (Case-Insensitive)
      if (stLower === "faqpage") {
        const mainEntity = props.mainEntity;
        if (!mainEntity) {
          isValid = false;
          structureErrorCount++;
          itemCritical.push("mainEntity property is missing or empty");
          critical.push({
            check_name: "Invalid FAQPage Schema Structure",
            message: `FAQPage schema (${fmt} #${idx + 1}) has an empty or missing mainEntity.`
          });
        } else {
          const questions = Array.isArray(mainEntity) ? mainEntity : [mainEntity];
          for (let qIdx = 0; qIdx < questions.length; qIdx++) {
            const q = questions[qIdx];
            if (!q || typeof q !== 'object') {
              isValid = false;
              structureErrorCount++;
              itemCritical.push(`mainEntity[${qIdx}] must be a Question object.`);
              continue;
            }

            const qType = String(q["@type"] || "").split(":").pop().split("/").pop().toLowerCase();
            if (qType !== "question") {
              isValid = false;
              structureErrorCount++;
              itemCritical.push(`Question #${qIdx + 1} has invalid type '${q["@type"]}'.`);
            }

            if (!q.name) {
              isValid = false;
              structureErrorCount++;
              itemCritical.push(`Question #${qIdx + 1} is missing its question 'name' text.`);
              critical.push({
                check_name: "Invalid FAQPage Question",
                message: `Question #${qIdx + 1} in FAQPage is missing the question name property.`
              });
            }

            const ans = q.acceptedAnswer;
            if (!ans) {
              isValid = false;
              structureErrorCount++;
              itemCritical.push(`Question #${qIdx + 1} is missing acceptedAnswer.`);
              critical.push({
                check_name: "Invalid FAQPage Answer",
                message: `Question #${qIdx + 1} in FAQPage is missing the acceptedAnswer property.`
              });
            } else if (typeof ans !== 'object') {
              isValid = false;
              structureErrorCount++;
              itemCritical.push(`acceptedAnswer for Question #${qIdx + 1} is not a valid object.`);
            } else {
              const ansType = String(ans["@type"] || "").split(":").pop().split("/").pop().toLowerCase();
              if (ansType !== "answer") {
                isValid = false;
                structureErrorCount++;
                itemCritical.push(`acceptedAnswer for Question #${qIdx + 1} type is '${ans["@type"]}' instead of 'Answer'.`);
              }
              if (!ans.text) {
                isValid = false;
                structureErrorCount++;
                itemCritical.push(`acceptedAnswer for Question #${qIdx + 1} is missing the answer 'text'.`);
              }
            }
          }
        }
      } else if (stLower === "breadcrumblist") {
        const elements = props.itemListElement;
        if (!elements) {
          isValid = false;
          structureErrorCount++;
          itemCritical.push("itemListElement property is missing or empty");
          critical.push({
            check_name: "Invalid BreadcrumbList Structure",
            message: `BreadcrumbList schema (${fmt} #${idx + 1}) is missing itemListElement.`
          });
        } else {
          const itemsList = Array.isArray(elements) ? elements : [elements];
          for (let itemIdx = 0; itemIdx < itemsList.length; itemIdx++) {
            const bItem = itemsList[itemIdx];
            if (!bItem || typeof bItem !== 'object') {
              isValid = false;
              structureErrorCount++;
              itemCritical.push(`itemListElement[${itemIdx}] must be a ListItem object.`);
              continue;
            }

            const itemType = String(bItem["@type"] || "").split(":").pop().split("/").pop().toLowerCase();
            if (itemType !== "listitem") {
              isValid = false;
              structureErrorCount++;
              itemCritical.push(`ListItem #${itemIdx + 1} has invalid type '${bItem["@type"]}'.`);
            }

            if (bItem.position === undefined || bItem.position === null) {
              isValid = false;
              structureErrorCount++;
              itemCritical.push(`ListItem #${itemIdx + 1} is missing 'position'.`);
              critical.push({
                check_name: "Invalid Breadcrumb Position",
                message: `Breadcrumb ListItem #${itemIdx + 1} is missing its 'position' hierarchy value.`
              });
            }

            if (!bItem.name) {
              isValid = false;
              structureErrorCount++;
              itemCritical.push(`ListItem #${itemIdx + 1} is missing 'name'.`);
              critical.push({
                check_name: "Invalid Breadcrumb Name",
                message: `Breadcrumb ListItem #${itemIdx + 1} is missing its name label.`
              });
            }

            if (!bItem.item) {
              isValid = false;
              structureErrorCount++;
              itemCritical.push(`ListItem #${itemIdx + 1} is missing URL 'item'.`);
              critical.push({
                check_name: "Invalid Breadcrumb Link",
                message: `Breadcrumb ListItem #${itemIdx + 1} is missing its URL target ('item').`
              });
            }
          }
        }
      } else if (stLower === "product") {
        const hasOffers = isPropertyPresent(props, "offers");
        const hasReview = isPropertyPresent(props, "review");
        const hasRating = isPropertyPresent(props, "aggregateRating");
        if (!hasOffers && !hasReview && !hasRating) {
          isValid = false;
          structureErrorCount++;
          itemCritical.push("Product schema requires at least 'offers', 'review', or 'aggregateRating' for Google Rich Results eligibility.");
          critical.push({
            check_name: "Missing Product Snippet Identifiers",
            message: `Product (${fmt} #${idx + 1}) requires at least 'offers', 'review', or 'aggregateRating'.`
          });
        }
      }

      if (isValid && itemWarnings.length === 0 && itemCritical.length === 0) {
        passed.push({
          check_name: `Schema Validation: ${origType}`,
          message: `${origType} schema (${fmt} #${idx + 1}) is fully populated and valid.`
        });
      }
    } else {
      itemPassed.push("Schema format is valid (no strict SEO property validation rules defined for this type).");
    }

    items.push({
      schema_type: st,
      format: fmt,
      properties: props,
      passed: itemPassed,
      warnings: itemWarnings,
      critical: itemCritical,
      is_valid: isValid
    });
  }

  if (normalizedItems.length > 0) {
    schemaScore -= Math.min(45.0, missingRequiredCount * 15.0);
    schemaScore -= Math.min(15.0, missingRecommendedCount * 5.0);
    schemaScore -= Math.min(20.0, structureErrorCount * 10.0);
  }

  const finalSchemaScore = Math.max(0, Math.min(100, Math.floor(schemaScore)));

  const suggestions = [];
  if (normalizedItems.length === 0) {
    suggestions.push("Add structured markup (JSON-LD format is highly recommended by Google) to define Organization, Article, or LocalBusiness info.");
  } else {
    if (missingRequiredCount > 0) {
      suggestions.push(`Populate the ${missingRequiredCount} missing required fields across your structured schema models.`);
    }
    if (structureErrorCount > 0) {
      suggestions.push(`Fix the ${structureErrorCount} structural hierarchy layout errors identified within FAQPage / BreadcrumbList markup.`);
    }
    if (missingRecommendedCount > 0) {
      suggestions.push(`Inject the ${missingRecommendedCount} missing recommended properties (e.g. logos, geo coordinates, ratings) to increase eligibility for rich search results.`);
    }
    if (suggestions.length === 0) {
      suggestions.push("Outstanding! All structured schemas are fully optimized with rich data properties and contain no structural defects.");
    }
  }

  return {
    schema_score: finalSchemaScore ,
    statistics,
    items,
    optimization_suggestions: suggestions,
    passed,
    warnings,
    critical
  };
}

module.exports = { runSchemaAnalysis };
