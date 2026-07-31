const express = require("express");
const router = express.Router();
const AutoContent = require("../models/AutoContent");
const ContentStats = require("../models/ContentStats");
const ContentSettings = require("../models/ContentSettings");
const cronScheduler = require("../services/cronScheduler");

// Helper to sanitize clean site name
function getCleanSiteName(domain) {
  if (!domain) return "your site";
  const clean = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  return clean.split(".")[0];
}

// ----------------------------------------------------
// 1. AUTOMATED CONTENT QUEUE, SETTINGS & STATS ENDPOINTS
// ----------------------------------------------------

// GET /api/content/settings
router.get("/settings", async (req, res) => {
  const domain = (req.query.domain || "nxtcall.app").toLowerCase();
  try {
    let settings = await ContentSettings.findOne({ domain });
    if (!settings) {
      settings = await ContentSettings.create({
        domain,
        wordCountLimit: 1000,
        targetKeywords: [],
        preferredTone: "Authoritative",
        dailyQuota: 10,
        autoFillRemaining: true,
      });
    }
    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/content/settings
router.post("/settings", async (req, res) => {
  const { domain = "nxtcall.app", company, email, phone, address, wordCountLimit, targetKeywords, preferredTone, dailyQuota, autoFillRemaining } = req.body;
  const cleanDomain = domain.toLowerCase();

  try {
    const settings = await ContentSettings.findOneAndUpdate(
      { domain: cleanDomain },
      {
        company: company || "",
        email: email || "",
        phone: phone || "",
        address: address || "",
        wordCountLimit: wordCountLimit || 1000,
        targetKeywords: Array.isArray(targetKeywords) ? targetKeywords : [],
        preferredTone: preferredTone || "Authoritative",
        dailyQuota: dailyQuota || 10,
        autoFillRemaining: autoFillRemaining !== undefined ? autoFillRemaining : true,
      },
      { upsert: true, new: true }
    );
    return res.json({ success: true, message: "Settings updated successfully!", settings });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/content/auto-queue/add-manual (Manually add item created in Content Generator)
router.post("/auto-queue/add-manual", async (req, res) => {
  const { domain = "nxtcall.app", title, summary, body, keywords, website, company, email, phone, address } = req.body;
  const cleanDomain = domain.toLowerCase();

  if (!title || !body) {
    return res.status(400).json({ error: "Title and Body are required." });
  }

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingTotalCount = await AutoContent.countDocuments({
      domain: cleanDomain,
      createdAt: { $gte: startOfDay },
    });

    if (existingTotalCount >= 10) {
      return res.status(400).json({ error: "Daily limit of 10 articles (manual + automated) reached for this domain." });
    }

    const userSettings = await ContentSettings.findOne({ domain: cleanDomain });
    const cleanDomainName = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
    const capitalizedSiteName = cleanDomainName.split(".")[0].toUpperCase();

    const companyName = company || userSettings?.company || `${capitalizedSiteName} Inc.`;
    const companyEmail = email || userSettings?.email || `contact@${cleanDomainName}`;
    const companyPhone = phone || userSettings?.phone || "";
    const companyAddress = address || userSettings?.address || "";

    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const newItem = new AutoContent({
      domain: cleanDomain,
      title: title.trim(),
      summary: summary || title,
      body: body,
      keywords: keywords || "",
      website: website || `https://${cleanDomain}/`,
      company: companyName,
      email: companyEmail,
      phone: companyPhone,
      address: companyAddress,
      status: "scheduled",
      isAutomated: false,
      scheduledForSubmissionAt: threeDaysLater,
      createdAt: now,
    });

    const saved = await newItem.save();
    await ContentStats.findOneAndUpdate(
      { domain: cleanDomain },
      { $inc: { totalGeneratedCount: 1 } },
      { upsert: true }
    );

    return res.json({
      success: true,
      message: "Article added to 3-day queue! Remaining daily quota updated.",
      item: saved,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/content/library
router.get("/library", async (req, res) => {
  const domain = (req.query.domain || "nxtcall.app").toLowerCase();

  try {
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const items = await AutoContent.find({
      domain,
      createdAt: { $gte: sixtyDaysAgo }
    }).sort({ createdAt: -1 });

    const now = Date.now();
    const formatted = items.map((item) => {
      const doc = item.toObject();
      const schedTime = new Date(doc.scheduledForSubmissionAt).getTime();
      const msRemaining = Math.max(0, schedTime - now);
      const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
      const minsRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

      return {
        ...doc,
        hoursRemaining,
        minsRemaining,
        isEditable: doc.status === "scheduled" && msRemaining > 0,
      };
    });

    return res.json({ success: true, items: formatted });
  } catch (err) {
    console.error("Error fetching library content:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/content/auto-queue
router.get("/auto-queue", async (req, res) => {
  const domain = (req.query.domain || "nxtcall.app").toLowerCase();

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const items = await AutoContent.find({
      domain,
      createdAt: { $gte: startOfDay }
    }).sort({ createdAt: -1 });
    const now = Date.now();

    const formatted = items.map((item) => {
      const doc = item.toObject();
      const schedTime = new Date(doc.scheduledForSubmissionAt).getTime();
      const msRemaining = Math.max(0, schedTime - now);
      const hoursRemaining = Math.floor(msRemaining / (1000 * 60 * 60));
      const minsRemaining = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));

      return {
        ...doc,
        hoursRemaining,
        minsRemaining,
        isEditable: doc.status === "scheduled" && msRemaining > 0,
      };
    });

    return res.json({ success: true, items: formatted });
  } catch (err) {
    console.error("Error fetching auto-queue:", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/content/auto-stats
router.get("/auto-stats", async (req, res) => {
  const domain = (req.query.domain || "nxtcall.app").toLowerCase();

  try {
    let stats = await ContentStats.findOne({ domain });
    if (!stats) {
      stats = await ContentStats.create({
        domain,
        totalGeneratedCount: 0,
        totalSubmittedCount: 0,
        totalWipedCount: 0,
      });
    }

    const scheduledCount = await AutoContent.countDocuments({ domain, status: "scheduled" });
    const activeSubmittedCount = await AutoContent.countDocuments({ domain, status: "submitted" });

    return res.json({
      success: true,
      domain,
      stats: {
        totalGeneratedCount: stats.totalGeneratedCount,
        totalSubmittedCount: stats.totalSubmittedCount,
        totalWipedCount: stats.totalWipedCount,
        currentScheduledInQueue: scheduledCount,
        activeSubmittedInQueue: activeSubmittedCount,
      },
    });
  } catch (err) {
    console.error("Error fetching auto-stats:", err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/content/auto-queue/generate-batch
router.post("/auto-queue/generate-batch", async (req, res) => {
  const { domain = "nxtcall.app", count } = req.body;

  try {
    const items = await cronScheduler.generateDailyContentBatch(domain, count !== undefined ? Number(count) : null);
    return res.json({
      success: true,
      message: `Successfully generated ${items.length} articles scheduled for backlink submission after 3 days.`,
      items,
    });
  } catch (err) {
    console.error("Error triggering batch generation:", err);
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/content/auto-queue/:id (User edits content before 3-day window)
router.put("/auto-queue/:id", async (req, res) => {
  const { id } = req.params;
  const { title, summary, body, keywords } = req.body;

  try {
    const item = await AutoContent.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Article not found in queue" });
    }

    if (item.status !== "scheduled") {
      return res.status(400).json({ error: "Cannot edit article after submission" });
    }

    if (title) item.title = title;
    if (summary) item.summary = summary;
    if (body) item.body = body;
    if (keywords) item.keywords = keywords;

    await item.save();
    return res.json({ success: true, message: "Article updated successfully!", item });
  } catch (err) {
    console.error("Error updating queue item:", err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/content/auto-queue/:id/submit-now (Manual override trigger)
router.post("/auto-queue/:id/submit-now", async (req, res) => {
  const { id } = req.params;

  try {
    const item = await AutoContent.findById(id);
    if (!item) {
      return res.status(404).json({ error: "Article not found" });
    }

    await cronScheduler.submitArticleToBacklinkEngine(item);
    return res.json({
      success: item.status === "submitted",
      message: item.status === "submitted" ? "Article submitted successfully!" : `Submission failed: ${item.submissionError}`,
      item,
    });
  } catch (err) {
    console.error("Error submitting queue item now:", err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/content/auto-queue/:id
router.delete("/auto-queue/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await AutoContent.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Article not found" });
    }
    return res.json({ success: true, message: "Article removed from queue." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 2. EXISTING CONTENT GENERATION ENDPOINTS
// ----------------------------------------------------

// POST /api/content/generate-blog
router.post("/generate-blog", async (req, res) => {
  const { topic, primaryKeyword, targetAudience, tone = "Authoritative", wordCountGoal = 1000, domain = "example.com" } = req.body;

  if (!topic && !primaryKeyword) {
    return res.status(400).json({ error: "Topic or primaryKeyword is required" });
  }

  const siteName = getCleanSiteName(domain);
  const targetTopic = topic || primaryKeyword;
  const kw = primaryKeyword || topic;

  try {
    const { OpenAI } = require("openai");
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey !== "your_openai_api_key_here") {
      const openai = new OpenAI({ apiKey });
      const prompt = `
You are an expert SEO copywriter and content strategist for ${siteName} (${domain}).
Generate a complete, high-converting, SEO-optimized blog article.

Parameters:
- Topic/Title Focus: "${targetTopic}"
- Target Primary Keyword: "${kw}"
- Audience: "${targetAudience || 'Digital Marketers and Web Professionals'}"
- Writing Tone: "${tone}"
- Target Word Count Goal: ~${wordCountGoal} words

Output MUST be a JSON object with this exact structure:
{
  "title": "<Catchy, click-worthy SEO Title under 60 chars>",
  "slug": "<url-friendly-slug>",
  "metaDescription": "<140-160 char meta description with CTA>",
  "estimatedReadingTime": "<e.g. 5 min read>",
  "wordCount": <number>,
  "outline": [
    { "level": "H2", "text": "<heading text>" },
    { "level": "H3", "text": "<sub-heading text>" }
  ],
  "contentHtml": "<HTML formatted article body with <h2>, <h3>, <p>, <ul>, <li>, and <strong> tags>",
  "contentMarkdown": "<Markdown formatted article body>",
  "keyTakeaways": ["<takeaway 1>", "<takeaway 2>", "<takeaway 3>"],
  "faqSchema": [
    { "question": "<Q1>", "answer": "<A1>" },
    { "question": "<Q2>", "answer": "<A2>" }
  ]
}
`;
      const aiRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const parsed = JSON.parse(aiRes.choices[0].message.content);
      return res.json({ success: true, ...parsed });
    }
  } catch (err) {
    console.error("OpenAI blog generation error, using smart template fallback:", err.message);
  }

  // Fallback / Mock Generator
  const formattedSlug = targetTopic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const fallbackTitle = `How ${targetTopic} Transforms Digital Visibility in 2026: Complete Guide`;
  const fallbackMeta = `Discover how ${targetTopic} and ${kw} boost domain authority, user engagement, and organic search citations on ${domain}. Read our complete guide.`;

  const fallbackHtml = `
<h2>Understanding ${targetTopic} in Modern Search Engine Optimization</h2>
<p>In today's evolving AI-driven search landscape, mastering <strong>${kw}</strong> is essential for driving qualified organic traffic to <em>${domain}</em>. Businesses that optimize content for conversational intent and generative search engines see up to <strong>3.5x higher citation rates</strong> compared to legacy keyword stuffing.</p>

<h2>Key Benefits of Integrating ${kw}</h2>
<p>Implementing a structured approach to <strong>${targetTopic}</strong> delivers distinct advantages across search engine algorithms and user engagement metrics:</p>
<ul>
  <li><strong>Enhanced Search Relevance:</strong> Directly satisfies informational user intent with clear, structured answers.</li>
  <li><strong>Higher CTR & Snippets:</strong> Formatted headings and bullet points qualify for Google AI Overviews and Perplexity summaries.</li>
  <li><strong>Accelerated Conversions:</strong> Authoritative copywriting builds immediate trust with target visitors.</li>
</ul>

<h2>Step-by-Step Execution Blueprint</h2>
<p>To maximize search visibility, follow these core content execution principles:</p>
<ol>
  <li><strong>Define Primary Intent:</strong> Identify whether searchers require direct transactional pricing or informational answers.</li>
  <li><strong>Structure Headings:</strong> Deploy clean H2 and H3 tags with semantic sub-keywords.</li>
  <li><strong>Add Quantifiable Data:</strong> Infuse numerical statistics, tables, and verifiable performance metrics.</li>
</ol>

<h2>Conclusion & Actionable Next Steps</h2>
<p>Integrating robust <strong>${targetTopic}</strong> strategies positions <em>${siteName}</em> as an industry authority across traditional search engines and AI engines alike.</p>
  `.trim();

  const fallbackMarkdown = `
## Understanding ${targetTopic} in Modern Search Engine Optimization

In today's evolving AI-driven search landscape, mastering **${kw}** is essential for driving qualified organic traffic to *${domain}*. Businesses that optimize content for conversational intent and generative search engines see up to **3.5x higher citation rates**.

## Key Benefits of Integrating ${kw}
- **Enhanced Search Relevance:** Directly satisfies informational user intent with clear answers.
- **Higher CTR & Snippets:** Formatted headings qualify for Google AI Overviews.
- **Accelerated Conversions:** Authoritative copywriting builds immediate trust.

## Step-by-Step Execution Blueprint
1. **Define Primary Intent:** Identify whether searchers require direct pricing or informational answers.
2. **Structure Headings:** Deploy clean H2 and H3 tags with semantic sub-keywords.
3. **Add Quantifiable Data:** Infuse numerical statistics, tables, and metrics.
  `.trim();

  return res.json({
    success: true,
    title: fallbackTitle,
    slug: formattedSlug,
    metaDescription: fallbackMeta,
    estimatedReadingTime: "4 min read",
    wordCount: 850,
    outline: [
      { level: "H2", text: `Understanding ${targetTopic} in Modern Search` },
      { level: "H2", text: `Key Benefits of Integrating ${kw}` },
      { level: "H2", text: "Step-by-Step Execution Blueprint" },
      { level: "H2", text: "Conclusion & Actionable Next Steps" }
    ],
    contentHtml: fallbackHtml,
    contentMarkdown: fallbackMarkdown,
    keyTakeaways: [
      `Mastering ${kw} increases search citations across Google & AI engines.`,
      `Structured H2/H3 headings and lists improve readability scores for LLM tokenizers.`,
      `Adding verified data tables boosts E-E-A-T trust signals by up to 40%.`
    ],
    faqSchema: [
      {
        question: `Why is ${kw} important for ${siteName}?`,
        answer: `${kw} establishes topic authority and satisfies user intent for ${domain}.`
      },
      {
        question: `How quickly can I see results from implementing ${targetTopic}?`,
        answer: "Most sites observe improved AI citation frequency and crawling within 2 to 4 weeks."
      }
    ]
  });
});

// POST /api/content/generate-ideas
router.post("/generate-ideas", async (req, res) => {
  const { domain = "example.com", niche = "Digital Marketing" } = req.body;
  const siteName = getCleanSiteName(domain);

  const ideas = [
    {
      id: 1,
      title: `The Ultimate Guide to AI Search Optimization for ${siteName} in 2026`,
      keyword: "ai search engine optimization",
      intent: "Informational",
      volume: 4200,
      difficulty: "Medium",
      estimatedTraffic: "1.8K/mo"
    },
    {
      id: 2,
      title: `Top 10 Growth Hacks to Boost Local Search & Maps Visibility`,
      keyword: "local search rank tracking",
      intent: "Commercial",
      volume: 2800,
      difficulty: "Low",
      estimatedTraffic: "1.2K/mo"
    },
    {
      id: 3,
      title: `How ${siteName} Automates On-Page SEO Audits & Schema Markup`,
      keyword: "automated on page seo audit",
      intent: "Transactional",
      volume: 1900,
      difficulty: "Low",
      estimatedTraffic: "950/mo"
    },
    {
      id: 4,
      title: `Generative Engine Optimization (GEO): Strategies for ChatGPT & Perplexity Citations`,
      keyword: "generative engine optimization geo",
      intent: "Informational",
      volume: 5600,
      difficulty: "Hard",
      estimatedTraffic: "2.4K/mo"
    }
  ];

  return res.json({ success: true, ideas });
});

// POST /api/content/rewrite-section
router.post("/rewrite-section", async (req, res) => {
  const { textToRewrite, targetTone = "Authoritative" } = req.body;

  if (!textToRewrite) {
    return res.status(400).json({ error: "textToRewrite is required" });
  }

  try {
    const { OpenAI } = require("openai");
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey !== "your_openai_api_key_here") {
      const openai = new OpenAI({ apiKey });
      const prompt = `Rewrite the following text snippet for maximum SEO impact, conversational fluency, and clear formatting. Target tone: ${targetTone}.\nText: "${textToRewrite}"\nReturn JSON: { "rewrittenText": "<improved text>" }`;
      
      const aiRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });
      const parsed = JSON.parse(aiRes.choices[0].message.content);
      return res.json({ success: true, rewrittenText: parsed.rewrittenText });
    }
  } catch (e) {}

  // Fallback
  const fallback = `<p><strong>Optimized Summary:</strong> ${textToRewrite.trim().replace(/\.$/, "")} by utilizing structured data headings, verified statistical data, and direct conversational answers for maximum search engine indexability.</p>`;
  return res.json({ success: true, rewrittenText: fallback });
});

module.exports = router;
