"use client";

import React from "react";
import { Gauge, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight, Zap, HardDrive } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CustomGaugeTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const isScore = data.name === "Score";
    return (
      <div className="bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl font-medium flex items-center gap-2 border border-slate-700/80 pointer-events-none">
        <span className={`w-2.5 h-2.5 rounded-full ${isScore ? "bg-purple-500" : "bg-slate-400"}`}></span>
        <span>{data.name}:</span>
        <span className="font-bold text-purple-300">{data.value}/100</span>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl font-medium flex items-center gap-2 border border-slate-700/80 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.solidColor }}></span>
        <span>{data.name}:</span>
        <span className="font-bold text-slate-100">{data.count} checks ({data.percent}%)</span>
      </div>
    );
  }
  return null;
};

export default function SiteAuditWidget({ auditData }) {
  const currentScore = auditData?.overallScore || 63;

  const gaugeData = [
    { name: "Score", value: currentScore },
    { name: "Remaining", value: Math.max(0, 100 - currentScore) },
  ];

  const GAUGE_COLORS = ["#9333ea", "#f1f5f9"];

  const severityData = [
    { name: "Passed", count: 13, percent: 81, gradientId: "greenGradient", solidColor: "#10b981" },
    { name: "Warnings", count: 2, percent: 13, gradientId: "amberGradient", solidColor: "#f59e0b" },
    { name: "Critical", count: 1, percent: 6, gradientId: "roseGradient", solidColor: "#f43f5e" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      {/* Audit Overview Card */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col w-full h-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
                Audit Overview
              </h3>
              <p className="text-xs text-slate-400">Technical Health & Score</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
            Site Score
          </span>
        </div>

        {/* Speedometer Arc Gauge Diagram */}
        <div className="flex flex-col items-center justify-center my-2">
          <div className="w-full h-[180px] relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomGaugeTooltip />} isAnimationActive={false} offset={15} />
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="75%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={72}
                  outerRadius={100}
                  paddingAngle={2}
                  cornerRadius={4}
                  dataKey="value"
                  stroke="none"
                >
                  {gaugeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GAUGE_COLORS[index % GAUGE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Score Text Inside Semi-Circle */}
            <div className="absolute bottom-3 inset-x-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-slate-800 tracking-tight">{currentScore}</span>
                <span className="text-xs font-bold text-slate-400">/100</span>
              </div>
              <div className="mt-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Fair Optimization
                </span>
              </div>
            </div>
          </div>

          {/* Mini-Stat Cards below Gauge */}
          <div className="grid grid-cols-3 gap-3 w-full mt-4">
            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-center hover:bg-emerald-50/50 hover:border-emerald-100 transition-colors">
              <div className="flex items-center justify-center gap-1 text-emerald-600 text-xs font-semibold mb-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Passed</span>
              </div>
              <span className="text-lg font-bold text-slate-800">13</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-center hover:bg-amber-50/50 hover:border-amber-100 transition-colors">
              <div className="flex items-center justify-center gap-1 text-amber-600 text-xs font-semibold mb-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Warnings</span>
              </div>
              <span className="text-lg font-bold text-slate-800">2</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-center hover:bg-rose-50/50 hover:border-rose-100 transition-colors">
              <div className="flex items-center justify-center gap-1 text-rose-600 text-xs font-semibold mb-0.5">
                <XCircle className="w-3.5 h-3.5" />
                <span>Errors</span>
              </div>
              <span className="text-lg font-bold text-slate-800">1</span>
            </div>
          </div>
        </div>

        <hr className="border-slate-100 my-4" />

        {/* Audit Metadata Details */}
        <div className="space-y-3 text-xs mt-auto">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Website audited</span>
            <span className="text-slate-800 font-semibold truncate max-w-[200px]">https://preconetindia.com</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Final Destination</span>
            <span className="text-blue-600 font-semibold truncate max-w-[200px] flex items-center gap-0.5">
              https://preconetindia.com <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Status Code</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
              200 OK
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Response Time
            </span>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                Fair
              </span>
              <span className="text-slate-800 font-bold">2,602 ms</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-emerald-500" /> HTML Payload
            </span>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                Optimal
              </span>
              <span className="text-slate-800 font-bold">40.1 KB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Issues By Severity Card */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col w-full h-full">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
              Issues By Severity
            </h3>
            <p className="text-xs text-slate-400">Categorized automated audit checks</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            16 Checks
          </span>
        </div>
        
        {/* Recharts BarChart */}
        <div className="w-full flex-1 min-h-[260px] pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={severityData}
              margin={{ top: 20, right: 20, left: -15, bottom: 5 }}
              barSize={90}
            >
              <defs>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="amberGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f87171" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                dy={8}
              />
              <YAxis
                domain={[0, 14]}
                ticks={[0, 2, 4, 6, 8, 10, 12, 14]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <Tooltip
                content={<CustomBarTooltip />}
                isAnimationActive={false}
                cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#${entry.gradientId})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Summary Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <div className="text-xs">
              <span className="font-bold text-slate-700">13</span> <span className="text-slate-400">Passed (81%)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400"></span>
            <div className="text-xs">
              <span className="font-bold text-slate-700">2</span> <span className="text-slate-400">Warnings (13%)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <div className="text-xs">
              <span className="font-bold text-slate-700">1</span> <span className="text-slate-400">Critical (6%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
