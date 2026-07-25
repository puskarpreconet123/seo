const { Router } = require('express');
const { prisma } = require('../db/client.js');
const {
  analyzeAndPersistDomain,
  getFullDomainDashboardData,
  calculateAuthorityScore,
  calculateOrganicTraffic,
  calculateVisibilityScore,
  generateSeedKeywords,
  crawlDomainPublicData
} = require('../services/seoAnalyticsEngine.js');
const {
  generateSeoAnalyticsCsv,
  generateSeoAnalyticsExcelXml,
  generateSeoAnalyticsHtmlReport
} = require('../services/excelReportGenerator.js');

const router = Router();

// Analyze domain overview & persist
router.post('/domain/overview', async (req, res) => {
  try {
    const { domain, country, searchEngine, device } = req.body;
    if (!domain) {
      return res.status(400).json({ detail: 'Domain Name is required.' });
    }

    console.info(`[AnalyticsRouter] Starting SEO Analytics for Domain: ${domain} | Country: ${country}`);
    const dashboardData = await analyzeAndPersistDomain(
      domain,
      country || 'India',
      searchEngine || 'Google',
      device || 'Desktop'
    );

    res.json(dashboardData);
  } catch (err) {
    console.error('[AnalyticsRouter] Domain analysis failed:', err);
    res.status(500).json({ detail: `Domain analysis error: ${err.message}` });
  }
});

// Fetch full dashboard payload by Domain ID
router.get('/domain/:domainId/data', async (req, res) => {
  try {
    const { domainId } = req.params;
    const dashboardData = await getFullDomainDashboardData(domainId);
    if (!dashboardData) {
      return res.status(404).json({ detail: 'Domain analytics record not found.' });
    }
    res.json(dashboardData);
  } catch (err) {
    console.error('[AnalyticsRouter] Failed to retrieve domain analytics:', err);
    res.status(500).json({ detail: `Query error: ${err.message}` });
  }
});

// List all tracked domains
router.get('/domains', async (req, res) => {
  try {
    const domains = await prisma.domain.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    res.json(domains);
  } catch (err) {
    console.error('[AnalyticsRouter] Failed to list domains:', err);
    res.status(500).json({ detail: 'Could not fetch tracked domains list.' });
  }
});

// Compare Primary Domain against entered Competitors
router.post('/competitors/compare', async (req, res) => {
  try {
    const { primaryDomainId, competitorDomains } = req.body;
    if (!primaryDomainId || !competitorDomains || !Array.isArray(competitorDomains)) {
      return res.status(400).json({ detail: 'primaryDomainId and competitorDomains array are required.' });
    }

    const primaryDomain = await prisma.domain.findUnique({ where: { id: primaryDomainId } });
    if (!primaryDomain) {
      return res.status(404).json({ detail: 'Primary domain record not found.' });
    }

    const results = [];
    for (const compDomain of competitorDomains) {
      const cleanComp = compDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
      if (!cleanComp) continue;

      const compKeywords = generateSeedKeywords(cleanComp, primaryDomain.country);
      const publicData = await crawlDomainPublicData(cleanComp);

      const trafficEstimate = calculateOrganicTraffic(compKeywords);
      const visibilityScore = calculateVisibilityScore(compKeywords);

      const referringDomains = new Set(publicData.backlinks.map(b => b.sourceDomain)).size;
      const compBacklinksCount = publicData.backlinks.length;
      const compFollowCount = publicData.backlinks.filter(b => !b.isNofollow).length;
      const compFollowRatio = compBacklinksCount > 0 ? compFollowCount / compBacklinksCount : 0.7;
      const authorityScore = calculateAuthorityScore({
        referringDomainsCount: referringDomains,
        backlinksCount: compBacklinksCount,
        followRatio: compFollowRatio,
        domainAgeYears: publicData.domainAgeYears,
        indexedPages: publicData.indexedPagesEstimate,
        technicalScore: 80
      });

      const top3 = compKeywords.filter(k => k.position && k.position <= 3).length;
      const top10 = compKeywords.filter(k => k.position && k.position <= 10).length;
      const top20 = compKeywords.filter(k => k.position && k.position <= 20).length;
      const top50 = compKeywords.filter(k => k.position && k.position <= 50).length;
      const top100 = compKeywords.filter(k => k.position && k.position <= 100).length;

      const rankingDistribution = { top3, top10, top20, top50, top100 };

      // Save competitor record in database
      const compRecord = await prisma.competitor.create({
        data: {
          primaryDomainId: primaryDomain.id,
          competitorDomain: cleanComp,
          authorityScore,
          trafficEstimate,
          keywordsCount: compKeywords.length,
          backlinksCount: compBacklinksCount,
          visibilityScore,
          rankingDistribution
        }
      });

      results.push({
        id: compRecord.id,
        competitorDomain: cleanComp,
        authorityScore,
        trafficEstimate,
        keywordsCount: compKeywords.length,
        backlinksCount: compBacklinksCount,
        visibilityScore,
        rankingDistribution
      });
    }

    res.json({
      primaryDomain: {
        name: primaryDomain.domainName,
        authorityScore: primaryDomain.authorityScore,
        trafficEstimate: primaryDomain.organicTrafficEstimate,
        keywordsCount: primaryDomain.totalKeywordsCount,
        backlinksCount: primaryDomain.totalBacklinksCount,
        visibilityScore: primaryDomain.visibilityScore
      },
      competitors: results
    });
  } catch (err) {
    console.error('[AnalyticsRouter] Competitor comparison failed:', err);
    res.status(500).json({ detail: `Competitor comparison error: ${err.message}` });
  }
});

// Export Reports (PDF / CSV / Excel)
router.get('/reports/export', async (req, res) => {
  try {
    const { domainId, domain: domainParam, format } = req.query;
    const identifier = domainId || domainParam;
    if (!identifier) {
      return res.status(400).send('domainId or domain query parameter is required.');
    }

    let dashboardData = null;
    
    // Check if identifier is a UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    if (isUuid) {
      dashboardData = await getFullDomainDashboardData(identifier);
    } else {
      const cleanName = identifier.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase();
      const existing = await prisma.domain.findUnique({ where: { domainName: cleanName } });
      if (existing) {
        dashboardData = await getFullDomainDashboardData(existing.id);
      } else {
        dashboardData = await analyzeAndPersistDomain(cleanName);
      }
    }

    if (!dashboardData) {
      return res.status(404).send('Domain record not found.');
    }

    const cleanName = dashboardData.domain.name.replace(/[^a-z0-9]/gi, '_');

    if (format === 'csv') {
      const csvStr = generateSeoAnalyticsCsv(dashboardData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${cleanName}_seo_analytics.csv"`);
      return res.send(csvStr);
    }

    if (format === 'excel') {
      const excelXml = generateSeoAnalyticsExcelXml(dashboardData);
      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader('Content-Disposition', `attachment; filename="${cleanName}_seo_analytics.xls"`);
      return res.send(excelXml);
    }

    // Default: Printable HTML Report for PDF
    const htmlReport = generateSeoAnalyticsHtmlReport(dashboardData);
    res.setHeader('Content-Type', 'text/html');
    return res.send(htmlReport);
  } catch (err) {
    console.error('[AnalyticsRouter] Report export failed:', err);
    res.status(500).send(`Export error: ${err.message}`);
  }
});

module.exports = router;
