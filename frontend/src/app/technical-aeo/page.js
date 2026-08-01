"use client";

import React, { useState, useEffect } from "react";
import { useSeo } from "@/context/SeoContext";
import {
  Bot,
  Search,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Code2,
  Server,
  Zap,
  Network,
  LayoutTemplate,
  Copy,
  Check,
  Target,
  Brain,
  RotateCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ExternalLink,
  Clock
} from "lucide-react";

export default function TechnicalAeoPage() {
  const { seoData, currentDomain } = useSeo();

  // State for AEO Fixes
  const [fixes, setFixes] = useState({});
  const [loadingFix, setLoadingFix] = useState({});
  const [copiedFixKey, setCopiedFixKey] = useState(null);
  const [expandedFix, setExpandedFix] = useState(null);
  const [expandedSubpage, setExpandedSubpage] = useState(null);

  if (!seoData) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-slate-200 min-h-[50vh]">
        <div className="text-center">
          <Bot className="w-8 h-8 text-rankgenie-orange animate-pulse mx-auto mb-2" />
          <span className="text-sm font-semibold text-slate-500">Retrieving SEO Intelligence...</span>
        </div>
      </div>
    );
  }

  // Generate AEO Semantic & Schema Markup Fixes
  const handleGenerateAeoFix = async (fixKey) => {
    setLoadingFix((prev) => ({ ...prev, [fixKey]: true }));
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
    try {
      if (fixKey === 'schema') {
        const response = await fetch(`${API_BASE_URL}/api/seo-data/schema`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: `https://${currentDomain}` })
        });
        const resData = await response.json();
        if (resData.schema) {
          setFixes((prev) => ({
            ...prev,
            schema: `<script type="application/ld+json">\n${JSON.stringify(resData.schema, null, 2)}\n</script>`
          }));
        }
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/seo-data/aeo-fixes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: `https://${currentDomain}`, fixType: fixKey })
      });
      const resData = await response.json();
      if (resData.suggestion) {
        setFixes((prev) => ({ ...prev, [fixKey]: resData.suggestion }));
      }
    } catch (err) {
      console.error("Failed to generate AEO fix", err);
    } finally {
      setLoadingFix((prev) => ({ ...prev, [fixKey]: false }));
    }
  };

  const handleCopyFix = (fixKey, text) => {
    navigator.clipboard.writeText(text);
    setCopiedFixKey(fixKey);
    setTimeout(() => setCopiedFixKey(null), 2000);
  };

  // =========================================================
  // PRE-CALCULATE AEO DATA VARIABLES
  // =========================================================
  const geoDataObj = seoData.aeoGeo || {};
  const aeoScore = geoDataObj.aeoScore || 0;
  const schemaAnalysis = geoDataObj.schemaAnalysis || {};
  const scrapedUrls = geoDataObj.scrapedUrls || [];
  const subpageReport = seoData?.website?.fullAudit?.subpage_audit_report || null;

  const topIssuesList = seoData.website?.technicalAudit?.topIssues || [];
  const titleIssues = topIssuesList.filter(issue => (issue?.message || issue?.issue || issue?.title || "").toLowerCase().includes("title"));
  const titleStatus = titleIssues.length === 0 ? "Passed" : (titleIssues[0]?.type === "error" ? "Error" : "Warning");
  const titleDetail = titleIssues.length === 0 
    ? "Format the <title> tag to clearly state the page intent in 50-60 characters. Answer engines pull headings and title elements to verify topic coverage." 
    : (titleIssues[0]?.message || titleIssues[0]?.issue || titleIssues[0]?.title || "Title issue detected");

  const h1Issues = topIssuesList.filter(issue => (issue?.message || issue?.issue || issue?.title || "").toLowerCase().includes("h1"));
  const h1Status = h1Issues.length === 0 ? "Passed" : (h1Issues[0]?.type === "error" ? "Error" : "Warning");
  const h1Detail = h1Issues.length === 0 
    ? "Exactly one H1 tag found on the target page." 
    : (h1Issues[0]?.message || h1Issues[0]?.issue || h1Issues[0]?.title || "H1 issue detected");

  const siteClean = currentDomain ? currentDomain.split(".")[0] : "domain";

  const aeoSolutions = [
    {
      key: 'title',
      name: 'Semantic Title Alignment',
      status: titleStatus,
      instruction: titleDetail,
      defaultSuggestion: `<!-- Suggested AEO Title Optimization -->\n<title>Expert Digital Services & Search Diagnostics | ${currentDomain}</title>`,
      icon: Search,
      metric: 'Critical'
    },
    {
      key: 'h1',
      name: 'H1 Entity Extraction',
      status: h1Status,
      instruction: h1Detail,
      defaultSuggestion: `<!-- Suggested AEO H1 Optimization -->\n<h1>Empower Your Digital Growth with Search Intelligence</h1>`,
      icon: LayoutTemplate,
      metric: 'High'
    },
    {
      key: 'schema',
      name: 'Knowledge Graph Schema (JSON-LD)',
      status: schemaAnalysis.schemaScore > 50 ? 'Passed' : 'Error',
      instruction: 'Deploy valid FAQPage, Article, or Organization schema to directly feed LLMs structured knowledge about your entities.',
      defaultSuggestion: `{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "${siteClean}",\n  "url": "https://${currentDomain}"\n}`,
      icon: Code2,
      metric: 'Vital'
    },
    {
      key: 'layout',
      name: 'Information Architecture (Lists/Tables)',
      status: geoDataObj.readabilityAnalysis?.tablePresence ? 'Passed' : 'Warning',
      instruction: 'Reformat unstructured text blocks into standard HTML tables and lists. LLMs parse tabular data significantly better than paragraphs.',
      defaultSuggestion: `<!-- Recommended Structured Layout (List/Table) -->\n<ul>\n  <li><strong>Core Service:</strong> Real-time SEO auditing & diagnostics</li>\n  <li><strong>Features:</strong> Answer Engine Optimization & maps visibility</li>\n  <li><strong>Performance:</strong> Accelerated search tracking & backlinks</li>\n</ul>`,
      icon: BarChart3,
      metric: 'Medium'
    }
  ];

  // Auto-trigger fix generation for non-passed items
  useEffect(() => {
    if (!currentDomain) return;
    aeoSolutions.forEach((sol) => {
      if (sol.status !== 'Passed' && !fixes[sol.key] && !loadingFix[sol.key]) {
        handleGenerateAeoFix(sol.key);
      }
    });
  }, [currentDomain]);

  const aeoColor = aeoScore >= 80 ? 'text-emerald-500' : aeoScore >= 50 ? 'text-amber-500' : 'text-rose-500';
  const aeoStroke = aeoScore >= 80 ? '#10b981' : aeoScore >= 50 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-12">
      {/* Premium Light Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-orange-50/20 p-8 md:p-12 rounded-[2rem] border border-slate-200 shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent opacity-60"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-rankgenie-orange text-xs font-bold uppercase tracking-widest">
              <Bot className="w-3.5 h-3.5" /> Technical AEO
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-slate-900">
              Answer Engine Optimization <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rankgenie-orange to-amber-500">
                AEO Technical Assistant
              </span>
            </h1>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl leading-relaxed font-medium">
              Audit on-page heading structures, validate JSON-LD structured schemas, and compile rich snippets for search citations.
            </p>
          </div>
          
          <div className="flex-shrink-0 bg-white border border-slate-200 px-5 py-4 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Domain</div>
              <div className="text-sm font-extrabold text-rankgenie-orange">{currentDomain}</div>
            </div>
            <div className="w-[1px] h-8 bg-slate-200" />
            <Target className="w-6 h-6 text-rankgenie-orange" />
          </div>
        </div>
      </div>

      {/* Radial dial + technical indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radial score card */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-md flex flex-col items-center justify-center group">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">AEO Readiness Index</h3>
          
          <div className="relative flex items-center justify-center w-56 h-56">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none opacity-40 group-hover:rotate-180 transition-transform duration-[10s] ease-linear">
              <circle cx="112" cy="112" r="100" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 8" fill="transparent" />
            </svg>
            
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="112" cy="112" r="80" stroke="#f1f5f9" strokeWidth="14" fill="transparent" />
              <circle
                cx="112"
                cy="112"
                r="80"
                stroke={aeoStroke}
                strokeWidth="14"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - aeoScore / 100)}
                strokeLinecap="round"
                className="transition-all duration-1500 ease-out"
                style={{ filter: `drop-shadow(0 4px 6px ${aeoStroke}40)` }}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black tracking-tighter ${aeoColor}`}>{aeoScore}</span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">/ 100</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4 w-full">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center shadow-sm">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Industry Avg</p>
              <p className="text-base font-black text-slate-700">65.0</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center shadow-sm">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Percentile</p>
              <p className="text-base font-black text-rankgenie-orange">Top {Math.max(1, Math.round(100 - aeoScore))}%</p>
            </div>
          </div>
        </div>

        {/* Semantic health metrics and scraped URLs */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md relative overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                  <Network className="w-5 h-5 text-blue-500" />
                </div>
                <h4 className="text-slate-700 font-bold text-sm">Schema Health</h4>
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">
                {(schemaAnalysis?.schemaScore && schemaAnalysis.schemaScore > 0)
                  ? schemaAnalysis.schemaScore
                  : (seoData?.schema_analysis_report?.schema_score || 
                     seoData?.website?.technicalAudit?.schemaAnalysisReport?.schema_score || 
                     seoData?.website?.fullAudit?.schema_analysis_report?.schema_score || 
                     schemaAnalysis?.schemaScore || 0)}
                <span className="text-sm text-slate-400 font-medium ml-1">/ 100</span>
              </p>
              <p className="text-xs text-slate-500">Validates structured JSON-LD presence for rich snippets.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md relative overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-purple-50 border border-purple-100">
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <h4 className="text-slate-700 font-bold text-sm">NLP Readability</h4>
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">
                {geoDataObj.readabilityAnalysis?.score ?? geoDataObj.readabilityAnalysis?.fleschKincaidReadingEase ?? 0}
                <span className="text-sm text-slate-400 font-medium ml-1">/ 100</span>
              </p>
              <p className="text-xs text-slate-500">Measures content parsing ease for LLM tokenizers.</p>
            </div>
          </div>

          {/* Scraped URL subpages / Detailed Audited Subpages */}
          <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-md flex flex-col mt-2">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <Server className="w-4 h-4 text-rankgenie-orange" />
                Audited URL Subpages
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-500">
                {scrapedUrls.length} Pages Crawled
              </span>
            </div>

            {subpageReport ? (
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                {/* Summary Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Avg SEO Score</span>
                    <span className="text-lg font-black text-slate-800">{subpageReport.average_subpage_score || 0}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Broken Pages</span>
                    <span className={`text-lg font-black ${subpageReport.summary_issues?.broken_subpages_count > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                      {subpageReport.summary_issues?.broken_subpages_count || 0}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Missing Title/Desc</span>
                    <span className="text-lg font-black text-slate-800">
                      {(subpageReport.summary_issues?.missing_title_count || 0) + 
                       (subpageReport.summary_issues?.missing_description_count || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Missing Alt Tags</span>
                    <span className="text-lg font-black text-slate-800">{subpageReport.summary_issues?.total_missing_alt_images || 0}</span>
                  </div>
                </div>

                {/* Subpage List & Expandable issues */}
                <div className="flex-1 overflow-y-auto max-h-[300px] pr-1 space-y-2">
                  {subpageReport.audited_subpages && 
                   subpageReport.audited_subpages.length > 0 ? (
                    subpageReport.audited_subpages.map((page, idx) => {
                      const isExpanded = expandedSubpage === idx;
                      const scoreColor = page.score >= 80 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : 
                                         page.score >= 50 ? 'text-amber-600 bg-amber-50 border-amber-200' : 
                                         'text-rose-600 bg-rose-50 border-rose-200';
                      
                      return (
                        <div key={idx} className="border border-slate-100 rounded-xl bg-white overflow-hidden shadow-sm transition-all hover:border-slate-200">
                          <div 
                            onClick={() => setExpandedSubpage(isExpanded ? null : idx)}
                            className="flex items-center justify-between p-3 cursor-pointer select-none hover:bg-slate-50/50 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${scoreColor}`}>
                                {page.score}
                              </span>
                              <span className="text-xs font-mono font-medium text-slate-600 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                                {page.url}
                              </span>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0 ml-2">
                              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${page.status_code >= 200 && page.status_code < 300 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                                {page.status_code}
                              </span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="border-t border-slate-50 bg-slate-50/30 p-3.5 text-xs text-slate-600 space-y-3">
                              {/* Page Metrics Details */}
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-medium border-b border-slate-100 pb-2">
                                <div><span className="text-slate-400 font-semibold mr-1">Title:</span> <span className="font-semibold text-slate-700">{page.title || <span className="text-red-500 font-bold">Missing</span>}</span></div>
                                <div><span className="text-slate-400 font-semibold mr-1">Word Count:</span> <span className="font-bold text-slate-700">{page.word_count || 0} words</span></div>
                                <div className="col-span-2 truncate"><span className="text-slate-400 font-semibold mr-1">Desc:</span> <span className="text-slate-700">{page.meta_description || <span className="text-red-500 font-bold">Missing</span>}</span></div>
                                <div><span className="text-slate-400 font-semibold mr-1">H1 / H2 Count:</span> <span className="text-slate-700 font-bold">{page.h1_count || 0} H1, {page.h2_count || 0} H2</span></div>
                                <div><span className="text-slate-400 font-semibold mr-1">Load Time:</span> <span className="text-slate-700 flex items-center gap-1 font-bold"><Clock className="w-3 h-3 text-slate-400" /> {page.response_time_ms}ms</span></div>
                              </div>

                              {/* Issues List */}
                              <div className="space-y-1.5">
                                <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider block">Audits & Warning Diagnostics</span>
                                {page.issues && page.issues.length > 0 ? (
                                  page.issues.map((issueStr, issueIdx) => (
                                    <div key={issueIdx} className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50/50 border border-amber-100/50 p-2 rounded-lg">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                      <span className="font-medium">{issueStr}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/50 border border-emerald-100/50 p-2 rounded-lg">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    <span className="font-bold">Passed all core technical SEO audits!</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 font-bold my-auto text-center w-full">
                      No subpage audits stored.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* Fallback simple list of crawled URLs if detailed reports are missing */
              <div className="flex-1 overflow-y-auto max-h-40 flex flex-col gap-2.5 pr-1">
                {scrapedUrls.length > 0 ? (
                  scrapedUrls.map((urlStr, uIdx) => (
                    <div key={uIdx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono font-medium text-slate-600 shadow-sm">
                      <span className="truncate max-w-[280px]">{urlStr}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 font-bold my-auto text-center w-full">
                    No subpages crawled. Set up your site configuration structure to crawl /about and /contact.
                  </p>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Semantic diagnostic resolutions */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-500" />
          AEO Diagnostic Solutions
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aeoSolutions.map((sol, idx) => {
            const Icon = sol.icon;
            const isPassed = sol.status === 'Passed';
            // Show fix box ONLY by default if status is NOT Passed (or if user manually generated a fix)
            const suggestionText = fixes[sol.key] || (!isPassed ? sol.defaultSuggestion : null);
            const showFixContainer = Boolean(suggestionText);
            const isExpanded = expandedFix === sol.key;
            
            let statusColor = sol.status === 'Passed' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 
                              sol.status === 'Warning' ? 'text-amber-700 bg-amber-50 border-amber-200' : 
                              'text-rose-700 bg-rose-50 border-rose-200';

            return (
              <div 
                key={idx} 
                className={`relative bg-white border ${isExpanded ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-lg' : 'border-slate-200 shadow-sm'} rounded-3xl p-6 transition-all duration-300 hover:shadow-md flex flex-col`}
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                      <Icon className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{sol.name}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Impact: {sol.metric}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${statusColor}`}>
                    {sol.status}
                  </div>
                </div>
                
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {sol.instruction}
                </p>

                {/* Generate / Show Semantic Markup Fix Action */}
                <div className="mt-auto">
                  {showFixContainer ? (
                    <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                      <div className="bg-white px-4 py-2 border-b border-slate-200 flex justify-between items-center shadow-sm">
                        <span className="text-[10px] text-orange-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-orange-500" /> AI Resolution Fix
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleGenerateAeoFix(sol.key)}
                            disabled={loadingFix[sol.key]}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold transition-all hover:shadow-sm active:scale-95 disabled:opacity-50"
                            title="Regenerate AI Fix"
                          >
                            <RotateCw className={`w-3.5 h-3.5 text-orange-600 ${loadingFix[sol.key] ? 'animate-spin' : ''}`} />
                            <span>{loadingFix[sol.key] ? "Regenerating..." : "Regenerate"}</span>
                          </button>
                          <button
                            onClick={() => handleCopyFix(sol.key, suggestionText)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                            title="Copy Fix Code"
                          >
                            {copiedFixKey === sol.key ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 max-h-40 overflow-y-auto">
                         <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">{suggestionText}</pre>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs font-semibold text-emerald-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Optimization Passed — No fixes required.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

