"use client";

import React, { useState, useEffect } from "react";
import { useSeo } from "@/context/SeoContext";
import {
  Bot,
  Search,
  CheckCircle2,
  AlertCircle,
  Globe,
  PieChart,
  ListOrdered,
  XCircle,
  Sparkles,
  RefreshCw,
  Target,
  Layers
} from "lucide-react";

export default function AiSimulatorPage() {
  const { seoData, currentDomain } = useSeo();

  // State for Multi-Query SOV Auditor
  const [auditBrand, setAuditBrand] = useState("");
  const [auditUrl, setAuditUrl] = useState("");
  const [auditCompetitors, setAuditCompetitors] = useState("");
  const [auditNiche, setAuditNiche] = useState("");
  const [auditAnalyzing, setAuditAnalyzing] = useState(false);
  const [auditError, setAuditError] = useState(null);
  const [auditResults, setAuditResults] = useState(null);

  // Sync default brand name and URL when currentDomain changes
  useEffect(() => {
    if (currentDomain) {
      const cleanDom = getCleanDomain(currentDomain);
      const brandNameOnly = cleanDom.split(".")[0];
      setAuditUrl(currentDomain);
      setAuditBrand(brandNameOnly);
    }
  }, [currentDomain]);

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

  // URL Sanitization Helper
  const getCleanDomain = (url) => {
    if (!url) return "";
    let clean = url.trim().toLowerCase();
    if (clean.includes("://")) {
      try {
        clean = new URL(clean).hostname;
      } catch (e) {
        clean = clean.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
      }
    } else {
      clean = clean.split("/")[0];
    }
    return clean.startsWith("www.") ? clean.substring(4) : clean;
  };

  // Run Campaign Audit Analysis
  const handleRunAudit = async (e) => {
    e.preventDefault();
    if (!auditBrand.trim() || !auditUrl.trim() || !auditNiche.trim()) {
      setAuditError("Brand Name, Website URL, and Business Niche are required.");
      return;
    }

    setAuditAnalyzing(true);
    setAuditError(null);
    setAuditResults(null);

    const domain = getCleanDomain(auditUrl);
    const competitors = auditCompetitors.trim()
      ? auditCompetitors.split(",").map((c) => c.trim()).filter(Boolean)
      : [];

    try {
      const response = await fetch("http://127.0.0.1:5000/api/seo-data/ai-visibility-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          brandName: auditBrand.trim(),
          competitors,
          niche: auditNiche.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process campaign AI visibility audit");
      }

      const data = await response.json();
      setAuditResults(data);
    } catch (err) {
      console.error(err);
      setAuditError(err.message || "An error occurred while running the campaign visibility audit. Please try again.");
    } finally {
      setAuditAnalyzing(false);
    }
  };

  // Sorting SOV list descending
  const sortedSOV = auditResults?.shareOfVoice
    ? [...auditResults.shareOfVoice].sort((a, b) => b.sov - a.sov)
    : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-12">
      {/* Premium Light Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50/50 to-orange-50/20 p-8 md:p-12 rounded-[2rem] border border-slate-200 shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent opacity-60"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-rankgenie-orange text-xs font-bold uppercase tracking-widest">
              <Bot className="w-3.5 h-3.5" /> Generative Search Audit
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight text-slate-900">
              AI Share of Voice & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rankgenie-orange to-amber-500">
                LLM Brand Preference
              </span>
            </h1>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl leading-relaxed font-medium">
              Verify AI Share of voice against rivals, simulate citations across multiple search queries, and analyze brand visibility metrics.
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

      {/* Campaign Auditor view */}
      <div className="space-y-8">
        {/* Config Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-2">
            <PieChart className="w-4.5 h-4.5 text-rankgenie-orange" />
            Campaign Share of Voice Parameters
          </h3>
          
          <form onSubmit={handleRunAudit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  My Brand Name
                </label>
                <input
                  type="text"
                  value={auditBrand}
                  onChange={(e) => setAuditBrand(e.target.value)}
                  placeholder="e.g. Preconet"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rankgenie-orange/20 focus:border-rankgenie-orange text-sm font-semibold transition-all"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Target Website URL / Domain
                </label>
                <input
                  type="text"
                  value={auditUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAuditUrl(val);
                    const cleanDom = getCleanDomain(val);
                    const brandNameOnly = cleanDom.split(".")[0];
                    if (brandNameOnly) {
                      setAuditBrand(brandNameOnly);
                    }
                  }}
                  placeholder="e.g. preconet.in"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rankgenie-orange/20 focus:border-rankgenie-orange text-sm font-semibold transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Competitor Brands (Optional)</span>
                  <span className="text-[9px] text-slate-400 font-bold normal-case">Leave blank to auto-discover</span>
                </label>
                <input
                  type="text"
                  value={auditCompetitors}
                  onChange={(e) => setAuditCompetitors(e.target.value)}
                  placeholder="e.g. Semrush, Ahrefs (or leave blank)"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rankgenie-orange/20 focus:border-rankgenie-orange text-sm font-semibold transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Business Niche / Focus Industry Keywords
                </label>
                <input
                  type="text"
                  value={auditNiche}
                  onChange={(e) => setAuditNiche(e.target.value)}
                  placeholder="e.g. Web Development India"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rankgenie-orange/20 focus:border-rankgenie-orange text-sm font-semibold transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
              <p className="text-[10px] text-slate-400 font-bold max-w-md">
                We generate niche search prompts, simulate ChatGPT/Gemini/Claude/Perplexity citations, and calculate visibility rates. Leaving competitors blank dynamically extracts rival brands from AI answers.
              </p>
              <button
                type="submit"
                disabled={auditAnalyzing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rankgenie-orange hover:bg-orange-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {auditAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Auditing Prompts...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Run Campaign Audit
                  </>
                )}
              </button>
            </div>
          </form>

          {auditError && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-700 text-sm font-semibold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{auditError}</span>
            </div>
          )}
        </div>

        {/* Audit Results Dashboard */}
        {auditResults && (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* Share of Voice Visual & Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* 1. Share of Voice visual */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-md flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-rankgenie-orange" />
                    Competitor Share of Voice
                  </h4>
                  <p className="text-xs text-slate-400 font-bold mb-6">Percentage share of total LLM recommendations</p>
                </div>

                <div className="space-y-6 py-4">
                  {sortedSOV.map((item, idx) => {
                    const colors = ["bg-orange-500", "bg-blue-500", "bg-indigo-500", "bg-teal-500", "bg-slate-400"];
                    const color = colors[idx % colors.length];

                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>{item.brand}</span>
                          <span className="text-slate-900">{item.sov}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ${color}`}
                            style={{ width: `${item.sov}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Leaderboard table */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-md flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <ListOrdered className="w-4 h-4 text-rankgenie-orange" />
                    Overall Leaderboard
                  </h4>
                  <p className="text-xs text-slate-400 font-bold mb-6">Comparative visibility scores and index rates</p>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[10px] text-slate-400 font-extrabold uppercase">
                        <th className="py-2.5 pb-4">Brand</th>
                        <th className="py-2.5 pb-4 text-center">AI Visibility</th>
                        <th className="py-2.5 pb-4 text-center">Citation Rate</th>
                        <th className="py-2.5 pb-4 text-center">Mention Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                      {auditResults.overallScores.map((scoreObj, sIdx) => {
                        const isTarget = scoreObj.brand.toLowerCase() === auditBrand.toLowerCase();
                        return (
                          <tr key={sIdx} className={isTarget ? "bg-orange-50/30" : ""}>
                            <td className="py-4 font-bold flex items-center gap-2">
                              {isTarget && <span className="w-1.5 h-6 bg-rankgenie-orange rounded-full"></span>}
                              {scoreObj.brand}
                              {isTarget && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-100 text-rankgenie-orange font-bold">Target</span>}
                            </td>
                            <td className="py-4 text-center text-sm font-black text-slate-900">
                              {scoreObj.visibilityScore}%
                            </td>
                            <td className="py-4 text-center text-slate-600 font-medium">
                              {scoreObj.citationRate}%
                            </td>
                            <td className="py-4 text-center text-slate-600 font-medium">
                              {scoreObj.mentionRate}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Prompt Citation Matrix */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 overflow-hidden">
              <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-rankgenie-orange" />
                Prompt Citation Matrix
              </h4>
              <p className="text-xs text-slate-400 font-bold mb-6">Audit breakdown of brand citation outcomes across niche queries</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] text-slate-400 font-extrabold uppercase">
                      <th className="py-3">Search Query / Prompt</th>
                      <th className="py-3 text-center">Volume</th>
                      {auditResults.overallScores.map((o, idx) => (
                        <th key={idx} className="py-3 text-center">{o.brand}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {auditResults.prompts.map((p, pIdx) => (
                      <tr key={pIdx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 font-bold max-w-sm text-slate-800 leading-normal">
                          {p.query}
                        </td>
                        <td className="py-4 text-center text-slate-500 font-mono">
                          {p.volume}
                        </td>
                        {auditResults.overallScores.map((o, bIdx) => {
                          const perf = p.brandPerformance.find(bp => bp.brand.toLowerCase() === o.brand.toLowerCase()) || { status: "none", score: 0 };
                          return (
                            <td key={bIdx} className="py-4 text-center">
                              {perf.status === "cited" ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  Cited ({perf.score})
                                </div>
                              ) : perf.status === "mentioned" ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold">
                                  <Bot className="w-3 h-3 text-blue-500" />
                                  Mentioned ({perf.score})
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 border border-slate-100 text-[10px] font-bold">
                                  <XCircle className="w-3 h-3 text-slate-300" />
                                  None
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Model Breakdown & Recommendations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* 1. Model breakdown */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-md flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Bot className="w-4 h-4 text-rankgenie-orange" />
                    LLM Performance Breakdown
                  </h4>
                  <p className="text-xs text-slate-400 font-bold mb-6">Target brand visibility score per AI Engine</p>
                </div>

                <div className="flex flex-col gap-5 py-4">
                  {[
                    {
                      name: "ChatGPT",
                      score: auditResults.modelBreakdown.ChatGPT || 0,
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 20.093 20" width="20.093" height="20">
                          <path fill="#fff" d="M4.537 0h11.019C18.051 0 20.093 2.042 20.093 4.537v10.926c0 2.495 -2.042 4.537 -4.537 4.537H4.537C2.042 20 0 17.959 0 15.463V4.537C0 2.042 2.042 0 4.537 0"/>
                          <path fillRule="nonzero" fill="#000" d="M16.17 8.703a3.563 3.563 0 0 0 0.182 -1.125 3.563 3.563 0 0 0 -0.488 -1.8c-0.642 -1.118 -1.834 -1.809 -3.124 -1.809 -0.254 0 -0.508 0.027 -0.756 0.08a3.562 3.562 0 0 0 -2.664 -1.198h-0.023c-0.002 0 -0.006 0 -0.008 0 -1.562 0 -2.948 1.008 -3.428 2.494 -1.006 0.206 -1.874 0.836 -2.381 1.728a3.607 3.607 0 0 0 -0.487 1.808 3.604 3.604 0 0 0 0.93 2.416 3.563 3.563 0 0 0 -0.182 1.125 3.563 3.563 0 0 0 0.488 1.8c0.642 1.119 1.834 1.809 3.124 1.809a3.603 3.603 0 0 0 0.756 -0.08 3.563 3.563 0 0 0 2.664 1.198h0.023l0.009 0c1.563 0 2.948 -1.008 3.428 -2.495 1.006 -0.206 1.874 -0.836 2.381 -1.728a3.599 3.599 0 0 0 0.486 -1.807 3.604 3.604 0 0 0 -0.93 -2.416zM10.796 16.214h-0.004a2.674 2.674 0 0 1 -1.711 -0.62 2.237 2.237 0 0 0 0.085 -0.048l2.847 -1.644a0.463 0.463 0 0 0 0.234 -0.402V9.483l1.203 0.695c0.013 0.006 0.022 0.019 0.023 0.033v3.324c-0.002 1.478 -1.199 2.676 -2.677 2.679zm-5.757 -2.459a2.673 2.673 0 0 1 -0.359 -1.338c0 -0.153 0.013 -0.307 0.039 -0.458 0.021 0.013 0.058 0.035 0.085 0.05l2.847 1.644a0.464 0.464 0 0 0 0.468 0l3.476 -2.007v1.39a0.043 0.043 0 0 1 -0.017 0.037l-2.878 1.662a2.685 2.685 0 0 1 -1.339 0.358 2.683 2.683 0 0 1 -2.321 -1.339zm-0.749 -6.215a2.67 2.67 0 0 1 1.395 -1.175c0 0.025 -0.001 0.068 -0.001 0.098v3.289l0 0.003a0.463 0.463 0 0 0 0.234 0.402l3.476 2.007 -1.203 0.695a0.043 0.043 0 0 1 -0.041 0.004l-2.878 -1.663a2.683 2.683 0 0 1 -1.338 -2.321 2.684 2.684 0 0 1 0.358 -1.338zm9.886 2.301 -3.476 -2.007 1.203 -0.695a0.043 0.043 0 0 1 0.041 -0.004l2.878 1.662c0.828 0.479 1.339 1.364 1.339 2.321 0 1.123 -0.7 2.127 -1.754 2.515v-3.387q0 -0.002 0 -0.004c0 -0.166 -0.089 -0.319 -0.232 -0.401m1.198 -1.802c-0.021 -0.013 -0.058 -0.035 -0.085 -0.05l-2.847 -1.644a0.465 0.465 0 0 0 -0.234 -0.063c-0.082 0 -0.163 0.022 -0.234 0.063l-3.476 2.007v-1.39l0 -0.002a0.043 0.043 0 0 1 0.017 -0.035l2.878 -1.66a2.68 2.68 0 0 1 1.339 -0.358c1.48 0 2.68 1.2 2.68 2.68a2.696 2.696 0 0 1 -0.039 0.453zm-7.529 2.477 -1.204 -0.695a0.043 0.043 0 0 1 -0.023 -0.033v-3.324c0.001 -1.479 1.201 -2.678 2.68 -2.678a2.682 2.682 0 0 1 1.715 0.62 2.472 2.472 0 0 0 -0.085 0.048l-2.847 1.644a0.463 0.463 0 0 0 -0.234 0.402v0.003zm0.654 -1.409 1.548 -0.894 1.548 0.893v1.788l-1.548 0.893 -1.548 -0.893z"/>
                        </svg>
                      )
                    },
                    {
                      name: "Claude 3.5 Sonnet",
                      score: auditResults.modelBreakdown.Claude || 0,
                      icon: (
                        <svg viewBox="0 0 20 20" width="20" height="20"><path d="M19.997 4.178v11.605c-0.048 0.091 -0.022 0.221 -0.043 0.321 -0.047 0.227 -0.079 0.461 -0.151 0.681 -0.283 0.864 -0.972 1.903 -1.772 2.386 -0.541 0.327 -1.075 0.568 -1.692 0.708 -0.451 0.102 -0.943 0.084 -1.406 0.084h-8.457c-0.736 0 -1.497 0.052 -2.227 -0.025 -0.195 -0.021 -0.395 -0.016 -0.586 -0.059 -0.617 -0.139 -1.15 -0.38 -1.692 -0.708 -0.8 -0.484 -1.49 -1.523 -1.772 -2.386 -0.072 -0.22 -0.104 -0.454 -0.151 -0.681 -0.021 -0.101 0.005 -0.231 -0.043 -0.321V4.178c0.045 -0.084 0.024 -0.19 0.043 -0.282 0.047 -0.227 0.079 -0.461 0.151 -0.681 0.283 -0.866 0.971 -1.902 1.772 -2.386C2.512 0.501 3.044 0.261 3.662 0.121c0.452 -0.102 0.944 -0.084 1.406 -0.084h8.457c0.736 0 1.497 -0.052 2.227 0.025 0.195 0.021 0.395 0.016 0.586 0.059 0.616 0.139 1.152 0.382 1.692 0.708 0.8 0.484 1.489 1.521 1.772 2.386 0.072 0.22 0.104 0.454 0.151 0.681 0.02 0.093 -0.002 0.198 0.043 0.282ZM10.139 8.252c-0.146 0.039 -0.16 -0.208 -0.195 -0.314 -0.039 -0.118 -0.058 -0.246 -0.11 -0.361 -0.108 -0.237 -0.238 -0.466 -0.354 -0.699 -0.329 -0.657 -0.699 -1.297 -0.997 -1.97 -0.18 -0.405 -0.364 -0.809 -0.544 -1.214 -0.1 -0.225 -0.18 -0.467 -0.295 -0.684 -0.04 -0.075 -0.18 -0.195 -0.256 -0.232 -0.113 -0.055 -0.573 -0.11 -0.691 -0.074 -0.233 0.071 -0.314 0.257 -0.456 0.441 -0.054 0.07 -0.156 0.163 -0.176 0.251 -0.036 0.157 0.106 0.704 0.189 0.847 0.117 0.205 0.258 0.396 0.376 0.6 0.399 0.696 0.801 1.39 1.193 2.09 0.131 0.234 0.266 0.466 0.39 0.704 0.066 0.127 0.179 0.258 0.206 0.399 -0.023 0.023 -0.046 0.045 -0.069 0.068 -0.11 -0.027 -0.195 -0.136 -0.286 -0.202 -0.195 -0.143 -0.384 -0.295 -0.583 -0.432 -0.814 -0.561 -1.582 -1.192 -2.366 -1.794 -0.243 -0.187 -0.339 -0.208 -0.648 -0.236 -0.074 -0.007 -0.201 -0.036 -0.27 -0.002 -0.072 0.036 -0.14 0.155 -0.195 0.214 -0.054 0.058 -0.156 0.133 -0.182 0.209 -0.03 0.085 0.025 0.22 0.038 0.307 0.016 0.104 0.013 0.223 0.055 0.321 0.127 0.302 0.589 0.509 0.838 0.704 0.51 0.398 1.062 0.735 1.598 1.098 0.376 0.254 0.75 0.514 1.131 0.762 0.252 0.164 0.494 0.341 0.746 0.505 0.098 0.064 0.227 0.134 0.285 0.237 -0.06 0.114 -0.223 0.085 -0.337 0.067 -0.285 -0.046 -0.591 -0.077 -0.879 -0.094 -0.241 -0.014 -0.481 -0.052 -0.723 -0.067 -0.933 -0.059 -1.869 -0.096 -2.8 -0.18 -0.142 -0.013 -0.645 -0.084 -0.75 -0.06 -0.156 0.036 -0.318 0.198 -0.325 0.353 -0.005 0.101 0.091 0.182 0.148 0.26 0.046 0.064 0.11 0.193 0.182 0.227 0.268 0.129 0.693 0.078 0.986 0.107 0.485 0.049 0.978 0.046 1.465 0.066 0.598 0.025 1.198 0.056 1.797 0.064 0.297 0.004 0.591 0.017 0.887 0.036 0.098 0.007 0.234 -0.02 0.304 0.055 0.023 0.163 -0.117 0.217 -0.238 0.284 -0.276 0.152 -0.552 0.309 -0.827 0.463 -0.624 0.35 -1.268 0.678 -1.877 1.052 -0.202 0.124 -0.39 0.275 -0.588 0.407 -0.168 0.111 -0.577 0.334 -0.665 0.507 -0.039 0.077 -0.055 0.386 -0.042 0.475 0.076 0.073 0.184 0.216 0.284 0.253 0.097 0.037 0.277 -0.016 0.378 -0.034 0.102 -0.018 0.207 -0.01 0.306 -0.042 0.189 -0.061 0.461 -0.286 0.632 -0.403 0.774 -0.526 1.57 -1.026 2.359 -1.529 0.206 -0.132 0.409 -0.269 0.615 -0.4 0.082 -0.052 0.193 -0.161 0.289 -0.17 0.025 0.131 -0.097 0.225 -0.18 0.318 -0.204 0.228 -0.393 0.468 -0.582 0.708 -0.613 0.774 -1.215 1.56 -1.818 2.342 -0.273 0.355 -0.616 0.661 -0.574 1.145 0.075 0.055 0.349 0.22 0.435 0.216 0.26 -0.013 0.62 -0.481 0.787 -0.672 0.166 -0.189 0.363 -0.359 0.517 -0.557 0.318 -0.411 0.631 -0.833 0.928 -1.259 0.165 -0.236 0.357 -0.455 0.517 -0.694 0.186 -0.277 0.388 -0.55 0.591 -0.815 0.058 -0.076 0.128 -0.243 0.237 -0.203 -0.008 0.211 -0.107 0.435 -0.139 0.647 -0.046 0.307 -0.066 0.627 -0.133 0.93 -0.125 0.571 -0.22 1.149 -0.351 1.719 -0.051 0.22 -0.11 0.446 -0.146 0.669 -0.03 0.185 -0.129 0.398 -0.121 0.586 0.003 0.08 0.152 0.414 0.209 0.476 0.043 0.046 0.296 0.246 0.349 0.254 0.158 0.025 0.614 -0.245 0.647 -0.42 0.066 -0.352 0.06 -0.733 0.092 -1.09 0.068 -0.75 0.152 -1.5 0.219 -2.25 0.024 -0.272 0.037 -0.546 0.072 -0.817 0.013 -0.101 -0.016 -0.233 0.102 -0.262 0.099 0.103 0.167 0.261 0.237 0.386 0.137 0.244 0.279 0.488 0.427 0.726 0.389 0.626 0.807 1.233 1.228 1.837 0.083 0.119 0.418 0.652 0.504 0.707 0.189 0.121 0.57 0.062 0.756 -0.038 0.204 -0.11 0.093 -0.823 -0.01 -0.98 -0.41 -0.629 -0.852 -1.239 -1.25 -1.875 -0.093 -0.149 -0.411 -0.506 -0.369 -0.665 0.156 -0.002 0.533 0.403 0.677 0.514 0.365 0.282 0.698 0.604 1.051 0.902 0.254 0.214 0.534 0.41 0.803 0.604 0.214 0.155 0.488 0.477 0.771 0.449 0.062 -0.064 0.179 -0.193 0.194 -0.283 0.013 -0.071 -0.044 -0.284 -0.084 -0.345 -0.101 -0.154 -0.473 -0.445 -0.626 -0.584 -0.691 -0.631 -1.376 -1.267 -2.068 -1.896 -0.18 -0.164 -0.354 -0.338 -0.527 -0.51 -0.069 -0.069 -0.171 -0.129 -0.178 -0.23 0.135 -0.036 0.273 0.027 0.403 0.061 0.26 0.067 0.521 0.13 0.782 0.194 0.695 0.172 1.398 0.307 2.09 0.489 0.21 0.055 0.422 0.102 0.633 0.152 0.098 0.023 0.236 0.086 0.336 0.069 0.129 -0.022 0.584 -0.291 0.723 -0.369 0.021 -0.084 0.068 -0.216 0.045 -0.302 -0.018 -0.068 -0.104 -0.146 -0.147 -0.202 -0.127 -0.163 -0.402 -0.425 -0.604 -0.49 -0.096 -0.031 -0.229 -0.029 -0.33 -0.036 -0.495 -0.036 -0.989 -0.071 -1.484 -0.11 -0.444 -0.036 -0.902 0 -1.348 -0.015 -0.248 -0.008 -0.495 -0.052 -0.742 -0.072 -0.093 -0.007 -0.225 0.011 -0.298 -0.054 0.073 -0.078 0.285 -0.089 0.394 -0.113 0.279 -0.06 0.559 -0.128 0.835 -0.198 0.723 -0.184 1.457 -0.314 2.188 -0.469 0.43 -0.091 0.851 -0.211 1.278 -0.314 0.115 -0.157 0.281 -0.541 0.163 -0.72 -0.058 -0.088 -0.244 -0.128 -0.336 -0.174 -0.1 -0.05 -0.176 -0.086 -0.291 -0.064 -0.846 0.16 -1.701 0.272 -2.539 0.468 -0.3 0.07 -0.6 0.136 -0.903 0.193 -0.114 0.021 -0.236 0.077 -0.353 0.058 -0.068 -0.096 0.047 -0.211 0.096 -0.299 0.145 -0.261 0.295 -0.519 0.471 -0.76 0.366 -0.499 0.737 -0.993 1.115 -1.483 0.196 -0.254 0.562 -0.635 0.705 -0.896 0.114 -0.208 0.121 -0.479 0.211 -0.697 -0.15 -0.228 -0.301 -0.456 -0.451 -0.684 -0.1 -0.03 -0.205 -0.017 -0.31 -0.018 -0.096 -0.001 -0.243 -0.03 -0.333 0.006 -0.222 0.089 -0.463 0.396 -0.625 0.57 -0.573 0.616 -1.112 1.262 -1.624 1.929 -0.207 0.269 -0.416 0.537 -0.613 0.813 -0.065 0.091 -0.185 0.241 -0.302 0.177 -0.005 -0.279 0.145 -0.798 0.199 -1.095 0.134 -0.734 0.279 -1.466 0.404 -2.202 0.034 -0.199 0.178 -0.882 0.151 -1.039 -0.011 -0.063 -0.241 -0.386 -0.298 -0.426 -0.095 -0.066 -0.23 -0.116 -0.339 -0.155 -0.131 0.064 -0.359 0.182 -0.449 0.298 -0.048 0.062 -0.068 0.147 -0.096 0.218 -0.045 0.112 -0.114 0.225 -0.141 0.342 -0.066 0.277 -0.071 0.683 -0.088 0.973 -0.042 0.752 -0.157 1.498 -0.228 2.246 -0.028 0.294 -0.047 0.588 -0.073 0.882 -0.011 0.126 0.006 0.266 -0.025 0.388Z" fill="#d77655" fill-rule="evenodd" stroke="#d77655" stroke-width="0.009765625" stroke-linejoin="round"/><path d="M10.139 8.252c0.032 -0.122 0.014 -0.262 0.025 -0.388 0.026 -0.294 0.046 -0.588 0.073 -0.882 0.071 -0.748 0.186 -1.494 0.228 -2.246 0.016 -0.29 0.022 -0.696 0.088 -0.973 0.028 -0.116 0.096 -0.23 0.141 -0.342 0.029 -0.071 0.049 -0.157 0.096 -0.218 0.089 -0.116 0.318 -0.234 0.449 -0.298 0.109 0.039 0.244 0.089 0.339 0.155 0.057 0.04 0.287 0.363 0.298 0.426 0.027 0.157 -0.117 0.84 -0.151 1.039 -0.125 0.735 -0.27 1.467 -0.404 2.202 -0.054 0.296 -0.204 0.816 -0.199 1.095 0.117 0.065 0.237 -0.085 0.302 -0.177 0.197 -0.276 0.407 -0.544 0.613 -0.813 0.512 -0.668 1.051 -1.313 1.624 -1.929 0.162 -0.174 0.403 -0.48 0.625 -0.57 0.089 -0.036 0.237 -0.007 0.333 -0.006 0.105 0.001 0.211 -0.013 0.31 0.018 0.15 0.228 0.3 0.456 0.451 0.684 -0.09 0.219 -0.098 0.489 -0.211 0.697 -0.143 0.261 -0.509 0.642 -0.705 0.896 -0.377 0.491 -0.748 0.984 -1.115 1.483 -0.177 0.241 -0.326 0.499 -0.471 0.76 -0.049 0.088 -0.164 0.203 -0.096 0.299 0.117 0.019 0.239 -0.037 0.353 -0.058 0.303 -0.057 0.604 -0.123 0.903 -0.193 0.838 -0.196 1.693 -0.308 2.539 -0.468 0.116 -0.022 0.191 0.014 0.291 0.064 0.092 0.046 0.278 0.086 0.336 0.174 0.118 0.179 -0.047 0.563 -0.163 0.72 -0.427 0.102 -0.848 0.223 -1.278 0.314 -0.731 0.155 -1.465 0.285 -2.188 0.469 -0.277 0.07 -0.557 0.138 -0.835 0.198 -0.109 0.023 -0.321 0.035 -0.394 0.113 0.072 0.064 0.205 0.046 0.298 0.054 0.247 0.02 0.494 0.064 0.742 0.072 0.446 0.014 0.904 -0.021 1.348 0.015 0.495 0.039 0.989 0.074 1.484 0.11 0.101 0.007 0.234 0.005 0.33 0.036 0.202 0.065 0.476 0.327 0.604 0.49 0.043 0.055 0.129 0.134 0.147 0.202 0.023 0.086 -0.024 0.218 -0.045 0.302 -0.139 0.078 -0.594 0.346 -0.723 0.369 -0.1 0.017 -0.238 -0.046 -0.336 -0.069 -0.211 -0.05 -0.423 -0.097 -0.633 -0.152 -0.692 -0.182 -1.396 -0.317 -2.09 -0.489 -0.261 -0.064 -0.522 -0.127 -0.782 -0.194 -0.13 -0.034 -0.268 -0.097 -0.403 -0.061 0.006 0.1 0.109 0.161 0.178 0.23 0.173 0.172 0.346 0.346 0.527 0.51 0.693 0.629 1.378 1.264 2.068 1.896 0.153 0.139 0.525 0.43 0.626 0.584 0.04 0.061 0.096 0.273 0.084 0.345 -0.016 0.091 -0.132 0.219 -0.194 0.283 -0.283 0.028 -0.557 -0.294 -0.771 -0.449 -0.269 -0.195 -0.549 -0.39 -0.803 -0.604 -0.352 -0.298 -0.686 -0.62 -1.051 -0.902 -0.144 -0.111 -0.521 -0.516 -0.677 -0.514 -0.042 0.159 0.275 0.516 0.369 0.665 0.398 0.636 0.84 1.246 1.25 1.875 0.103 0.158 0.213 0.871 0.01 0.98 -0.186 0.1 -0.567 0.16 -0.756 0.038 -0.085 -0.055 -0.421 -0.587 -0.504 -0.707 -0.421 -0.605 -0.839 -1.211 -1.228 -1.837 -0.148 -0.237 -0.29 -0.482 -0.427 -0.726 -0.07 -0.125 -0.138 -0.283 -0.237 -0.386 -0.118 0.029 -0.089 0.161 -0.102 0.262 -0.034 0.271 -0.048 0.545 -0.072 0.817 -0.067 0.75 -0.151 1.5 -0.219 2.25 -0.032 0.357 -0.026 0.738 -0.092 1.09 -0.033 0.175 -0.489 0.445 -0.647 0.42 -0.053 -0.009 -0.306 -0.208 -0.349 -0.254 -0.057 -0.061 -0.205 -0.395 -0.209 -0.476 -0.008 -0.188 0.091 -0.401 0.121 -0.586 0.036 -0.223 0.095 -0.449 0.146 -0.669 0.131 -0.57 0.227 -1.148 0.351 -1.719 0.066 -0.303 0.087 -0.623 0.133 -0.93 0.032 -0.212 0.131 -0.436 0.139 -0.647 -0.109 -0.04 -0.179 0.127 -0.237 0.203 -0.203 0.265 -0.405 0.537 -0.591 0.815 -0.161 0.239 -0.352 0.457 -0.517 0.694 -0.297 0.426 -0.61 0.848 -0.928 1.259 -0.154 0.199 -0.352 0.368 -0.517 0.557 -0.168 0.191 -0.528 0.66 -0.787 0.672 -0.086 0.004 -0.36 -0.161 -0.435 -0.216 -0.042 -0.483 0.3 -0.79 0.574 -1.145 0.603 -0.782 1.205 -1.568 1.818 -2.342 0.189 -0.239 0.378 -0.48 0.582 -0.708 0.083 -0.093 0.205 -0.186 0.18 -0.318 -0.097 0.009 -0.207 0.117 -0.289 0.17 -0.207 0.131 -0.409 0.268 -0.615 0.4 -0.789 0.503 -1.584 1.003 -2.359 1.529 -0.171 0.116 -0.443 0.342 -0.632 0.403 -0.099 0.032 -0.205 0.024 -0.306 0.042 -0.101 0.018 -0.281 0.071 -0.378 0.034 -0.099 -0.037 -0.208 -0.18 -0.284 -0.253 -0.014 -0.089 0.003 -0.399 0.042 -0.475 0.088 -0.173 0.497 -0.395 0.665 -0.507 0.198 -0.131 0.386 -0.282 0.588 -0.407 0.609 -0.374 1.254 -0.703 1.877 -1.052 0.275 -0.154 0.551 -0.311 0.827 -0.463 0.121 -0.066 0.262 -0.12 0.238 -0.284 -0.07 -0.075 -0.206 -0.048 -0.304 -0.055 -0.296 -0.019 -0.59 -0.032 -0.887 -0.036 -0.599 -0.009 -1.198 -0.039 -1.797 -0.064 -0.487 -0.021 -0.98 -0.018 -1.465 -0.066 -0.294 -0.029 -0.718 0.021 -0.986 -0.107 -0.073 -0.034 -0.136 -0.164 -0.182 -0.227 -0.057 -0.077 -0.152 -0.159 -0.148 -0.26 0.007 -0.155 0.17 -0.318 0.325 -0.353 0.105 -0.024 0.608 0.047 0.75 0.06 0.931 0.084 1.867 0.121 2.8 0.18 0.242 0.015 0.481 0.053 0.723 0.067 0.288 0.017 0.594 0.048 0.879 0.094 0.113 0.018 0.277 0.047 0.337 -0.067 -0.058 -0.103 -0.188 -0.173 -0.285 -0.237 -0.252 -0.164 -0.494 -0.341 -0.746 -0.505 -0.38 -0.248 -0.755 -0.508 -1.131 -0.762 -0.536 -0.362 -1.087 -0.699 -1.598 -1.098 -0.25 -0.195 -0.712 -0.402 -0.838 -0.704 -0.041 -0.098 -0.039 -0.218 -0.055 -0.321 -0.013 -0.087 -0.068 -0.221 -0.038 -0.307 0.026 -0.075 0.129 -0.151 0.182 -0.209 0.055 -0.059 0.123 -0.178 0.195 -0.214 0.069 -0.034 0.196 -0.005 0.27 0.002 0.308 0.028 0.405 0.049 0.648 0.236 0.785 0.602 1.552 1.233 2.366 1.794 0.199 0.137 0.388 0.289 0.583 0.432 0.09 0.066 0.176 0.175 0.286 0.202 0.023 -0.022 0.046 -0.045 0.069 -0.068 -0.027 -0.141 -0.14 -0.271 -0.206 -0.399 -0.123 -0.237 -0.259 -0.47 -0.39 -0.704 -0.392 -0.7 -0.794 -1.394 -1.193 -2.09 -0.118 -0.204 -0.259 -0.395 -0.376 -0.6 -0.083 -0.144 -0.225 -0.69 -0.189 -0.847 0.02 -0.088 0.123 -0.181 0.176 -0.251 0.141 -0.185 0.223 -0.37 0.456 -0.441 0.118 -0.036 0.577 0.019 0.691 0.074 0.076 0.037 0.216 0.157 0.256 0.232 0.115 0.217 0.195 0.459 0.295 0.684 0.18 0.404 0.364 0.809 0.544 1.214 0.298 0.672 0.668 1.313 0.997 1.97 0.116 0.233 0.246 0.462 0.354 0.699 0.052 0.114 0.071 0.243 0.11 0.361 0.035 0.106 0.049 0.354 0.195 0.314Z" fill="#fcf2ee" fill-rule="evenodd" stroke="#fcf2ee" stroke-width="0.009765625" stroke-linejoin="round"/></svg>
                      )
                    },
                    {
                      name: "Perplexity AI",
                      score: auditResults.modelBreakdown.Perplexity || 0,
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20"><path d="M19.997 4.18v11.641c-0.071 0.13 -0.053 0.348 -0.08 0.497 -0.028 0.153 -0.072 0.318 -0.118 0.466 -0.295 0.944 -0.944 1.83 -1.774 2.384 -1.415 0.943 -2.754 0.791 -4.382 0.791h-6.875c-0.964 0 -2.151 0.088 -3.085 -0.081 -0.599 -0.108 -1.129 -0.367 -1.648 -0.672 -0.844 -0.495 -1.547 -1.509 -1.833 -2.423 -0.046 -0.148 -0.09 -0.313 -0.118 -0.466 -0.027 -0.149 -0.009 -0.367 -0.08 -0.497V4.18c0.071 -0.13 0.053 -0.348 0.08 -0.497 0.028 -0.153 0.072 -0.318 0.118 -0.466 0.286 -0.913 0.989 -1.928 1.833 -2.423 0.52 -0.305 1.049 -0.564 1.648 -0.672 0.929 -0.168 2.107 -0.081 3.066 -0.081h6.758c0.925 0 1.899 -0.084 2.812 0.081 0.597 0.108 1.132 0.365 1.65 0.671 0.843 0.498 1.546 1.509 1.832 2.423 0.046 0.148 0.09 0.313 0.118 0.466 0.027 0.149 0.009 0.367 0.08 0.497ZM5.964 3.629v3.698h-1.514v5.603h1.458v3.467c1.259 -1.102 2.518 -2.205 3.778 -3.307v3.245h0.664v-3.247c1.229 1.107 2.457 2.214 3.685 3.321v-3.479h1.514V7.327h-1.256V3.643l-3.943 3.281v-3.258h-0.664v3.21zm7.665 1.454v2.244h-2.648c0.036 -0.136 0.468 -0.436 0.597 -0.543 0.48 -0.397 0.952 -0.807 1.428 -1.209 0.134 -0.113 0.473 -0.468 0.623 -0.492Zm-7 0.029c0.827 0.738 1.653 1.477 2.48 2.214h-2.48zm2.54 2.881c-0.028 0.136 -0.264 0.292 -0.365 0.392 -0.336 0.335 -0.68 0.661 -1.02 0.991 -0.448 0.436 -0.891 0.881 -1.344 1.313 -0.096 0.091 -0.493 0.434 -0.527 0.529 -0.067 0.184 0.025 0.792 -0.018 1.046h-0.78V7.993zm5.715 0v4.271h-0.832c-0.062 -0.248 0.053 -0.891 -0.028 -1.062 -0.061 -0.129 -0.423 -0.435 -0.543 -0.552 -0.425 -0.415 -0.835 -0.845 -1.259 -1.261 -0.343 -0.335 -0.673 -0.681 -1.015 -1.016 -0.094 -0.092 -0.323 -0.254 -0.339 -0.38zm-5.207 0.493c0.05 0.277 0.008 0.598 0.008 0.88v2.48c0 0.093 0.028 0.24 -0.007 0.326 -0.028 0.068 -0.148 0.137 -0.203 0.185 -0.176 0.156 -0.354 0.311 -0.526 0.471 -0.545 0.504 -1.106 0.991 -1.662 1.482 -0.161 0.143 -0.521 0.537 -0.697 0.605 -0.07 -0.182 -0.017 -0.595 -0.017 -0.803v-1.797c0 -0.149 -0.036 -0.751 0.02 -0.846 0.084 -0.146 0.409 -0.398 0.543 -0.532 0.412 -0.408 0.839 -0.803 1.247 -1.214 0.291 -0.294 0.598 -0.574 0.89 -0.868 0.107 -0.107 0.263 -0.321 0.404 -0.369Zm0.703 0.004c0.23 0.195 0.439 0.429 0.65 0.645a93.867 93.867 0 0 0 1.435 1.437c0.211 0.206 0.414 0.42 0.624 0.626 0.08 0.078 0.223 0.177 0.27 0.278 0.05 0.106 0.011 0.436 0.011 0.566v2.422c0 0.125 0.039 0.328 -0.021 0.438 -0.22 -0.121 -0.571 -0.521 -0.778 -0.705 -0.478 -0.425 -0.944 -0.865 -1.415 -1.298 -0.194 -0.178 -0.387 -0.356 -0.582 -0.533 -0.06 -0.054 -0.189 -0.133 -0.215 -0.212 -0.048 -0.15 -0.005 -0.471 -0.005 -0.639v-2.578c0 -0.122 -0.041 -0.349 0.026 -0.446Z" fill="#1f1f1f" fill-rule="evenodd" stroke="#1f1f1f" stroke-width="0.009765625" stroke-linejoin="round"/><path d="m5.964 3.629 3.721 3.247V3.666h0.664v3.258l3.943 -3.281v3.684h1.256v5.603h-1.514v3.479c-1.229 -1.107 -2.457 -2.214 -3.685 -3.321v3.247h-0.664v-3.245c-1.259 1.102 -2.518 2.205 -3.778 3.307v-3.467h-1.458V7.327h1.514zm7.665 1.454c-0.15 0.024 -0.489 0.379 -0.623 0.492 -0.476 0.403 -0.947 0.813 -1.428 1.209 -0.129 0.106 -0.561 0.407 -0.597 0.543h2.648zm-7 0.029v2.214h2.48c-0.827 -0.738 -1.653 -1.476 -2.48 -2.214Zm2.54 2.881h-4.055v4.271h0.78c0.044 -0.254 -0.048 -0.862 0.018 -1.046 0.034 -0.095 0.431 -0.438 0.527 -0.529 0.454 -0.431 0.896 -0.876 1.344 -1.313 0.339 -0.33 0.684 -0.656 1.02 -0.991 0.101 -0.1 0.337 -0.256 0.365 -0.392Zm5.715 0h-4.016c0.016 0.127 0.245 0.288 0.339 0.38 0.342 0.335 0.673 0.681 1.015 1.016 0.424 0.415 0.834 0.845 1.259 1.261 0.12 0.117 0.481 0.424 0.543 0.552 0.081 0.171 -0.034 0.813 0.028 1.062h0.832zm-5.207 0.493c-0.141 0.047 -0.296 0.261 -0.404 0.369 -0.293 0.293 -0.599 0.573 -0.89 0.868 -0.408 0.411 -0.835 0.806 -1.247 1.214 -0.134 0.133 -0.459 0.385 -0.543 0.532 -0.055 0.096 -0.02 0.698 -0.02 0.846v1.797c0 0.209 -0.053 0.621 0.017 0.803 0.175 -0.068 0.536 -0.462 0.697 -0.605 0.556 -0.491 1.116 -0.979 1.662 -1.482 0.172 -0.159 0.35 -0.315 0.526 -0.471 0.055 -0.048 0.175 -0.117 0.203 -0.185 0.035 -0.086 0.007 -0.233 0.007 -0.326v-2.48c0 -0.282 0.042 -0.603 -0.008 -0.88Zm0.703 0.004c-0.067 0.097 -0.026 0.323 -0.026 0.446v2.578c0 0.168 -0.043 0.488 0.005 0.639 0.025 0.079 0.155 0.158 0.215 0.212 0.195 0.177 0.388 0.355 0.582 0.533 0.471 0.433 0.938 0.873 1.415 1.298 0.207 0.184 0.557 0.585 0.778 0.705 0.06 -0.109 0.021 -0.313 0.021 -0.438v-2.422c0 -0.13 0.039 -0.459 -0.011 -0.566 -0.048 -0.101 -0.19 -0.2 -0.27 -0.278 -0.21 -0.206 -0.413 -0.42 -0.624 -0.626a93.867 93.867 0 0 1 -1.435 -1.437c-0.211 -0.216 -0.42 -0.45 -0.65 -0.645Z" fill="#ffffff" fill-rule="evenodd" stroke="#ffffff" stroke-width="0.009765625" stroke-linejoin="round"/></svg>
                      )
                    },
                    {
                      name: "Google Gemini",
                      score: auditResults.modelBreakdown.Gemini || 0,
                      icon: (
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-blue-500 text-blue-500">
                          <path
                            fill="url(#gemini-gradient-search-refactored-new)"
                            d="M12 2a1 1 0 0 0-1 1c0 4.418-3.582 8-8 8a1 1 0 0 0 0 2c4.418 0 8 3.582 8 8a1 1 0 0 0 2 0c0-4.418 3.582-8 8-8a1 1 0 0 0 0-2c-4.418 0-8-3.582-8-8a1 1 0 0 0-1-1z"
                          />
                          <defs>
                            <linearGradient id="gemini-gradient-search-refactored-new" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#4e82f5" />
                              <stop offset="50%" stopColor="#ab7df6" />
                              <stop offset="100%" stopColor="#e287b2" />
                            </linearGradient>
                          </defs>
                        </svg>
                      )
                    }
                  ].map((m, mIdx) => (
                    <div key={mIdx} className="flex items-center gap-4">
                      <div className="flex items-center gap-2.5 w-36 shrink-0">
                        {m.icon}
                        <span className="text-slate-700 text-sm font-semibold truncate">{m.name}</span>
                      </div>
                      <div className="flex-1 bg-slate-100 h-5 rounded overflow-hidden relative">
                        <div
                          className="h-full bg-[#5f5fed] transition-all duration-1000"
                          style={{ width: `${m.score}%` }}
                        ></div>
                      </div>
                      <span className="text-slate-700 text-sm font-semibold w-12 text-right">{m.score}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Recommendations */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-md flex flex-col">
                <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rankgenie-orange" />
                  Actionable GEO Optimization Strategy
                </h4>

                <ul className="space-y-4 flex-1">
                  {auditResults.recommendations.map((rec, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-3 text-xs font-semibold text-slate-600 leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-orange-50 border border-orange-200 text-rankgenie-orange text-[9px] font-black flex items-center justify-center shrink-0">
                        {rIdx + 1}
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
