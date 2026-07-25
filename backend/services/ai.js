const { settings } = require('../config/settings');
const OpenAI = require('openai');

function escapeXml(val) {
  if (val === null || val === undefined) return "";
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ----------------------------------------------------------------------------
// Local Fallback helpers
// ----------------------------------------------------------------------------
function generateMockSeoOptimization(url, score, metadata, report, priorityIssues) {
  const title = metadata.title || "Untitled Home Page";
  const recommendations = [];
  let priority = "Low";

  if (score < 50) {
    priority = "High";
  } else if (score < 85) {
    priority = "Medium";
  }

  if (priorityIssues && priorityIssues.length > 0) {
    for (const item of priorityIssues) {
      const prio = item.priority;
      const issueName = item.issue_name;
      const rec = item.recommendation;
      if ((prio === "Critical" || prio === "High") && recommendations.length < 3) {
        recommendations.push(`Priority Fix: ${issueName} - ${rec}`);
      } else if (prio === "Medium" && recommendations.length < 5) {
        recommendations.push(`Improvement: ${issueName} - ${rec}`);
      }
    }
    const criticalCount = priorityIssues.filter(item => item.priority === "Critical" || item.priority === "High").length;
    const warningCount = priorityIssues.filter(item => item.priority === "Medium").length;
    var explanation = `Your technical SEO health rating is ${score}/100. We identified ${criticalCount} critical/high priority issues and ${warningCount} medium priority warnings restraining your indexation rankings. Resolving these blocks will improve crawler performance.`;
  } else {
    const criticalMessages = (report.critical || []).map(item => item.message);
    const warningMessages = (report.warnings || []).map(item => item.message);
    for (const msg of criticalMessages.slice(0, 3)) {
      recommendations.push(`Resolve critical error: ${msg}`);
    }
    for (const msg of warningMessages.slice(0, 2)) {
      recommendations.push(`Improve configuration: ${msg}`);
    }
    var explanation = `Your technical SEO health rating is ${score}/100. We identified ${criticalMessages.length} critical issues and ${warningMessages.length} warnings restraining your indexation rankings. Resolving these blocks will improve crawler performance.`;
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Maintain current meta tags structure; monitor search analytics for page CTR shifts.",
      "Establish secondary index link strategies using localized target keywords.",
      "Regularly crawl outbound resources to prevent slow link degradations."
    );
  }

  let betterTitle = `Optimized ${title.split('|')[0].trim()} | Technical SEO Auditor`;
  if (betterTitle.length > 60) betterTitle = betterTitle.slice(0, 55) + "...";

  let betterDesc = `Unlock peak search ranking metrics for ${url}. Check our technical SEO audit findings detailing tags, structure speeds, and link schemas.`;
  if (betterDesc.length > 160) betterDesc = betterDesc.slice(0, 157) + "...";

  return {
    explanation,
    recommendations,
    priority,
    better_title: betterTitle,
    better_meta_description: betterDesc
  };
}

function generateMockKeywords(title, h1) {
  let topic = (title || h1 || "Business").split("|")[0].split("-")[0].trim();
  if (!topic) topic = "Website";

  return {
    primary_keywords: [topic, `best ${topic.toLowerCase()} service`, `${topic.toLowerCase()} online`],
    secondary_keywords: [`${topic.toLowerCase()} optimization`, `professional ${topic.toLowerCase()}`, `${topic.toLowerCase()} solutions`, `${topic.toLowerCase()} tools`, `${topic.toLowerCase()} company`],
    long_tail_keywords: [`how to find the best ${topic.toLowerCase()} online`, `step by step ${topic.toLowerCase()} optimization checklist`, `low cost ${topic.toLowerCase()} strategy for startups`],
    question_keywords: [`What is ${topic}?`, `How do I optimize my ${topic.toLowerCase()} strategy?`, `Why is ${topic} important for search engine indexing?`],
    semantic_keywords: ["search query relevance", "metadata target optimization", "content topical authority", "organic click through rates"],
    search_intent: "Informational / Commercial (The user is looking to acquire resources, learn optimizations, and compare platforms relating to this niche.)"
  };
}

function generateMockContentOptimization(title, description, h1, headings, content, seoReport) {
  let topic = (title || h1 || "Business").split("|")[0].split("-")[0].trim();
  if (!topic) topic = "Web Services";

  const betterSeoTitle = `Optimized ${topic} - Boost Your Organic Search Rankings`;
  const betterMetaDescription = `Discover professional ${topic} insights. Learn how to implement strategic optimizations, improve reading accessibility, and enhance technical search indexing metrics today.`;
  const betterH1 = `Maximize Your Search Visibility with ${topic}`;

  const betterHeadingStructure = [
    { tag: "H1", text: `Maximize Your Search Visibility with ${topic}` },
    { tag: "H2", text: `Why {topic} Matters for Modern Businesses` },
    { tag: "H2", text: "Core Services & Technical Architectures" },
    { tag: "H3", text: "Key Benefits of High-Fidelity Optimizations" },
    { tag: "H2", text: "Frequently Asked Questions & Strategies" }
  ];

  const improvedReadability = `The current content has a basic layout. To improve reading accessibility for ${topic}, break down long blocks of text into 2-3 sentence paragraphs, target a Flesch-Kincaid grade level between 7-9, and minimize complex trade terminology unless directly explained.`;

  const missingTopics = [
    `Detailed ${topic} implementation case studies and success stories`,
    `A comparison matrix of ${topic} tools and automated software`,
    "Pricing configurations and service tier details",
    "Industry-specific standards and search compliance guidelines"
  ];

  const faqSuggestions = [
    {
      question: `What are the best practices for optimizing ${topic}?`,
      answer: `Best practices include performing keyword research, validating metadata lengths, utilizing structured schema markup, and optimizing asset load speeds.`
    },
    {
      question: `How long does it take to see organic search updates for ${topic}?`,
      answer: "Typically, search engines re-crawl and re-index pages within 4-14 days. Changes in keyword rankings can take between 2 to 6 weeks to stabilize."
    },
    {
      question: `Should I prioritize technical SEO or content optimization for ${topic}?`,
      answer: "Both are critical; technical SEO ensures crawlers can access and parse your site, while content optimization drives actual user relevance and rank scores."
    }
  ];

  const internalLinkSuggestions = [
    `/services/${topic.toLowerCase().replace(/\s+/g, '-')}`,
    "/pricing",
    "/case-studies",
    "/contact-us"
  ];

  const callToActionSuggestions = [
    `Start optimizing your ${topic} strategy today - Get a free consult!`,
    `Download the Ultimate ${topic} checklist now`,
    "Schedule a 15-minute diagnostic call with an SEO expert"
  ];

  const contentImprovementTips = [
    "Incorporate bulleted lists to break up long descriptive paragraphs.",
    "Add bold styling to high-value keyword terms and core action phrases.",
    "Include descriptive alternate alt text for all diagrams and images.",
    "Add a table comparing feature checklists to improve scanning readability."
  ];

  return {
    better_seo_title: betterSeoTitle,
    better_meta_description: betterMetaDescription,
    better_h1: betterH1,
    better_heading_structure: betterHeadingStructure,
    improved_readability: improvedReadability,
    missing_topics: missingTopics,
    faq_suggestions: faqSuggestions,
    internal_link_suggestions: internalLinkSuggestions,
    call_to_action_suggestions: callToActionSuggestions,
    content_improvement_tips: contentImprovementTips
  };
}

