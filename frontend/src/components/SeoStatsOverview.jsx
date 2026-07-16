import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Activity, Settings, Layout, Image as ImageIcon, Code2 } from 'lucide-react';

export default function SeoStatsOverview() {
  return (
    <div className="w-full space-y-4 mb-8">
      {/* Top Row: Priorities */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Critical */}
        <div className="bg-white rounded-xl border border-rose-100 shadow-[0_2px_10px_-3px_rgba(225,29,72,0.1)] p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-rose-300 transition-all">
          <div className="absolute top-0 w-full h-1 bg-rose-500"></div>
          <AlertCircle className="w-5 h-5 text-rose-500 absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity" />
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Critical</h4>
          <span className="text-5xl font-light text-rose-500 mb-1">1</span>
          <p className="text-[13px] font-medium text-slate-400">Fix immediately</p>
        </div>

        {/* High */}
        <div className="bg-white rounded-xl border border-amber-100 shadow-[0_2px_10px_-3px_rgba(217,119,6,0.1)] p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="absolute top-0 w-full h-1 bg-amber-400"></div>
          <AlertTriangle className="w-5 h-5 text-amber-500 absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity" />
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">High</h4>
          <span className="text-5xl font-light text-amber-500 mb-1">8</span>
          <p className="text-[13px] font-medium text-slate-400">High impact</p>
        </div>

        {/* Medium */}
        <div className="bg-white rounded-xl border border-blue-100 shadow-[0_2px_10px_-3px_rgba(37,99,235,0.1)] p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="absolute top-0 w-full h-1 bg-blue-500"></div>
          <Info className="w-5 h-5 text-blue-500 absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity" />
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Medium</h4>
          <span className="text-5xl font-light text-blue-600 mb-1">12</span>
          <p className="text-[13px] font-medium text-slate-400">Warnings</p>
        </div>

        {/* Low Priority */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(100,116,139,0.1)] p-5 flex flex-col items-center justify-center relative overflow-hidden group hover:border-slate-300 transition-all">
          <div className="absolute top-0 w-full h-1 bg-slate-400"></div>
          <CheckCircle2 className="w-5 h-5 text-slate-400 absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity" />
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Low Priority</h4>
          <span className="text-5xl font-light text-slate-500 mb-1">5</span>
          <p className="text-[13px] font-medium text-slate-400">Advisories</p>
        </div>
      </div>

      {/* Bottom Row: Category Scores */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-slate-400" />
            <h4 className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">Performance</h4>
          </div>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className="text-3xl font-light text-rose-500">30</span>
            <span className="text-[13px] font-medium text-slate-400">/100</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Settings className="w-4 h-4 text-slate-400" />
            <h4 className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">Technical SEO</h4>
          </div>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className="text-3xl font-light text-amber-500">63</span>
            <span className="text-[13px] font-medium text-slate-400">/100</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Layout className="w-4 h-4 text-slate-400" />
            <h4 className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">On-Page SEO</h4>
          </div>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className="text-3xl font-light text-blue-500">73</span>
            <span className="text-[13px] font-medium text-slate-400">/100</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-4 h-4 text-slate-400" />
            <h4 className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">Image SEO</h4>
          </div>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className="text-3xl font-light text-blue-500">71</span>
            <span className="text-[13px] font-medium text-slate-400">/100</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-3">
            <Code2 className="w-4 h-4 text-slate-400" />
            <h4 className="text-[12px] font-bold text-slate-600 uppercase tracking-wide">Schema</h4>
          </div>
          <div className="flex items-baseline gap-1 mt-auto">
            <span className="text-3xl font-light text-rose-500">0</span>
            <span className="text-[13px] font-medium text-slate-400">/100</span>
          </div>
        </div>

      </div>
    </div>
  );
}
