const AutoContent = require("../models/AutoContent");
const ContentStats = require("../models/ContentStats");
const SEORecord = require("../models/SEORecord");
const ContentSettings = require("../models/ContentSettings");
const { generateAiArticleContent } = require("./aiContentGenerator");

let schedulerTimer = null;
let failedSchedulerTimer = null;
const RANKGENI_SUBMIT_API = "https://rankgeni-backlink.onrender.com/api/submissions";

// Helper to increment stats counter
async function incrementStat(domain, fieldName, amount = 1) {
  try {
    await ContentStats.findOneAndUpdate(
      { domain: domain.toLowerCase() },
      { $inc: { [fieldName]: amount } },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error(`[CronScheduler] Error incrementing stat ${fieldName} for ${domain}:`, err.message);
  }
}

// 1. Generate Batch of Articles (Using LLM AI Content Generator)
async function generateDailyContentBatch(targetDomain, requestedCount = null) {
  const domain = (targetDomain || "nxtcall.app").toLowerCase();

  // Load User Content Settings for this domain
  let userSettings = null;
  try {
    userSettings = await ContentSettings.findOne({ domain });
    if (!userSettings) {
      userSettings = await ContentSettings.create({
        domain,
        wordCountLimit: 1000,
        targetKeywords: [],
        preferredTone: "Authoritative",
        dailyQuota: 10,
        autoFillRemaining: true,
      });
    }
  } catch (err) {
    console.warn(`[CronScheduler] Could not fetch ContentSettings for ${domain}:`, err.message);
    userSettings = { wordCountLimit: 1000, targetKeywords: [], preferredTone: "Authoritative", dailyQuota: 10, autoFillRemaining: true };
  }

  // Calculate items created today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const existingTodayCount = await AutoContent.countDocuments({
    domain,
    createdAt: { $gte: startOfDay },
  });

  // Query SEORecord for domain-specific keywords if user didn't specify custom ones
  let seoRecord = null;
  try {
    seoRecord = await SEORecord.findOne({ domain });
  } catch (err) {
    console.warn(`[CronScheduler] Could not fetch SEORecord for ${domain}:`, err.message);
  }

  const recordKeywords = (seoRecord?.topKeywords || []).map(k => k.keyword).filter(Boolean);
  const hasUserKeywords = userSettings.targetKeywords && userSettings.targetKeywords.length > 0;
  const userKeywords = hasUserKeywords ? userSettings.targetKeywords : recordKeywords;
  const activeKwList = userKeywords.length > 0 ? userKeywords : ["sales call tracking software", "ai crm lead management", "telephony analytics"];

  const dailyQuota = userSettings.dailyQuota || 10;
  const remainingQuota = Math.max(0, dailyQuota - existingTodayCount);

  // If user selected specific keywords (e.g., 4 keywords), target batch size matches the 4 keywords
  const defaultBatchSize = hasUserKeywords ? userSettings.targetKeywords.length : dailyQuota;
  let countToGenerate = Math.min(requestedCount !== null ? requestedCount : defaultBatchSize, remainingQuota);

  if (countToGenerate <= 0) {
    console.log(`[CronScheduler] Domain ${domain} already has ${existingTodayCount}/${dailyQuota} items generated today. Skipping auto-generation.`);
    return [];
  }

  console.log(`[CronScheduler] Generating ${countToGenerate} LLM AI articles for ${domain} (Today's existing: ${existingTodayCount}, Target Quota: ${dailyQuota}, Target Keywords: ${userKeywords.length})...`);

  const articleTemplates = [
    (kw, d) => ({ title: `How ${d} Uses ${kw.toUpperCase()} to Accelerate Organic Search Growth`, kw: `${kw}, organic traffic` }),
    (kw, d) => ({ title: `Automating Lead Management & Workflows with ${kw.toUpperCase()}`, kw: `${kw}, lead automation` }),
    (kw, d) => ({ title: `Top Growth Strategies for ${d} Driven by ${kw.toUpperCase()}`, kw: `${kw}, growth hacks` }),
    (kw, d) => ({ title: `Why ${kw.toUpperCase()} is Essential for High-Converting Operations on ${d}`, kw: kw }),
    (kw, d) => ({ title: `The 2026 Blueprint for ${kw.toUpperCase()} & AI Engine Visibility`, kw: `${kw}, generative geo` }),
  ];

  const topics = [];
  let topicIdx = 0;
  while (topics.length < countToGenerate) {
    const kw = activeKwList[topicIdx % activeKwList.length];
    const templateFn = articleTemplates[Math.floor(topics.length / activeKwList.length) % articleTemplates.length];
    topics.push(templateFn(kw, domain));
    topicIdx++;
  }

  const now = new Date();
  const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 72 hours window

  // Compute dynamic company profile metadata per domain
  const cleanDomainName = domain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  const capitalizedSiteName = cleanDomainName.split(".")[0].toUpperCase();

  const companyName = userSettings.company || `${capitalizedSiteName} Inc.`;
  const companyEmail = userSettings.email || `contact@${cleanDomainName}`;
  const companyPhone = userSettings.phone || "";
  const companyAddress = userSettings.address || "";

  const createdItems = await Promise.all(
    topics.map(async (itemData) => {
      const aiArticle = await generateAiArticleContent({
        domain,
        topic: itemData.title,
        primaryKeyword: itemData.kw,
        wordCountGoal: userSettings.wordCountLimit || 1000,
        tone: userSettings.preferredTone || "Authoritative",
        company: companyName,
        email: companyEmail,
        phone: companyPhone,
        address: companyAddress,
      });

      const newContent = new AutoContent({
        domain,
        title: aiArticle.title || itemData.title,
        summary: aiArticle.summary || itemData.title,
        body: aiArticle.body,
        keywords: aiArticle.keywords || itemData.kw,
        website: domain.startsWith("http") ? domain : `https://${domain}/`,
        company: companyName,
        email: companyEmail,
        phone: companyPhone,
        address: companyAddress,
        status: "scheduled",
        scheduledForSubmissionAt: threeDaysLater,
        createdAt: now,
      });

      const saved = await newContent.save();
      await incrementStat(domain, "totalGeneratedCount", 1);
      return saved;
    })
  );

  console.log(`[CronScheduler] Successfully created ${createdItems.length} scheduled content items for ${domain}. Scheduled for: ${threeDaysLater.toISOString()}`);
  return createdItems;
}