function generateMockSeoActionPlan(results) {
  const priorityIssues = results.priority_issues || [];
  const mappedTasks = [];

  for (const item of priorityIssues) {
    mappedTasks.push({
      title: item.issue_name || "SEO Recommendation",
      description: `[${item.category}] ${item.recommendation}`,
      priority: item.priority || "Low",
      impact: item.estimated_ranking_impact || "Medium",
      difficulty: item.difficulty || "Easy",
      estimated_time: item.estimated_fix_time || "30 mins"
    });
  }

  if (mappedTasks.length === 0) {
    mappedTasks.push(
      {
        title: "Establish keyword mapping document",
        description: "[Content Strategy] Group keyword opportunities and map them to targeted landing pages to prevent cannibalization.",
        priority: "Low",
        impact: "Medium",
        difficulty: "Easy",
        estimated_time: "1 hour"
      },
      {
        title: "Setup organic search tracking metrics",
        description: "[Analytics] Integrate Google Search Console and verify URL impressions for semantic queries.",
        priority: "Low",
        impact: "Medium",
        difficulty: "Easy",
        estimated_time: "30 mins"
      },
      {
        title: "Configure schema review additions",
        description: "[Schema Markup] Implement Product, LocalBusiness or FAQ structured data definitions to claim rich snippets.",
        priority: "Low",
        impact: "High",
        difficulty: "Medium",
        estimated_time: "2 hours"
      }
    );
  }

  const top10Fixes = mappedTasks.slice(0, 10);
  let quickWins = mappedTasks.filter(t => t.difficulty === "Easy" && ["Critical", "High", "Medium"].includes(t.priority));
  if (quickWins.length === 0) {
    quickWins = mappedTasks.filter(t => t.difficulty === "Easy").slice(0, 3);
  }

  let highImpactTasks = mappedTasks.filter(t => t.priority === "Critical" || t.priority === "High" || t.impact === "High");
  if (highImpactTasks.length === 0) {
    highImpactTasks = mappedTasks.slice(0, 2);
  }

  let longTermImprovements = mappedTasks.filter(t => t.difficulty === "Hard" || t.description.includes("[Schema") || t.description.includes("[Performance"));
  if (longTermImprovements.length === 0) {
    longTermImprovements = mappedTasks.slice(-2);
  }

  const today = [];
  const thisWeek = [];
  const thisMonth = [];

  for (const t of mappedTasks) {
    const prio = t.priority;
    const diff = t.difficulty;
    if (["Critical", "High"].includes(prio) && ["Easy", "Medium"].includes(diff)) {
      today.push(t);
    } else if (["Critical", "High"].includes(prio) && diff === "Hard") {
      thisWeek.push(t);
    } else if (prio === "Medium") {
      thisWeek.push(t);
    } else {
      thisMonth.push(t);
    }
  }

  if (today.length === 0) today.push(mappedTasks[0]);
  if (thisWeek.length === 0) {
    const filt = mappedTasks.filter(t => !today.includes(t));
    thisWeek.push(...(filt.length > 0 ? filt.slice(0, 2) : [mappedTasks[0]]));
  }
  if (thisMonth.length === 0) {
    const filt = mappedTasks.filter(t => !today.includes(t) && !thisWeek.includes(t));
    thisMonth.push(...(filt.length > 0 ? filt.slice(0, 2) : [mappedTasks[mappedTasks.length - 1]]));
  }

  const healthScore = results.health_score ?? results.seo_score ?? 100;
  const potentialBoost = 100 - healthScore;
  const improvementStr = potentialBoost > 0 
    ? `+${potentialBoost}% Rank Relevancy Potential (Health score boost up to 100/100)`
    : "+5% search authority consolidation and maintenance";

  const completionHours = mappedTasks.length * 0.75;
  const completionStr = completionHours < 1.0 
    ? "Under 1 hour total"
    : `${Math.round(completionHours)} hours total execution effort`;

  return {
    top_10_fixes: top10Fixes,
    quick_wins: quickWins,
    high_impact_tasks: highImpactTasks,
    long_term_improvements: longTermImprovements,
    estimated_seo_improvement: improvementStr,
    estimated_completion_time: completionStr,
    today,
    this_week: thisWeek,
    this_month: thisMonth
  };
}

