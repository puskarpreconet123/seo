import React from 'react';
import { XCircle, AlertTriangle, CheckCircle2, Bot, Lightbulb } from 'lucide-react';

export default function RobotsSitemapAnalyzer() {
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
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-[13px]">
              100/100
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-slate-500">Sitemap Score:</span>
            <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bold text-[13px]">
              45/100
            </span>
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
                <span className="text-lg font-bold text-emerald-600">Yes</span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">Exists</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-lg font-bold text-emerald-600">Valid</span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">Syntax</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-lg font-bold text-slate-800">None</span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">Crawl Delay</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-lg font-bold text-slate-800">1</span>
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
                <span className="text-lg font-bold text-emerald-600">Yes</span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">Exists</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-lg font-bold text-emerald-600">Valid</span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">XML Format</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-lg font-bold text-slate-800">18</span>
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mt-1">URL Count</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-lg font-bold text-emerald-600">200</span>
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
              <span className="px-2 py-0.5 rounded bg-emerald-100/50 border border-emerald-300 text-emerald-700 font-bold text-[11px] uppercase">
                Allowed / Indexable
              </span>
            </div>
            <div>
              <span className="text-[13px] font-bold text-slate-600 block mb-2">Detected User-Agents:</span>
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded border border-slate-200 bg-white text-slate-600 font-bold text-sm">
                *
              </span>
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
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-[10px]">YES</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-md py-1.5 flex items-center justify-center gap-2">
                <span className="text-[12px] font-medium text-slate-500">priority</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-[10px]">YES</span>
              </div>
              <div className="bg-white border border-slate-100 rounded-md py-1.5 flex items-center justify-center gap-2">
                <span className="text-[12px] font-medium text-slate-500">changefreq</span>
                <span className="px-1.5 py-0.5 rounded bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[10px]">NO</span>
              </div>
            </div>
            <div>
              <span className="text-[13px] font-bold text-slate-600 block mb-2">Broken Sitemap URLs (Sample Validation):</span>
              <ul className="space-y-1.5 font-mono text-[12px] text-rose-500">
                <li className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 fill-rose-500 text-white flex-shrink-0" />
                  https://preconetindia.com/index.html
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 fill-rose-500 text-white flex-shrink-0" />
                  https://preconetindia.com/ui-ux.html
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 fill-rose-500 text-white flex-shrink-0" />
                  https://preconetindia.com/web-development.html
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5 fill-rose-500 text-white flex-shrink-0" />
                  https://preconetindia.com/mobile-app-dev.html
                </li>
              </ul>
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
            <li className="flex gap-3 text-slate-500 text-[13px] leading-relaxed items-start">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
              <span>Remove or replace the 4 broken URLs in the sitemap sample returning 4xx/5xx errors.</span>
            </li>
            <li className="flex gap-3 text-slate-500 text-[13px] leading-relaxed items-start">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
              <span>Add <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 text-xs font-mono">changefreq</code> (always, daily, weekly, etc.) values to direct index refresh intervals.</span>
            </li>
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
            
            <div className="bg-rose-50/50 border border-rose-200 rounded-lg p-4 flex gap-3 items-start">
              <XCircle className="w-5 h-5 text-rose-500 fill-rose-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <h4 className="text-slate-800 font-bold text-[13px] mb-1">Sitemap Broken URLs Check</h4>
                <p className="text-slate-500 text-[12px] leading-relaxed">
                  Sitemap audit checked a sample and detected 4 broken URL(s) (returning &gt;= 400 or timeouts).
                </p>
              </div>
            </div>
          </div>

          {/* Warnings Column */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5  fill-slate-800 text-white" strokeWidth={2} />
              <h3 className="font-bold text-slate-800 text-[12px] tracking-wide uppercase">
                Warnings
              </h3>
            </div>

            <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <h4 className="text-slate-800 font-bold text-[13px] mb-1">Sitemap Change Frequency</h4>
                <p className="text-slate-500 text-[12px] leading-relaxed">
                  Less than 80% of URLs in the sitemap declare <code className="bg-amber-100/50 px-1 rounded">changefreq</code> metadata. Set changefreq values to direct crawler refresh schedules.
                </p>
              </div>
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
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <h4 className="text-slate-800 font-bold text-[13px] mb-1">Robots.txt Allowed Indexation</h4>
                  <p className="text-slate-500 text-[12px] leading-relaxed">
                    The audited URL is allowed to be crawled by wildcard user-agent rules.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <h4 className="text-slate-800 font-bold text-[13px] mb-1">Robots.txt Sitemap Linkage</h4>
                  <p className="text-slate-500 text-[12px] leading-relaxed">
                    Found 1 XML sitemap(s) declared in robots.txt.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <h4 className="text-slate-800 font-bold text-[13px] mb-1">Sitemap Presence</h4>
                  <p className="text-slate-500 text-[12px] leading-relaxed">
                    XML Sitemap found at 'https://preconetindia.com/sitemap.xml' (HTTP status 200).
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <h4 className="text-slate-800 font-bold text-[13px] mb-1">Sitemap XML Validity</h4>
                  <p className="text-slate-500 text-[12px] leading-relaxed">
                    XML sitemap is correctly formatted and parsed successfully.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <h4 className="text-slate-800 font-bold text-[13px] mb-1">Sitemap URL Count</h4>
                  <p className="text-slate-500 text-[12px] leading-relaxed">
                    XML sitemap contains 18 page URL declarations.
                  </p>
                </div>
              </div>
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
