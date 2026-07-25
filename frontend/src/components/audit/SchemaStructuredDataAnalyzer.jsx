"use client";

import React from 'react';
import { XCircle, AlertTriangle, CheckCircle2, Network, Lightbulb, Code } from 'lucide-react';
import { useSeo } from "@/context/SeoContext";

export default function SchemaStructuredDataAnalyzer({ schemaReport }) {
  const { seoData } = useSeo();

  const schemaAnalysis = schemaReport || seoData?.schema_analysis_report || {};
  
  const score = schemaAnalysis.schema_score ?? 0;
  const jsonLdCount = schemaAnalysis.statistics?.json_ld ?? 0;
  const microdataCount = schemaAnalysis.statistics?.microdata ?? 0;
  const rdfaCount = schemaAnalysis.statistics?.rdfa ?? 0;

  const items = schemaAnalysis.items || [];
  const detectedTypes = Array.from(new Set(items.map(item => item.schema_type))).filter(Boolean);
  
  const passed = schemaAnalysis.passed || [];
  const warnings = schemaAnalysis.warnings || [];
  const critical = schemaAnalysis.critical || [];
  const suggestions = schemaAnalysis.optimization_suggestions || [];

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
          <span className={`px-3 py-1 rounded-full border font-bold text-[13px] ${
            score > 0 ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-rose-50 border-rose-200 text-rose-600"
          }`}>
            {score}/100
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
                <span className="text-xl font-bold text-slate-800">{jsonLdCount}</span>
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-1">JSON-LD</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-xl font-bold text-slate-800">{microdataCount}</span>
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-1">MICRODATA</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-lg py-4 flex flex-col items-center justify-center shadow-sm">
                <span className="text-xl font-bold text-slate-800">{rdfaCount}</span>
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase mt-1">RDFA</span>
              </div>
            </div>
          </div>

          {/* Detected Schema Types */}
          <div className="lg:col-span-2 bg-slate-50/50 border border-slate-200 rounded-xl p-5 shadow-sm">
            <h4 className="text-[11px] font-bold text-slate-500 tracking-wider uppercase border-b border-slate-200 pb-3 mb-4">
              Detected Schema Types
            </h4>
            <div className="flex flex-wrap items-center gap-2 min-h-[50px]">
              {detectedTypes.length > 0 ? (
                detectedTypes.map((type, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold rounded-lg flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    {type}
                  </span>
                ))
              ) : (
                <span className="text-[13px] text-slate-500">No schema types detected.</span>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Schema Entity Validations */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm min-h-[120px] flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-5 h-5 text-purple-600" />
            <h4 className="font-bold text-slate-600 text-[14px]">Schema Entity Validations</h4>
          </div>
          <div className="space-y-4">
            {items.length > 0 ? (
              items.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                      {item.schema_type} ({item.format})
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      item.is_valid ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
                    }`}>
                      {item.is_valid ? "Valid" : "Invalid"}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {item.passed.map((msg, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-1.5 text-xs text-slate-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{msg}</span>
                      </div>
                    ))}
                    {item.critical.map((msg, cIdx) => (
                      <div key={cIdx} className="flex items-start gap-1.5 text-xs text-rose-600">
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{msg}</span>
                      </div>
                    ))}
                    {item.warnings.map((msg, wIdx) => (
                      <div key={wIdx} className="flex items-start gap-1.5 text-xs text-amber-600">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{msg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <span className="text-slate-500 text-[13px]">No schema entities found on core pages.</span>
            )}
          </div>
        </div>

        {/* Row 3: Schema Optimization Suggestions */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h4 className="font-bold text-slate-700 text-[14px]">Schema Optimization Suggestions</h4>
          </div>
          <ul className="space-y-2.5">
            {suggestions.length > 0 ? (
              suggestions.map((item, idx) => (
                <li key={idx} className="flex gap-3 text-slate-500 text-[13px] leading-relaxed items-start">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
                  <span>{item}</span>
                </li>
              ))
            ) : (
              <li className="flex gap-3 text-slate-500 text-[13px] leading-relaxed items-start">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
                <span>Add structured markup (JSON-LD format is highly recommended by Google) to define Organization, Article, or LocalBusiness info.</span>
              </li>
            )}
          </ul>
        </div>

        {/* Row 4: Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          
          {/* Critical Issues Column */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center">
                <XCircle className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <h3 className="font-bold text-slate-800 text-[12px] tracking-wide uppercase">
                Critical Issues ({critical.length})
              </h3>
            </div>
            
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] pr-1">
              {critical.length > 0 ? (
                critical.map((item, idx) => (
                  <div key={idx} className="bg-rose-50/50 border border-rose-200 rounded-lg p-4 flex gap-3 items-start animate-fade-in">
                    <XCircle className="w-5 h-5 text-rose-500 fill-rose-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                      <h4 className="text-slate-800 font-bold text-[13px] mb-0.5">{item.check_name}</h4>
                      <p className="text-slate-500 text-[12px] leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-slate-400 text-[13px]">No critical issues found.</span>
              )}
            </div>
          </div>

          {/* Warnings Column */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 fill-slate-800 text-white" strokeWidth={2} />
              <h3 className="font-bold text-slate-800 text-[12px] tracking-wide uppercase">
                Warnings ({warnings.length})
              </h3>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] pr-1">
              {warnings.length > 0 ? (
                warnings.map((item, idx) => (
                  <div key={idx} className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex gap-3 items-start animate-fade-in">
                    <AlertTriangle className="w-5 h-5 text-amber-500 fill-amber-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                      <h4 className="text-slate-800 font-bold text-[13px] mb-0.5">{item.check_name}</h4>
                      <p className="text-slate-500 text-[12px] leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-slate-400 text-[13px]">No warnings found.</span>
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
                Passed Checks ({passed.length})
              </h3>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] pr-1">
              {passed.length > 0 ? (
                passed.map((item, idx) => (
                  <div key={idx} className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 flex gap-3 items-start animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <div>
                      <h4 className="text-slate-800 font-bold text-[13px] mb-0.5">{item.check_name}</h4>
                      <p className="text-slate-500 text-[12px] leading-relaxed">{item.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-slate-400 text-[13px]">No passed checks.</span>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
