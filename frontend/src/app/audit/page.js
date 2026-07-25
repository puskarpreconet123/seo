"use client";

import React, { useState } from "react";
import { useSeo } from "@/context/SeoContext";
import SiteAuditWidget from "@/components/audit/SiteAuditWidget";
import SeoStatsOverview from "@/components/audit/SeoStatsOverview";
import SeoScoreCharts from "@/components/audit/SeoScoreCharts";
import SeoPriorityActionPlan from "@/components/audit/SeoPriorityActionPlan";
import ConsolidatedSeoChecklist from "@/components/audit/ConsolidatedSeoChecklist";
import PagePerformanceAnalysis from "@/components/audit/PagePerformanceAnalysis";
import PerformanceCharts from "@/components/audit/PerformanceCharts";
import RobotsSitemapAnalyzer from "@/components/audit/RobotsSitemapAnalyzer";
import SchemaStructuredDataAnalyzer from "@/components/audit/SchemaStructuredDataAnalyzer";
import { Layers, RefreshCw, Download, Share2, FileText, Monitor } from "lucide-react";

export default function AuditPage() {
  const { seoData, currentDomain, handleRefresh, isLoading } = useSeo();
  const [activeTab, setActiveTab] = useState("overview");

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "issues", label: "Issues & Action Plan" },
    { id: "performance", label: "Site Performance" },
    { id: "crawlability", label: "Crawlability & Indexing" },
    { id: "schema", label: "Structured Data" },
  ];

  const handleExportPdf = () => {
    const domain = currentDomain || "preconetindia.com";
    window.open(`${API_BASE_URL}/api/reports/export?domain=${encodeURIComponent(domain)}&format=pdf`, "_blank");
  };

  const handleExportCsv = () => {
    const domain = currentDomain || "preconetindia.com";
    window.open(`${API_BASE_URL}/api/reports/export?domain=${encodeURIComponent(domain)}&format=csv`, "_blank");
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert("Page link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-6">
      {/* SEMrush Style Header */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                Site Audit: <span className="text-blue-600 font-semibold">{currentDomain || "preconetindia.com"}</span>
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-slate-400">
              <span>{currentDomain || "preconetindia.com"}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Updated: {seoData?.lastUpdated || "Wed, Jul 15, 2026"}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1">
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>JS rendering: Disabled</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="text-slate-500 font-bold">Pages crawled: 43/100</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`} /> Rerun campaign
            </button>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-rose-500" /> PDF
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" /> Export
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center overflow-x-auto gap-6 pt-4 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-1 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-blue-600 text-blue-600 font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <SeoStatsOverview />
            <SiteAuditWidget auditData={seoData?.website?.technicalAudit} />
            <SeoScoreCharts />
          </div>
        )}

        {activeTab === "issues" && (
          <div className="space-y-6">
            <SeoPriorityActionPlan />
            <ConsolidatedSeoChecklist />
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-6">
            <PagePerformanceAnalysis />
            <PerformanceCharts />
          </div>
        )}

        {activeTab === "crawlability" && (
          <div className="space-y-6">
            <RobotsSitemapAnalyzer />
          </div>
        )}

        {activeTab === "schema" && (
          <div className="space-y-6">
            <SchemaStructuredDataAnalyzer />
          </div>
        )}
      </div>
    </div>
  );
}
