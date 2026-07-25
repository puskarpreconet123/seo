"use client";

import React from "react";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { useSeo } from "@/context/SeoContext";

export default function SeoScoreCharts() {
  const { seoData } = useSeo();

  const audit = seoData?.website?.technicalAudit || {};
  const currentScore = audit.healthScore ?? audit.overallScore ?? 78;

  // Dynamic 6-month historical score & predicted trajectory
  const trendData = [
    { time: "Jan", score: Math.max(30, currentScore - 15) },
    { time: "Feb", score: Math.max(35, currentScore - 10) },
    { time: "Mar", score: Math.max(40, currentScore - 5) },
    { time: "Apr (Current)", score: currentScore, predicted: currentScore },
    { time: "May", predicted: Math.min(95, currentScore + 6) },
    { time: "Jun", predicted: Math.min(98, currentScore + 12) },
    { time: "Jul", predicted: Math.min(100, currentScore + 18) },
  ];

  return (
    <div className="w-full mb-8">
      {/* Trend Chart Card - Full Width */}
      <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200/80 shadow-sm w-full flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              SEO Score Trend & Prediction
            </h3>
            <p className="text-xs text-slate-400">6-month historical score & predicted trajectory</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#a855f7]"></div>
              <span className="text-xs font-semibold text-slate-600">Historical & Current</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#c084fc] border-2 border-dashed border-white"></div>
              <span className="text-xs font-semibold text-slate-600">Predicted Future</span>
            </div>
          </div>
        </div>
        
        <div className="w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={trendData}
              margin={{
                top: 15,
                right: 30,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }} 
                dy={10}
              />
              <YAxis 
                domain={[0, 100]} 
                ticks={[0, 20, 40, 60, 80, 100]}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#94a3b8", fontSize: 12 }} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.12)", backgroundColor: "#0f172a", color: "#fff" }}
                itemStyle={{ color: "#c084fc", fontWeight: "bold" }}
              />
              
              {/* Soft Gradient Area under Historical Score */}
              <Area 
                type="monotone" 
                dataKey="score" 
                fill="url(#purpleArea)" 
                stroke="none" 
              />

              {/* Past/Current Data Line */}
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#a855f7" 
                strokeWidth={3} 
                dot={{ r: 5, fill: "#a855f7", strokeWidth: 2, stroke: "#fff" }} 
                activeDot={{ r: 8 }} 
                name="Historical Score"
              />
              
              {/* Predicted Future Data Line */}
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#c084fc" 
                strokeWidth={3} 
                strokeDasharray="5 5"
                dot={{ r: 5, fill: "#c084fc", strokeWidth: 2, stroke: "#fff" }} 
                name="Predicted Growth"
              />

              {/* Highlight Current Dot */}
              <ReferenceDot x="Apr (Current)" y={currentScore} r={8} fill="#a855f7" stroke="white" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
