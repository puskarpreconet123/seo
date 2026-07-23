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
  Brain
} from "lucide-react";

export default function TechnicalAeoPage() {
  const { seoData, currentDomain } = useSeo();

  // State for AEO Fixes
  const [fixes, setFixes] = useState({});
  const [loadingFix, setLoadingFix] = useState({});
  const [copiedFixKey, setCopiedFixKey] = useState(null);
  const [expandedFix, setExpandedFix] = useState(null);

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
    try {
      if (fixKey === 'schema') {
        const response = await fetch("http://127.0.0.1:5000/api/seo-data/schema", {
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

      const response = await fetch("http://127.0.0.1:5000/api/seo-data/aeo-fixes", {
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

  const titleIssues = seoData.website?.technicalAudit?.topIssues?.filter(issue => issue.message.toLowerCase().includes("title")) || [];
  const titleStatus = titleIssues.length === 0 ? "Passed" : titleIssues[0].type === "error" ? "Error" : "Warning";
  const titleDetail = titleIssues.length === 0 ? "Format the <title> tag to clearly state the page intent in 50-60 characters. Answer engines pull headings and title elements to verify topic coverage." : titleIssues[0].message;

  const h1Issues = seoData.website?.technicalAudit?.topIssues?.filter(issue => issue.message.toLowerCase().includes("h1")) || [];
  const h1Status = h1Issues.length === 0 ? "Passed" : h1Issues[0].type === "error" ? "Error" : "Warning";
  const h1Detail = h1Issues.length === 0 ? "Exactly one H1 tag found on the target page." : h1Issues[0].message;

  const aeoSolutions = [
    {
      key: 'title',
      name: 'Semantic Title Alignment',
      status: titleStatus,
      instruction: titleDetail,
      icon: Search,
      metric: 'Critical'
    },
    {
      key: 'h1',
      name: 'H1 Entity Extraction',
      status: h1Status,
      instruction: h1Detail,
      icon: LayoutTemplate,
      metric: 'High'
    },
    {
      key: 'schema',
      name: 'Knowledge Graph Schema (JSON-LD)',
      status: schemaAnalysis.schemaScore > 50 ? 'Passed' : 'Error',
      instruction: 'Deploy valid FAQPage, Article, or Organization schema to directly feed LLMs structured knowledge about your entities.',
      defaultSuggestion: `{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "${currentDomain.split(".")[0]}",\n  "url": "https://${currentDomain}"\n}`,
      icon: Code2,
      metric: 'Vital'
    },
    {
      key: 'layout',
      name: 'Information Architecture (Lists/Tables)',
      status: geoDataObj.readabilityAnalysis?.tablePresence ? 'Passed' : 'Warning',
      instruction: 'Reformat unstructured text blocks into standard HTML tables and lists. LLMs parse tabular data significantly better than paragraphs.',
      icon: BarChart3,
      metric: 'Medium'
    }
  ];

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
              <p className="text-3xl font-black text-slate-900 mb-1">{schemaAnalysis.schemaScore || 0}<span className="text-sm text-slate-400 font-medium ml-1">/ 100</span></p>
              <p className="text-xs text-slate-500">Validates structured JSON-LD presence for rich snippets.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md relative overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-purple-50 border border-purple-100">
                  <Brain className="w-5 h-5 text-purple-500" />
                </div>
                <h4 className="text-slate-700 font-bold text-sm">NLP Readability</h4>
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">{geoDataObj.readabilityAnalysis?.score || 0}<span className="text-sm text-slate-400 font-medium ml-1">/ 100</span></p>
              <p className="text-xs text-slate-500">Measures content parsing ease for LLM tokenizers.</p>
            </div>
          </div>

          {/* Scraped URL subpages */}
          <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-md flex flex-col mt-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <Server className="w-4 h-4 text-rankgenie-orange" />
                Audited URL Subpages
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-500">
                {scrapedUrls.length} Scraped
              </span>
            </div>

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
            const suggestionText = fixes[sol.key] || sol.defaultSuggestion;
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

                {/* Generate Semantic Markup Action */}
                <div className="mt-auto">
                  {suggestionText ? (
                    <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                      <div className="bg-white px-4 py-2 border-b border-slate-200 flex justify-between items-center shadow-sm">
                        <span className="text-[10px] text-orange-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> AI Resolution
                        </span>
                        <button
                          onClick={() => handleCopyFix(sol.key, suggestionText)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                        >
                          {copiedFixKey === sol.key ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="p-4 bg-slate-50 max-h-40 overflow-y-auto">
                         <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">{suggestionText}</pre>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateAeoFix(sol.key)}
                      disabled={loadingFix[sol.key]}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {loadingFix[sol.key] ? (
                        <div className="w-5.5 h-5.5 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-orange-500" />
                          Generate AI Fix
                        </>
                      )}
                    </button>
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
