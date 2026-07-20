"use client";

import React from "react";
import { useSeo } from "@/context/SeoContext";
import KeywordTable from "@/components/KeywordTable";
import { TrendingUp } from "lucide-react";

export default function OrganicPage() {
  const { seoData } = useSeo();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="text-left">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-rankgenie-orange" />
            Organic Research Reports
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Analyze keywords driving organic search traffic to your domain
          </p>
        </div>
      </div>
      <KeywordTable keywords={seoData.website.topKeywords} />
    </div>
  );
}
