"use client";

import React, { useState, useEffect } from "react";
import { LineChart, Search, Globe, RefreshCw, TrendingUp, Award, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function PositionTrackingPage() {
  const [url, setUrl] = useState("https://example.com");
  const [keywordsText, setKeywordsText] = useState("best software, online tools, seo services");
  const [location, setLocation] = useState("India (Google) • English");
  const [timeframe, setTimeframe] = useState("last 7 days");
  
  const [trackData, setTrackData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/position/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        if (data.length > 0 && !trackData) {
          setTrackData(data[0].data);
        }
      }
    } catch (err) {
      console.error("Fetch Position History Error:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!url) return;

    setIsScanning(true);
    setError(null);

    const keywordsList = keywordsText.split(",").map(k => k.trim()).filter(Boolean);

    try {
      const res = await fetch(`${API_BASE_URL}/api/position/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, location, timeframe, keywords: keywordsList }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "SERP position tracking failed.");
      }

      const result = await res.json();
      setTrackData(result.data);
      fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <LineChart className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-800">Real SERP Position Tracking Engine</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track daily SERP rankings, CTR visibility score, and keyword position changes.
          </p>
        </div>
      </div>

      {/* Tracker Configuration Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Target Website URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Location & Engine</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Keywords (Comma separated)</label>
              <input
                type="text"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                placeholder="best tools, pricing, services"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
              />
            </div>
          </div>

          {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700">{error}</div>}

          <button
            type="submit"
            disabled={isScanning || !url}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Scan Live SERP Positions
          </button>
        </form>
      </div>

      {/* Tracker Visual Dashboard */}
      {trackData && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase">Search Visibility</div>
              <div className="text-3xl font-extrabold text-purple-600 mt-1">{trackData.visibility}%</div>
              <div className="text-[11px] text-slate-500 mt-1">Weighted CTR Curve</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase">Top 3 Keywords</div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1">{trackData.categories?.top3?.count || 0}</div>
              <div className="text-[11px] text-slate-500 mt-1">Highest ranking queries</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase">Top 10 Keywords</div>
              <div className="text-3xl font-extrabold text-blue-600 mt-1">{trackData.categories?.top10?.count || 0}</div>
              <div className="text-[11px] text-slate-500 mt-1">Page 1 SERP presence</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-400 uppercase">Top 100 Keywords</div>
              <div className="text-3xl font-extrabold text-slate-800 mt-1">{trackData.categories?.top100?.count || 0}</div>
              <div className="text-[11px] text-slate-500 mt-1">Total indexed queries</div>
            </div>
          </div>

          {/* Visibility Trend Curve Chart */}
          {trackData.trend && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                7-Day Search Visibility Trend
              </h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={trackData.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="visibility" stroke="#9333ea" strokeWidth={3} dot={{ fill: "#9333ea", r: 4 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Scraped Keyword Ranking Table */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Tracked Keywords Ranking Table
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                    <th className="p-2.5">Keyword Query</th>
                    <th className="p-2.5 text-center">SERP Position</th>
                    <th className="p-2.5 text-center">Position Change</th>
                    <th className="p-2.5 text-right">Visibility CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(trackData.keywords || []).map((kw, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="p-2.5 font-bold text-slate-800">{kw.keyword}</td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2.5 py-1 rounded text-xs font-extrabold ${
                          kw.position && kw.position <= 3 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          kw.position && kw.position <= 10 ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-slate-100 text-slate-600"
                        }`}>
                          {kw.position ? `#${kw.position}` : "100+"}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        {kw.change < 0 ? (
                          <span className="text-emerald-600 font-bold flex items-center justify-center gap-0.5"><ArrowUp className="w-3 h-3" /> {Math.abs(kw.change)}</span>
                        ) : kw.change > 0 ? (
                          <span className="text-rose-600 font-bold flex items-center justify-center gap-0.5"><ArrowDown className="w-3 h-3" /> {kw.change}</span>
                        ) : (
                          <span className="text-slate-400 font-medium">-</span>
                        )}
                      </td>
                      <td className="p-2.5 text-right font-bold text-purple-600">{kw.visibility}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
