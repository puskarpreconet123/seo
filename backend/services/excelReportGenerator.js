function escapeXml(val) {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate CSV Report for SEO Analytics Dashboard
function generateSeoAnalyticsCsv(dashboardData) {
  const domain = dashboardData.domain || {};
  const cards = dashboardData.cards || {};
  const keywords = dashboardData.keywords || [];
  const backlinks = dashboardData.backlinkProfile?.backlinks || [];
  const competitors = dashboardData.competitors || [];

  const rows = [];

  // Section 1: Executive Overview
  rows.push(['SEO ANALYTICS DASHBOARD REPORT']);
  rows.push(['Domain Name', domain.name || 'N/A']);
  rows.push(['Country', domain.country || 'India']);
  rows.push(['Search Engine', domain.searchEngine || 'Google']);
  rows.push(['Device', domain.device || 'Desktop']);
  rows.push(['Authority Score (0-100)', cards.authorityScore ?? 0]);
  rows.push(['Organic Traffic Estimate', cards.organicTraffic ?? 0]);
  rows.push(['Organic Keywords Count', cards.organicKeywords ?? 0]);
  rows.push(['Total Backlinks Count', cards.backlinks ?? 0]);
  rows.push(['Referring Domains Count', cards.referringDomains ?? 0]);
  rows.push(['SEO Visibility Score (%)', `${cards.visibility ?? 0}%`]);
  rows.push(['Average Keyword Position', cards.avgPosition ?? 0]);
  rows.push(['Top Keyword', cards.topKeyword || 'N/A']);
  rows.push([]);

  // Section 2: Technical Checks
  rows.push(['TECHNICAL SEO AUDIT METRICS']);
  rows.push(['HTTPS Status', domain.httpsStatus ? 'Passed' : 'Failed']);
  rows.push(['WWW Redirect Status', domain.wwwRedirect ? 'Configured' : 'Missing']);
  rows.push(['Canonical Tag Status', domain.canonicalStatus ? 'Valid' : 'Issue Detected']);
  rows.push(['Robots.txt Status', domain.robotsTxtStatus ? 'Found' : 'Missing']);
  rows.push(['Sitemap Status', domain.sitemapStatus ? 'Found' : 'Missing']);
  rows.push(['Domain Age (Years)', domain.domainAgeYears ?? 'N/A']);
  rows.push(['Indexed Pages Estimate', domain.indexedPagesEstimate ?? 0]);
  rows.push([]);

  // Section 3: Organic Keywords Table
  rows.push(['ORGANIC KEYWORDS RANKING TABLE']);
  rows.push(['Keyword', 'Position', 'Pos Yesterday', 'Pos 7d', 'Pos 30d', 'Search Volume', 'Difficulty (%)', 'CPC ($)', 'Competition', 'SERP Features', 'Ranking URL']);
  for (const kw of keywords) {
    const features = Array.isArray(kw.serpFeatures) ? kw.serpFeatures.join('; ') : '';
    rows.push([
      kw.keyword || '',
      kw.position ?? '100+',
      kw.positionYesterday ?? 'N/A',
      kw.position7d ?? 'N/A',
      kw.position30d ?? 'N/A',
      kw.searchVolume ?? 0,
      kw.difficulty ?? 0,
      kw.cpc ? `$${kw.cpc}` : '$0.00',
      kw.competition ?? 0,
      features,
      kw.urlRanking || ''
    ]);
  }
  rows.push([]);

  // Section 4: Backlink Intelligence
  rows.push(['BACKLINK INTELLIGENCE PROFILE']);
  rows.push(['Source Domain', 'Source IP', 'Target URL', 'Anchor Text', 'Link Type', 'Status', 'Date Discovered']);
  for (const bl of backlinks) {
    rows.push([
      bl.sourceDomain || '',
      bl.sourceIp || 'N/A',
      bl.targetUrl || '',
      bl.anchorText || '',
      bl.isNofollow ? 'Nofollow' : 'Dofollow',
      bl.isLost ? 'Lost' : bl.isNew ? 'New' : 'Active',
      bl.dateDiscovered ? new Date(bl.dateDiscovered).toISOString().split('T')[0] : 'N/A'
    ]);
  }
  rows.push([]);

  // Section 5: Competitors Comparison
  if (competitors.length > 0) {
    rows.push(['COMPETITOR BENCHMARK COMPARISON']);
    rows.push(['Competitor Domain', 'Authority Score', 'Estimated Traffic', 'Keywords Count', 'Backlinks Count', 'Visibility Score (%)']);
    for (const comp of competitors) {
      rows.push([
        comp.competitorDomain || '',
        comp.authorityScore ?? 0,
        comp.trafficEstimate ?? 0,
        comp.keywordsCount ?? 0,
        comp.backlinksCount ?? 0,
        `${comp.visibilityScore ?? 0}%`
      ]);
    }
  }

  // Format to CSV string
  return rows.map(r => r.map(val => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }).join(',')).join('\n');
}

