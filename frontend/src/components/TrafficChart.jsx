import React, { useState } from "react";
import { Info, HelpCircle } from "lucide-react";

export default function TrafficChart({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) return null;

  // Chart configuration constants
  const width = 600;
  const height = 240;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map(d => Math.max(d.organic, d.paid)));
  // Round maxVal up to a neat number
  const yAxisMax = Math.ceil(maxVal / 20000) * 20000;
  
  // Convert coordinate logic
  const getX = (idx) => paddingLeft + (idx / (data.length - 1)) * chartWidth;
  const getY = (val) => paddingTop + chartHeight - (val / yAxisMax) * chartHeight;

  // Generate SVG paths
  const getPathString = (key) => {
    return data.map((d, idx) => {
      const x = getX(idx);
      const y = getY(d[key]);
      return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  const getAreaPathString = (key) => {
    const linePath = getPathString(key);
    const startX = getX(0);
    const endX = getX(data.length - 1);
    const baseY = paddingTop + chartHeight;
    return `${linePath} L ${endX} ${baseY} L ${startX} ${baseY} Z`;
  };

  // Y-axis gridline ticks
  const ticksCount = 4;
  const yTicks = Array.from({ length: ticksCount + 1 }).map((_, idx) => {
    const val = (yAxisMax / ticksCount) * idx;
    return { val, y: getY(val) };
  });

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-700 text-sm tracking-tight">Traffic Analytics</h3>
          <span className="group relative">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 bg-slate-800 text-white text-[10px] rounded p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md leading-relaxed">
              Organic vs. Paid search traffic over the last 6 months.
            </span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-semrush-orange rounded-full"></span>
            <span className="text-slate-600">Organic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-semrush-blue rounded-full"></span>
            <span className="text-slate-600">Paid Search</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="mt-4 relative flex-1 min-h-[250px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            {/* Gradients */}
            <linearGradient id="organicGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff640d" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ff640d" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1098f7" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#1098f7" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridlines & Y-Axis labels */}
          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={width - paddingRight}
                y2={tick.y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={paddingLeft - 10}
                y={tick.y + 4}
                className="text-[10px] fill-slate-400 font-semibold"
                textAnchor="end"
              >
                {new Intl.NumberFormat("en-US", { notation: "compact" }).format(tick.val)}
              </text>
            </g>
          ))}

          {/* Area Gradients */}
          <path d={getAreaPathString("paid")} fill="url(#paidGrad)" />
          <path d={getAreaPathString("organic")} fill="url(#organicGrad)" />

          {/* Paths */}
          <path
            d={getPathString("paid")}
            fill="none"
            stroke="#1098f7"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={getPathString("organic")}
            fill="none"
            stroke="#ff640d"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points / Interactivity Bars */}
          {data.map((d, idx) => {
            const x = getX(idx);
            const orgY = getY(d.organic);
            const paidY = getY(d.paid);

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Visual indicator lines */}
                {hoveredIdx === idx && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + chartHeight}
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                )}

                {/* Organic dot */}
                <circle
                  cx={x}
                  cy={orgY}
                  r={hoveredIdx === idx ? 5 : 3.5}
                  className="fill-white stroke-semrush-orange"
                  strokeWidth="2.5"
                />

                {/* Paid dot */}
                <circle
                  cx={x}
                  cy={paidY}
                  r={hoveredIdx === idx ? 5 : 3.5}
                  className="fill-white stroke-semrush-blue"
                  strokeWidth="2.5"
                />

                {/* Hidden hover interaction rect */}
                <rect
                  x={x - chartWidth / (data.length - 1) / 2}
                  y={paddingTop}
                  width={chartWidth / (data.length - 1)}
                  height={chartHeight}
                  fill="transparent"
                />
              </g>
            );
          })}

          {/* X-Axis labels */}
          {data.map((d, idx) => (
            <text
              key={idx}
              x={getX(idx)}
              y={height - paddingBottom + 20}
              className="text-[10px] fill-slate-400 font-bold"
              textAnchor="middle"
            >
              {d.month}
            </text>
          ))}
        </svg>

        {/* Floating Tooltip HTML Layer */}
        {hoveredIdx !== null && (
          <div
            className="absolute bg-slate-800 text-white rounded-lg p-2.5 shadow-xl text-xs z-10 border border-slate-700 pointer-events-none transition-all duration-100 flex flex-col gap-1 w-36"
            style={{
              left: `${getX(hoveredIdx) + 12}px`,
              top: `${Math.min(getY(data[hoveredIdx].organic), getY(data[hoveredIdx].paid)) - 25}px`,
              transform: getX(hoveredIdx) > width - 150 ? "translateX(-115%)" : "none",
            }}
          >
            <div className="font-bold border-b border-slate-700 pb-1 text-slate-300">
              {data[hoveredIdx].month} Analytics
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-semrush-orange"></span>
                <span>Organic:</span>
              </span>
              <span className="font-bold">{data[hoveredIdx].organic.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-semrush-blue"></span>
                <span>Paid:</span>
              </span>
              <span className="font-bold">{data[hoveredIdx].paid.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
