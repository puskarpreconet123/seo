"use client";

import React, { useState } from "react";
import { Globe, Trophy, ShieldCheck, AlertTriangle, Lightbulb, CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";

export default function CompetitorAuditPage() {
  const [primaryUrl, setPrimaryUrl] = useState("https://example.com");
  const [competitorUrl, setCompetitorUrl] = useState("https://competitor.com");
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!primaryUrl || !competitorUrl) return;

    setIsComparing(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/competitor/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primary_url: primaryUrl, competitor_url: competitorUrl }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Competitor comparison failed.");
      }

      const data = await res.json();
      setComparisonResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-800">Competitor Audit & Comparison Engine</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Side-by-side technical SEO audit comparison and AI-generated tactical advice.
          </p>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleCompare} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Your Website URL (Primary)</label>
              <input
                type="text"
                value={primaryUrl}
                onChange={(e) => setPrimaryUrl(e.target.value)}
                placeholder="https://mysite.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Competitor Website URL</label>
              <input
                type="text"
                value={competitorUrl}
                onChange={(e) => setCompetitorUrl(e.target.value)}
                placeholder="https://competitor.com"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
              />
            </div>
          </div>

          {error && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700">{error}</div>}

          <button
            type="submit"
            disabled={isComparing || !primaryUrl || !competitorUrl}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isComparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
            Compare Technical SEO Audits
          </button>
        </form>
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <div className="space-y-6">
          {/* Winner Banner */}
          {comparisonResult.ai_insights && (
            <div className="bg-gradient-to-r from-purple-900 to-slate-900 text-white p-6 rounded-xl border border-purple-800/80 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wide">
                  Winner: <span className="text-amber-300 capitalize">{comparisonResult.ai_insights.winner_overall}</span>
                </h3>
              </div>
              <p className="text-xs text-purple-100/90 leading-relaxed font-medium">
                {comparisonResult.ai_insights.winner_reason}
              </p>
            </div>
          )}

          {/* Scores Comparison Table */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Side-by-Side Health Score Comparison
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Site Card */}
              <div className="p-5 bg-purple-50/50 border border-purple-200 rounded-xl space-y-3">
                <div className="text-xs font-bold text-purple-600 uppercase">Primary Site</div>
                <div className="font-bold text-slate-800 truncate text-sm">{comparisonResult.primary_audit?.requested_url}</div>
                <div className="text-3xl font-extrabold text-purple-700">
                  {comparisonResult.primary_audit?.health_score}/100
                </div>
              </div>

              {/* Competitor Site Card */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="text-xs font-bold text-slate-500 uppercase">Competitor Site</div>
                <div className="font-bold text-slate-800 truncate text-sm">{comparisonResult.competitor_audit?.requested_url}</div>
                <div className="text-3xl font-extrabold text-slate-800">
                  {comparisonResult.competitor_audit?.health_score}/100
                </div>
              </div>
            </div>
          </div>

          {/* Tactical Advice to Outperform */}
          {comparisonResult.ai_insights?.suggestions_to_outperform && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Tactical Advice to Outperform Competitor
                </h3>
              </div>

              <ul className="space-y-2">
                {comparisonResult.ai_insights.suggestions_to_outperform.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <ArrowRight className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