// Generate Excel XML Spreadsheet (.xlsx/.xls compatible format)
function generateSeoAnalyticsExcelXml(dashboardData) {
  const domain = dashboardData.domain || {};
  const cards = dashboardData.cards || {};
  const keywords = dashboardData.keywords || [];
  const backlinks = dashboardData.backlinkProfile?.backlinks || [];

  let xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="SubHeader">
   <Font ss:Bold="1" ss:Color="#1F2937"/>
   <Interior ss:Color="#E5E7EB" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Bold">
   <Font ss:Bold="1"/>
  </Style>
 </Styles>

 <Worksheet ss:Name="Overview">
  <Table>
   <Row><Cell ss:StyleID="Header"><Data ss:Type="String">SEO Analytics Executive Summary — ${escapeXml(domain.name)}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Country: ${escapeXml(domain.country)} | Search Engine: ${escapeXml(domain.searchEngine)} | Device: ${escapeXml(domain.device)}</Data></Cell></Row>
   <Row></Row>
   <Row><Cell ss:StyleID="SubHeader"><Data ss:Type="String">Metric</Data></Cell><Cell ss:StyleID="SubHeader"><Data ss:Type="String">Value</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Authority Score</Data></Cell><Cell><Data ss:Type="Number">${cards.authorityScore ?? 0}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Organic Traffic Estimate</Data></Cell><Cell><Data ss:Type="Number">${cards.organicTraffic ?? 0}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Organic Keywords Count</Data></Cell><Cell><Data ss:Type="Number">${cards.organicKeywords ?? 0}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Total Backlinks Count</Data></Cell><Cell><Data ss:Type="Number">${cards.backlinks ?? 0}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Referring Domains Count</Data></Cell><Cell><Data ss:Type="Number">${cards.referringDomains ?? 0}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">SEO Visibility Score (%)</Data></Cell><Cell><Data ss:Type="Number">${cards.visibility ?? 0}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Average Position</Data></Cell><Cell><Data ss:Type="Number">${cards.avgPosition ?? 0}</Data></Cell></Row>
   <Row><Cell><Data ss:Type="String">Top Ranking Keyword</Data></Cell><Cell><Data ss:Type="String">${escapeXml(cards.topKeyword)}</Data></Cell></Row>
  </Table>
 </Worksheet>

 <Worksheet ss:Name="Keywords">
  <Table>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Keyword</Data></Cell>
    <Cell><Data ss:Type="String">Position</Data></Cell>
    <Cell><Data ss:Type="String">Yesterday</Data></Cell>
    <Cell><Data ss:Type="String">Search Volume</Data></Cell>
    <Cell><Data ss:Type="String">Difficulty</Data></Cell>
    <Cell><Data ss:Type="String">CPC ($)</Data></Cell>
    <Cell><Data ss:Type="String">Ranking URL</Data></Cell>
   </Row>`;

  for (const kw of keywords) {
    xml += `
   <Row>
    <Cell><Data ss:Type="String">${escapeXml(kw.keyword)}</Data></Cell>
    <Cell><Data ss:Type="Number">${kw.position ?? 100}</Data></Cell>
    <Cell><Data ss:Type="Number">${kw.positionYesterday ?? 100}</Data></Cell>
    <Cell><Data ss:Type="Number">${kw.searchVolume ?? 0}</Data></Cell>
    <Cell><Data ss:Type="Number">${kw.difficulty ?? 0}</Data></Cell>
    <Cell><Data ss:Type="Number">${kw.cpc ?? 0}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(kw.urlRanking)}</Data></Cell>
   </Row>`;
  }

  xml += `
  </Table>
 </Worksheet>

 <Worksheet ss:Name="Backlinks">
  <Table>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Source Domain</Data></Cell>
    <Cell><Data ss:Type="String">Source IP</Data></Cell>
    <Cell><Data ss:Type="String">Anchor Text</Data></Cell>
    <Cell><Data ss:Type="String">Attribute</Data></Cell>
    <Cell><Data ss:Type="String">Target URL</Data></Cell>
   </Row>`;

  for (const bl of backlinks) {
    xml += `
   <Row>
    <Cell><Data ss:Type="String">${escapeXml(bl.sourceDomain)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(bl.sourceIp)}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(bl.anchorText)}</Data></Cell>
    <Cell><Data ss:Type="String">${bl.isNofollow ? 'Nofollow' : 'Dofollow'}</Data></Cell>
    <Cell><Data ss:Type="String">${escapeXml(bl.targetUrl)}</Data></Cell>
   </Row>`;
  }

  xml += `
  </Table>
 </Worksheet>