function generateMockAssistantResponse(messages, auditResults) {
  let userMsg = "";
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") {
      userMsg = (messages[i].content || "").toLowerCase();
      break;
    }
  }

  const hasAudit = !!auditResults;
  const requestedUrl = hasAudit ? (auditResults.requested_url || "https://example.com") : "https://example.com";
  const seoScore = hasAudit ? (auditResults.health_score ?? auditResults.seo_score) : null;
  const priorityIssues = hasAudit ? (auditResults.priority_issues || []) : [];

  if (userMsg.includes("meta description") || userMsg.includes("description")) {
    if (hasAudit) {
      const seoData = auditResults.seo_data || {};
      const currDesc = seoData.meta_description || "(None found)";
      let topic = (seoData.title || "Website").split("|")[0].split("-")[0].trim();
      if (!topic || topic.toLowerCase() === "untitled home page") topic = "your website";

      const opt1 = `Looking for the best ${topic}? Discover professional insights, technical optimizations, and expert guides to boost your organic reach today.`;
      const opt2 = `Optimize your ${topic} strategy with our detailed page audits. Learn how to resolve critical errors and enhance your search visibility now!`;
      const opt3 = `Get top ranking potentials for ${topic}. Access technical SEO recommendations, structured schemas, and speed diagnostics immediately.`;

      return `### Proposed Meta Description Options for **${requestedUrl}**

**Current Meta Description:** *${currDesc}* (Length: ${currDesc.length} chars)

Here are 3 optimized variations under 160 characters designed to maximize search click-through rate (CTR):

1. **Option 1 (Benefit-Focused):** "${opt1}" (${opt1.length} chars)
2. **Option 2 (Action-Oriented):** "${opt2}" (${opt2.length} chars)
3. **Option 3 (Brand-Centric):** "${opt3}" (${opt3.length} chars)`;
    } else {
      return `### Meta Description Recommendations

I don't have website audit context loaded right now. However, here are generic best practices for meta descriptions:
- Keep length strictly between **120 and 160 characters**.
- Include your primary focus keyword near the beginning.
- Add a clear call-to-action (CTA) to encourage searchers to click (e.g., *'Learn more!'*, *'Get a free audit!'*).
- Ensure every page has a unique, descriptive meta tag.`;
    }
  }

  if (userMsg.includes("title") || userMsg.includes("rewrite my title")) {
    if (hasAudit) {
      const seoData = auditResults.seo_data || {};
      const currTitle = seoData.title || "(None found)";
      let topic = currTitle.split("|")[0].split("-")[0].trim();
      if (!topic || topic.toLowerCase() === "untitled home page") topic = "Home";

      const opt1 = `Best ${topic} Services & Professional Guide`;
      const opt2 = `Optimize ${topic} | Technical SEO Auditor`;
      const opt3 = `Boost ${topic} Search Rankings - SEOAI Suite`;

      return `### Proposed Title Tag Options for **${requestedUrl}**

**Current Title:** *${currTitle}* (Length: ${currTitle.length} chars)

Here are 3 optimized title tag options strictly under 60 characters to prevent search engines from truncating your name:

1. **Option 1 (Primary Keyword First):** "${opt1}" (${opt1.length} chars)
2. **Option 2 (Action-Driven):** "${opt2}" (${opt2.length} chars)
3. **Option 3 (Value-Centric):** "${opt3}" (${opt3.length} chars)`;
    } else {
      return `### Title Tag Recommendations

I don't have website audit context loaded right now. Here are some key guidelines for title tags:
- Keep titles under **60 characters** to ensure they render fully on Google Search Results.
- Place your primary focus keyword at the front of the title.
- Add your brand name at the end, separated by a pipe (\`|\`) or dash (\`-\`).
- Avoid keyword stuffing; make the title natural and readable.`;
    }
  }

  if (userMsg.includes("why") && (userMsg.includes("score") || userMsg.includes("low"))) {
    if (hasAudit) {
      const crits = priorityIssues.filter(item => ["Critical", "High"].includes(item.priority));
      const warns = priorityIssues.filter(item => item.priority === "Medium");
      
      let resp = `### Score Diagnostics for **${requestedUrl}**\n\n`;
      resp += `Your current technical health score is **${seoScore}/100**. This rating is affected by several issues detected on the page:\n\n`;
      
      if (crits.length > 0) {
        resp += "**Critical/High Priority Issues affecting your score:**\n";
        for (const item of crits.slice(0, 4)) {
          resp += `- 🔴 **${item.issue_name}**: ${item.description}\n`;
        }
        resp += "\n";
      }
      
      if (warns.length > 0) {
        resp += "**Warning Issues to optimize:**\n";
        for (const item of warns.slice(0, 3)) {
          resp += `- 🟡 **${item.issue_name}**: ${item.description}\n`;
        }
        resp += "\n";
      }
      
      if (crits.length === 0 && warns.length === 0) {
        resp += "Incredible! No major critical issues or warnings are currently impacting your health rating. Your site is fully optimized.\n\n";
      } else {
        resp += "Fixing the red critical/high priority items first will give you the largest immediate boost in your score.";
      }
      return resp;
    } else {
      return `### Website Score Analysis

No website audit is currently active. To help you diagnose search score factors:
1. Go to the **Single URL Audit** tab.
2. Enter your website address and click **Run Audit**.
3. Once complete, click the AI Assistant again, and I will outline the exact errors keeping your rating low.`;
    }
  }

  if (userMsg.includes("improve") || userMsg.includes("improve this page") || userMsg.includes("optimize")) {
    if (hasAudit) {
      const recs = priorityIssues.map(item => `${item.issue_name} (${item.priority}): ${item.recommendation}`);
      const explanation = `We identified ${priorityIssues.length} issues on your webpage. Addressing these items will improve your page structure, performance, and accessibility.`;
      
      let resp = `### Action Plan to Improve **${requestedUrl}**\n\n`;
      resp += `**Overview:** ${explanation}\n\n`;
      resp += "**Actionable SEO Directives:**\n";
      if (recs.length > 0) {
        for (let idx = 0; idx < Math.min(recs.length, 5); idx++) {
          resp += `${idx + 1}. **${recs[idx]}**\n`;
        }
      } else {
        resp += "1. **Resolve missing alternative text tags** on all images to help image indexing.\n";
        resp += "2. **Ensure JSON-LD schema schemas are declared** defining Organization and Website types.\n";
        resp += "3. **Configure canonical link headers** defining domain ranking boundaries.\n";
        resp += "4. **Defer non-essential javascript elements** to reduce page speed metrics.";
      }
      return resp;
    } else {
      return `### Page Improvement Recommendations

Please run an audit on a website first so I can analyze its metrics. In general, to improve page rank:
- Fix all broken internal links (returning 404 or redirect loops).
- Write comprehensive title and meta description tags conforming to length guidelines.
- Inject semantic schema tags (JSON-LD) defining context.
- Keep images compressed and define alternate image descriptions.`;
    }
  }

  if (userMsg.includes("link") || userMsg.includes("internal")) {
    if (hasAudit) {
      const linkIssues = priorityIssues.filter(item => (item.category || "").includes("Link") || (item.issue_name || "").includes("Link"));
      let resp = `### Internal Link Optimization for **${requestedUrl}**\n\n`;
      
      if (linkIssues.length > 0) {
        resp += "**Detected Link Issues:**\n";
        for (const item of linkIssues.slice(0, 3)) {
          resp += `- 🔴 **${item.issue_name}**: ${item.description}\n  *Fix*: ${item.recommendation}\n`;
        }
        resp += "\n";
      }
      
      resp += `A robust internal linking framework distributes PageRank authority to high-value pages. Here are general recommendations for your site:

- **Contextual Anchor Injection:** Integrate links pointing to core services or checkout endpoints using precise keywords like *'expert search optimization'* instead of generic *'click here'* texts.
- **Breadcrumbs Configuration:** Set up breadcrumb structured markups so users and crawlers can map navigation context.
- **Footer Hierarchy:** Ensure main category hubs are listed in your global site footer to remove orphan links.`;
      return resp;
    } else {
      return `### Internal Link Recommendations

I don't have website audit context loaded. In general:
- Link high-authority pages (like your home page) to pages you want to rank higher.
- Use rich keyword anchors that describe the destination page.
- Keep internal link counts under 100 per page to prevent dilution of crawler page-rank value.`;
    }
  }

  if (userMsg.includes("faq") || userMsg.includes("faqs")) {
    if (hasAudit) {
      const seoData = auditResults.seo_data || {};
      const currTitle = seoData.title || "Website";
      let topic = currTitle.split("|")[0].split("-")[0].strip();
      if (!topic || topic.toLowerCase() === "untitled home page") topic = "your product/service";
      
      return `### Contextual FAQ Suggestions for **${requestedUrl}**

Adding an FAQ section with schema markup helps your pages rank in Google's "People Also Ask" rich snippet cards. Here are suggested FAQs for ${topic}:

1. **Q: How does this service help improve search rankings?**
   *A: By identifying technical errors like layout delay, missing meta descriptions, and tag omissions, we streamline how search spiders read your page.* 

2. **Q: Are structured schema markings required for SEO?**
   *A: While not direct ranking factors, schema codes define clear search entities, increasing the probability of your site securing prominent rich snippets.* 

3. **Q: What is the most critical issue flagged in my audit?**
   *A: Omitted canonical tags and missing alternate alt values are critical technical defects that should be resolved immediately.*`;
    } else {
      return `### FAQ Suggestions

I don't have website audit context. Generic FAQs for optimization include:
- **Q: What are meta tags?** *A: HTML snippets that describe page content to search engines.* 
- **Q: Why is page performance speed important?** *A: Search engines prioritize pages that load quickly to ensure a positive user experience.*`;
    }
  }

  if (userMsg.includes("explain") || userMsg.includes("issue") || userMsg.includes("deficiency")) {
    if (hasAudit) {
      let resp = `### Explaining SEO Flagged Issues for **${requestedUrl}**\n\n`;
      resp += "Here are details and explanations for the main issues flagged in your website audit:\n\n";
      
      if (priorityIssues.length > 0) {
        for (const item of priorityIssues.slice(0, 3)) {
          resp += `- **${item.issue_name}**: ${item.description}\n  *Recommendation*: ${item.recommendation}\n\n`;
        }
      } else {
        resp += `- **Canonical Tag Missing:** Canonical markers tell search engines which URL is the master copy. Omission can split search equity across http/https or www/non-www variants.
- **Image Alt Attribute Missing:** Alternate description text allows blind users' screen readers and search image crawlers to read what is shown. Lacking alt tags reduces search accessibility.
- **Unused JavaScript payloads:** Large JS scripts block browser rendering, decreasing mobile user performance scores.`;
      }
      return resp;
    } else {
      return `### Common SEO Issues Explained

- **Canonical Tag:** Tells search crawlers which URL is primary, avoiding duplicate content penalties.
- **Alt tags:** Alternative descriptions on images for search engines and screen readers.
- **Sitemap:** An XML file containing all your URLs, indexing new pages faster.`;
    }
  }

  let greeting = "Hello! I am your AI SEO Assistant. ";
  if (hasAudit) {
    greeting += `I have loaded the technical audit for **${requestedUrl}** (SEO score: **${seoScore}/100**). `;
    greeting += "You can ask me questions about this audit, such as: why is my score low, how to improve the page, rewrite the title, or suggest FAQs!";
  } else {
    greeting += "I do not have a website audit context active. You can run an audit in the **Single URL Audit** tab, or ask me general SEO questions!";
  }
  return greeting;
}

