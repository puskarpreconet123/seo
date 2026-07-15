"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Cpu,
  MapPin,
  Sparkles,
  TrendingUp,
  Megaphone,
  MessageCircle,
  UserPlus,
  Plus,
  ExternalLink,
  Globe,
  MoreVertical
} from "lucide-react";

export default function HomeDashboard({ seoData, currentDomain }) {
  const router = useRouter();
  const carouselRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const checkScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setShowLeftScroll(scrollLeft > 5);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [seoData]);

  const handleCarouselScroll = () => {
    checkScroll();
  };

  const scrollCarouselLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -260, behavior: "smooth" });
    }
  };

  const scrollCarouselRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 260, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Toolkit/Service Cards Flex Carousel */}
      <div className="relative group/carousel">
        {/* Left Scroll Button */}
        {showLeftScroll && (
          <button
            onClick={scrollCarouselLeft}
            className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center z-20 transition-all duration-200"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Left Gradient Blur Fade */}
        {showLeftScroll && (
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-semrush-lightBg to-transparent pointer-events-none z-10" />
        )}

        {/* Scrollable Container */}
        <div 
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
        >
          {/* Card 1: AI Search */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all duration-200 w-64 min-w-[240px] text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-800 text-sm">AI Search Optimization</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Optimize your website visibility for ChatGPT search, Gemini, and LLM search agents.
            </p>
          </div>

          {/* Card 2: Local */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all duration-200 w-64 min-w-[240px] text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-semrush-orange">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-800 text-sm">Local SEO</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Manage reviews, boost local maps search visibility, and track local business competitors.
            </p>
          </div>

          {/* Card 3: Content */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all duration-200 w-64 min-w-[240px] text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-500">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-800 text-sm">Content Assistant</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Create high-ranking, SEO-friendly articles using built-in AI writing models.
            </p>
          </div>

          {/* Card 4: Advertising */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all duration-200 w-64 min-w-[240px] text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-800 text-sm">Advertising Insights</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Research competitors, launch and optimize Google Search and Meta Ads campaigns.
            </p>
          </div>

          {/* Card 5: AI PR */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all duration-200 w-64 min-w-[240px] text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                <Megaphone className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-800 text-sm">AI PR Campaigns</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Get media press coverage that directly shapes your brand visibility across generative models.
            </p>
          </div>

          {/* Card 6: Social Media */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-all duration-200 w-64 min-w-[240px] text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-800 text-sm">Social Analytics</span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Manage the entire social media cycle: schedule posts, track shares, and analyze traffic.
            </p>
          </div>
        </div>

        {/* Right Gradient Blur Fade */}
        {showRightScroll && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-semrush-lightBg to-transparent pointer-events-none z-10" />
        )}

        {/* Right Scroll Button */}
        {showRightScroll && (
          <button
            onClick={scrollCarouselRight}
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center z-20 transition-all duration-200"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Folders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-800 tracking-tight">Folders</h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs transition-colors shadow-sm">
              <UserPlus className="w-3.5 h-3.5" />
              Share
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" />
              Create Folder
            </button>
          </div>
        </div>

        {/* Main Domain Box Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
          {/* Domain Header Row */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Dynamic Favicon */}
              <div className="w-6 h-6 rounded bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src={`https://www.google.com/s2/favicons?sz=32&domain=${encodeURIComponent(currentDomain)}`}
                  alt="" 
                  className="w-4 h-4 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <Globe className="w-3.5 h-3.5 text-slate-400 hidden" />
              </div>

              <div className="flex items-baseline gap-2.5">
                <span className="font-extrabold text-blue-600 hover:underline text-[24px] cursor-pointer flex items-center gap-1.5 leading-none">
                  {currentDomain}
                  <ExternalLink className="w-5 h-5 text-blue-500" />
                </span>
                <span className="text-xs text-slate-400 font-semibold hidden sm:inline leading-none">
                  {currentDomain}
                </span>
              </div>
            </div>
            
            <button className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Tab Bar inside Domain Card */}
          <div className="px-4 pt-3 flex border-b border-slate-100 bg-slate-50/30">
            <div className="text-blue-600 border-b-2 border-blue-600 font-extrabold text-xs pb-2 px-1 tracking-wider uppercase">
              SEO
            </div>
          </div>

          {/* Metrics Columns Row */}
          <div className="p-5 overflow-x-auto">
            <div className="grid grid-cols-2 md:grid-cols-7 gap-6 min-w-[750px] divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              {/* 1. AI Visibility */}
              <div className="flex flex-col items-start justify-start text-left p-2 pr-4 first:pl-0 h-full gap-1">
                <span className="text-[14px] text-slate-400 mb-1">Ai Visibility</span>
                <div className="flex items-center gap-2">
                  <span className="text-[20px] font-semibold text-indigo-700 leading-none mt-0.5">n/a</span>
                  <div className="relative flex items-center justify-center mt-0.5">
                    <svg className="w-10 h-6" viewBox="0 0 32 18">
                      <path 
                        d="M 3 15 A 13 13 0 0 1 29 15" 
                        className="stroke-slate-200 fill-none" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 2. Mentions */}
              <div className="flex flex-col items-start justify-start text-left p-2 pl-5 h-full gap-1">
                <span className="text-[14px] text-slate-400 mb-1">Mentions</span>
                <span className="text-[20px] font-semibold text-indigo-700 leading-none mt-1">0</span>
              </div>

              {/* 3. Site Health */}
              <div className="flex flex-col items-start justify-start text-left p-2 pl-5 h-full cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push("/audit")}>
                <span className="text-[14px] text-slate-400 mb-1">Site Health</span>
                <span className="text-[20px] font-semibold text-indigo-700 leading-none mt-0.5">{seoData.website.technicalAudit.healthScore}%</span>
                <span className="text-[14px] text-slate-400 mt-1">just now</span>
              </div>

              {/* 4. Visibility */}
              <div className="flex flex-col items-start justify-start text-left p-2 pl-5 h-full cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push("/organic")}>
                <span className="text-[14px] text-slate-400 mb-1">Visibility</span>
                <span className="text-[20px] font-semibold text-indigo-700 leading-none mt-0.5">14.85%</span>
                <span className="text-[14px] text-slate-400 mt-1">just now</span>
              </div>

              {/* 5. Organic Traffic */}
              <div className="flex flex-col items-start justify-start text-left p-2 pl-5 h-full gap-1">
                <span className="text-[14px] text-slate-400 mb-1">Organic Traffic</span>
                <span className="text-[20px] font-semibold text-indigo-700 leading-none mt-0.5">
                  {seoData.website.organicTraffic >= 1000 
                    ? `${(seoData.website.organicTraffic / 1000).toFixed(1)}K` 
                    : seoData.website.organicTraffic}
                </span>
                <span className="text-[14px] text-slate-400 mt-1">0</span>
              </div>

              {/* 6. Organic Keywords */}
              <div className="flex flex-col items-start justify-start text-left p-2 pl-5 h-full gap-1">
                <span className="text-[14px] text-slate-400 mb-1">Organic Keywords</span>
                <span className="text-[20px] font-semibold text-indigo-700 leading-none mt-0.5">
                  {seoData.website.organicKeywords >= 1000 
                    ? `${(seoData.website.organicKeywords / 1000).toFixed(1)}K` 
                    : seoData.website.organicKeywords}
                </span>
                <span className="text-[14px] text-emerald-500 flex items-center gap-0.5 mt-1">
                  +30%
                </span>
              </div>

              {/* 7. Backlinks */}
              <div className="flex flex-col items-start justify-start text-left p-2 pl-5 h-full gap-1">
                <span className="text-[14px] text-slate-400 mb-1">Backlinks</span>
                <span className="text-[20px] font-semibold text-indigo-700 leading-none mt-0.5">
                  {seoData.website.backlinks >= 1000 
                    ? `${(seoData.website.backlinks / 1000).toFixed(1)}K` 
                    : seoData.website.backlinks}
                </span>
                <span className="text-[14px] text-emerald-500 flex items-center gap-0.5 mt-1">
                  +{seoData.website.backlinksGrowth}%
                </span>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Domains for monitoring Accordion */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm cursor-pointer hover:bg-slate-50 transition-all duration-200">
        <span className="font-extrabold text-slate-800 text-sm tracking-tight">Domains for monitoring</span>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 ">
          <span>Open</span>
          <ChevronRight className="w-4 h-4 transform rotate-90" />
        </div>
      </div>

      {/* Home Page Footer Links */}
      <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-xs font-semibold text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="cursor-pointer hover:text-slate-600">Contact us</span>
          <span className="cursor-pointer hover:text-slate-600">About us</span>
          <span className="cursor-pointer hover:text-slate-600">Blog</span>
          <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600">
            <Globe className="w-3.5 h-3.5" />
            <span>English</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="cursor-pointer hover:text-slate-600">See plans and pricing</span>
          <button className="px-4 py-2 bg-[#00c07f] hover:bg-[#00ab70] text-white font-extrabold rounded-lg text-xs shadow-sm transition-colors">
            Get started with Semrush
          </button>
        </div>
      </div>
    </div>
  );
}
