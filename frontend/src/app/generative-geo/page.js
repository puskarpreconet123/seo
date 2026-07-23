"use client";

import React, { useState, useEffect } from "react";
import { useSeo } from "@/context/SeoContext";
import {
  Bot,
  Search,
  Sparkles,
  ShieldCheck,
  AlignLeft,
  MessageSquare,
  Copy,
  Check,
  Zap,
  Terminal,
  Target
} from "lucide-react";

export default function GenerativeGeoPage() {
  const { seoData, currentDomain } = useSeo();

  // State for GEO Fixes
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

  // Generate GEO Copywriting & Prompt Fixes
  const handleGenerateGeoFix = async (fixKey) => {
    setLoadingFix((prev) => ({ ...prev, [fixKey]: true }));
    try {
      if (fixKey === 'prompt') {
        setTimeout(() => {
          setFixes((prev) => ({
            ...prev,
            prompt: `System Prompt: Optimized GEO Content Agent\nObjective: Optimize ${currentDomain} content for Generative Engines.\n\nRules:\n1. Infuse concrete statistics and factual metrics.\n2. Add authoritative author profiles (E-E-A-T).\n3. Structure sections using conversational Q&A prompts.`
          }));
          setLoadingFix((prev) => ({ ...prev, [fixKey]: false }));
        }, 1200);
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/api/seo-data/geo-fixes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: `https://${currentDomain}`, fixType: fixKey })
      });
      const resData = await response.json();
      if (resData.suggestion) {
        setFixes((prev) => ({ ...prev, [fixKey]: resData.suggestion }));
      }
    } catch (err) {
      console.error("Failed to generate GEO fix", err);
    } finally {
      if (fixKey !== 'prompt') {
        setLoadingFix((prev) => ({ ...prev, [fixKey]: false }));
      }
    }
  };

  const handleCopyFix = (fixKey, text) => {
    navigator.clipboard.writeText(text);
    setCopiedFixKey(fixKey);
    setTimeout(() => setCopiedFixKey(null), 2000);
  };

  // =========================================================
  // PRE-CALCULATE GEO DATA VARIABLES
  // =========================================================
  const geoDataObj = seoData.aeoGeo || {};
  const geoScore = geoDataObj.geoScore || 0;
  const textDensity = geoDataObj.textDensity || {};
  const keywords = geoDataObj.conversationalKeywords || [];
  const geoSuggestions = geoDataObj.suggestions || {};

  const geoSolutions = [
    {
      key: 'stats',
      name: 'Quantifiable Statistics Infusion',
      status: textDensity.factualDensityScore > 50 ? 'Passed' : 'Warning',
      instruction: 'Add concrete metrics, statistics, or chronological values. LLMs prioritize sentences featuring quantifiable numerical data when citing sources.',
      defaultSuggestion: geoSuggestions.stats,
      icon: AlignLeft,
      metric: 'Critical'
    },
    {
      key: 'authority',
      name: 'Author Credentials & Trust Indicators',
      status: textDensity.eeatScore > 50 ? 'Passed' : 'Warning',
      instruction: 'Include clear author credentials, affiliations, and expert tone profiles. Generative crawlers use credentials to measure authority values.',
      defaultSuggestion: geoSuggestions.authority,
      icon: ShieldCheck,
      metric: 'High'
    },
    {
      key: 'fluency',
      name: 'Direct Conversational Answers',
      status: keywords.length > 0 ? 'Passed' : 'Warning',
      instruction: 'Deploy direct, concise Q&A summary paragraphs. Generative engines crawl for clear answers explaining who, what, why, and how without unnecessary filler.',
      defaultSuggestion: geoSuggestions.fluency,
      icon: MessageSquare,
      metric: 'Medium'
    },
    {
      key: 'prompt',
      name: 'System Prompt Architecture',
      status: 'Passed',
      instruction: 'Configure the AI agent system prompt to enforce tone, factual consistency, and layout rules across all generative content.',
      defaultSuggestion: geoSuggestions.prompt,
      icon: Terminal,
      metric: 'Vital'
    }
  ];

  const geoColor = geoScore >= 80 ? 'text-emerald-500' : geoScore >= 50 ? 'text-blue-500' : 'text-rose-500';
  const geoStroke = geoScore >= 80 ? '#10b981' : geoScore >= 50 ? '#3b82f6' : '#f43f5e';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-12">
      {/* Premium Light Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-orange-50/20 p-8 md:p-12 rounded-[2rem] border border-slate-200 shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent opacity-60"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-rankgenie-orange text-xs font-bold uppercase tracking-widest">
              <Bot className="w-3.5 h-3.5" /> Content GEO
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-slate-900">
              Generative Engine Optimization <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rankgenie-orange to-amber-500">
                GEO Content Assistant
              </span>
            </h1>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl leading-relaxed font-medium">
              Grade factual density levels, identify conversational search queries, and optimize content structure for Generative AI search visibility.
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

      {/* Radial grade + metrics cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radial score card */}
        <div className="lg:col-span-5 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-md flex flex-col items-center justify-center group">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">GEO Readiness Index</h3>
          
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
                stroke={geoStroke}
                strokeWidth="14"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 80}
                strokeDashoffset={2 * Math.PI * 80 * (1 - geoScore / 100)}
                strokeLinecap="round"
                className="transition-all duration-1500 ease-out"
                style={{ filter: `drop-shadow(0 4px 6px ${geoStroke}40)` }}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black tracking-tighter ${geoColor}`}>{geoScore}</span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">/ 100</span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4 w-full">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center shadow-sm">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Industry Avg</p>
              <p className="text-base font-black text-slate-700">60.0</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center shadow-sm">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Percentile</p>
              <p className="text-base font-black text-blue-500">Top {Math.max(1, Math.round(100 - geoScore))}%</p>
            </div>
          </div>
        </div>

        {/* Factual metrics and keywords columns */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md relative overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                  <AlignLeft className="w-5 h-5 text-blue-500" />
                </div>
                <h4 className="text-slate-700 font-bold text-sm">Factual Density</h4>
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">{textDensity.factualDensityScore || 0}<span className="text-sm text-slate-400 font-medium ml-1">/ 100</span></p>
              <p className="text-xs text-slate-500">Measures the concentration of hard facts and entities.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md relative overflow-hidden">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                </div>
                <h4 className="text-slate-700 font-bold text-sm">Authority (E-E-A-T)</h4>
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">{textDensity.eeatScore || 0}<span className="text-sm text-slate-400 font-medium ml-1">/ 100</span></p>
              <p className="text-xs text-slate-500">Evaluates author credentials and trust indicators.</p>
            </div>
          </div>

          {/* Conversational Keywords list */}
          <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-md flex flex-col mt-2">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                Conversational AI Keywords
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-500">
                {keywords.length} Discovered
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-40 flex flex-wrap gap-2 pr-1">
              {keywords.length > 0 ? (
                keywords.map((kw, kwIdx) => (
                  <span
                    key={kwIdx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <Search className="w-3 h-3 text-slate-400" />
                    {kw.keyword}
                  </span>
                ))
              ) : (
                <p className="text-xs text-slate-400 font-bold my-auto text-center w-full">
                  No specific conversational keywords scraped. Try adding more long-tail questions to your page!
                </p>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Resolutions checklist */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-500" />
          GEO Diagnostic Solutions
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {geoSolutions.map((sol, idx) => {
            const Icon = sol.icon;
            const suggestionText = fixes[sol.key] || sol.defaultSuggestion;
            const isExpanded = expandedFix === sol.key;
            
            let statusColor = sol.status === 'Passed' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 
                              sol.status === 'Warning' ? 'text-amber-700 bg-amber-50 border-amber-200' : 
                              'text-rose-700 bg-rose-50 border-rose-200';

            return (
              <div 
                key={idx} 
                className={`relative bg-white border ${isExpanded ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg' : 'border-slate-200 shadow-sm'} rounded-3xl p-6 transition-all duration-300 hover:shadow-md flex flex-col`}
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

                {/* Generate Copywriting Action */}
                <div className="mt-auto">
                  {suggestionText ? (
                    <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                      <div className="bg-white px-4 py-2 border-b border-slate-200 flex justify-between items-center shadow-sm">
                        <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest flex items-center gap-1.5">
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
                      onClick={() => handleGenerateGeoFix(sol.key)}
                      disabled={loadingFix[sol.key]}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {loadingFix[sol.key] ? (
                        <div className="w-5.5 h-5.5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-blue-500" />
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
