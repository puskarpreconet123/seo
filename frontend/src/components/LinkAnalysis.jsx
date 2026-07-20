"use client";

import React from "react";
import {
  Link as LinkIcon,
  Lightbulb,
  XCircle,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { useSeo } from "@/context/SeoContext";

export default function LinkAnalysis() {
  const { currentDomain } = useSeo();

  const criticalIssues = [
    {
      title: "Placeholder Link",
      desc: "Link #3 is non-functional or a placeholder target (href='#')."
    },
    {
      title: "Placeholder Link",
      desc: "Link #12 is non-functional or a placeholder target (href='#')."
    },
    {
      title: "Placeholder Link",
      desc: "Link #18 is non-functional or a placeholder target (href='#')."
    },
    {
      title: "Broken External Links",
      desc: "Detected 1 broken outbound external links. Remove or replace these dead endpoints."
    },
    {
      title: "Empty Anchors Check",
      desc: "Detected 1 empty anchors (links with no clickable text/alt description). This hurts accessibility and keyword indexing."
    }
  ];

  const warnings = [
    {
      title: "Orphan Pages",
      desc: "Found 16 pages in the sitemap that are not linked from this page. Add internal links to these pages."
    }
  ];

  const passedChecks = [
    {
      title: "Internal Link Presence",
      desc: "Found 51 internal links on the page."
    },
    {
      title: "External Link Presence",
      desc: "Found 5 outbound external links."
    },
    {
      title: "Insecure Outbound Links",
      desc: "All outbound links point to secure HTTPS destinations."
    },
    {
      title: "Redirect Chains",
      desc: "No link redirect chains (2+ redirects) were detected."
    },
    {
      title: "Generic Anchor Text",
      desc: "Anchor texts are descriptive and avoid low-quality generic words."
    },
    {
      title: "Duplicate Anchor Contexts",
      desc: "Anchor texts uniquely point to single target destinations."
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-indigo-500" />
          <h2 className="text-md font-bold text-slate-800 tracking-tight uppercase flex items-center gap-2">
            Link Analysis Engine
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-slate-400">Internal Link Score:</span>
            <span className="px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-rankgenie-orange font-bold text-[13px]">
              70/100
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-slate-400">External Link Score:</span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[13px]">
              80/100
            </span>
          </div>
        </div>
      </div>

      {/* Row 1: Metrics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Internal Link Metrics */}
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
            Internal Links Metrics
          </h3>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200/50 rounded-lg p-3 text-center flex flex-col justify-center items-center shadow-sm">
              <span className="text-xl font-bold text-slate-800">51</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total</span>
            </div>
            <div className="bg-white border border-slate-200/50 rounded-lg p-3 text-center flex flex-col justify-center items-center shadow-sm">
              <span className="text-xl font-bold text-rose-500">0</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Broken</span>
            </div>
            <div className="bg-white border border-slate-200/50 rounded-lg p-3 text-center flex flex-col justify-center items-center shadow-sm">
              <span className="text-xl font-bold text-amber-500">0</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Redirects</span>
            </div>
            <div className="bg-white border border-slate-200/50 rounded-lg p-3 text-center flex flex-col justify-center items-center shadow-sm">
              <span className="text-xl font-bold text-indigo-500">0</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Nofollow</span>
            </div>
          </div>
        </div>

        {/* External Link Metrics */}
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 flex flex-col justify-between">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
            External Links Metrics
          </h3>
          <div className="grid grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200/50 rounded-lg p-3 text-center flex flex-col justify-center items-center shadow-sm">
              <span className="text-xl font-bold text-slate-800">5</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Total</span>
            </div>
            <div className="bg-white border border-slate-200/50 rounded-lg p-3 text-center flex flex-col justify-center items-center shadow-sm">
              <span className="text-xl font-bold text-rose-500">1</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Broken</span>
            </div>
            <div className="bg-white border border-slate-200/50 rounded-lg p-3 text-center flex flex-col justify-center items-center shadow-sm">
              <span className="text-xl font-bold text-amber-500">0</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Redirects</span>
            </div>
            <div className="bg-white border border-slate-200/50 rounded-lg p-3 text-center flex flex-col justify-center items-center shadow-sm">
              <span className="text-xl font-bold text-indigo-500">0</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-1">Nofollow</span>
            </div>
            <div className="bg-white border border-slate-200/50 rounded-lg p-3 text-center flex flex-col justify-center items-center shadow-sm">
              <span className="text-xl font-bold text-emerald-500">5/0</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1 leading-none whitespace-nowrap">
                HTTPS/HTTP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
          <span className="text-2xl font-bold text-rose-500">0</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 text-center">
            Redirect Chains
          </span>
        </div>
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
          <span className="text-2xl font-bold text-amber-500">1</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 text-center">
            Empty Anchors
          </span>
        </div>
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
          <span className="text-2xl font-bold text-amber-500">0</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 text-center">
            Duplicate Anchors
          </span>
        </div>
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 flex flex-col items-center justify-center shadow-sm">
          <span className="text-2xl font-bold text-sky-500">16</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1 text-center">
            Orphan Links
          </span>
        </div>
      </div>

      {/* Row 3: Suggestions */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Link Optimization Suggestions
          </h4>
          <ul className="list-disc pl-5 text-[13px] text-slate-500 font-semibold leading-relaxed">
            <li>No suggestions. All links are fully optimized.</li>
          </ul>
        </div>
      </div>

      {/* Row 4: Detailed Audit Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <XCircle className="w-4 h-4 text-slate-900 shrink-0" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Critical Issues
            </h3>
          </div>
          <div className="max-h-[480px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {criticalIssues.map((issue, i) => (
              <div
                key={i}
                className="bg-rose-50/20 border border-rose-100 rounded-xl p-4 flex items-start gap-3"
              >
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">{issue.title}</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed font-semibold">
                    {issue.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-slate-900 shrink-0" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Warnings
            </h3>
          </div>
          <div className="max-h-[480px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {warnings.map((issue, i) => (
              <div
                key={i}
                className="bg-amber-50/20 border border-amber-100 rounded-xl p-4 flex items-start gap-3"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">{issue.title}</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed font-semibold">
                    {issue.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Passed Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Passed Checks
            </h3>
          </div>
          <div className="max-h-[480px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {passedChecks.map((check, i) => (
              <div
                key={i}
                className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-4 flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-xs">{check.title}</h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed font-semibold">
                    {check.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
