"use client";

import React from 'react';
import { useSeo } from '@/context/SeoContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  AreaChart, Area 
} from 'recharts';

export default function PerformanceCharts() {
  const { seoData } = useSeo();
  const desktopData = seoData?.website?.fullAudit?.desktop || seoData?.website?.fullAudit?.pagespeed?.desktop || null;
  const mainCrawlTime = seoData?.website?.technicalAudit?.responseTime || 0;

  const hasLivePerformanceData = desktopData && desktopData.success === true;

  const metrics = hasLivePerformanceData ? (desktopData?.metrics || {}) : {};

  const fcpMs = hasLivePerformanceData ? ((metrics.first_contentful_paint || 0) * 1000) : 0;
  const lcpMs = hasLivePerformanceData ? ((metrics.largest_contentful_paint || 0) * 1000) : 0;
  const tbtMs = hasLivePerformanceData ? (metrics.total_blocking_time || 0) : 0;
  const ttfbMs = hasLivePerformanceData ? mainCrawlTime : 0;
  const loadTimeMs = hasLivePerformanceData ? ((metrics.interactive ? (metrics.interactive * 1000) : (mainCrawlTime * 2)) || 0) : 0;

  // Data for the Performance Metrics Horizontal Bar Chart
  const barData = [
    { name: 'FCP', duration: Math.round(fcpMs), color: '#38bdf8' },
    { name: 'LCP', duration: Math.round(lcpMs), color: '#22d3ee' },
    { name: 'TBT', duration: Math.round(tbtMs), color: '#a78bfa' },
    { name: 'TTFB', duration: Math.round(ttfbMs), color: '#818cf8' },
    { name: 'Load Time', duration: Math.round(loadTimeMs), color: '#c084fc' },
  ];

  // Data for Audit Execution Speed Area Chart
  const areaData = [
    { stage: 'Server Connect', time: Math.round(ttfbMs * 0.4) },
    { stage: 'TTFB Latency', time: Math.round(ttfbMs) },
    { stage: 'FCP Paint', time: Math.round(fcpMs) },
    { stage: 'Page Load Complete', time: Math.round(loadTimeMs) },
  ];

  const maxVal = Math.max(8000, Math.round(loadTimeMs * 1.1));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 mt-6">
      
      {/* Bar Chart Card: Performance Metrics */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] flex flex-col">
        <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-6 w-full">
          Performance Metrics (Core Web Vitals)
        </h3>
        
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={barData}
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis 
                type="number" 
                domain={[0, maxVal]}
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  backgroundColor: '#334155', 
                  borderRadius: '6px', 
                  border: 'none', 
                  color: '#fff',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px'
                }}
                itemStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                formatter={(value) => [`Duration (ms): ${value}`]}
                labelStyle={{ display: 'none' }}
              />
              <Bar dataKey="duration" radius={[0, 4, 4, 0]} barSize={28}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Area Chart Card: Audit Execution Speed */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] flex flex-col">
        <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-6 w-full">
          Audit Execution Speed (MS)
        </h3>
        
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={areaData}
              margin={{ top: 10, right: 30, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="stage" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                dy={10}
              />
              <YAxis 
                domain={[0, maxVal]}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                tickFormatter={(val) => val === 0 ? '0' : val.toLocaleString()}
              />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                itemStyle={{ color: '#475569', fontWeight: 'bold', fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey="time" 
                stroke="#06b6d4" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTime)" 
                activeDot={{ r: 8 }}
                dot={{ r: 5, fill: '#06b6d4', strokeWidth: 2, stroke: '#fff' }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
