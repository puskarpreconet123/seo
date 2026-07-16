"use client";

import React from 'react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

export default function SeoScoreCharts() {
  const currentScore = 63;

  // Data for the Donut/Gauge Chart
  const gaugeData = [
    { name: 'Score', value: currentScore },
    { name: 'Remaining', value: 100 - currentScore },
  ];
  
  // Custom purple and light gray for the gauge
  const GAUGE_COLORS = ['#a855f7', '#f1f5f9'];

  // Mock data for the Trend Chart including past and future predictions
  const trendData = [
    { time: 'Jan', score: 52 },
    { time: 'Feb', score: 55 },
    { time: 'Mar', score: 58 },
    { time: 'Apr (Current)', score: currentScore },
    { time: 'May', predicted: 68 },
    { time: 'Jun', predicted: 78 },
    { time: 'Jul', predicted: 85 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      
      {/* Gauge Chart Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] col-span-1 flex flex-col items-center justify-center">
        <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-6 w-full text-center">
          SEO Score Gauge
        </h3>
        
        <div className="w-full h-[250px] relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip 
                position={{ y: 0 }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#475569', fontWeight: 'bold' }}
              />
              <Pie
                data={gaugeData}
                cx="50%"
                cy="50%"
                startAngle={90}
                endAngle={-270}
                innerRadius={70}
                outerRadius={100}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {gaugeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GAUGE_COLORS[index % GAUGE_COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-light text-slate-800">{currentScore}</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Score</span>
          </div>
        </div>
      </div>

      {/* Trend Chart Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] col-span-1 md:col-span-2 flex flex-col">
        <h3 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest mb-6 w-full">
          SEO Score Trend & Prediction
        </h3>
        
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{
                top: 10,
                right: 30,
                left: -20,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                domain={[0, 100]} 
                ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              
              {/* Past/Current Data Line */}
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#a855f7" 
                strokeWidth={3} 
                dot={{ r: 5, fill: '#a855f7', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 8 }} 
                name="Historical Score"
              />
              
              {/* Predicted Future Data Line */}
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#d8b4fe" 
                strokeWidth={3} 
                strokeDasharray="5 5"
                dot={{ r: 5, fill: '#d8b4fe', strokeWidth: 2, stroke: '#fff' }} 
                name="Predicted Growth"
              />

              {/* Highlight Current Dot */}
              <ReferenceDot x="Apr (Current)" y={currentScore} r={8} fill="#a855f7" stroke="white" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#a855f7]"></div>
            <span className="text-[12px] font-medium text-slate-500">Historical & Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#d8b4fe] border-2 border-dashed border-white"></div>
            <span className="text-[12px] font-medium text-slate-500">Predicted Future</span>
          </div>
        </div>

      </div>
    </div>
  );
}
