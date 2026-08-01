import React from 'react';
import { useSeo } from '@/context/SeoContext';
import { XCircle, AlertTriangle, CheckCircle2, Bot, Lightbulb } from 'lucide-react';

export default function RobotsSitemapAnalyzer() {
  const { seoData } = useSeo();
  const reportsObj = seoData?.website?.fullAudit?.robots_sitemap_report || seoData?.fullAudit?.robots_sitemap_report || null;

  const robotsReport = reportsObj?.robots_report || {
    exists: false,
    syntax_valid: false,
    crawl_delay: 0,
    user_agents: [],
    sitemaps_declared: [],
    is_audited_url_blocked: false,
    syntax_errors: [],
    score: 0
  };

  const sitemapReport = reportsObj?.sitemap_report || {
    exists: false,
    xml_valid: false,
    url_count: 0,
    broken_urls: [],
    status_code: 0,
    has_lastmod: false,
    has_priority: false,
    has_changefreq: false,
    score: 0
  };

  const passed = reportsObj?.passed || [];
  const warnings = reportsObj?.warnings || [];
  const critical = reportsObj?.critical || [];
  const suggestions = reportsObj?.optimization_suggestions || [];

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200 text-emerald-600';
    if (score >= 50) return 'bg-amber-50 border-amber-200 text-amber-600';
    return 'bg-rose-50 border-rose-200 text-rose-600';
  };

  const getYesNoColor = (val) => {
    return val 
      ? 'bg-emerald-100 border-emerald-200 text-emerald-700' 
      : 'bg-rose-100 border-rose-200 text-rose-700';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden w-full mt-8">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" strokeWidth={2} />
          <h3 className="font-bold text-slate-500 text-[13px] tracking-widest uppercase">
            Robots.txt & XML Sitemap Analyzer
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-slate-500">Robots Score:</span>
            <span className={`px-3 py-1 rounded-full font-bold text-[13px] border ${getScoreColor(robotsReport.score)}`}>
              {robotsReport.score}/100
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-slate-500">Sitemap Score:</span>
            {sitemapReport.is_checking ? (
              <span className="px-3 py-1 rounded-full font-bold text-[13px] border bg-indigo-50 border-indigo-200 text-indigo-600 animate-pulse flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                Auditing...
              </span>
            ) : (
              <span className={`px-3 py-1 rounded-full font-bold text-[13px] border ${getScoreColor(sitemapReport.score)}`}>
                {sitemapReport.score}/100
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-slate-50/50">
        
        {/* Row 1: Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Robots.txt Metrics */}
          <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 shadow-sm">
            <h4 className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-4">
              Robots.txt Metrics
            </h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className={`text-lg font-bold ${robotsReport.exists ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {robotsReport.exists ? "Yes" : "No"}
                </span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">Exists</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className={`text-lg font-bold ${robotsReport.exists ? (robotsReport.syntax_valid ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-400'}`}>
                  {robotsReport.exists ? (robotsReport.syntax_valid ? "Valid" : "Errors") : "N/A"}
                </span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">Syntax</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-lg font-bold text-slate-800">
                  {robotsReport.crawl_delay ? `${robotsReport.crawl_delay}s` : "None"}
                </span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">Crawl Delay</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-lg font-bold text-slate-800">
                  {robotsReport.sitemaps_declared?.length || 0}
                </span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1 text-center leading-tight">Sitemaps<br/>Declared</span>
              </div>
            </div>
          </div>

          {/* XML Sitemap Metrics */}
          <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 shadow-sm">
            <h4 className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-4">
              XML Sitemap Metrics
            </h4>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className={`text-lg font-bold ${sitemapReport.exists ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {sitemapReport.exists ? "Yes" : "No"}
                </span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">Exists</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className={`text-lg font-bold ${sitemapReport.exists ? (sitemapReport.xml_valid ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-400'}`}>
                  {sitemapReport.exists ? (sitemapReport.xml_valid ? "Valid" : "Invalid") : "N/A"}
                </span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">XML Format</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-lg font-bold text-slate-800">
                  {sitemapReport.url_count || 0}
                </span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">URL Count</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className={`text-lg font-bold ${sitemapReport.status_code >= 200 && sitemapReport.status_code < 400 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {sitemapReport.status_code || "N/A"}
                </span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">HTTP Status</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Analysis Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Robots.txt Analysis Details */}
          <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <h4 className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1">
              Robots.txt Analysis Details
            </h4>
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-bold text-slate-600">Indexation Status of Audited Page:</span>
              <span className={`px-2 py-0.5 rounded border font-bold text-[11px] uppercase ${
                robotsReport.is_audited_url_blocked 
                  ? "bg-rose-100/50 border-rose-300 text-rose-700" 
                  : "bg-emerald-100/50 border-emerald-300 text-emerald-700"
              }`}>
                {robotsReport.is_audited_url_blocked ? "Blocked / Non-indexable" : "Allowed / Indexable"}
              </span>
            </div>
            <div>
              <span className="text-[13px] font-bold text-slate-600 block mb-2">Detected User-Agents:</span>
              <div className="flex flex-wrap gap-1.5">
                {robotsReport.user_agents && robotsReport.user_agents.length > 0 ? (
                  robotsReport.user_agents.map((ua, index) => (
                    <span key={index} className="inline-flex items-center justify-center px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-600 font-bold text-xs">
                      {ua}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-xs">None</span>
                )}
              </div>
            </div>
          </div>

          {/* Sitemap Metadata & Sample Check */}
          <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <h4 className="text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1">
              Sitemap Metadata & Sample Check
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-slate-100 rounded-md py-1.5 flex items-center justify-center gap-2">
                <span className="text-[12px] font-medium text-slate-500">lastmod</span>
                <span className={`px-1.5 py-0.5 rounded border font-bold text-[10px] ${getYesNoColor(sitemapReport.has_lastmod)}`}>
                  {sitemapReport.has_lastmod ? "YES" : "NO"}
                </span>
              </div>
              <div className="bg-white border border-slate-100 rounded-md py-1.5 flex items-center justify-center gap-2">
                <span className="text-[12px] font-medium text-slate-500">priority</span>
                <span className={`px-1.5 py-0.5 rounded border font-bold text-[10px] ${getYesNoColor(sitemapReport.has_priority)}`}>
                  {sitemapReport.has_priority ? "YES" : "NO"}
                </span>
              </div>
              <div className="bg-white border border-slate-100 rounded-md py-1.5 flex items-center justify-center gap-2">
                <span className="text-[12px] font-medium text-slate-500">changefreq</span>
                <span className={`px-1.5 py-0.5 rounded border font-bold text-[10px] ${getYesNoColor(sitemapReport.has_changefreq)}`}>
                  {sitemapReport.has_changefreq ? "YES" : "NO"}
                </span>
              </div>
            </div>
            <div>
              <span className="text-[13px] font-bold text-slate-600 block mb-2">Broken Sitemap URLs (Sample Validation):</span>
              {sitemapReport.is_checking ? (
                <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-lg text-xs font-semibold animate-pulse">
                  <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  Validating sitemap links in background...
                </div>
              ) : sitemapReport.broken_urls && sitemapReport.broken_urls.length > 0 ? (
                <ul className="space-y-1.5 font-mono text-[11px] text-rose-500 max-h-[120px] overflow-y-auto pr-1">
                  {sitemapReport.broken_urls.map((item, idx) => {
                    const u = Array.isArray(item) ? item[0] : (item?.url || item);
                    const code = Array.isArray(item) ? item[1] : (item?.status || 404);
                    return (
                      <li key={idx} className="flex items-center justify-between p-1 bg-white border border-slate-100 rounded shadow-sm gap-2">
                        <span className="truncate max-w-[200px] sm:max-w-xs">{u}</span>
                        <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 font-bold font-mono text-[9px]">{code}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50/50 border border-emerald-100/50 p-2 rounded-lg text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  All sampled sitemap URLs returned active 200 codes!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Suggestions */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h4 className="font-bold text-slate-700 text-[14px]">Robots & Sitemap Suggestions</h4>
          </div>
          <ul className="space-y-2.5">
            {suggestions.length > 0 ? (
              suggestions.map((sug, sIdx) => (
                <li key={sIdx} className="flex gap-3 text-slate-500 text-[13px] leading-relaxed items-start">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
                  <span>{sug}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 text-[13px] leading-relaxed font-semibold">
                No sitemap or robots suggestions available. Rerun campaign to gather crawler status.
              </li>
            )}
          </ul>
        </div>

        {/* Row 4: Column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          
          {/* Critical Issues Column */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center">
                <XCircle className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <h3 className="font-bold text-slate-800 text-[12px] tracking-wide uppercase">
                Critical Issues
              </h3>
            </div>
            
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 max-h-[300px] custom-scrollbar">
              {critical.length > 0 ? (
                critical.map((item, idx) => (
                  <div key={idx} className="bg-rose-50/50 border border-rose-200 rounded-lg p-4 flex gap-3 items-start">
                    <XCircle className="w-5 h-5 text-rose-500 fill-rose-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                      <h4 className="text-slate-800 font-bold text-[13px] mb-1">{item.check_name || item.name || "Crawlability Issue"}</h4>
                      <p className="text-slate-500 text-[12px] leading-relaxed">{item.message || item.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <h4 className="text-slate-800 font-bold text-[13px] mb-1">No Critical Crawl Blocks</h4>
                    <p className="text-slate-500 text-[12px] leading-relaxed">Search engine indexers can crawl the primary page boundaries.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Warnings Column */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 fill-slate-800 text-white" strokeWidth={2} />
              <h3 className="font-bold text-slate-800 text-[12px] tracking-wide uppercase">
                Warnings
              </h3>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto pr-2 max-h-[300px] custom-scrollbar">
              {warnings.length > 0 ? (
                warnings.map((item, idx) => (
                  <div key={idx} className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                      <h4 className="text-slate-800 font-bold text-[13px] mb-1">{item.check_name || item.name || "Crawlability Warning"}</h4>
                      <p className="text-slate-500 text-[12px] leading-relaxed">{item.message || item.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <h4 className="text-slate-800 font-bold text-[13px] mb-1">Optimize Sitemap Settings</h4>
                    <p className="text-slate-500 text-[12px] leading-relaxed">Verify sitemap declarations specify change frequencies or priority overrides.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Passed Checks Column */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <h3 className="font-bold text-slate-800 text-[12px] tracking-wide uppercase">
                Passed Checks
              </h3>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto pr-2 max-h-[300px] custom-scrollbar">
              {passed.length > 0 ? (
                passed.map((item, idx) => (
                  <div key={idx} className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                      <h4 className="text-slate-800 font-bold text-[13px] mb-1">{item.check_name || item.name || "Passed Check"}</h4>
                      <p className="text-slate-500 text-[12px] leading-relaxed">{item.message || item.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center text-slate-400 font-medium text-xs">
                  No passed checklist data available.
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}} />
    </div>
  );
}
