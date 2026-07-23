"use client";

import React from 'react';
import { 
  FileText, AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, XCircle 
} from 'lucide-react';

export default function AdvancedOnPageAnalysis() {
  const criticalIssues = [
    {
      title: 'Keyword in Title',
      desc: "Primary keyword 'mobile app website' is NOT in the page title. Add it near the beginning for best SEO impact."
    },
    {
      title: 'Keyword in H1',
      desc: "Primary keyword 'mobile app website' not found in H1. H1 should clearly reflect the target keyword."
    }
  ];

  const warnings = [
    {
      title: 'Keyword in First Para',
      desc: "Primary keyword 'mobile app website' not found in the first 500 characters. Use the keyword early in the content."
    },
    {
      title: 'Keyword Density',
      desc: "Keyword 'mobile app website' has 0% density — not found in page content. Include it naturally throughout the text."
    },
    {
      title: 'Content Length',
      desc: "Content length is adequate but modest (430 words). 600+ words perform better for competitive keywords."
    }
  ];

  const passedChecks = [
    {
      title: 'Meta Description',
      desc: "Meta description appears unique and descriptive."
    },
    {
      title: 'Duplicate H1',
      desc: "One unique H1 found: 'Mobile App & Website DevelopmentCompany in'."
    },
    {
      title: 'Internal Links',
      desc: "Good internal linking — 24 internal links found, supporting page authority distribution."
    },
    {
      title: 'External Links',
      desc: "5 external link(s) found — outbound links to authoritative sources boost topical relevance."
    },
    {
      title: 'Anchor Text Quality',
      desc: "Anchor text appears descriptive — low occurrence (1) of generic patterns like 'click here'."
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-800 tracking-tight uppercase text-[13px]">
            Advanced On-Page SEO Analysis
          </h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-slate-400">Primary Keyword Detected:</span>
            <span className="px-3 py-1 rounded-md bg-blue-50 border border-blue-100 text-[12px] font-bold text-blue-600">
              mobile app website
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium text-slate-400">On-Page Score:</span>
            <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-orange-600 font-bold text-[13px]">
              73/100
            </span>
          </div>
        </div>
      </div>

      {/* Summary Score Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Critical Card */}
        <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-rose-600">2</span>
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mt-0.5">Critical</span>
        </div>

        {/* Warnings Card */}
        <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-amber-600">3</span>
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mt-0.5">Warnings</span>
        </div>

        {/* Passed Card */}
        <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-emerald-600">13</span>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-0.5">Passed</span>
        </div>
      </div>

      {/* Three Column Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Critical Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <XCircle className="w-5 h-5 text-slate-900 shrink-0" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Critical Issues</h3>
          </div>
          <div className="space-y-3">
            {criticalIssues.map((issue, i) => (
              <div key={i} className="bg-rose-50/30 border border-rose-100 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">{issue.title}</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{issue.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <AlertTriangle className="w-5 h-5 text-slate-900 shrink-0" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Warnings</h3>
          </div>
          <div className="space-y-3">
            {warnings.map((issue, i) => (
              <div key={i} className="bg-amber-50/20 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">{issue.title}</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{issue.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Passed Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Passed Checks</h3>
          </div>
          <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {passedChecks.map((check, i) => (
              <div key={i} className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">{check.title}</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed font-medium">{check.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
