import React from 'react';
import { XCircle, AlertTriangle, CheckCircle2, Activity, Lightbulb } from 'lucide-react';

export default function PagePerformanceAnalysis() {
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
          <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bold text-[13px]">
            30/100
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-slate-50/50">
        
        {/* Row 1: Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-xl font-bold text-indigo-900">8.00s</span>
            <span className="text-[9px] font-bold text-indigo-600 tracking-[0.15em] uppercase mt-1">Load Time</span>
          </div>
          <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-xl font-bold text-purple-900">1949.73 ms</span>
            <span className="text-[9px] font-bold text-purple-600 tracking-[0.15em] uppercase mt-1">FCP</span>
          </div>
          <div className="bg-cyan-50/70 border border-cyan-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-xl font-bold text-cyan-800">3449.73 ms</span>
            <span className="text-[9px] font-bold text-cyan-600 tracking-[0.15em] uppercase mt-1">LCP</span>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-xl font-bold text-emerald-700">0.800</span>
            <span className="text-[9px] font-bold text-emerald-600 tracking-[0.15em] uppercase mt-1">CLS</span>
          </div>
          <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-xl font-bold text-amber-500">75 ms</span>
            <span className="text-[9px] font-bold text-amber-400 tracking-[0.15em] uppercase mt-1">INP</span>
          </div>
          <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-xl font-bold text-rose-600">1139.73 ms</span>
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
            <li className="flex gap-3 text-slate-500 text-[13px] leading-relaxed items-start">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
              <span>Eliminate render-blocking resources by deferring non-critical CSS/JS, using async/defer attributes on script tags, or preloading critical assets.</span>
            </li>
            <li className="flex gap-3 text-slate-500 text-[13px] leading-relaxed items-start">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
              <span>Add <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 text-xs font-mono">loading="lazy"</code> attributes to below-the-fold images to improve initial viewport rendering speeds.</span>
            </li>
            <li className="flex gap-3 text-slate-500 text-[13px] leading-relaxed items-start">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
              <span>Reduce stylesheet payloads by minifying CSS, removing unused classes, or splitting layouts based on page templates.</span>
            </li>
            <li className="flex gap-3 text-slate-500 text-[13px] leading-relaxed items-start">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
              <span>Decrease JavaScript file weight using modern code-splitting, tree-shaking dead code, and minifying bundle contents.</span>
            </li>
            <li className="flex gap-3 text-slate-500 text-[13px] leading-relaxed items-start">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
              <span>Configure long-term cache lifetimes (e.g., <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 text-xs font-mono">Cache-Control: max-age=31536000</code>) for static assets like CSS, JS, and images.</span>
            </li>
            <li className="flex gap-3 text-slate-500 text-[13px] leading-relaxed items-start">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
              <span>Specify explicit <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 text-xs font-mono">width</code> and <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 text-xs font-mono">height</code> attributes on images to reserve space and prevent layout shifts.</span>
            </li>
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
            
            <div className="bg-rose-50/50 border border-rose-200 rounded-lg p-4 flex gap-3 items-start">
              <XCircle className="w-5 h-5 text-rose-500 fill-rose-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <h4 className="text-slate-800 font-bold text-[13px] mb-1">Render-blocking resources</h4>
                <p className="text-slate-500 text-[12px] leading-relaxed">
                  Found 3 stylesheets and 1 scripts in the head blocking initial render.
                </p>
              </div>
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
              <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <h4 className="text-slate-800 font-bold text-[13px] mb-1">Missing lazy loading</h4>
                  <p className="text-slate-500 text-[12px] leading-relaxed">
                    Detected 66 images without lazy loading (about 95% of below-the-fold images).
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <h4 className="text-slate-800 font-bold text-[13px] mb-1">Large CSS files</h4>
                  <p className="text-slate-500 text-[12px] leading-relaxed">
                    Found 1 CSS files exceeding the recommended 100 KB threshold.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <h4 className="text-slate-800 font-bold text-[13px] mb-1">Unused CSS</h4>
                  <p className="text-slate-500 text-[12px] leading-relaxed">
                    Potential unused CSS classes detected in oversized files or large structural libraries.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <h4 className="text-slate-800 font-bold text-[13px] mb-1">Unused JavaScript</h4>
                  <p className="text-slate-500 text-[12px] leading-relaxed">
                    Potential unused JavaScript or modules found in large client bundles or dependency files.
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <h4 className="text-slate-800 font-bold text-[13px] mb-1">Missing browser caching</h4>
                  <p className="text-slate-500 text-[12px] leading-relaxed">
                    Found 2 static style or script assets missing Cache-Control headers.
                  </p>
                </div>
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

            <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <h4 className="text-slate-800 font-bold text-[13px] mb-1">Large JavaScript files</h4>
                <p className="text-slate-500 text-[12px] leading-relaxed">
                  All JavaScript bundles are within optimal size limits(&lt; 200 KB).
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <h4 className="text-slate-800 font-bold text-[13px] mb-1">Missing compression</h4>
                <p className="text-slate-500 text-[12px] leading-relaxed">
                  Text assets (HTML, CSS, JS) use GZIP or Brotli compression.
                </p>
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
