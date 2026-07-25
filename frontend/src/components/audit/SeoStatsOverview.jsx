"use client";

import React from "react";
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Activity, Layout, Image as ImageIcon, Code2, Sparkles } from "lucide-react";
import { useSeo } from "@/context/SeoContext";

export default function SeoStatsOverview() {
  const { seoData } = useSeo();

  const audit = seoData?.website?.technicalAudit || {};
  const criticals = audit.criticals ?? 0;
  const warnings = audit.warnings ?? 0;
  const passed = audit.passed ?? 0;

  // Dynamic category scores
  const healthScore = audit.healthScore ?? audit.overallScore ?? 78;
  const seoScore = seoData?.website?.fullAudit?.seo_score ?? audit.seoScore ?? healthScore;
  const performanceScore = seoData?.website?.fullAudit?.desktop?.performance ?? seoData?.website?.fullAudit?.mobile?.performance ?? 0;
  const onPageScore = seoData?.website?.fullAudit?.onpage_report?.onpage_score ?? 0;
  const imageScore = seoData?.website?.fullAudit?.image_seo_report?.image_seo_score ?? 0;

  // Fix: Read schemaScore directly from backend schema_analysis_report.schema_score
  const schemaScore = seoData?.schema_analysis_report?.schema_score ?? 0;

  return (
    <div className="w-full space-y-4 mb-8">
      {/* Top Row: Priorities */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Criticals */}
        <div className="bg-white rounded-xl border border-rose-100 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.1)] p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-rose-300 transition-all">
          <div className="absolute top-0 w-full h-1 bg-rose-500"></div>
          <AlertCircle className="w-5 h-5 text-rose-500 absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity" />
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Criticals</h4>
          <span className="text-5xl font-light text-rose-500 mb-1">{criticals}</span>
          <p className="text-[13px] font-medium text-slate-400">Fix immediately</p>
        </div>

        {/* Warnings */}
        <div className="bg-white rounded-xl border border-amber-100 shadow-[0_2px_10px_-3px_rgba(217,119,6,0.1)] p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="absolute top-0 w-full h-1 bg-amber-400"></div>
          <AlertTriangle className="w-5 h-5 text-amber-500 absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity" />
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Warnings</h4>
          <span className="text-5xl font-light text-amber-500 mb-1">{warnings}</span>
          <p className="text-[13px] font-medium text-slate-400">High impact</p>
        </div>

        {/* Passed */}
        <div className="bg-white rounded-xl border border-emerald-100 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.1)] p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="absolute top-0 w-full h-1 bg-emerald-500"></div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500 absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity" />
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Passed</h4>
          <span className="text-5xl font-light text-emerald-600 mb-1">{passed}</span>
          <p className="text-[13px] font-medium text-slate-400">Advisories</p>
        </div>
      </div>

      {/* Bottom Row: Category Scores */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Performance */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Activity className="w-4 h-4 text-rose-500 shrink-0" />
              <h4 className="text-[12px] font-bold text-slate-600 uppercase tracking-wide truncate">Performance</h4>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shrink-0 ${
              performanceScore > 70 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
            }`}>
              {performanceScore > 70 ? "Good" : "Needs Work"}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className={`text-3xl font-light ${performanceScore > 70 ? "text-emerald-600" : "text-rose-500"}`}>{performanceScore}</span>
            <span className="text-[13px] font-medium text-slate-400">/100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className={`${performanceScore > 70 ? "bg-emerald-500" : "bg-rose-500"} h-full rounded-full`} style={{ width: `${performanceScore}%` }}></div>
          </div>
        </div>

        {/* SEO Score */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <h4 className="text-[12px] font-bold text-slate-600 uppercase tracking-wide truncate">SEO Score</h4>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shrink-0 ${
              seoScore > 70 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600 border border-amber-100"
            }`}>
              {seoScore > 70 ? "Good" : "Needs Work"}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className={`text-3xl font-light ${seoScore > 70 ? "text-indigo-600" : "text-amber-500"}`}>{seoScore}</span>
            <span className="text-[13px] font-medium text-slate-400">/100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className={`${seoScore > 70 ? "bg-indigo-500" : "bg-amber-500"} h-full rounded-full`} style={{ width: `${seoScore}%` }}></div>
          </div>
        </div>

        {/* On-Page SEO */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Layout className="w-4 h-4 text-blue-500 shrink-0" />
              <h4 className="text-[12px] font-bold text-slate-600 uppercase tracking-wide truncate">On-Page SEO</h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap shrink-0">
              Good
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className="text-3xl font-light text-blue-500">{onPageScore}</span>
            <span className="text-[13px] font-medium text-slate-400">/100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${onPageScore}%` }}></div>
          </div>
        </div>

        {/* Image SEO */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <ImageIcon className="w-4 h-4 text-blue-500 shrink-0" />
              <h4 className="text-[12px] font-bold text-slate-600 uppercase tracking-wide truncate">Image SEO</h4>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap shrink-0">
              Good
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className="text-3xl font-light text-blue-500">{imageScore}</span>
            <span className="text-[13px] font-medium text-slate-400">/100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${imageScore}%` }}></div>
          </div>
        </div>

        {/* Schema */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex flex-col shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Code2 className="w-4 h-4 text-purple-500 shrink-0" />
              <h4 className="text-[12px] font-bold text-slate-600 uppercase tracking-wide truncate">Schema</h4>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap shrink-0 ${
              schemaScore > 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
            }`}>
              {schemaScore > 0 ? "Detected" : "Missing"}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className={`text-3xl font-light ${schemaScore > 0 ? "text-emerald-600" : "text-rose-500"}`}>{schemaScore}</span>
            <span className="text-[13px] font-medium text-slate-400">/100</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div className={`${schemaScore > 0 ? "bg-emerald-500" : "bg-rose-500"} h-full rounded-full`} style={{ width: `${schemaScore}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