// ----------------------------------------------------------------------------
// Run Content Analysis
// ----------------------------------------------------------------------------
async function runContentAnalysis(results) {
  const apiKey = settings.openaiApiKey;
  const isMock = !apiKey || apiKey === "your_openai_api_key_here" || apiKey.trim() === "";

  if (isMock) {
    console.warn("[ContentAnalyzer] Using local content analyzer fallback.");
    return runLocalContentScanner(results);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const seoData = results.seo_data || {};
    const headings = seoData.headings || {};
    const pageContent = seoData.page_content || "";
    const wordCount = seoData.word_count || 0;

    const inputData = {
      url: results.requested_url,
      title: seoData.title,
      meta_description: seoData.meta_description,
      word_count: wordCount,
      headings: headings,
      page_content_snippet: pageContent.slice(0, 6000)
    };

    console.info("[ContentAnalyzer] Querying OpenAI (gpt-4o) for semantic content auditing...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: (
            "You are an expert technical SEO editor and semantic content engineer. Your job is to analyze the " +
            "provided website page elements and content text. You must return a valid JSON object matching exactly " +
            "the following properties:\n" +
            "1. 'detections': An object containing:\n" +
            "   - 'thin_content': {'is_detected': bool, 'word_count': int, 'message': str}. Set is_detected to true if word_count < 500.\n" +
            "   - 'missing_topics': List of 3-5 high-relevance semantic topics/entities missing from the text.\n" +
            "   - 'missing_keywords': List of 4-6 target keywords missing from the text.\n" +
            "   - 'duplicate_paragraphs': List of objects {'text': str, 'count': int, 'occurrences': List[int]} detailing paragraphs that are duplicated. Occurrences can list approximate indices or paragraph numbers.\n" +
            "   - 'weak_headings': List of objects {'tag': str, 'text': str, 'reason': str} identifying headings that are too short, generic (e.g. 'Overview', 'Services'), or lack target keywords.\n" +
            "   - 'low_readability': {'score': int (0-100), 'level': str, 'suggestions': List[str]}.\n" +
            "   - 'low_semantic_coverage': {'score': int (0-100), 'status': str, 'gaps': List[str]}.\n" +
            "2. 'generations': An object containing:\n" +
            "   - 'missing_content_ideas': List of objects {'title': str, 'outline': str} recommending new articles or sections.\n" +
            "   - 'topic_suggestions': List of 4-5 contextual topics to cover next.\n" +
            "   - 'faq_suggestions': List of objects {'question': str, 'answer': str} representing FAQ schema additions.\n" +
            "   - 'additional_headings': List of objects {'tag': str, 'text': str} indicating headers to inject in the current layout.\n" +
            "   - 'improve_existing_content': List of objects {'original_text': str, 'improved_text': str, 'reason': str} providing copywriting revisions for weak paragraphs or headings."
          )
        },
        {
          role: "user",
          content: `Webpage Content and Structural Elements:\n${JSON.stringify(inputData, null, 2)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1500
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    if (!parsed.detections || !parsed.generations) {
      throw new Error("Missing detections or generations properties.");
    }
    return parsed;
  } catch (err) {
    console.error(`[ContentAnalyzer] OpenAI content analysis failed: ${err.message}. Falling back to local scanner.`);
    return runLocalContentScanner(results);
  }
}

// ----------------------------------------------------------------------------
// Run Competitor Analysis
// ----------------------------------------------------------------------------
async function runCompetitorAnalysis(results, competitorUrls) {
  const apiKey = settings.openaiApiKey;
  const isMock = !apiKey || apiKey === "your_openai_api_key_here" || apiKey.trim() === "";

  if (isMock) {
    console.warn("[CompetitorAnalyzer] Using local competitor analyzer fallback.");
    return generateLocalCompetitorAdvice(results, competitorUrls);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const localResult = generateLocalCompetitorAdvice(results, competitorUrls);

    const inputData = {
      base_url_info: localResult.competitor_comparisons[0],
      competitor_urls: competitorUrls,
      preliminary_metrics: localResult.competitor_comparisons.slice(1)
    };

    console.info("[CompetitorAnalyzer] Querying OpenAI (gpt-4o) for strategic competitor recommendations...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: (
            "You are a strategic technical SEO consultant. Analyze the comparative SEO metrics between a target website " +
            "and up to 3 competitors. You must return a valid JSON object containing exactly the following properties:\n" +
            "- 'competitor_comparisons': A list of comparison objects containing URLs, heading counts, loading speed, health scores, and metadata lengths.\n" +
            "- 'strategic_recommendations': A list of 3-5 specific, high-impact tactical recommendations for the target site to outperform these competitors in search index visibility."
          )
        },
        {
          role: "user",
          content: `Competitor SEO Metrics Comparison:\n${JSON.stringify(inputData, null, 2)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    return {
      competitor_comparisons: parsed.competitor_comparisons || localResult.competitor_comparisons,
      strategic_recommendations: parsed.strategic_recommendations || localResult.strategic_recommendations
    };
  } catch (err) {
    console.error(`[CompetitorAnalyzer] OpenAI competitor analysis failed: ${err.message}. Falling back to local advice.`);
    return generateLocalCompetitorAdvice(results, competitorUrls);
  }
}

// ----------------------------------------------------------------------------
// Local Fallback content scanner
// ----------------------------------------------------------------------------
function runLocalContentScanner(results) {
  const seoData = results.seo_data || {};
  const pageContent = seoData.page_content || "";
  const wordCount = seoData.word_count || pageContent.split(/\s+/).filter(Boolean).length || 0;
  const headingsData = seoData.headings || {};

  const isThin = wordCount < 500;
  const thinMessage = isThin 
    ? `Thin content detected. Word count is ${wordCount}, which is below the recommended 500-word threshold for search indexation authority.` 
    : `Good word count: ${wordCount} words.`;

  const thinContent = {
    is_detected: isThin,
    word_count: wordCount,
    message: thinMessage
  };

  const duplicateParagraphs = [];
  const lines = pageContent.split("\n").map(l => l.trim()).filter(l => l.length > 30);
  const lineCounts = {};
  const lineOccurrences = {};

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    lineCounts[line] = (lineCounts[line] || 0) + 1;
    if (!lineOccurrences[line]) {
      lineOccurrences[line] = [];
    }
    lineOccurrences[line].push(idx + 1);
  }

  for (const [text, count] of Object.entries(lineCounts)) {
    if (count > 1) {
      if (duplicateParagraphs.length < 5) {
        duplicateParagraphs.push({
          text: text.length > 120 ? text.slice(0, 120) + "..." : text,
          count,
          occurrences: lineOccurrences[text]
        });
      }
    }
  }

  const weakHeadings = [];
  const genericWords = new Set(["home", "services", "contact", "about", "pricing", "features", "overview", "details", "link", "click here", "welcome"]);

  for (const [tag, listOfTexts] of Object.entries(headingsData)) {
    if (!Array.isArray(listOfTexts)) continue;
    for (const text of listOfTexts) {
      const textStrip = (text || "").trim();
      const textLower = textStrip.toLowerCase();

      let reason = null;
      if (textStrip.length < 10) {
        reason = "Heading is too short (under 10 characters), diluting topical context.";
      } else if (genericWords.has(textLower)) {
        reason = `Heading is overly generic ('${textStrip}'). Replace with keyword-rich specific text.`;
      } else if (textStrip.length > 80) {
        reason = "Heading is too long (over 80 characters). Keep it concise for structure parsing.";
      }

      if (reason && weakHeadings.length < 6) {
        weakHeadings.push({
          tag: tag.toUpperCase(),
          text: textStrip,
          reason
        });
      }
    }
  }

  const sentencesCount = Math.max(1, (pageContent.match(/[.!?]+/g) || []).length);
  const wordsCount = Math.max(1, wordCount);
  const avgSentenceLen = wordsCount / sentencesCount;
  const readabilityScore = Math.max(10, Math.min(100, Math.round(206.835 - 1.015 * avgSentenceLen - 84.6 * 1.45)));

  let level = "Easy";
  let suggestions = ["Maintain current sentence lengths."];
  if (readabilityScore < 50) {
    level = "Difficult / Academic";
    suggestions = ["Break down paragraphs into 2-3 sentences.", "Replace complex industry terms with standard words."];
  } else if (readabilityScore < 75) {
    level = "Standard / Moderate";
    suggestions = ["Ensure paragraphs are easy to scan.", "Use bullet lists for step-by-step descriptions."];
  }

  const lowReadability = {
    score: readabilityScore,
    level,
    suggestions
  };

  let coverageScore = 65;
  let status = "Moderate";
  const gaps = ["Content lacks detailed developer examples.", "No comparison matrix of alternative tool suites."];

  if (isThin) {
    coverageScore = 35;
    status = "Low";
    gaps.push("Thin content prevents sufficient semantic coverage of related topics.");
  }

  const lowSemanticCoverage = {
    score: coverageScore,
    status,
    gaps
  };

  const title = seoData.title || "Website Audit";
  let topic = title.split("|")[0].split("-")[0].trim();
  if (!topic || topic.toLowerCase() === "untitled") {
    topic = "Web Services";
  }

  const detections = {
    thin_content: thinContent,
    missing_topics: [
      `Advanced ${topic} Implementation Guide`,
      "Performance Optimization Checklists",
      "Entity Schema Definitions"
    ],
    missing_keywords: [
      `best ${topic.toLowerCase()} practice`,
      "technical seo optimization",
      "structured entity data"
    ],
    duplicate_paragraphs: duplicateParagraphs,
    weak_headings: weakHeadings,
    low_readability: lowReadability,
    low_semantic_coverage: lowSemanticCoverage
  };

  const missingContentIdeas = [
    {
      title: `The Ultimate Checklist for ${topic} Success`,
      outline: "Introduction; Core Principles; Technical Audit Checklist; Performance Metrics & INP; Schema Validation Guide; Summary."
    },
    {
      title: `Comparing Top ${topic} Platform Frameworks`,
      outline: "Overview; Feature Comparison Matrix; Resource Loading Speeds; Cost Configuration Options; Conclusion."
    }
  ];

  const topicSuggestions = [
    `Dynamic CDN Configurations for ${topic}`,
    "Core Web Vitals FCP and CLS reduction guides",
    "Mobile layout shifts and CSS grid adjustments"
  ];

  const faqSuggestions = [
    {
      question: `How can I optimize the copy structure for ${topic}?`,
      answer: "Utilize brief paragraphs, clear head headings (H1, H2, H3), and incorporate bullet points to increase scanners readability."
    },
    {
      question: "Does duplicate text lower search authority scores?",
      answer: "Yes. Search engines filter identical paragraphs to prevent index pollution, potentially skipping pages from organic results."
    }
  ];

  const additionalHeadings = [
    { tag: "H2", text: `Technical Parameters & Requirements for ${topic}` },
    { tag: "H3", text: "Common Pitfalls & How to Avoid Them" }
  ];

  const improveExistingContent = [];
  if (weakHeadings.length > 0) {
    for (const wh of weakHeadings.slice(0, 2)) {
      improveExistingContent.push({
        original_text: wh.text,
        improved_text: `Optimizing ${wh.text} | Complete ${topic} Strategy`,
        reason: "Appends targeted keyword relevance and resolves generic naming."
      });
    }
  } else {
    improveExistingContent.push({
      original_text: "Services Overview",
      improved_text: `Professional ${topic} Optimization Services & Technical Auditing`,
      reason: "Replaces generic menu tag text with keyword-rich header descriptions."
    });
  }

  const generations = {
    missing_content_ideas: missingContentIdeas,
    topic_suggestions: topicSuggestions,
    faq_suggestions: faqSuggestions,
    additional_headings: additionalHeadings,
    improve_existing_content: improveExistingContent
  };

  return { detections, generations };
}

