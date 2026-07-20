"use client";

import React from "react";
import LinkAnalysis from "@/components/LinkAnalysis";
import { Link2 } from "lucide-react";

export default function LinkAnalysisPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="text-left">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Link2 className="w-6 h-6 text-indigo-500" />
            Link Optimization
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Analyze internal and external links, redirects, anchor distribution and orphan pages.
          </p>
        </div>
      </div>
      
      <LinkAnalysis />
    </div>
  );
}
