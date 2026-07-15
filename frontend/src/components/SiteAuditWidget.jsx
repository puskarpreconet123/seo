import React from "react";
import { AlertCircle, AlertTriangle, Info, ShieldCheck } from "lucide-react";

export default function SiteAuditWidget({ auditData }) {
  if (!auditData) return null;

  const score = auditData.healthScore;
  
  // Calculate SVG stroke-dashoffset for the health score gauge
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (val) => {
    if (val >= 90) return "text-emerald-500 stroke-emerald-500";
    if (val >= 80) return "text-green-500 stroke-green-500";
    if (val >= 70) return "text-amber-500 stroke-amber-500";
    return "text-rose-500 stroke-rose-500";
  };

  const getIssueIcon = (type) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-semrush-danger shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-semrush-warning shrink-0" />;
      case "notice":
      default:
        return <Info className="w-4 h-4 text-semrush-blue shrink-0" />;
    }
  };

  const getIssueTypeBadge = (type) => {
    switch (type) {
      case "error":
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-50 text-semrush-danger border border-red-100 uppercase tracking-wide">Error</span>;
      case "warning":
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-50 text-semrush-warning border border-amber-100 uppercase tracking-wide">Warning</span>;
      case "notice":
      default:
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 text-semrush-blue border border-blue-100 uppercase tracking-wide">Notice</span>;
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <h3 className="font-bold text-slate-700 text-sm tracking-tight flex items-center gap-1.5">
          <ShieldCheck className="w-4.5 h-4.5 text-semrush-success" />
          Site Audit & Health
        </h3>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Crawl Complete</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
        {/* Left: Radial gauge */}
        <div className="md:col-span-2 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4 shrink-0">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* SVG Circle Gauge */}
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-100 fill-none"
                strokeWidth={strokeWidth}
              />
              {/* Foreground animated progress circle */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className={`fill-none transition-all duration-1000 ease-out animate-dash ${getScoreColor(score)}`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-slate-800 tracking-tighter">{score}%</span>
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Health Score</div>
            </div>
          </div>
        </div>

        {/* Right: Technical Stats & Audit Logs */}
        <div className="md:col-span-3 space-y-4">
          {/* Status Breakdown Row */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-red-50/50 border border-red-100 p-2 rounded-lg">
              <div className="text-lg font-extrabold text-semrush-danger">{auditData.errors}</div>
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">Errors</div>
            </div>
            <div className="bg-amber-50/50 border border-amber-100 p-2 rounded-lg">
              <div className="text-lg font-extrabold text-semrush-warning">{auditData.warnings}</div>
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">Warnings</div>
            </div>
            <div className="bg-blue-50/50 border border-blue-100 p-2 rounded-lg">
              <div className="text-lg font-extrabold text-semrush-blue">{auditData.notices}</div>
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">Notices</div>
            </div>
          </div>

          {/* Audit Logs list */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Audit Recommendations</h4>
            <div className="space-y-2 max-h-[145px] overflow-y-auto pr-1">
              {auditData.topIssues.map((issue, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-600 font-medium leading-tight truncate">{issue.message}</p>
                  </div>
                  {getIssueTypeBadge(issue.type)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
