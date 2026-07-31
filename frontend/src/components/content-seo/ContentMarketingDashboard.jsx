"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSeo } from "@/context/SeoContext";
import {
  Sparkles,
  FileText,
  Edit3,
  ArrowRight,
  Zap,
  HelpCircle,
  BarChart2,
  RotateCw
} from "lucide-react";
import AutoContentQueue from "@/components/content-seo/AutoContentQueue";

export default function ContentMarketingDashboard() {
  const router = useRouter();
  const { currentDomain } = useSeo();
  const [ideas, setIdeas] = useState([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    async function fetchIdeas() {
      if (!currentDomain) return;
      setIsLoadingIdeas(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/content/generate-ideas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain: currentDomain })
        });
        const resData = await response.json();
        if (resData.ideas) {
          setIdeas(resData.ideas);
        }
      } catch (err) {
        console.error("Failed to fetch content ideas", err);
      } finally {
        setIsLoadingIdeas(false);
      }
    }
    fetchIdeas();
  }, [currentDomain]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Sub-Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Content Marketing Suite
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Content Dashboard
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Plan, generate, and optimize high-ranking articles for {currentDomain}
        </p>
      </div>

      <div className="space-y-8">

        {/* Automated 10/day Queue & 60-day Retention Engine */}
        <AutoContentQueue />

        {/* Quick AI Generators Row */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 rounded-[2rem] text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Quick AI Actions</span>
              <h3 className="text-xl font-black tracking-tight mt-1">Instant Content Generation Tools</h3>
            </div>

            <button
              onClick={() => router.push("/content-generator")}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" /> Open Blog Studio
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => router.push("/content-generator")}
              className="bg-white/10 hover:bg-white/15 border border-white/10 p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-300 w-fit mb-3">
                <Edit3 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1 group-hover:text-purple-300 transition-colors">Blog Article Generator</h4>
              <p className="text-xs text-slate-300">Generate 1,000+ word rank-ready blog posts with H2/H3 outlines.</p>
            </div>

            <div
              onClick={() => router.push("/content-generator")}
              className="bg-white/10 hover:bg-white/15 border border-white/10 p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 w-fit mb-3">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1 group-hover:text-blue-300 transition-colors">FAQ & Schema Builder</h4>
              <p className="text-xs text-slate-300">Compile Q&A pairs with structured JSON-LD snippet tags.</p>
            </div>

            <div
              onClick={() => router.push("/content-generator")}
              className="bg-white/10 hover:bg-white/15 border border-white/10 p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 w-fit mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1 group-hover:text-amber-300 transition-colors">Paragraph Rewriter</h4>
              <p className="text-xs text-slate-300">Transform weak copy into authoritative, engaging text.</p>
            </div>

            <div
              onClick={() => router.push("/content-generator")}
              className="bg-white/10 hover:bg-white/15 border border-white/10 p-5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 w-fit mb-3">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-white mb-1 group-hover:text-emerald-300 transition-colors">Content Briefs</h4>
              <p className="text-xs text-slate-300">Discover trending search topics tailored to {currentDomain}.</p>
            </div>
          </div>
        </div>

        {/* AI Suggested Content Briefs List */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-md">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">AI Suggested Content Strategy</h3>
              <p className="text-xs text-slate-500">High-intent blog topics discovered for {currentDomain}</p>
            </div>
            <span className="px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold rounded-full">
              {ideas.length} High-Intent Briefs
            </span>
          </div>

          {isLoadingIdeas ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-slate-50/50 rounded-2xl border border-slate-100">
              <RotateCw className="w-6 h-6 animate-spin text-purple-600 mb-2" />
              <p className="text-xs font-bold">Analyzing keywords & suggestions...</p>
            </div>
          ) : ideas.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 font-bold bg-slate-50/50 rounded-2xl border border-slate-100">
              No suggested briefs found for this domain.
            </div>
          ) : (
            <div className="space-y-4">
              {ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200 gap-4 transition-all"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                      {idea.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                      <span>Keyword: <strong className="text-slate-800">{idea.keyword}</strong></span>
                      <span>•</span>
                      <span>Intent: <strong className="text-purple-600">{idea.intent}</strong></span>
                      <span>•</span>
                      <span>Est. Traffic: <strong className="text-emerald-600">{idea.estimatedTraffic}</strong></span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const query = `?title=${encodeURIComponent(idea.title)}&keyword=${encodeURIComponent(idea.keyword)}`;
                      router.push(`/content-generator${query}`);
                    }}
                    className="shrink-0 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Generate Post</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