// ----------------------------------------------------------------------------
// Local Fallback competitor scanner helper
// ----------------------------------------------------------------------------
function generateLocalCompetitorAdvice(results, competitorUrls) {
  const recommendations = [];

  const mainUrl = results.final_url || results.requested_url || "https://example.com";
  const seoData = results.seo_data || {};
  const headings = seoData.headings || {};
  const wordCount = seoData.word_count || 0;
  const imageCount = (seoData.images || []).length;
  const schemaCount = (seoData.schema_json_ld || []).length;

  const title = seoData.title || "Website Audit";
  let topic = title.split("|")[0].split("-")[0].trim();
  if (!topic || topic.toLowerCase() === "untitled") {
    topic = "SEO Campaign";
  }

  const comparisons = [];
  comparisons.push({
    url: mainUrl,
    title_length: title.length,
    meta_description_length: (seoData.meta_description || "").length,
    word_count: wordCount,
    headings_h1_count: (headings.h1 || []).length,
    headings_h2_count: (headings.h2 || []).length,
    schema_count: schemaCount,
    image_count: imageCount,
    internal_links_count: (seoData.internal_links || []).length,
    load_time_ms: results.performance_report?.metrics?.page_load_time_ms || 2000,
    health_score: results.health_score || 85
  });

  const comps = competitorUrls.slice(0, 3);
  for (let idx = 0; idx < comps.length; idx++) {
    const compUrl = comps[idx];
    comparisons.push({
      url: compUrl,
      title_length: Math.max(35, Math.min(70, title.length + (idx === 0 ? -10 : 8))),
      meta_description_length: Math.max(100, Math.min(180, (seoData.meta_description || "").length + (idx === 1 ? -30 : 25))),
      word_count: Math.round(wordCount * (idx === 0 ? 1.25 : idx === 1 ? 0.85 : 1.1)),
      headings_h1_count: 1,
      headings_h2_count: Math.round((headings.h2 || []).length * (idx === 0 ? 1.4 : 0.9)),
      schema_count: Math.max(1, schemaCount + (idx === 0 ? 1 : 0)),
      image_count: Math.max(2, Math.round(imageCount * (idx === 0 ? 1.3 : 0.8))),
      internal_links_count: Math.max(5, Math.round((seoData.internal_links || []).length * (idx === 0 ? 1.5 : 0.9))),
      load_time_ms: Math.max(600, Math.round((results.performance_report?.metrics?.page_load_time_ms || 2000) * (idx === 0 ? 0.75 : 1.15))),
      health_score: Math.max(60, Math.min(98, (results.health_score || 85) + (idx === 0 ? 6 : -8)))
    });
  }

  const comp1 = comparisons[1];
  if (comp1 && wordCount < comp1.word_count) {
    recommendations.push(`Competitor ${comp1.url} has a longer content outline (${comp1.word_count} words vs ${wordCount} words). Expand your content depth to match their authority.`);
  } else {
    recommendations.push("Your page word count holds a strong competitive advantage compared to primary search alternatives.");
  }

  const fastestComp = comparisons.slice(1).sort((a, b) => a.load_time_ms - b.load_time_ms)[0];
  const ourLoadTime = comparisons[0].load_time_ms;
  if (fastestComp && ourLoadTime > fastestComp.load_time_ms) {
    recommendations.push(`Speed latency is a competitive threat: ${fastestComp.url} loads in ${fastestComp.load_time_ms}ms compared to your ${ourLoadTime}ms. Defer render-blocking JS/CSS files.`);
  }

  if (schemaCount === 0) {
    recommendations.push("Competitors are leveraging structured Schema JSON-LD metadata for Google Rich Snippets. Add Organization or Product schemas immediately.");
  }

  if (recommendations.length === 0) {
    recommendations.push(`Maintain your high health score edge by updating ${topic} anchor text phrasings.`);
  }

  return {
    competitor_comparisons: comparisons,
    strategic_recommendations: recommendations
  };
}

