"use client";

import React from "react";
import ContentAnalyzer from "@/components/content-seo/ContentAnalyzer";
import AdvancedOnPageAnalysis from "@/components/content-seo/AdvancedOnPageAnalysis";
import { Sparkles } from "lucide-react";

export default function ContentSeoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="text-left">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-500" />
            Content SEO
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Optimize text content, target keywords, and close semantic gaps
          </p>
        </div>
      </div>
      
      <ContentAnalyzer />

      <AdvancedOnPageAnalysis />
    </div>
  );
}