// 2. Queue Submission Processor: Submits scheduled articles after 3-day countdown
async function processPendingSubmissions() {
  console.log("[CronScheduler] Checking for articles due for backlink submission...");
  const now = new Date();

  try {
    const dueItems = await AutoContent.find({
      status: "scheduled",
      scheduledForSubmissionAt: { $lte: now },
    }).limit(20);

    if (!dueItems.length) {
      console.log("[CronScheduler] No articles due for submission at this time.");
      return;
    }

    console.log(`[CronScheduler] Found ${dueItems.length} articles due for backlink submission.`);

    for (const item of dueItems) {
      await submitArticleToBacklinkEngine(item);
    }
  } catch (err) {
    console.error("[CronScheduler] Error in processPendingSubmissions:", err.message);
  }
}

// Single Article Submission Helper
async function submitArticleToBacklinkEngine(item) {
  const payload = {
    project_id: item._id ? item._id.toString() : "Postman Test Project",
    title: item.title ? item.title : "title",
    submitted_by: "Rankgenie",
    description: item.body ? item.body : item.summary ? item.summary : "description",
    website: item.website ? item.website : "www.example.com",
    keywords: item.keywords ? item.keywords : "abc, def, ghi",
    company: item.company ? item.company : "abc company",
    email: item.email ? item.email : "abc@gmail.com",
    phone: item.phone ? item.phone : "1234567890",
    address: item.address ? item.address : "New York",
  };
  console.log(payload)

  try {
    console.log(`[CronScheduler] Submitting item "${item.title}" (${item._id}) to ${RANKGENI_SUBMIT_API}...`);
    const response = await fetch(RANKGENI_SUBMIT_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const resData = await response.json();
    console.log(resData, "-------------------------")
    if (response.ok && resData.status === "success") {
      item.status = "submitted";
      item.submittedAt = new Date();
      item.backlinkJobId = resData.submission.id || "job_submitted";
      item.submissionError = "";
      await item.save();

      await incrementStat(item.domain, "totalSubmittedCount", 1);
      console.log(`[CronScheduler] ✅ Article "${item.title}" successfully submitted! Job ID: ${resData.submission.id}`);
    } else {
      item.status = "failed";
      item.submissionError = resData.error || resData.message || "API Error";
      await item.save();
      console.error(`[CronScheduler] ❌ Backlink submission failed for "${item.title}":`, item.submissionError);
    }
  } catch (err) {
    item.status = "failed";
    item.submissionError = err.message;
    await item.save();
    console.error(`[CronScheduler] ❌ Network/Submission error for "${item.title}":`, err.message);
  }
}

// 3. 60-Day Data Wiping Job: Cleans up content older than 60 days while incrementing aggregate counter
async function processSixtyDayCleanup() {
  console.log("[CronScheduler] Running 60-day data retention cleanup...");
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  try {
    const expiredItems = await AutoContent.find({
      createdAt: { $lte: sixtyDaysAgo },
    });

    if (!expiredItems.length) {
      console.log("[CronScheduler] No articles older than 60 days to clean up.");
      return;
    }

    console.log(`[CronScheduler] Found ${expiredItems.length} articles older than 60 days. Processing wiping...`);

    // Group by domain for counter update
    const domainCounts = {};
    for (const item of expiredItems) {
      domainCounts[item.domain] = (domainCounts[item.domain] || 0) + 1;
    }

    for (const [domain, count] of Object.entries(domainCounts)) {
      await incrementStat(domain, "totalWipedCount", count);
    }

    // Delete raw documents
    const result = await AutoContent.deleteMany({
      createdAt: { $lte: sixtyDaysAgo },
    });

    console.log(`[CronScheduler] ✅ 60-Day Cleanup Complete. Deleted ${result.deletedCount} old documents. Stats updated.`);
  } catch (err) {
    console.error("[CronScheduler] Error running 60-day cleanup:", err.message);
  }
}

// 4. Retry Failed Submissions
async function processFailedSubmissions() {
  console.log("[CronScheduler] Checking for failed articles to resubmit...");
  try {
    const failedItems = await AutoContent.find({
      status: "failed",
    });

    if (!failedItems.length) {
      console.log("[CronScheduler] No failed articles to resubmit.");
      return;
    }

    console.log(`[CronScheduler] Found ${failedItems.length} failed articles. Attempting resubmission...`);

    for (const item of failedItems) {
      await submitArticleToBacklinkEngine(item);
    }
  } catch (err) {
    console.error("[CronScheduler] Error in processFailedSubmissions:", err.message);
  }
}

// 5. Run Daily Batch Generation for all registered SEORecords
async function runDailyBatchForAllSeoRecords() {
  try {
    const seoRecords = await SEORecord.find({}).select("domain");
    const domains = seoRecords.map(r => r.domain).filter(Boolean);
    const targetDomains = domains.length ? Array.from(new Set(domains)) : ["nxtcall.app"];

    console.log(`[CronScheduler] Running daily 10-article generation for ${targetDomains.length} domains...`);
    for (const domain of targetDomains) {
      await generateDailyContentBatch(domain, 10);
    }
  } catch (err) {
    console.error("[CronScheduler] Error in runDailyBatchForAllSeoRecords:", err.message);
  }
}

// Master Scheduler Loop
function startCronScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
  }
  if (failedSchedulerTimer) {
    clearInterval(failedSchedulerTimer);
  }
  console.info("[CronScheduler] Starting automated 3-day Queue & 60-day Retention Scheduler...");

  // Run initial check after 5 seconds, failed check after 10 seconds
  setTimeout(() => {
    processPendingSubmissions();
    processSixtyDayCleanup();
  }, 5000);

  setTimeout(() => {
    processFailedSubmissions();
  }, 10000);

  // Check queue every 1 hour (3,600,000 ms)
  schedulerTimer = setInterval(() => {
    processPendingSubmissions();
    processSixtyDayCleanup();
  }, 3600000);

  // Check failed submissions every 2 hours (7,200,000 ms)
  failedSchedulerTimer = setInterval(() => {
    processFailedSubmissions();
  }, 7200000);
}

function stopCronScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
    console.info("[CronScheduler] Background scheduler stopped.");
  }
  if (failedSchedulerTimer) {
    clearInterval(failedSchedulerTimer);
    failedSchedulerTimer = null;
    console.info("[CronScheduler] Failed submissions auto-retry scheduler stopped.");
  }
}

module.exports = {
  generateDailyContentBatch,
  runDailyBatchForAllSeoRecords,
  processPendingSubmissions,
  processSixtyDayCleanup,
  processFailedSubmissions,
  submitArticleToBacklinkEngine,
  startCronScheduler,
  stopCronScheduler,
};