</Workbook>`;

  return xml;
}

// Printable PDF HTML Report
function generateSeoAnalyticsHtmlReport(dashboardData) {
  const domain = dashboardData.domain || {};
  const cards = dashboardData.cards || {};
  const keywords = dashboardData.keywords || [];
  const backlinks = dashboardData.backlinkProfile?.backlinks || [];

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SEO Analytics Report - ${escapeXml(domain.name)}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937; margin: 30px; }
    h1 { color: #4f46e5; font-size: 24px; margin-bottom: 5px; }
    .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; text-align: center; }
    .card-num { font-size: 24px; font-weight: bold; color: #111827; }
    .card-label { font-size: 11px; text-transform: uppercase; color: #6b7280; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
    th { background: #4f46e5; color: white; text-align: left; padding: 8px 12px; }
    td { border-bottom: 1px solid #e5e7eb; padding: 8px 12px; }
    tr:nth-child(even) { background: #f9fafb; }
    .badge { padding: 3px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
    .badge-top3 { background: #dcfce7; color: #15803d; }
    .badge-top10 { background: #dbeafe; color: #1e40af; }
  </style>
</head>
<body>
  <h1>SEM-Style SEO Analytics Dashboard Report</h1>
  <div class="subtitle">Domain: <strong>${escapeXml(domain.name)}</strong> | Country: ${escapeXml(domain.country)} | Engine: ${escapeXml(domain.searchEngine)}</div>

  <div class="grid">
    <div class="card"><div class="card-num">${cards.authorityScore}/100</div><div class="card-label">Authority Score</div></div>
    <div class="card"><div class="card-num">${cards.organicTraffic?.toLocaleString()}</div><div class="card-label">Organic Traffic</div></div>
    <div class="card"><div class="card-num">${cards.organicKeywords}</div><div class="card-label">Organic Keywords</div></div>
    <div class="card"><div class="card-num">${cards.backlinks}</div><div class="card-label">Total Backlinks</div></div>
  </div>

  <h2>Organic Keywords Ranking Profile</h2>
  <table>
    <thead>
      <tr><th>Keyword</th><th>Position</th><th>Volume</th><th>Difficulty</th><th>CPC</th><th>SERP Features</th></tr>
    </thead>
    <tbody>
      ${keywords.map(k => `
        <tr>
          <td><strong>${escapeXml(k.keyword)}</strong></td>
          <td><span class="badge ${k.position <= 3 ? 'badge-top3' : 'badge-top10'}">#${k.position}</span></td>
          <td>${k.searchVolume?.toLocaleString()}</td>
          <td>${k.difficulty}%</td>
          <td>$${k.cpc}</td>
          <td>${Array.isArray(k.serpFeatures) ? k.serpFeatures.join(', ') : ''}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>`;
}

module.exports = { generateSeoAnalyticsCsv, generateSeoAnalyticsExcelXml, generateSeoAnalyticsHtmlReport };