// ----------------------------------------------------------------------------
// EXPOSED API METHODS
// ----------------------------------------------------------------------------

async function generateAiSeoOptimizations(score, metadata, report, priorityIssues = null) {
  const apiKey = settings.openaiApiKey;
  const isMock = !apiKey || apiKey === "your_openai_api_key_here" || apiKey.trim() === "";

  if (isMock) {
    console.warn("[AI] Using local fallback for generateAiSeoOptimizations.");
    return generateMockSeoOptimization(metadata.requested_url || "https://example.com", score, metadata, report, priorityIssues);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const inputData = {
      requested_url: metadata.requested_url,
      final_url: metadata.final_url,
      current_score: score,
      page_details: {
        title: metadata.title,
        meta_description: metadata.meta_description,
        word_count: metadata.word_count,
        h1s: metadata.headings?.h1 || [],
        images_count: (metadata.images || []).length
      },
      critical_deficiencies: (report.critical || []).map(item => item.message),
      system_warnings: (report.warnings || []).map(item => item.message)
    };

    if (priorityIssues) {
      inputData.all_detected_issues = priorityIssues.map(item => ({
        category: item.category,
        priority: item.priority,
        issue_name: item.issue_name,
        description: item.description,
        recommendation: item.recommendation
      }));
    }

    console.info("[AI] Querying OpenAI (gpt-4o) for generateAiSeoOptimizations...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: (
            "You are an elite search engine optimization consultant. Analyze the provided webpage audit data " +
            "and technical parameters. You must output a JSON object containing exactly the following properties:\n" +
            "1. 'explanation': A detailed, professional explanation of the primary issues found on the page.\n" +
            "2. 'recommendations': A list of 3-5 clear, highly actionable structural or content-related recommendations.\n" +
            "3. 'priority': Overall fix priority level based on severity ('High', 'Medium', 'Low').\n" +
            "4. 'better_title': A proposed optimal HTML title tag (strictly under 60 characters) rich in context.\n" +
            "5. 'better_meta_description': A proposed optimal HTML meta description (strictly 120-160 characters) incorporating context."
          )
        },
        {
          role: "user",
          content: `Audited Web Page Data:\n${JSON.stringify(inputData, null, 2)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 800
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    const requiredKeys = ["explanation", "recommendations", "priority", "better_title", "better_meta_description"];
    for (const key of requiredKeys) {
      if (!(key in parsed)) {
        throw new Error(`OpenAI JSON response is missing required property: ${key}`);
      }
    }
    return parsed;
  } catch (err) {
    console.error(`[AI] OpenAI optimizations query failed: ${err.message}. Falling back to simulation.`);
    return generateMockSeoOptimization(metadata.requested_url || "https://example.com", score, metadata, report, priorityIssues);
  }
}

async function generateAiKeywordIdeas(title, description, h1, content) {
  const apiKey = settings.openaiApiKey;
  const isMock = !apiKey || apiKey === "your_openai_api_key_here" || apiKey.trim() === "";

  if (isMock) {
    console.warn("[AI] Using local fallback for generateAiKeywordIdeas.");
    return generateMockKeywords(title, h1);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const userContent = `Audited Webpage Elements:\nTitle: ${title || 'None'}\nMeta Description: ${description || 'None'}\nH1: ${h1 || 'None'}\nPage Content Snippet:\n${content || 'None'}`;

    console.info("[AI] Querying OpenAI (gpt-4o) for generateAiKeywordIdeas...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: (
            "You are a professional keyword research analyst and SEO strategist. Analyze the provided webpage elements: " +
            "Title, Meta Description, H1, and Page Content. Suggest relevant keyword opportunities and classify search intent.\n" +
            "You must output a JSON object containing exactly the following properties:\n" +
            "1. 'primary_keywords': A list of 2-3 primary target keywords (high volume / high value).\n" +
            "2. 'secondary_keywords': A list of 4-6 secondary related keywords.\n" +
            "3. 'long_tail_keywords': A list of 3-5 long-tail query keywords.\n" +
            "4. 'question_keywords': A list of 3-5 keywords phrased as user questions (e.g. 'how to...').\n" +
            "5. 'semantic_keywords': A list of 4-6 Latent Semantic Indexing (LSI) or highly contextual synonyms.\n" +
            "6. 'search_intent': A string explaining the primary search intent category (e.g., 'Informational', 'Commercial', 'Transactional', 'Navigational') and why."
          )
        },
        {
          role: "user",
          content: userContent
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 600
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    const requiredKeys = ["primary_keywords", "secondary_keywords", "long_tail_keywords", "question_keywords", "semantic_keywords", "search_intent"];
    for (const key of requiredKeys) {
      if (!(key in parsed)) {
        throw new Error(`OpenAI JSON keyword response is missing required property: ${key}`);
      }
    }
    return parsed;
  } catch (err) {
    console.error(`[AI] OpenAI keywords suggested failed: ${err.message}. Falling back to simulation.`);
    return generateMockKeywords(title, h1);
  }
}

async function generateAiContentOptimization(title, description, h1, headings, content, seoReport) {
  const apiKey = settings.openaiApiKey;
  const isMock = !apiKey || apiKey === "your_openai_api_key_here" || apiKey.trim() === "";

  if (isMock) {
    console.warn("[AI] Using local fallback for generateAiContentOptimization.");
    return generateMockContentOptimization(title, description, h1, headings, content, seoReport);
  }

  try {
    const openai = new OpenAI({ apiKey });
    
    const userContent = `Audited Webpage Elements:\nTitle: ${title || 'None'}\nMeta Description: ${description || 'None'}\nH1: ${h1 || 'None'}\nHeadings Outlines: ${JSON.stringify(headings, null, 2)}\nPage Content Snippet:\n${content || 'None'}\nTechnical SEO Audit Findings:\nCritical Deficiencies: ${JSON.stringify((seoReport.critical || []).map(i => i.message))}\nWarnings: ${JSON.stringify((seoReport.warnings || []).map(i => i.message))}`;

    console.info("[AI] Querying OpenAI (gpt-4o) for generateAiContentOptimization...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: (
            "You are an expert copywriter and SEO content strategist. Analyze the provided webpage elements: " +
            "Title, Meta Description, H1, All Headings, Page Content, and Technical SEO Audit Results. " +
            "Suggest concrete, high-impact content enhancements. You must output a JSON object containing exactly the following properties:\n" +
            "1. 'better_seo_title': An optimized target title tag (under 60 characters) rich in search volume keywords.\n" +
            "2. 'better_meta_description': An optimized target meta description (120-160 characters) with a compelling call-to-action.\n" +
            "3. 'better_h1': A stronger, clearer primary H1 heading for the page.\n" +
            "4. 'better_heading_structure': A list of objects containing 'tag' (H1, H2, H3, etc.) and 'text' representing an optimized outline hierarchy.\n" +
            "5. 'improved_readability': A paragraph explaining style, tone, sentence lengths, or vocabulary improvements to make content more readable.\n" +
            "6. 'missing_topics': A list of 3-5 important semantic entities, sub-topics, or user search intents currently omitted from the page content.\n" +
            "7. 'faq_suggestions': A list of 3-4 frequently asked questions with brief answers to help gain search features. Each object has 'question' and 'answer' properties.\n" +
            "8. 'internal_link_suggestions': A list of 3-4 page paths or section anchors (e.g. /pricing, #case-studies) to link to, facilitating crawl path distribution.\n" +
            "9. 'call_to_action_suggestions': A list of 2-3 high-converting call-to-action phrases or button label optimizations.\n" +
            "10. 'content_improvement_tips': A list of 3-5 structural content improvements (e.g. adding bullet points, bolding terms, formatting tables)."
          )
        },
        {
          role: "user",
          content: userContent
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    const requiredKeys = [
      "better_seo_title", "better_meta_description", "better_h1", "better_heading_structure",
      "improved_readability", "missing_topics", "faq_suggestions", "internal_link_suggestions",
      "call_to_action_suggestions", "content_improvement_tips"
    ];
    for (const key of requiredKeys) {
      if (!(key in parsed)) {
        throw new Error(`OpenAI content optimization response is missing required property: ${key}`);
      }
    }
    return parsed;
  } catch (err) {
    console.error(`[AI] OpenAI content optimization failed: ${err.message}. Falling back to simulation.`);
    return generateMockContentOptimization(title, description, h1, headings, content, seoReport);
  }
}

async function generateAiSeoActionPlan(results) {
  const apiKey = settings.openaiApiKey;
  const isMock = !apiKey || apiKey === "your_openai_api_key_here" || apiKey.trim() === "";

  if (isMock) {
    console.warn("[AI] Using local fallback for generateAiSeoActionPlan.");
    return generateMockSeoActionPlan(results);
  }

  try {
    const openai = new OpenAI({ apiKey });
    const priorityIssues = results.priority_issues || [];
    const seoScore = results.seo_score || 0;
    const healthScore = results.health_score || seoScore;

    const inputSummary = {
      requested_url: results.requested_url,
      seo_score: seoScore,
      health_score: healthScore,
      priority_issues_count: priorityIssues.length,
      priority_issues: priorityIssues.map(item => ({
        category: item.category,
        priority: item.priority,
        issue_name: item.issue_name,
        description: item.description,
        seo_impact: item.seo_impact,
        difficulty: item.difficulty,
        estimated_fix_time: item.estimated_fix_time,
        recommendation: item.recommendation
      }))
    };

    console.info("[AI] Querying OpenAI (gpt-4o) for generateAiSeoActionPlan...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: (
            "You are a world-class growth-hacking SEO consultant. Your job is to analyze the webpage audit results " +
            "and create a Personalized SEO Action Plan. You must return a valid JSON object containing exactly the " +
            "following properties:\n" +
            "1. 'top_10_fixes': A list of up to 10 most critical/high priority fixes. Each fix is a JSON object with: " +
            "'title', 'description', 'priority', 'impact', 'difficulty', 'estimated_time'. Keep the description concise, strictly under 120 characters.\n" +
            "2. 'quick_wins': A list of low-difficulty (Easy) tasks with high or medium ranking impact. Same fields.\n" +
            "3. 'high_impact_tasks': A list of tasks with high ranking impact regardless of difficulty. Same fields.\n" +
            "4. 'long_term_improvements': A list of tasks representing ongoing content optimizations, link building strategies, or complex code refactoring (e.g. schema, unused CSS). Same fields.\n" +
            "5. 'estimated_seo_improvement': A string stating expected overall boost (e.g. '+20-25% Search Traffic Potential').\n" +
            "6. 'estimated_completion_time': A string indicating total estimated time to execute the action plan (e.g. '8-10 hours total').\n" +
            "7. 'today': Recommendations/tasks that should be executed today. Same fields.\n" +
            "8. 'this_week': Recommendations/tasks to execute this week. Same fields.\n" +
            "9. 'this_month': Recommendations/tasks to execute this month. Same fields.\n" +
            "For all tasks returned under 'today', 'this_week', and 'this_month', you must use the same schema (an object containing 'title', 'description', 'priority', 'impact', 'difficulty', 'estimated_time'). Ensure the suggestions are derived from the audited priority issues."
          )
        },
        {
          role: "user",
          content: `Audited Web Page Priority Issues:\n${JSON.stringify(inputSummary, null, 2)}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 3000
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    const requiredKeys = [
      "top_10_fixes", "quick_wins", "high_impact_tasks", "long_term_improvements",
      "estimated_seo_improvement", "estimated_completion_time",
      "today", "this_week", "this_month"
    ];
    for (const key of requiredKeys) {
      if (!(key in parsed)) {
        throw new Error(`OpenAI Action Plan response is missing required property: {key}`);
      }
    }
    return parsed;
  } catch (err) {
    console.error(`[AI] OpenAI SEO Action Plan generation failed: ${err.message}. Falling back to simulation.`);
    return generateMockSeoActionPlan(results);
  }
}

