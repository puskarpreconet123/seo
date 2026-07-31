async function generateAiArticleContent({
  domain = "example.com",
  topic,
  primaryKeyword,
  targetAudience = "Target Audience and Industry Professionals",
  tone = "Authoritative",
  wordCountGoal = 1000,
  company = "",
  email = "",
  phone = "",
  address = "",
}) {
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  const capitalizedSiteName = cleanDomain.split(".")[0].toUpperCase();

  const companyName = company || `${capitalizedSiteName} Inc.`;
  const companyEmail = email || `contact@${cleanDomain}`;
  const companyPhone = phone || "";
  const companyAddress = address || "";

  const targetTopic = topic || primaryKeyword || "Search Engine Growth";
  const kw = primaryKeyword || topic || "organic search optimization";

  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey !== "your_openai_api_key_here") {
    try {
      const { OpenAI } = require("openai");
      const openai = new OpenAI({ apiKey });
      const prompt = `
You are an expert AI SEO copywriter and content strategist for ${companyName} (${domain}).
Generate a complete, high-converting, publication-ready SEO blog article.

Parameters:
- Topic/Title Focus: "${targetTopic}"
- Target Primary Keyword: "${kw}"
- Company Name: "${companyName}"
- Contact Email: "${companyEmail}"
- Contact Phone: "${companyPhone}"
- Business Address: "${companyAddress}"
- Writing Tone: "${tone}"
- Target Word Count Goal: ~${wordCountGoal} words

CRITICAL WRITING RULES TO HIT THE WORD COUNT GOAL:
1. To satisfy the target word count goal of ~${wordCountGoal} words, you MUST write an exhaustive, deep-dive article.
2. Structure the article with a minimum of 4 to 6 detailed sections using <h2> and <h3> tags.
3. For each section, write at least 2 to 3 substantial paragraphs of 100-150 words each, complete with industry-specific context, concrete examples, and actionable advice.
4. Do NOT write a brief overview or summary. Expand thoroughly on every concept to ensure the total body text length is close to the requested ${wordCountGoal} words.

Output MUST be a JSON object with this exact structure:
{
  "title": "<Catchy, click-worthy SEO Title under 60 chars>",
  "slug": "<url-friendly-slug>",
  "metaDescription": "<140-160 char meta description>",
  "wordCount": ${wordCountGoal},
  "contentHtml": "<HTML formatted article body with <h2>, <h3>, <p>, <ul>, <li>, and <strong> tags>",
  "contentMarkdown": "<Markdown formatted article body>",
  "keywords": "${kw}"
}
`;
      const aiRes = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(aiRes.choices[0].message.content);
      if (parsed.title && parsed.contentHtml) {
        return {
          title: parsed.title,
          summary: parsed.metaDescription || `Discover how ${companyName} uses ${kw} to drive qualified search traffic and maximize performance.`,
          body: parsed.contentHtml,
          markdown: parsed.contentMarkdown || "",
          keywords: parsed.keywords || kw,
        };
      }
    } catch (err) {
      console.warn("[AiContentGenerator] OpenAI API call failed, using intelligent AI template generator:", err.message);
    }
  }

  // Intelligent AI Generation Engine (Fallback & Native mode)
  const locationPrefix = companyAddress ? `<strong>${companyAddress}</strong> – ` : "";

  const title = targetTopic.toLowerCase().startsWith("how") ? targetTopic : `How ${targetTopic} Drives High-Converting Organic Traffic for ${companyName}`;
  const summary = `Discover how ${companyName} (${domain}) leverages ${kw} to drive qualified search traffic, automate workflows, and maximize performance (~${wordCountGoal} words).`;
  
  const contentHtml = `
${locationPrefix}In today's fast-evolving search landscape, mastering <strong>${kw}</strong> is vital for expanding organic reach and establishing market authority for <em>${companyName}</em> (${domain}).

<h2>1. Strategic Importance of ${targetTopic}</h2>
<p>Modern generative search engines and recommendation platforms prioritize structured, authoritative content that directly answers customer intent. By integrating <strong>${kw}</strong>, businesses build sustainable search visibility while engaging target buyers across multi-channel touchpoints.</p>

<h2>2. Key Benefits & Competitive Advantages</h2>
<p>Adopting an advanced approach to <strong>${targetTopic}</strong> delivers measurable impact across key business metrics:</p>
<ul>
  <li><strong>Accelerated Organic Rankings:</strong> Content structured for search algorithms achieves top-page citation rates.</li>
  <li><strong>Enhanced Customer Trust:</strong> Clear, authoritative insights position <strong>${companyName}</strong> as an industry leader.</li>
  <li><strong>Automated Conversions:</strong> High-intent landing page copy converts casual readers into qualified leads.</li>
</ul>

<h2>3. Implementing Best Practices for ${companyName}</h2>
<p>To maximize return on investment, ${companyName} combines data-driven keyword research with responsive workflows. For more details or direct inquiries, contact our team at <strong>${companyEmail}</strong>${companyPhone ? ` or call <strong>${companyPhone}</strong>` : ''}.</p>
  `.trim();

  return {
    title,
    summary,
    body: contentHtml,
    markdown: `## Strategic Importance of ${targetTopic}\n\nIn today's fast-evolving search landscape...`,
    keywords: kw,
  };
}

module.exports = {
  generateAiArticleContent,
};
