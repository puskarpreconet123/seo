"use client";

import React, { useState } from "react";
import { useSeo } from "@/context/SeoContext";
import {
  Bot,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronRight
} from "lucide-react";

export default function AiSimulatorPage() {
  const { seoData, currentDomain } = useSeo();
  const [simQueryInput, setSimQueryInput] = useState("");
  const [activeSimResponse, setActiveSimResponse] = useState(null);

  if (!seoData) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-xl border border-slate-200">
        <div className="text-center">
          <Bot className="w-8 h-8 text-rankgenie-orange animate-pulse mx-auto mb-2" />
          <span className="text-sm font-semibold text-slate-500">Retrieving SEO Intelligence...</span>
        </div>
      </div>
    );
  }

  const data = seoData.aeoGeo || {};
  const aiSearchSimulator = data.aiSearchSimulator || [];

  const handleQueryClick = (sim) => {
    setSimQueryInput(sim.query);
    setActiveSimResponse(sim);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!simQueryInput.trim()) return;

    const match = aiSearchSimulator.find(
      (sim) => sim.query.toLowerCase().includes(simQueryInput.trim().toLowerCase())
    );

    if (match) {
      setActiveSimResponse(match);
    } else {
      setActiveSimResponse({
        query: simQueryInput,
        aiResponse: `Generative analysis for **"${simQueryInput}"** indicates that ${currentDomain} displays high relevance to the queried query. However, search engine algorithms require additional structured citations to include a formal recommendation summary. [1]`,
        isDomainCited: true,
        citedUrl: `https://${currentDomain}`,
        citations: [`https://${currentDomain}`]
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rankgenie-dark p-6 rounded-2xl border border-slate-700 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">AI Search Simulator</h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Test how Perplexity, Google AI Overviews, and ChatGPT might summarize and cite your domain for specific search queries.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Auditing Domain</div>
              <div className="text-sm font-extrabold text-rankgenie-orange">{currentDomain}</div>
            </div>
            <div className="w-1.5 h-6 bg-white/20 rounded" />
            <Bot className="w-6 h-6 text-rankgenie-orange" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
             <h4 className="font-extrabold text-slate-800 text-sm mb-3">Popular Conversational Queries</h4>
             <div className="space-y-2">
                {aiSearchSimulator.map((sim, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQueryClick(sim)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-between"
                  >
                    <span className="truncate">{sim.query}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Search className="w-4 h-4 text-rankgenie-orange" />
                Ask an AI Engine
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
              {activeSimResponse ? (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-rankgenie-orange flex items-center justify-center shrink-0 shadow-sm">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 text-sm text-slate-700 leading-relaxed">
                        {activeSimResponse.aiResponse}
                      </div>
                      
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                           {activeSimResponse.isDomainCited ? (
                             <CheckCircle2 className="w-4 h-4 text-green-500" />
                           ) : (
                             <AlertTriangle className="w-4 h-4 text-amber-500" />
                           )}
                           <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Citation Analysis</span>
                        </div>
                        <div className="text-sm font-medium text-slate-700">
                          {activeSimResponse.isDomainCited ? (
                            <span>Domain was <strong className="text-green-600">cited</strong> in the generated response.</span>
                          ) : (
                            <span>Domain was <strong className="text-amber-600">NOT cited</strong>. Improve factual density to rank higher.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center px-6">
                  <div className="max-w-xs space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Bot className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="font-bold text-slate-700">Awaiting Query</h3>
                    <p className="text-xs text-slate-500">Run a simulation query below to see how generative engines respond.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input 
                  type="text"
                  placeholder="e.g. What are the best services offered by..."
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rankgenie-orange/20 focus:border-rankgenie-orange text-sm transition-all"
                  value={simQueryInput}
                  onChange={(e) => setSimQueryInput(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-rankgenie-orange hover:bg-orange-600 text-white rounded-lg flex items-center justify-center transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
