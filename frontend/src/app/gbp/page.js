"use client";

import React from "react";
import { useSeo } from "@/context/SeoContext";
import GBPWidget from "@/components/GBPWidget";
import { MapPin } from "lucide-react";

export default function GBPPage() {
  const { seoData, currentDomain } = useSeo();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="text-left">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-rankgenie-blue" />
            Google Business Profile Insights
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Analyze and manage your local maps listing performance and reviews
          </p>
        </div>
      </div>
      <GBPWidget gbpData={{ ...seoData.gbp, domain: currentDomain }} />
    </div>
  );
}
