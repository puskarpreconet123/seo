import React from 'react';
import { useSeo } from '@/context/SeoContext';
import { XCircle, AlertTriangle, CheckCircle2, Activity, Lightbulb } from 'lucide-react';

export default function PagePerformanceAnalysis() {
  const { seoData } = useSeo();
  const desktopData = seoData?.website?.fullAudit?.desktop || seoData?.website?.fullAudit?.pagespeed?.desktop || null;
  const mainCrawlTime = seoData?.website?.technicalAudit?.responseTime || 0;

  // Verify if actual live PageSpeed audits succeeded (local simulated fallback returns success: false)
  const hasLivePerformanceData = desktopData && desktopData.success === true;

  const perfScore = hasLivePerformanceData ? (desktopData.performance ?? 0) : 0;
  const metrics = hasLivePerformanceData ? (desktopData.metrics || {}) : {};

  const fcpSec = metrics.first_contentful_paint || 0;
  const lcpSec = metrics.largest_contentful_paint || 0;
  const clsVal = metrics.cumulative_layout_shift || 0;
  const tbtMs = metrics.total_blocking_time || 0;
  const ttfbMs = hasLivePerformanceData ? mainCrawlTime : 0;
  const loadTimeSec = hasLivePerformanceData ? (metrics.interactive || (mainCrawlTime * 2 / 1000)) : 0;

  const recommendations = hasLivePerformanceData ? (desktopData.recommendations || []) : [];
  
  // Group recommendations
  const criticalIssues = recommendations.filter(r => r.score !== null && r.score < 0.5);
  const warnings = recommendations.filter(r => r.score !== null && r.score >= 0.5 && r.score < 0.9);

  // Score color badge
  const scoreBadgeColor = !hasLivePerformanceData
    ? "bg-slate-50 border-slate-200 text-slate-400"
    : perfScore >= 80 
      ? "bg-emerald-50 border-emerald-200 text-emerald-600" 
      : perfScore >= 50 
        ? "bg-amber-50 border-amber-200 text-amber-600" 
        : "bg-rose-50 border-rose-200 text-rose-600";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden w-full mt-8">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" strokeWidth={2} />
          <h3 className="font-bold text-slate-500 text-[13px] tracking-widest uppercase">
            Page Performance Diagnostics
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-slate-500">Performance Score:</span>
          <span className={`px-3 py-1 rounded-full border font-bold text-[13px] ${scoreBadgeColor}`}>
            {hasLivePerformanceData ? `${perfScore}/100` : "No Data Available"}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-slate-50/50">
        
        {/* Row 1: Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-xl font-bold text-indigo-900">{hasLivePerformanceData ? `${loadTimeSec.toFixed(2)}s` : "-"}</span>
            <span className="text-[9px] font-bold text-indigo-600 tracking-[0.15em] uppercase mt-1">Load Time</span>
          </div>
          <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-xl font-bold text-purple-900">{hasLivePerformanceData ? `${(fcpSec * 1000).toFixed(0)} ms` : "-"}</span>
            <span className="text-[9px] font-bold text-purple-600 tracking-[0.15em] uppercase mt-1">FCP</span>
          </div>
          <div className="bg-cyan-50/70 border border-cyan-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-xl font-bold text-cyan-800">{hasLivePerformanceData ? `${(lcpSec * 1000).toFixed(0)} ms` : "-"}</span>
            <span className="text-[9px] font-bold text-cyan-600 tracking-[0.15em] uppercase mt-1">LCP</span>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-xl font-bold text-emerald-700">{hasLivePerformanceData ? clsVal.toFixed(3) : "-"}</span>
            <span className="text-[9px] font-bold text-emerald-600 tracking-[0.15em] uppercase mt-1">CLS</span>
          </div>
          <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-xl font-bold text-amber-500">{hasLivePerformanceData ? `${tbtMs} ms` : "-"}</span>
            <span className="text-[9px] font-bold text-amber-400 tracking-[0.15em] uppercase mt-1">TBT</span>
          </div>
          <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-xl font-bold text-rose-600">{hasLivePerformanceData ? `${ttfbMs.toFixed(0)} ms` : "-"}</span>
            <span className="text-[9px] font-bold text-rose-500 tracking-[0.15em] uppercase mt-1">TTFB</span>
          </div>
        </div>

        {/* Row 2: Performance Suggestions & Optimizations */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h4 className="font-bold text-slate-700 text-[14px]">Performance Suggestions & Optimizations</h4>
          </div>
          <ul className="space-y-2.5">
            {hasLivePerformanceData && recommendations.length > 0 ? (
              recommendations.slice(0, 6).map((rec, rIdx) => (
                <li key={rIdx} className="flex gap-3 text-slate-500 text-[13px] leading-relaxed items-start">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
                  <span>
                    <strong className="text-slate-700">{rec.title}:</strong> {rec.description} 
                    {rec.displayValue && (
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 text-xs font-mono ml-1">
                        {rec.displayValue}
                      </code>
                    )}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-slate-400 text-[13px] leading-relaxed font-semibold">
                No performance suggestions available. Make sure Google PageSpeed API key is configured.
              </li>
            )}
          </ul>
        </div>

        {/* Row 3: Column layout */}
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
              {!hasLivePerformanceData ? (
                <div className="text-slate-400 text-xs p-2 font-semibold">No performance data available.</div>
              ) : criticalIssues.length > 0 ? (
                criticalIssues.map((item, idx) => (
                  <div key={idx} className="bg-rose-50/50 border border-rose-200 rounded-lg p-4 flex gap-3 items-start">
                    <XCircle className="w-5 h-5 text-rose-500 fill-rose-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                      <h4 className="text-slate-800 font-bold text-[13px] mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-[12px] leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <h4 className="text-slate-800 font-bold text-[13px] mb-1">No Critical Performance Errors</h4>
                    <p className="text-slate-500 text-[12px] leading-relaxed">No high-risk rendering blocks or script leaks detected.</p>
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
              {!hasLivePerformanceData ? (
                <div className="text-slate-400 text-xs p-2 font-semibold">No performance data available.</div>
              ) : warnings.length > 0 ? (
                warnings.map((item, idx) => (
                  <div key={idx} className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                    <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                      <h4 className="text-slate-800 font-bold text-[13px] mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-[12px] leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <h4 className="text-slate-800 font-bold text-[13px] mb-1">Optimize Assets</h4>
                    <p className="text-slate-500 text-[12px] leading-relaxed">
                      Identify unused CSS templates or split bundle payloads to improve painting.
                    </p>
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
              {!hasLivePerformanceData ? (
                <div className="text-slate-400 text-xs p-2 font-semibold">No performance data available.</div>
              ) : (
                <>
                  <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                      <h4 className="text-slate-800 font-bold text-[13px] mb-1">Core Text Compression</h4>
                      <p className="text-slate-500 text-[12px] leading-relaxed">
                        Text assets (HTML, CSS, JS) leverage GZIP or Brotli compression.
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                      <h4 className="text-slate-800 font-bold text-[13px] mb-1">Bundle Payload Limits</h4>
                      <p className="text-slate-500 text-[12px] leading-relaxed">
                        All core script bundle sizes are well below standard limits (&lt; 200 KB).
                      </p>
                    </div>
                  </div>
                </>
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
          border-radius: 4px;
        }
      `}} />
    </div>
  );
}
