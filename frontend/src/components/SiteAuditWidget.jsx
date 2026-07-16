import React from "react";
import { Gauge } from "lucide-react";

export default function SiteAuditWidget({ auditData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      {/* Audit Overview */}
      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col w-full h-full">
        <div className="flex items-center gap-2 mb-12">
          <Gauge className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
          <h3 className="font-semibold text-slate-600 text-sm tracking-wide uppercase">
            Audit Overview
          </h3>
        </div>

        <div className="flex flex-col items-center justify-center mb-10">
          <div className="text-6xl font-light text-slate-800 mb-1">63</div>
          <div className="text-sm text-slate-500 uppercase tracking-widest mb-6">SEO SCORE</div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">Fair Optimization</div>
        </div>

        <hr className="border-slate-100 mb-6" />

        <div className="space-y-4 text-[15px] mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Website audited</span>
            <span className="text-slate-800">https://preconetindia.co...</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Final Destination</span>
            <span className="text-blue-600">https://preconetindia.co...</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Status Code</span>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
              200
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Response Time</span>
            <span className="text-purple-700 font-medium">2602.86 ms</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-500">HTML Payload</span>
            <span className="text-purple-700 font-medium">40158 bytes</span>
          </div>
        </div>
      </div>

      {/* Issues By Severity */}
      <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col w-full h-full">
        <h3 className="font-semibold text-slate-600 text-sm tracking-wide uppercase mb-8">
          Issues By Severity
        </h3>
        
        <div className="relative flex-1 flex flex-col justify-end mt-4 min-h-[250px]">
          {/* Y-axis labels and grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[14, 12, 10, 8, 6, 4, 2, 0].map((tick) => (
              <div key={tick} className="flex items-center w-full translate-y-[-50%]">
                <span className="w-8 text-right text-slate-400 text-sm pr-4 shrink-0">{tick}</span>
                <div className="flex-1 border-b border-slate-100"></div>
              </div>
            ))}
          </div>
          
          {/* Bars Container */}
          <div className="flex-1 flex flex-col justify-end z-10 pt-4 pb-[1px] ml-8 h-full">
            <div className="flex items-end justify-around h-full w-full">
              {/* Passed */}
              <div className="flex flex-col items-center justify-end w-1/4 h-full relative">
                <div className="w-full bg-[#3cc494] absolute bottom-0" style={{ height: `${(13/14)*100}%` }}></div>
              </div>
              {/* Warnings */}
              <div className="flex flex-col items-center justify-end w-1/4 h-full relative">
                <div className="w-full bg-[#f6b042] absolute bottom-0" style={{ height: `${(2/14)*100}%` }}></div>
              </div>
              {/* Critical */}
              <div className="flex flex-col items-center justify-end w-1/4 h-full relative">
                <div className="w-full bg-[#ef5d5d] absolute bottom-0" style={{ height: `${(1/14)*100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-around ml-8 mt-4 text-slate-500 text-sm">
          <div className="w-1/4 text-center">Passed</div>
          <div className="w-1/4 text-center">Warnings</div>
          <div className="w-1/4 text-center">Critical</div>
        </div>
      </div>
    </div>
  );
}
