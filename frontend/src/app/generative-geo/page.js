"use client";

import React, { useState } from "react";
import { useSeo } from "@/context/SeoContext";
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  TrendingUp,
  Globe2,
  ShieldCheck,
  AlignLeft,
  MessageSquare,
  Copy,
  Check,
  Terminal,
  Zap,
  Network,
  Brain,
  Search,
  LayoutTemplate
} from "lucide-react";

export default function GenerativeGeoPage() {
  const { seoData, currentDomain } = useSeo();
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [expandedFix, setExpandedFix] = useState(null);

  if (!seoData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 bg-white rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-white to-white"></div>
        <FileText className="w-16 h-16 text-blue-500 animate-bounce relative z-10 mb-6 drop-shadow-md" />
        <h2 className="text-lg font-black text-slate-800 relative z-10 tracking-tight mb-2">Initializing GEO Matrix</h2>
        <p className="text-slate-500 relative z-10 font-medium">Analyzing E-E-A-T signals and factual density...</p>
      </div>
    );
  }

  const data = seoData.aeoGeo || {};
  const geoScore = data.geoScore || 0;
  const textDensity = data.textDensity || {};
  const keywords = data.conversationalKeywords || [];
  const dbSuggestions = data.suggestions || {};

  const [aiPrompt, setAiPrompt] = useState(null);
  const [generating, setGenerating] = useState(false);

  const defaultPrompt = `System Prompt: Content Optimization Agent
Objective: Enhance the factual density and conversational fluency for ${currentDomain}.

Instructions:
1. Embed concrete metrics and numerical data (Factual Density Target: >70%).
2. Clearly state author credentials and trust signals (E-E-A-T optimization).
3. Ensure direct, concise Q&A formatting for Voice Search and AI Overviews.
4. Maintain a professional, authoritative tone without unnecessary filler.

Target Keywords (Conversational):
${keywords.length > 0 ? keywords.map(k => "- " + k.keyword).join('\n') : "- General informative queries"}
`;

  const currentPromptText = aiPrompt || defaultPrompt;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(currentPromptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleGeneratePrompt = async () => {
    setGenerating(true);
    try {
      // Simulate API call for prompt generation
      setTimeout(() => {
        setAiPrompt(`System Prompt: Optimized GEO Agent
Objective: Enhance AI readiness for ${currentDomain}

Generated Output:
- Factual Density: Optimized
- Conversational Q&A: Integrated
- E-E-A-T Signals: Embedded
`);
        setGenerating(false);
      }, 1500);
    } catch (err) {
      console.error("Prompt generation failed", err);
      setGenerating(false);
    }
  };

  const [fixes, setFixes] = useState({});
  const [loadingFix, setLoadingFix] = useState({});
  const [copiedFixKey, setCopiedFixKey] = useState(null);

  const handleGenerateFix = async (fixKey) => {
    setLoadingFix(prev => ({ ...prev, [fixKey]: true }));
    try {
      const response = await fetch("http://127.0.0.1:5000/api/seo-data/geo-fixes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: `https://${currentDomain}`, fixType: fixKey })
      });
      const resData = await response.json();
      if (resData.suggestion) {
        setFixes(prev => ({ ...prev, [fixKey]: resData.suggestion }));
      }
    } catch (err) {
      console.error("Failed to generate GEO fix", err);
    } finally {
      setLoadingFix(prev => ({ ...prev, [fixKey]: false }));
    }
  };

  const handleCopyFix = (fixKey, text) => {
    navigator.clipboard.writeText(text);
    setCopiedFixKey(fixKey);
    setTimeout(() => setCopiedFixKey(null), 2000);
  };

  const solutions = [
    {
      key: 'stats',
      name: 'Quantifiable Statistics Infusion',
      status: textDensity.factualDensityScore > 50 ? 'Passed' : 'Warning',
      instruction: 'Add concrete metrics, statistics, or chronological values. LLMs prioritize sentences featuring quantifiable numerical data when citing sources.',
      defaultSuggestion: dbSuggestions.stats,
      icon: AlignLeft,
      metric: 'Critical'
    },
    {
      key: 'authority',
      name: 'Author Credentials & Trust Indicators',
      status: textDensity.eeatScore > 50 ? 'Passed' : 'Warning',
      instruction: 'Include clear author credentials, affiliations, and expert tone profiles. Generative crawlers use credentials to measure authority values.',
      defaultSuggestion: dbSuggestions.authority,
      icon: ShieldCheck,
      metric: 'High'
    },
    {
      key: 'fluency',
      name: 'Direct Conversational Answers',
      status: keywords.length > 0 ? 'Passed' : 'Warning',
      instruction: 'Deploy direct, concise Q&A summary paragraphs. Generative engines crawl for clear answers explaining who, what, why, and how without unnecessary filler.',
      defaultSuggestion: dbSuggestions.fluency,
      icon: MessageSquare,
      metric: 'Medium'
    },
    {
      key: 'prompt',
      name: 'System Prompt Architecture',
      status: 'Passed',
      instruction: 'Configure the AI agent system prompt to enforce tone, factual consistency, and layout rules across all generative content.',
      icon: Terminal,
      isPrompt: true,
      metric: 'Vital'
    }
  ];

  const highlightText = (text) => {
    let html = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") // escape HTML
      .replace(/(System Prompt:|Objective:|Instructions:|Target Keywords \(Conversational\):)/g, '<span class="text-blue-600 font-bold">$1</span>') // Headers
      .replace(/(Factual Density Target:|>70%|E-E-A-T optimization)/g, '<span class="text-emerald-600 font-medium">$1</span>') // Metrics
      .replace(/(- )/g, '<span class="text-slate-400">$1</span>'); // List items
    return html;
  };

  const geoColor = geoScore >= 80 ? 'text-emerald-500' : geoScore >= 50 ? 'text-blue-500' : 'text-rose-500';
  const geoStroke = geoScore >= 80 ? '#10b981' : geoScore >= 50 ? '#3b82f6' : '#f43f5e';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-12">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-multiply"></div>
        <div className="absolute -left-32 -top-32 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-colors duration-1000"></div>
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-indigo-500/5 blur-[80px] rounded-full"></div>
        
        <div className="relative p-10 md:p-14 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 text-xs font-bold uppercase tracking-widest backdrop-blur-md mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Content Optimization
            </div>
            <h1 className="text-2xl md:text-2xl font-black tracking-tight text-slate-900 leading-tight">
              Generative Engine <br className="hidden md:block"/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Optimization (GEO)
              </span>
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed font-medium max-w-2xl">
              Optimize your digital presence for LLMs, Voice Search, and AI Overviews. We analyze your structural readiness to be cited as a direct answer by modern Generative Engines.
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <div className="relative bg-white/80 backdrop-blur-xl border border-slate-200/60 p-6 rounded-3xl shadow-xl flex flex-col items-center justify-center min-w-[240px] transform hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50/50 rounded-3xl pointer-events-none"></div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4 relative z-10">Target Entity</p>
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 relative z-10 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
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
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30"></div>
          
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">GEO Readiness Index</h3>
          
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
                stroke={geoStroke}
                strokeWidth="16"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 90}
                strokeDashoffset={2 * Math.PI * 90 * (1 - geoScore / 100)}
                strokeLinecap="round"
                className="transition-all duration-1500 ease-out"
                style={{ filter: `drop-shadow(0 4px 6px ${geoStroke}40)` }}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-black tracking-tighter ${geoColor}`}>
                {geoScore}
              </span>
              <span className="text-slate-400 text-sm font-bold uppercase tracking-wider mt-1">/ 100</span>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-4 w-full">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Industry Avg</p>
              <p className="text-lg font-black text-slate-700">60.0</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center shadow-sm">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Percentile</p>
              <p className="text-lg font-black text-blue-500">Top {Math.max(1, Math.round(100 - geoScore))}%</p>
            </div>
          </div>
        </div>

        {/* Sub-metrics & Keywords */}
        <div className="lg:col-span-7 space-y-6 flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full"></div>
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                   <AlignLeft className="w-5 h-5 text-blue-500" />
                 </div>
                 <h4 className="text-slate-700 font-bold">Factual Density</h4>
               </div>
               <p className="text-3xl font-black text-slate-900 mb-2">{textDensity.factualDensityScore || 0}<span className="text-sm text-slate-400 font-medium ml-1">/ 100</span></p>
               <p className="text-xs text-slate-500">Measures the concentration of hard facts and entities.</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] rounded-full"></div>
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                   <ShieldCheck className="w-5 h-5 text-indigo-500" />
                 </div>
                 <h4 className="text-slate-700 font-bold">Authority (E-E-A-T)</h4>
               </div>
               <p className="text-3xl font-black text-slate-900 mb-2">{textDensity.eeatScore || 0}<span className="text-sm text-slate-400 font-medium ml-1">/ 100</span></p>
               <p className="text-xs text-slate-500">Evaluates author credentials and trust indicators.</p>
            </div>
          </div>

          {/* Deep Scan Results */}
          <div className="flex-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-lg flex flex-col">
             <div className="flex items-center justify-between mb-6">
               <h4 className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                 <MessageSquare className="w-4 h-4 text-blue-500" />
                 Conversational AI Keywords
               </h4>
               <span className="px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-500 shadow-sm">
                 {keywords.length} Discovered
               </span>
             </div>
             
             {keywords.length > 0 ? (
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[160px] pr-2">
                  {keywords.map((kw, idx) => (
                    <div key={idx} className="relative group">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5 z-10 relative">
                        <span className="truncate pr-4">{kw.keyword}</span>
                        <span className="flex-shrink-0 text-blue-600">{kw.aiSearchCitationProbability}% Probability</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-lg h-8 overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg transition-all duration-1000 ease-out" 
                          style={{ width: `${kw.aiSearchCitationProbability}%` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center px-3 text-[10px] text-slate-900 font-medium z-20">
                          Vol: {kw.volume} | Intent: {kw.intent}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <AlertTriangle className="w-8 h-8 text-amber-500/70 mb-3" />
                  <p className="text-sm text-slate-500 font-medium">No conversational keywords found.</p>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Generative Solutions section */}
      <div className="mt-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-[0_4px_15px_rgba(59,130,246,0.2)]">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">GEO Diagnostic Resolutions</h2>
            <p className="text-sm text-slate-500 font-medium">AI-powered fixes to align with Generative Engine algorithms.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {solutions.map((sol, idx) => {
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
                {!sol.isPrompt && (
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
                          <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 text-blue-500" />
                            Generate AI Fix
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
                
                {sol.isPrompt && (
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

      {/* System Prompt Console / IDE */}
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
              <span className="text-xs font-mono text-slate-600 font-medium">system-prompt.txt</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleGeneratePrompt}
              disabled={generating}
              className="group relative flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {generating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
              )}
              {generating ? "Synthesizing..." : "Synthesize Prompt"}
            </button>
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition-colors border border-slate-200 shadow-sm"
            >
              {copiedPrompt ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>
        
        {/* IDE Body */}
        <div className="relative group flex">
          <div className="w-12 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-4 text-slate-400 font-mono text-xs select-none">
            {currentPromptText.split('\n').map((_, i) => (
              <div key={i} className="h-6 leading-6">{i + 1}</div>
            ))}
          </div>
          <pre className="flex-1 p-4 overflow-x-auto text-sm leading-6 font-mono bg-white text-slate-800 min-h-[300px]"
            dangerouslySetInnerHTML={{ __html: highlightText(currentPromptText) }}
          />
        </div>
      </div>
    </div>
  );
}
