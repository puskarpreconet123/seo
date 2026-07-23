import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function OverviewCard({ title, value, change, format, sparklineData, icon: Icon, colorClass }) {
  const isPositive = change >= 0;

  // Render a tiny SVG sparkline for a nice premium touch
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length === 0) return null;
    
    const width = 100;
    const height = 30;
    const maxVal = Math.max(...sparklineData);
    const minVal = Math.min(...sparklineData);
    const range = maxVal - minVal || 1;
    
    const points = sparklineData
      .map((val, idx) => {
        const x = (idx / (sparklineData.length - 1)) * width;
        const y = height - ((val - minVal) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg className="w-24 h-8 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={isPositive ? "#00c07f" : "#ff4d6d"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  const formattedValue = () => {
    if (format === "compact" && typeof value === "number") {
      return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
    }
    return value;
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${colorClass || "bg-slate-100 text-slate-600"}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">
            {formattedValue()}
          </span>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-1.5">
              {isPositive ? (
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-rankgenie-success bg-green-50 px-1.5 py-0.5 rounded">
                  <TrendingUp className="w-3 h-3" />
                  +{change}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-rankgenie-danger bg-red-50 px-1.5 py-0.5 rounded">
                  <TrendingDown className="w-3 h-3" />
                  {change}%
                </span>
              )}
              <span className="text-[10px] text-slate-400 font-medium">vs last month</span>
            </div>
          )}
        </div>

        {/* Sparkline Visualizer */}
        <div className="pb-1">
          {renderSparkline()}
        </div>
      </div>
    </div>
  );
}
