import React from 'react';
import { XCircle, AlertTriangle, CheckCircle2, Network, Lightbulb, Code } from 'lucide-react';

export default function SchemaStructuredDataAnalyzer() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] overflow-hidden w-full mt-8">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-purple-600" strokeWidth={2} />
          <h3 className="font-bold text-slate-500 text-[13px] tracking-widest uppercase">
            Schema Structured Data Analyzer
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-slate-500">Schema Score:</span>
          <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bold text-[13px]">
            0/100
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-slate-50/50">
        
        {/* Row 1: Detected Formats & Schema Types */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Detected Formats */}
          <div className="lg:col-span-1 bg-slate-50/50 border border-slate-200 rounded-xl p-5 shadow-sm">
            <h4 className="text-[11px] font-bold text-slate-500 tracking-wider uppercase border-b border-slate-200 pb-3 mb-4">
              Detected Formats
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-xl font-bold text-slate-800">0</span>
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-1">JSON-LD</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-xl font-bold text-slate-800">0</span>
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-1">MICRODATA</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-xl font-bold text-slate-800">0</span>
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-1">RDFA</span>
              </div>
            </div>
          </div>

          {/* Detected Schema Types */}
          <div className="lg:col-span-2 bg-slate-50/50 border border-slate-200 rounded-xl p-5 shadow-sm">
            <h4 className="text-[11px] font-bold text-slate-500 tracking-wider uppercase border-b border-slate-200 pb-3 mb-4">
              Detected Schema Types
            </h4>
            <div className="flex items-center h-[92px]">
              <span className="text-[13px] text-slate-500">No schema types detected.</span>
            </div>
          </div>
        </div>

        {/* Row 2: Schema Entity Validations */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-h-[160px] flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-purple-600" />
            <h4 className="font-bold text-slate-600 text-[14px]">Schema Entity Validations</h4>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="text-slate-500 text-[13px]">No schema entities found.</span>
          </div>
        </div>

        {/* Row 3: Schema Optimization Suggestions */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h4 className="font-bold text-slate-700 text-[14px]">Schema Optimization Suggestions</h4>
          </div>
          <ul className="space-y-2.5">
            <li className="flex gap-3 text-slate-500 text-[13px] leading-relaxed items-start">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
              <span>Add structured markup (JSON-LD format is highly recommended by Google) to define Organization, Article, or LocalBusiness info.</span>
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
                <h4 className="text-slate-800 font-bold text-[13px] mb-1">Structured Data Presence</h4>
                <p className="text-slate-500 text-[12px] leading-relaxed">
                  No JSON-LD, Microdata, or RDFa structured schemas found on this page. Search engines rely on structured data for rich snippet integration.
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

            <div className="flex-1 flex items-start pt-2">
               <span className="text-slate-400 text-[13px]">No warning checks.</span>
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

            <div className="flex-1 flex items-start pt-2">
               <span className="text-slate-400 text-[13px]">No passed checks.</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
