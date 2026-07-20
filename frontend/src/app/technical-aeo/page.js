"use client";

import React, { useState } from "react";
import { useSeo } from "@/context/SeoContext";
import {
  Brain,
  HelpCircle,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Globe2,
  Search,
  Sparkles,
  BarChart3,
  TrendingUp,
  LayoutTemplate,
  Terminal,
  Zap,
  Server,
  Code2,
  Network
} from "lucide-react";

export default function TechnicalAeoPage() {
  const { seoData, currentDomain } = useSeo();
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [expandedFix, setExpandedFix] = useState(null);

  if (!seoData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-white rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rankgenie-orange/10 via-white to-white"></div>
        <Brain className="w-16 h-16 text-rankgenie-orange animate-bounce relative z-10 mb-6 drop-shadow-md" />
        <h2 className="text-lg font-black text-slate-800 relative z-10 tracking-tight mb-2">Initializing AEO Matrix</h2>
        <p className="text-slate-500 relative z-10 font-medium">Extracting semantic entities and validating knowledge graphs...</p>
      </div>
    );
  }

  const data = seoData.aeoGeo || {};
  const aeoScore = data.aeoScore || 0;
  const schemaAnalysis = data.schemaAnalysis || {};
  const scrapedUrls = data.scrapedUrls || [];
  
  const [aiSchema, setAiSchema] = useState(null);
  const [generating, setGenerating] = useState(false);

  const defaultSchema = `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the primary service offered by ${currentDomain}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "${currentDomain} offers integrated digital visibility services, search optimizations, and comprehensive website audit diagnostics."
      }
    }
  ]
}`;

  const currentSchemaText = aiSchema || defaultSchema;

  const handleCopySchema = () => {
    navigator.clipboard.writeText(currentSchemaText);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleGenerateSchema = async () => {
    setGenerating(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/api/seo-data/schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: `https://${currentDomain}` })
      });
      const resData = await response.json();
      if (resData.schema) {
        setAiSchema(`<script type="application/ld+json">\n${JSON.stringify(resData.schema, null, 2)}\n</script>`);
      }
    } catch (err) {
      console.error("Schema generation failed", err);
    } finally {
      setGenerating(false);
    }
  };

  const [fixes, setFixes] = useState({});
  const [loadingFix, setLoadingFix] = useState({});
  const [copiedFixKey, setCopiedFixKey] = useState(null);

  const handleGenerateFix = async (fixKey) => {
    setLoadingFix(prev => ({ ...prev, [fixKey]: true }));
    try {
      const response = await fetch("http://127.0.0.1:5000/api/seo-data/aeo-fixes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: `https://${currentDomain}`, fixType: fixKey })
      });
      const resData = await response.json();
      if (resData.suggestion) {
        setFixes(prev => ({ ...prev, [fixKey]: resData.suggestion }));
      }
    } catch (err) {
      console.error("Failed to generate AEO fix", err);
    } finally {
      setLoadingFix(prev => ({ ...prev, [fixKey]: false }));
    }
  };

  const handleCopyFix = (fixKey, text) => {
    navigator.clipboard.writeText(text);
    setCopiedFixKey(fixKey);
    setTimeout(() => setCopiedFixKey(null), 2000);
  };

  const titleIssues = seoData.website?.technicalAudit?.topIssues?.filter(issue => issue.message.toLowerCase().includes("title")) || [];
  const titleStatus = titleIssues.length === 0 ? "Passed" : titleIssues[0].type === "error" ? "Error" : "Warning";
  const titleDetail = titleIssues.length === 0 ? "Format the <title> tag to clearly state the page intent in 50-60 characters. Answer engines pull headings and title elements to verify topic coverage." : titleIssues[0].message;

  const h1Issues = seoData.website?.technicalAudit?.topIssues?.filter(issue => issue.message.toLowerCase().includes("h1")) || [];
  const h1Status = h1Issues.length === 0 ? "Passed" : h1Issues[0].type === "error" ? "Error" : "Warning";
  const h1Detail = h1Issues.length === 0 ? "Exactly one H1 tag found on the target page." : h1Issues[0].message;

  const solutions = [
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
      icon: Code2,
      isSchema: true,
      metric: 'Vital'
    },
    {
      key: 'layout',
      name: 'Information Architecture (Lists/Tables)',
      status: data.readabilityAnalysis?.tablePresence ? 'Passed' : 'Warning',
      instruction: 'Reformat unstructured text blocks into standard HTML tables and lists. LLMs parse tabular data significantly better than paragraphs.',
      icon: BarChart3,
      metric: 'Medium'
    }
  ];

  // Light theme syntax highlighting mock
  const highlightJSON = (text) => {
    let html = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") // escape HTML
      .replace(/("[^"]*")(\s*:)/g, '<span class="text-blue-600 font-medium">$1</span>$2') // Keys
      .replace(/:\s*("[^"]*")/g, ': <span class="text-emerald-600">$1</span>') // String values
      .replace(/:\s*(true|false|null)/g, ': <span class="text-rose-600 font-bold">$1</span>') // Booleans
      .replace(/:\s*([0-9.]+)/g, ': <span class="text-amber-600">$1</span>'); // Numbers
    return html;
  };

  const aeoColor = aeoScore >= 80 ? 'text-emerald-500' : aeoScore >= 50 ? 'text-amber-500' : 'text-rose-500';
  const aeoStroke = aeoScore >= 80 ? '#10b981' : aeoScore >= 50 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-12">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-multiply"></div>
        <div className="absolute -left-32 -top-32 w-96 h-96 bg-rankgenie-orange/10 blur-[100px] rounded-full group-hover:bg-rankgenie-orange/20 transition-colors duration-1000"></div>
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-blue-500/5 blur-[80px] rounded-full"></div>
        
        <div className="relative p-10 md:p-14 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rankgenie-orange/10 border border-rankgenie-orange/20 text-rankgenie-orange text-xs font-bold uppercase tracking-widest backdrop-blur-md mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Core Optimization
            </div>
            <h1 className="text-2xl md:text-2xl font-black tracking-tight text-slate-900 leading-tight">
              Answer Engine <br className="hidden md:block"/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rankgenie-orange to-orange-400">
                Optimization (AEO)
              </span>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed font-medium max-w-2xl">
              Optimize your digital presence for LLMs, Voice Search, and AI Overviews. We analyze your structural readiness to be cited as a direct answer by modern Answer Engines.
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <div className="relative bg-white/80 backdrop-blur-xl border border-slate-200/60 p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center min-w-[240px] transform hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50/50 rounded-3xl pointer-events-none"></div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4 relative z-10">Target Entity</p>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 relative z-10 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-mono font-bold text-slate-700">{currentDomain || "example.com"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Radial Chart */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-lg relative overflow-hidden flex flex-col items-center justify-center group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rankgenie-orange to-transparent opacity-30"></div>
          
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">AEO Readiness Index</h3>
          
          <div className="relative flex items-center justify-center w-64 h-64">
            {/* Outer decorative ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none opacity-40 group-hover:rotate-180 transition-transform duration-[10s] ease-linear">
              <circle cx="128" cy="128" r="115" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 8" fill="transparent" />
            </svg>
            
            {/* Background ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="128" cy="128" r="90" stroke="#f1f5f9" strokeWidth="16" fill="transparent" />
              <circle
                cx="128"
                cy="128"
                r="90"
                stroke={aeoStroke}
                strokeWidth="16"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 90}
                strokeDashoffset={2 * Math.PI * 90 * (1 - aeoScore / 100)}
                strokeLinecap="round"
                className="transition-all duration-1500 ease-out"
                style={{ filter: `drop-shadow(0 4px 6px ${aeoStroke}40)` }}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-black tracking-tighter ${aeoColor}`}>
                {aeoScore}
              </span>
              <span className="text-slate-400 text-sm font-bold uppercase tracking-wider mt-1">/ 100</span>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4 w-full">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Industry Avg</p>
              <p className="text-lg font-black text-slate-700">65.0</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Percentile</p>
              <p className="text-lg font-black text-rankgenie-orange">Top {Math.max(1, Math.round(100 - aeoScore))}%</p>
            </div>
          </div>
        </div>

        {/* Sub-metrics & Knowledge Graph */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full"></div>
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                   <Network className="w-5 h-5 text-blue-500" />
                 </div>
                 <h4 className="text-slate-700 font-bold">Schema Health</h4>
               </div>
               <p className="text-3xl font-black text-slate-900 mb-2">{schemaAnalysis.schemaScore || 0}<span className="text-sm text-slate-400 font-medium ml-1">/ 100</span></p>
               <p className="text-xs text-slate-500">Validates structured JSON-LD presence for rich results.</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] rounded-full"></div>
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                   <Brain className="w-5 h-5 text-purple-500" />
                 </div>
                 <h4 className="text-slate-700 font-bold">NLP Readability</h4>
               </div>
               <p className="text-3xl font-black text-slate-900 mb-2">{data.readabilityAnalysis?.score || 0}<span className="text-sm text-slate-400 font-medium ml-1">/ 100</span></p>
               <p className="text-xs text-slate-500">Measures content parsing ease for LLM tokenizers.</p>
            </div>
          </div>

          {/* Deep Scan Results */}
          <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-lg flex flex-col">
             <div className="flex items-center justify-between mb-6">
               <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                 <Search className="w-4 h-4 text-rankgenie-orange" />
                 Knowledge Graph Extraction Points
               </h4>
               <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-500 shadow-sm">
                 {scrapedUrls.length} Nodes Discovered
               </span>
             </div>
             
             {scrapedUrls.length > 0 ? (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[160px] pr-2">
                  {scrapedUrls.map((url, idx) => (
                    <div key={idx} className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <span className="text-sm font-mono text-slate-600 truncate group-hover:text-slate-900 transition-colors">{url}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <AlertTriangle className="w-8 h-8 text-amber-500/70 mb-3" />
                  <p className="text-sm text-slate-500 font-medium">No active extraction nodes found.</p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Technical Solutions section */}
      <div className="mt-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-rankgenie-orange to-orange-500 rounded-2xl shadow-[0_4px_15px_rgba(255,100,13,0.2)]">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">AEO Diagnostic Resolutions</h2>
            <p className="text-sm text-slate-500 font-medium">AI-powered fixes to align with Answer Engine algorithms.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {solutions.map((sol, idx) => {
            const Icon = sol.icon;
            const suggestionText = fixes[sol.key];
            const isExpanded = expandedFix === sol.key;
            
            let statusColor = sol.status === 'Passed' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 
                              sol.status === 'Warning' ? 'text-amber-700 bg-amber-50 border-amber-200' : 
                              'text-rose-700 bg-rose-50 border-rose-200';

            return (
              <div 
                key={idx} 
                className={`relative bg-white border ${isExpanded ? 'border-rankgenie-orange ring-2 ring-rankgenie-orange/20 shadow-lg' : 'border-slate-200 shadow-sm'} rounded-3xl p-6 transition-all duration-300 hover:shadow-md flex flex-col`}
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm group-hover:scale-105 transition-transform">
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

                {/* Fix Generation Area */}
                {!sol.isSchema && sol.status !== 'Passed' && (
                  <div className="mt-auto">
                    {suggestionText ? (
                      <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                        <div className="bg-white px-4 py-2 border-b border-slate-200 flex justify-between items-center shadow-sm">
                          <span className="text-[10px] text-rankgenie-orange font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> AI Resolution
                          </span>
                          <button
                            onClick={() => handleCopyFix(sol.key, suggestionText)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                            title="Copy Fix"
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
                        onClick={() => handleGenerateFix(sol.key)}
                        disabled={loadingFix[sol.key]}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold transition-colors disabled:opacity-50"
                      >
                        {loadingFix[sol.key] ? (
                          <div className="w-5 h-5 border-2 border-slate-300 border-t-rankgenie-orange rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 text-rankgenie-orange" />
                            Generate AI Fix
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
                
                {sol.isSchema && (
                  <div className="mt-auto p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                    <p className="text-xs text-blue-700 font-medium">
                      Configure via the unified IDE environment below.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* JSON-LD Schema IDE */}
      <div className="mt-12 rounded-[2rem] overflow-hidden border border-slate-200 shadow-xl bg-white">
        {/* IDE Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-mono text-slate-600 font-medium">schema.jsonld</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateSchema}
              disabled={generating}
              className="group relative flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-rankgenie-orange to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {generating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
              )}
              {generating ? "Synthesizing..." : "Synthesize Schema"}
            </button>
            <button
              onClick={handleCopySchema}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition-colors border border-slate-200 shadow-sm"
            >
              {copiedSchema ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>
        
        {/* IDE Body */}
        <div className="relative group flex">
          <div className="w-12 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-4 text-slate-400 font-mono text-xs select-none">
            {currentSchemaText.split('\n').map((_, i) => (
              <div key={i} className="h-6 leading-6">{i + 1}</div>
            ))}
          </div>
          <pre className="flex-1 p-4 overflow-x-auto text-sm leading-6 font-mono bg-white text-slate-800 min-h-[300px]"
            dangerouslySetInnerHTML={{ __html: highlightJSON(currentSchemaText) }}
          />
        </div>
      </div>
    </div>
  );
}