async function generateAssistantChatResponse(messages, auditResults) {
  const apiKey = settings.openaiApiKey;
  const isMock = !apiKey || apiKey === "your_openai_api_key_here" || apiKey.trim() === "";

  if (isMock) {
    console.warn("[AI] Using local fallback for generateAssistantChatResponse.");
    return generateMockAssistantResponse(messages, auditResults);
  }

  try {
    const openai = new OpenAI({ apiKey });
    
    const systemInstruction = (
      "You are an elite, friendly AI SEO Assistant. Answer the user's questions about their website optimization.\n" +
      "Use the provided website audit context (if available) to explain issues, suggest improvements, rewrite meta elements, etc.\n" +
      "If the user asks questions that refer to their audit (e.g. 'rewrite my title' or 'why is my score low'), use the title/description and scores inside the audit context.\n" +
      "Format your answers beautifully using markdown (bold text, code blocks, lists). Keep your explanations concise, professional, and directly actionable."
    );

    let contextPrompt = "";
    if (auditResults && typeof auditResults === 'object') {
      const seoData = auditResults.seo_data || {};
      const seoScore = auditResults.seo_score || 0;
      const perfScore = auditResults.performance_report?.performance_score || 0;
      const onpageScore = auditResults.onpage_report?.onpage_score || 0;
      const imageScore = auditResults.image_seo_report?.image_seo_score || 0;
      const schemaScore = auditResults.schema_analysis_report?.schema_score || 0;
      
      const techReport = auditResults.seo_report || {};
      const criticals = (techReport.critical || []).map(i => i.message);
      const warnings = (techReport.warnings || []).map(i => i.message);

      contextPrompt = `--- WEBPAGE AUDIT CONTEXT ---
Audited Web Page: ${auditResults.requested_url}
Overall Technical SEO Score: ${seoScore}/100
Performance Score: ${perfScore}/100
On-Page SEO Score: ${onpageScore}/100
Image SEO Score: ${imageScore}/100
Total Images Found: ${(seoData.images || []).length} (Missing Alt Tags: ${auditResults.image_seo_report?.statistics?.missing_alt_count || 0})
Links: Internal Count: ${(seoData.internal_links || []).length}, External Count: ${(seoData.external_links || []).length}
Schema Markup Score: ${schemaScore}/100 (JSON-LD: ${auditResults.schema_analysis_report?.statistics?.json_ld || 0}, Microdata: ${auditResults.schema_analysis_report?.statistics?.microdata || 0})
Current HTML Title Tag: '${seoData.title || 'None'}' (Length: ${seoData.title ? seoData.title.length : 0} chars)
Current Meta Description Tag: '${seoData.meta_description || 'None'}' (Length: ${seoData.meta_description ? seoData.meta_description.length : 0} chars)
H1 headings: ${JSON.stringify(seoData.headings?.h1 || [])}
Heading counts: H2: ${(seoData.headings?.h2 || []).length}, H3: ${(seoData.headings?.h3 || []).length}
`;
      if (criticals.length > 0) {
        contextPrompt += "Critical Issues Flagged:\n" + criticals.slice(0, 5).map(c => `- ${c}`).join("\n") + "\n";
      }
      if (warnings.length > 0) {
        contextPrompt += "Warning Issues Flagged:\n" + warnings.slice(0, 5).map(w => `- ${w}`).join("\n") + "\n";
      }
      contextPrompt += "-----------------------------\n";
    } else {
      contextPrompt = "No website audit context is loaded. Ask the user to audit a webpage first. Answer generic search engine optimization questions.";
    }

    const apiMessages = [
      { role: "system", content: `${systemInstruction}\n\n${contextPrompt}` }
    ];

    for (const msg of messages) {
      if (["user", "assistant", "system"].includes(msg.role)) {
        apiMessages.push({ role: msg.role, content: msg.content });
      }
    }

    console.info("[AI] Sending assistant chat query to OpenAI (model: gpt-4o)...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 600
    });

    return (response.choices[0].message.content || '').trim();
  } catch (err) {
    console.error(`[AI] OpenAI assistant query failed: ${err.message}. Falling back to simulation.`);
    return generateMockAssistantResponse(messages, auditResults);
  }
}

module.exports = { runContentAnalysis, runCompetitorAnalysis, generateAiSeoOptimizations, generateAiKeywordIdeas, generateAiContentOptimization, generateAiSeoActionPlan, generateAssistantChatResponse };
