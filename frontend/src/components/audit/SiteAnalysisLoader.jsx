"use client";

import React, { useState, useEffect } from "react";
import { 
  Globe, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  Gauge, 
  Zap, 
  Bot 
} from "lucide-react";

const AUDIT_STEPS = [
  {
    id: "dns",
    title: "Server Protocol & SSL Handshake",
    subtitle: "Checking DNS records, SSL Certificate & TTFB latency",
    icon: ShieldCheck,
  },
  {
    id: "crawl",
    title: "DOM Crawl & Meta Tag Audit",
    subtitle: "Parsing Title, Meta Description, H1-H6 structure & canonicals",
    icon: Search,
  },
  {
    id: "vitals",
    title: "Core Web Vitals & Page Speed",
    subtitle: "Evaluating LCP, CLS, FCP & render-blocking scripts",
    icon: Zap,
  },
  {
    id: "aeo",
    title: "AEO & Generative AI Engine Index",
    subtitle: "Auditing visibility in Perplexity, ChatGPT & Gemini",
    icon: Bot,
  },
  {
    id: "synthesize",
    title: "Synthesizing SEO Health Score",
    subtitle: "Compiling Technical Audit & prioritizing action items",
    icon: Sparkles,
  },
];

// Real 3D rotating globe built from CSS perspective + preserve-3d,
// instead of a flat SVG with dash-offset "fake spin".
function Animated3dGlobe({ className = "w-7 h-7" }) {
  // Longitude rings placed at evenly spaced angles around the Y axis.
  // Because the whole group sits inside a perspective + preserve-3d
  // context and spins on rotateY, each ring genuinely swings from
  // "edge-on" (looks like a thin vertical line) to "face-on" (looks
  // like a full circle) as it rotates — the same optical behaviour a
  // real wireframe sphere has, rather than a dash-array animation
  // pretending to be one.
  const MERIDIAN_ANGLES = [0, 30, 60, 90, 120, 150];

  return (
    <div className={`relative ${className}`} style={{ perspective: "220px" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes globeSpin3d {
          from { transform: rotateX(-12deg) rotateY(0deg); }
          to   { transform: rotateX(-12deg) rotateY(360deg); }
        }
        @keyframes globeBob {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-1.5px); }
        }
        @keyframes globeSheen {
          0%, 100% { opacity: 0.25; transform: translateX(-10%); }
          50%      { opacity: 0.5;  transform: translateX(10%); }
        }
        .globe-wrap {
          animation: globeBob 3.2s ease-in-out infinite;
        }
        .globe-sphere {
          transform-style: preserve-3d;
          animation: globeSpin3d 7s linear infinite;
        }
        .globe-meridian {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          border: 1.4px solid currentColor;
        }
        .globe-sheen {
          animation: globeSheen 3.5s ease-in-out infinite;
        }
      `}} />

      <div className="w-full h-full globe-wrap relative text-rankgenie-orange">
        {/* Base sphere fill + shading so it reads as a solid volume,
            not just wireframe lines */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9) 0%, rgba(249,115,22,0.55) 38%, rgba(194,65,12,0.65) 100%)",
          }}
        />
        <div className="absolute inset-0 rounded-full border-[1.5px] border-current opacity-90" />

        {/* Moving highlight to sell the 3D volume as it spins */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden pointer-events-none globe-sheen"
          style={{
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.9), transparent 55%)",
          }}
        />

        {/* Rotating 3D longitude shell */}
        <div className="absolute inset-0 globe-sphere">
          {MERIDIAN_ANGLES.map((deg) => (
            <div
              key={deg}
              className="globe-meridian"
              style={{
                transform: `rotateY(${deg}deg)`,
                opacity: deg === 0 || deg === 90 ? 0.85 : 0.4,
              }}
            />
          ))}
          {/* Equator, tilted slightly so it reads as a 3D belt */}
          <div
            className="globe-meridian"
            style={{ transform: "rotateX(90deg)", opacity: 0.55 }}
          />
        </div>

        {/* Active search node glowing at the core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SiteAnalysisLoader({ domain = "example.com" }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    // Progress increment timer
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) return 94;
        const bump = Math.floor(Math.random() * 8) + 4;
        return Math.min(94, prev + bump);
      });
    }, 400);

    // Step cycle timer
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < AUDIT_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1100);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 flex flex-col items-center justify-center">
      {/* Outer Card Wrapper */}
      <div className="w-full bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-6 md:p-10 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
        {/* Subtle Background Glow Spheres */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header & Domain Pill */}
        <div className="flex flex-col items-center text-center space-y-3 mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200/80 shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rankgenie-orange"></span>
            </span>
            <span className="text-xs font-bold text-slate-700">
              Analyzing Domain: <span className="text-rankgenie-orange font-extrabold">{domain}</span>
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Running Deep SEO Audit
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-lg">
            Scanning website architecture, search visibility, Core Web Vitals & Generative AI indexability in real time.
          </p>
        </div>

        {/* Central Holographic Radar Scanner */}
        <div className="relative my-8 flex items-center justify-center">
          <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
            {/* Outer Concentric Pulse Waves */}
            <div className="absolute inset-0 rounded-full border border-orange-500/20 animate-radar-pulse pointer-events-none"></div>
            <div className="absolute inset-4 rounded-full border border-purple-500/20 animate-radar-pulse [animation-delay:0.75s] pointer-events-none"></div>

            {/* Outer Gradient Ring (Spin Clockwise) */}
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-orange-500 border-r-purple-600 animate-spin"></div>
            
            {/* Inner Gradient Ring (Spin Counter-Clockwise) */}
            <div className="absolute inset-6 rounded-full border-2 border-transparent border-b-cyan-500 border-l-orange-400 animate-spin-reverse"></div>

            {/* Center Pulsing Sphere */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-white via-orange-50/90 to-amber-100/70 border-2 border-orange-200/90 shadow-2xl shadow-orange-500/20 flex flex-col items-center justify-center relative z-10 text-slate-900 group">
              <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-300/50 mb-1 shadow-xs">
                <Animated3dGlobe className="w-8 h-8 md:w-9 md:h-9" />
              </div>
              <span className="text-xs font-black text-slate-900 tracking-wider uppercase">
                {progress}%
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full max-w-2xl mx-auto mb-8 relative z-10">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
            <span>Overall Progress</span>
            <span className="text-rankgenie-orange font-extrabold">{progress}% Complete</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-purple-600 to-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Stepper Status Steps */}
        <div className="w-full max-w-2xl mx-auto space-y-3 relative z-10">
          {AUDIT_STEPS.map((step, index) => {
            const IconComponent = step.icon;
            const isCompleted = index < currentStepIndex;
            const isActive = index === currentStepIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 md:gap-4 p-3 md:p-3.5 rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? "bg-orange-50/70 border-orange-200 shadow-md shadow-orange-500/5 translate-x-1"
                    : isCompleted
                    ? "bg-slate-50/60 border-slate-200/80 opacity-90"
                    : "bg-white/40 border-slate-100 opacity-40"
                }`}
              >
                {/* Step Indicator Icon */}
                <div
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-sm"
                      : isActive
                      ? "bg-rankgenie-orange text-white shadow-md shadow-orange-500/20"
                      : "bg-slate-100 text-slate-400 border border-slate-200"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <IconComponent className="w-5 h-5" />
                  )}
                </div>

                {/* Step Text Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-xs md:text-sm font-bold truncate ${
                        isActive
                          ? "text-slate-900 font-extrabold"
                          : isCompleted
                          ? "text-slate-700"
                          : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </h4>
                    {isActive && (
                      <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider animate-pulse shrink-0">
                        In Progress
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[11px] font-semibold text-emerald-600 shrink-0">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] md:text-xs text-slate-500 truncate mt-0.5">
                    {step.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Skeleton Metric Preview Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mt-8 pt-6 border-t border-slate-100 relative z-10">
          <div className="bg-slate-50/80 border border-slate-200/70 p-3.5 rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-purple-600" /> Tech Health
              </span>
              <span className="h-3 w-10 bg-slate-200 rounded animate-pulse"></span>
            </div>
            <div className="h-5 w-24 bg-slate-200 rounded mb-1 animate-pulse"></div>
            <div className="h-2 w-full bg-slate-200 rounded animate-pulse"></div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/70 p-3.5 rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-blue-600" /> AEO Visibility
              </span>
              <span className="h-3 w-10 bg-slate-200 rounded animate-pulse"></span>
            </div>
            <div className="h-5 w-24 bg-slate-200 rounded mb-1 animate-pulse"></div>
            <div className="h-2 w-full bg-slate-200 rounded animate-pulse"></div>
          </div>

          <div className="bg-slate-50/80 border border-slate-200/70 p-3.5 rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-600" /> Core Web Vitals
              </span>
              <span className="h-3 w-10 bg-slate-200 rounded animate-pulse"></span>
            </div>
            <div className="h-5 w-24 bg-slate-200 rounded mb-1 animate-pulse"></div>
            <div className="h-2 w-full bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div> */}
      </div>
    </div>
  );
}