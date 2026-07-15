"use client";

import React from "react";
import { useSeo } from "@/context/SeoContext";
import SiteAuditWidget from "@/components/SiteAuditWidget";
import { Layers } from "lucide-react";

export default function AuditPage() {
  const { seoData } = useSeo();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="text-left">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-500" />
            Technical Site Audit Logs
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Optimize crawl health and fix critical warnings or technical errors
          </p>
        </div>
      </div>
      <SiteAuditWidget auditData={seoData.website.technicalAudit} />
    </div>
  );
}
