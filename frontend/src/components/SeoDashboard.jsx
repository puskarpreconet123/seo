import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ExternalLink,
  Plus,
  Settings,
  X,
  Info,
  LineChart,
  Sparkles,
  Monitor
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line as RechartsLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  AreaChart as RechartsAreaChart,
  Area as RechartsArea
} from "recharts";

const generateSparklinePath = (history, width = 100, height = 24) => {
  if (!history || history.length < 2) return { linePath: "", areaPath: "" };
  const maxVal = Math.max(...history, 1);
  const minVal = Math.min(...history, 0);
  const range = maxVal - minVal || 1;

  const points = history.map((val, idx) => {
    const x = (idx / (history.length - 1)) * width;
    const y = height - ((val - minVal) / range) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePath = `M ${points.join(" L ")}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
  return { linePath, areaPath };
};

const getDummyPositionTracking = (domain) => {
  return {
    visibility: 14.85,
    visibilityHistory: [
      { date: "Jun 15", value: 14.80 },
      { date: "Jun 18", value: 14.82 },
      { date: "Jun 21", value: 14.81 },
      { date: "Jun 24", value: 14.85 },
      { date: "Jun 27", value: 14.83 },
      { date: "Jun 30", value: 14.84 },
      { date: "Jul 3", value: 14.86 },
      { date: "Jul 6", value: 14.85 },
      { date: "Jul 9", value: 14.87 },
      { date: "Jul 12", value: 14.85 },
      { date: "Jul 14", value: 14.85 }
    ],
    keywords: {
      top3: { value: 1, new: 0, lost: 0, history: [1, 2, 1, 1, 2, 1, 1] },
      top10: { value: 1, new: 0, lost: 0, history: [0, 1, 1, 2, 1, 1, 1] },
      top20: { value: 1, new: 0, lost: 0, history: [2, 1, 1, 0, 1, 1, 1] },
      top100: { value: 4, new: 0, lost: 0, history: [3, 4, 3, 5, 4, 3, 4] }
    },
    topKeywords: [
      { keyword: "preconet technologies", position: 1, positionChange: 0, visibility: 14.29 },
      { keyword: "bassetti india", position: 43, positionChange: 0, visibility: 0.23 },
      { keyword: "bassetti ites private limited", position: 57, positionChange: 0, visibility: 0.17 },
      { keyword: "perennation computer solutions globa...", position: 60, positionChange: 0, visibility: 0.16 },
      { keyword: "abipet technologies private limited", position: null, positionChange: 0, visibility: 0 },
      { keyword: "prepaid netbanking", position: null, positionChange: 0, visibility: 0 }
    ]
  };
};

export default function SeoDashboard({ seoData, currentDomain }) {
  const router = useRouter();

  const [visibleWidgets, setVisibleWidgets] = useState({
    aiSearch: true,
    seoOverview: true,
    positionTracking: true,
    siteAudit: true,
    onPageSeo: true,
    backlinkAudit: true,
    organicTrafficInsights: true,
    trafficAnalytics: true,
    organicRankings: true,
    backlinks: true
  });

  const widgetTitles = {
    aiSearch: "toolTitles.AiSearch",
    seoOverview: "toolTitles.SeoOverview",
    positionTracking: "toolTitles.PositionTracking",
    siteAudit: "toolTitles.SiteAudit",
    onPageSeo: "toolTitles.OnPageSeo",
    backlinkAudit: "toolTitles.BacklinkAudit",
    organicTrafficInsights: "toolTitles.OrganicTrafficInsights",
    trafficAnalytics: "toolTitles.TrafficAnalytics",
    organicRankings: "toolTitles.OrganicResearch",
    backlinks: "toolTitles.BacklinkAnalytics"
  };

  const visibleShortcutsCount = [
    visibleWidgets.siteAudit,
    visibleWidgets.onPageSeo,
    visibleWidgets.backlinkAudit,
    visibleWidgets.organicTrafficInsights
  ].filter(Boolean).length;

  const shortcutGridClass = 
    visibleShortcutsCount === 4 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" :
    visibleShortcutsCount === 3 ? "grid-cols-1 md:grid-cols-3" :
    visibleShortcutsCount === 2 ? "grid-cols-1 md:grid-cols-2" :
    "grid-cols-1";

  const isDataAvailable = currentDomain && currentDomain.toLowerCase() !== "nodata.com";
  const positionTracking = isDataAvailable ? getDummyPositionTracking(currentDomain) : null;

  const VisibilityTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white text-[11px] rounded py-1.5 px-2.5 shadow-md z-30 pointer-events-none text-left border border-slate-700">
          <div className="font-semibold">{payload[0].payload.date}</div>
          <div className="text-indigo-200 font-medium mt-0.5">
            Visibility: <span className="font-extrabold text-white">{payload[0].value}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const [backlinksTimeframe, setBacklinksTimeframe] = useState("Last 12 months");
  const [showBacklinksDropdown, setShowBacklinksDropdown] = useState(false);

  const backlinks12Months = [
    { name: "Aug 25", value: 125 },
    { name: "Sep 25", value: 127 },
    { name: "Oct 25", value: 142 },
    { name: "Nov 25", value: 136 },
    { name: "Dec 25", value: 154 },
    { name: "Jan 26", value: 168 },
    { name: "Feb 26", value: 153 },
    { name: "Mar 26", value: 156 },
    { name: "Apr 26", value: 160 },
    { name: "May 26", value: 166 },
    { name: "Jun 26", value: 153 },
    { name: "Jul 26", value: 157 }
  ];

  const backlinks6Months = [
    { name: "Feb 26", value: 153 },
    { name: "Mar 26", value: 156 },
    { name: "Apr 26", value: 160 },
    { name: "May 26", value: 166 },
    { name: "Jun 26", value: 153 },
    { name: "Jul 26", value: 157 }
  ];

  const backlinks30Days = [
    { name: "Week 1", value: 153 },
    { name: "Week 2", value: 155 },
    { name: "Week 3", value: 154 },
    { name: "Week 4", value: 157 }
  ];

  const getBacklinksData = () => {
    if (backlinksTimeframe === "Last 30 days") return backlinks30Days;
    if (backlinksTimeframe === "Last 6 months") return backlinks6Months;
    return backlinks12Months;
  };

  const BacklinksTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200/80 rounded-xl p-2.5 shadow-xl text-left text-xs z-30">
          <div className="font-semibold text-slate-500 mb-1">{label}</div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
            <span className="text-slate-600 font-medium">Referring Domains:</span>
            <span className="font-extrabold text-slate-800">{payload[0].value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [hoveredBarIdx, setHoveredBarIdx] = useState(null);
  const [barTooltipPos, setBarTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseMoveBar = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setBarTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const [timeframe, setTimeframe] = useState("Last 6 months");
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [dataSource, setDataSource] = useState("semrush");
  const [visibleChannels, setVisibleChannels] = useState({
    direct: true,
    referral: true,
    organicSearch: true,
    organicSocial: true,
    paidSocial: true,
    paidSearch: true,
    displayAds: true,
    email: true
  });

  const toggleChannel = (id) => {
    setVisibleChannels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const data6Months = [
    { name: "Jan 26", direct: 130, referral: 0, organicSearch: 0, organicSocial: 20, paidSocial: 0, paidSearch: 0, displayAds: 0, email: 0 },
    { name: "Feb 26", direct: 20, referral: 0, organicSearch: 0, organicSocial: 0, paidSocial: 0, paidSearch: 0, displayAds: 0, email: 0 },
    { name: "Mar 26", direct: 0, referral: 0, organicSearch: 0, organicSocial: 0, paidSocial: 0, paidSearch: 0, displayAds: 0, email: 0 },
    { name: "Apr 26", direct: 50, referral: 0, organicSearch: 0, organicSocial: 0, paidSocial: 0, paidSearch: 0, displayAds: 0, email: 0 },
    { name: "May 26", direct: 68, referral: 104, organicSearch: 0, organicSocial: 0, paidSocial: 0, paidSearch: 0, displayAds: 0, email: 0 },
    { name: "Jun 26", direct: 0, referral: 0, organicSearch: 45, organicSocial: 38, paidSocial: 0, paidSearch: 0, displayAds: 0, email: 0 }
  ];

  const data30Days = [
    { name: "Week 1", direct: 80, referral: 15, organicSearch: 10, organicSocial: 5, paidSocial: 5, paidSearch: 2, displayAds: 0, email: 0 },
    { name: "Week 2", direct: 65, referral: 40, organicSearch: 22, organicSocial: 12, paidSocial: 8, paidSearch: 4, displayAds: 1, email: 1 },
    { name: "Week 3", direct: 95, referral: 60, organicSearch: 35, organicSocial: 18, paidSocial: 15, paidSearch: 10, displayAds: 2, email: 2 },
    { name: "Week 4", direct: 110, referral: 90, organicSearch: 40, organicSocial: 25, paidSocial: 20, paidSearch: 15, displayAds: 3, email: 4 }
  ];

  const data12Months = [
    { name: "Jul 25", direct: 140, referral: 10, organicSearch: 5, organicSocial: 2, paidSocial: 0, paidSearch: 0, displayAds: 0, email: 0 },
    { name: "Aug 25", direct: 120, referral: 15, organicSearch: 8, organicSocial: 4, paidSocial: 1, paidSearch: 1, displayAds: 0, email: 0 },
    { name: "Sep 25", direct: 90, referral: 12, organicSearch: 7, organicSocial: 3, paidSocial: 0, paidSearch: 0, displayAds: 0, email: 0 },
    { name: "Oct 25", direct: 75, referral: 8, organicSearch: 5, organicSocial: 2, paidSocial: 0, paidSearch: 0, displayAds: 0, email: 0 },
    { name: "Nov 25", direct: 60, referral: 15, organicSearch: 10, organicSocial: 5, paidSocial: 2, paidSearch: 1, displayAds: 1, email: 0 },
    { name: "Dec 25", direct: 85, referral: 25, organicSearch: 15, organicSocial: 8, paidSocial: 5, paidSearch: 3, displayAds: 2, email: 1 },
    { name: "Jan 26", direct: 130, referral: 30, organicSearch: 12, organicSocial: 10, paidSocial: 4, paidSearch: 2, displayAds: 1, email: 0 },
    { name: "Feb 26", direct: 50, referral: 20, organicSearch: 8, organicSocial: 5, paidSocial: 2, paidSearch: 1, displayAds: 0, email: 0 },
    { name: "Mar 26", direct: 40, referral: 35, organicSearch: 15, organicSocial: 9, paidSocial: 5, paidSearch: 3, displayAds: 1, email: 1 },
    { name: "Apr 26", direct: 75, referral: 60, organicSearch: 22, organicSocial: 12, paidSocial: 10, paidSearch: 5, displayAds: 2, email: 2 },
    { name: "May 26", direct: 68, referral: 104, organicSearch: 30, organicSocial: 15, paidSocial: 12, paidSearch: 8, displayAds: 3, email: 3 },
    { name: "Jun 26", direct: 90, referral: 85, organicSearch: 45, organicSocial: 38, paidSocial: 18, paidSearch: 12, displayAds: 4, email: 4 }
  ];

  const getChartData = () => {
    if (timeframe === "Last 30 days") return data30Days;
    if (timeframe === "Last 12 months") return data12Months;
    return data6Months;
  };

  const channels = [
    { id: "direct", name: "Direct", color: "#6366f1" },
    { id: "referral", name: "Referral", color: "#14b8a6" },
    { id: "organicSearch", name: "Organic Search", color: "#ef4444" },
    { id: "organicSocial", name: "Organic Social", color: "#fda4af" },
    { id: "paidSocial", name: "Paid Social", color: "#ec4899" },
    { id: "paidSearch", name: "Paid Search", color: "#a855f7" },
    { id: "displayAds", name: "Display Ads", color: "#d946ef" },
    { id: "email", name: "Email", color: "#10b981" }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xl min-w-[170px] text-left text-xs z-30">
          <div className="font-semibold text-slate-500 border-b border-slate-100 pb-1 mb-1.5">
            {label}
          </div>
          <div className="space-y-1">
            {payload.map((p, idx) => {
              const chan = channels.find(c => c.id === p.name);
              return (
                <div key={idx} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
                    <span className="text-slate-600 font-medium">{chan ? chan.name : p.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-800">{p.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Tooltip states for Organic Traffic & Organic Keywords graphs
  const [hoveredTraffic, setHoveredTraffic] = useState(false);
  const [hoveredKeywords, setHoveredKeywords] = useState(false);
  const [trafficTooltipPos, setTrafficTooltipPos] = useState({ x: 0, y: 0 });
  const [keywordsTooltipPos, setKeywordsTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseMoveTraffic = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTrafficTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMoveKeywords = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setKeywordsTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title / Action Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-bold text-slate-800 tracking-tight">
            SEO Dashboard:
          </h1>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[20px] font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
              {currentDomain}
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </span>
            <a href={`https://${currentDomain}`} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-lg text-xs shadow-sm transition-colors flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Create SEO Project
          </button>
          <button className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-extrabold border border-slate-200 rounded-lg text-xs shadow-sm transition-colors">
            Share
          </button>
          <button className="p-2 bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 rounded-lg shadow-sm transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>


      {/* Grid 1: AI Search Card & SEO Card */}
      {(visibleWidgets.aiSearch || visibleWidgets.seoOverview) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Column 1: AI Search Widget (6 cols) */}
          {visibleWidgets.aiSearch && (
            <div className={`${visibleWidgets.seoOverview ? "lg:col-span-6" : "lg:col-span-12"} bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col justify-between`}>
          <div>
            {/* Badge & Dropdowns */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div className="px-2.5 py-1 bg-purple-50 text-purple-700 font-extrabold text-[10px] rounded uppercase tracking-wider">
                AI Search
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 cursor-pointer hover:underline text-blue-600">
                  <img src="https://flagcdn.com/w20/us.png" className="w-4 h-3 object-contain rounded-sm" alt="US" />
                  United States
                  <ChevronDown className="w-3.5 h-3.5" />
                </span>
                <button 
                  onClick={() => setVisibleWidgets(prev => ({ ...prev, aiSearch: false }))}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Integrated AI Search Card Table/Structure */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-1 pt-1">
              
              {/* Headers */}
              <div className="text-left">
                <div className="text-[14px] text-slate-400 mb-3">AI Visibility</div>
                <div className="flex items-center gap-1.5 mb-3">
                  {/* Half Ring Arc Chart SVG */}
                  <div className="relative flex items-center justify-center">
                    <svg className="w-10 h-6" viewBox="0 0 32 18">
                      <path 
                        d="M 3 15 A 13 13 0 0 1 29 15" 
                        className="stroke-slate-200 fill-none" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                      />
                      {/* A tiny yellow start dot matching the screen */}
                      <circle cx="2.5" cy="14.5" r="2" className="fill-amber-500 stroke-none" />
                    </svg>
                  </div>
                  <span className="text-[24px] font-semibold text-indigo-700 leading-none">0</span>
                </div>
              </div>

              <div className="text-left">
                <div className="text-[14px] text-slate-400 mb-3">Mentions</div>
                <div className="text-[24px] font-semibold text-indigo-700 leading-none mb-3">0</div>
              </div>

              <div className="text-left">
                <div className="text-[14px] text-slate-400 mb-3">Cited pages</div>
                <div className="text-[24px] font-semibold text-indigo-700 leading-none mb-3">0</div>
              </div>

              {/* ChatGPT Row */}
              <div className="col-span-1 flex items-center gap-2 h-7">
                <svg xmlns="http://www.w3.org/2000/svg" shapeRendering="geometricPrecision" textRendering="geometricPrecision" imageRendering="optimizeQuality" fillRule="evenodd" clipRule="evenodd" viewBox="0 0 20.093 20" width="20.093" height="20">
                  <path fill="#fff" d="M4.537 0h11.019C18.051 0 20.093 2.042 20.093 4.537v10.926c0 2.495 -2.042 4.537 -4.537 4.537H4.537C2.042 20 0 17.959 0 15.463V4.537C0 2.042 2.042 0 4.537 0"/>
                  <path fillRule="nonzero" fill="#000" d="M16.17 8.703a3.563 3.563 0 0 0 0.182 -1.125 3.563 3.563 0 0 0 -0.488 -1.8c-0.642 -1.118 -1.834 -1.809 -3.124 -1.809 -0.254 0 -0.508 0.027 -0.756 0.08a3.562 3.562 0 0 0 -2.664 -1.198h-0.023c-0.002 0 -0.006 0 -0.008 0 -1.562 0 -2.948 1.008 -3.428 2.494 -1.006 0.206 -1.874 0.836 -2.381 1.728a3.607 3.607 0 0 0 -0.487 1.808 3.604 3.604 0 0 0 0.93 2.416 3.563 3.563 0 0 0 -0.182 1.125 3.563 3.563 0 0 0 0.488 1.8c0.642 1.119 1.834 1.809 3.124 1.809a3.603 3.603 0 0 0 0.756 -0.08 3.563 3.563 0 0 0 2.664 1.198h0.023l0.009 0c1.563 0 2.948 -1.008 3.428 -2.495 1.006 -0.206 1.874 -0.836 2.381 -1.728a3.599 3.599 0 0 0 0.486 -1.807 3.604 3.604 0 0 0 -0.93 -2.416zM10.796 16.214h-0.004a2.674 2.674 0 0 1 -1.711 -0.62 2.237 2.237 0 0 0 0.085 -0.048l2.847 -1.644a0.463 0.463 0 0 0 0.234 -0.402V9.483l1.203 0.695c0.013 0.006 0.022 0.019 0.023 0.033v3.324c-0.002 1.478 -1.199 2.676 -2.677 2.679zm-5.757 -2.459a2.673 2.673 0 0 1 -0.359 -1.338c0 -0.153 0.013 -0.307 0.039 -0.458 0.021 0.013 0.058 0.035 0.085 0.05l2.847 1.644a0.464 0.464 0 0 0 0.468 0l3.476 -2.007v1.39a0.043 0.043 0 0 1 -0.017 0.037l-2.878 1.662a2.685 2.685 0 0 1 -1.339 0.358 2.683 2.683 0 0 1 -2.321 -1.339zm-0.749 -6.215a2.67 2.67 0 0 1 1.395 -1.175c0 0.025 -0.001 0.068 -0.001 0.098v3.289l0 0.003a0.463 0.463 0 0 0 0.234 0.402l3.476 2.007 -1.203 0.695a0.043 0.043 0 0 1 -0.041 0.004l-2.878 -1.663a2.683 2.683 0 0 1 -1.338 -2.321 2.684 2.684 0 0 1 0.358 -1.338zm9.886 2.301 -3.476 -2.007 1.203 -0.695a0.043 0.043 0 0 1 0.041 -0.004l2.878 1.662c0.828 0.479 1.339 1.364 1.339 2.321 0 1.123 -0.7 2.127 -1.754 2.515v-3.387q0 -0.002 0 -0.004c0 -0.166 -0.089 -0.319 -0.232 -0.401m1.198 -1.802c-0.021 -0.013 -0.058 -0.035 -0.085 -0.05l-2.847 -1.644a0.465 0.465 0 0 0 -0.234 -0.063c-0.082 0 -0.163 0.022 -0.234 0.063l-3.476 2.007v-1.39l0 -0.002a0.043 0.043 0 0 1 0.017 -0.035l2.878 -1.66a2.68 2.68 0 0 1 1.339 -0.358c1.48 0 2.68 1.2 2.68 2.68a2.696 2.696 0 0 1 -0.039 0.453zm-7.529 2.477 -1.204 -0.695a0.043 0.043 0 0 1 -0.023 -0.033v-3.324c0.001 -1.479 1.201 -2.678 2.68 -2.678a2.682 2.682 0 0 1 1.715 0.62 2.472 2.472 0 0 0 -0.085 0.048l-2.847 1.644a0.463 0.463 0 0 0 -0.234 0.402v0.003zm0.654 -1.409 1.548 -0.894 1.548 0.893v1.788l-1.548 0.893 -1.548 -0.893z"/>
                </svg>
                <span className="text-[14px] text-slate-700 font-normal">ChatGPT</span>
              </div>
              <div className="col-span-1 flex items-center h-7 pl-1">
                <span className="text-[14px] text-blue-600 hover:underline cursor-pointer">0</span>
              </div>
              <div className="col-span-1 flex items-center h-7 pl-1">
                <span className="text-[14px] text-blue-600 hover:underline cursor-pointer">0</span>
              </div>

              {/* AI Overview Row */}
              <div className="col-span-1 flex items-center gap-2 h-7">
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.63-1.04-1.38-1.2-2.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-[14px] text-slate-700 font-normal">AI Overview</span>
              </div>
              <div className="col-span-1 flex items-center h-7 pl-1">
                <span className="text-[14px] text-blue-600 hover:underline cursor-pointer">0</span>
              </div>
              <div className="col-span-1 flex items-center h-7 pl-1">
                <span className="text-[14px] text-blue-600 hover:underline cursor-pointer">0</span>
              </div>

              {/* AI Mode Row */}
              <div className="col-span-1 flex items-center gap-2 h-7">
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.63-1.04-1.38-1.2-2.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-[14px] text-slate-700 font-normal">AI Mode</span>
              </div>
              <div className="col-span-1 flex items-center h-7 pl-1">
                <span className="text-[14px] text-blue-600 hover:underline cursor-pointer">0</span>
              </div>
              <div className="col-span-1 flex items-center h-7 pl-1">
                <span className="text-[14px] text-blue-600 hover:underline cursor-pointer">0</span>
              </div>

              {/* Gemini Row */}
              <div className="col-span-1 flex items-center gap-2 h-7">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-blue-500 text-blue-500">
                  <path
                    fill="url(#gemini-gradient-search-refactored-new)"
                    d="M12 2a1 1 0 0 0-1 1c0 4.418-3.582 8-8 8a1 1 0 0 0 0 2c4.418 0 8 3.582 8 8a1 1 0 0 0 2 0c0-4.418 3.582-8 8-8a1 1 0 0 0 0-2c-4.418 0-8-3.582-8-8a1 1 0 0 0-1-1z"
                  />
                  <defs>
                    <linearGradient id="gemini-gradient-search-refactored-new" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4e82f5" />
                      <stop offset="50%" stopColor="#ab7df6" />
                      <stop offset="100%" stopColor="#e287b2" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-[14px] text-slate-700 font-normal">Gemini</span>
              </div>
              <div className="col-span-1 flex items-center h-7 pl-1">
                <span className="text-[14px] text-blue-600 hover:underline cursor-pointer">0</span>
              </div>
              <div className="col-span-1 flex items-center h-7 pl-1">
                <span className="text-[14px] text-blue-600 hover:underline cursor-pointer">0</span>
              </div>

            </div>
          </div>
        </div>
          )}

        {/* Column 2: SEO Overview Widget (6 cols) */}
        {visibleWidgets.seoOverview && (
          <div className={`${visibleWidgets.aiSearch ? "lg:col-span-6" : "lg:col-span-12"} bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col justify-between`}>
          <div>
            {/* Badge & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 bg-blue-50 text-blue-700 font-extrabold text-[10px] rounded uppercase tracking-wider">
                  SEO
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Scope: Root Domain
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                <span className="flex items-center gap-1.5 cursor-pointer hover:underline text-blue-600">
                  <img src="https://flagcdn.com/w20/us.png" className="w-4 h-3 object-contain rounded-sm" alt="US" />
                  United States
                  <ChevronDown className="w-3.5 h-3.5" />
                </span>
                <span className="flex items-center gap-1 cursor-pointer hover:underline text-blue-600">
                  <Monitor className="w-3.5 h-3.5 text-blue-600" />
                   Desktop
                  <ChevronDown className="w-3.5 h-3.5" />
                </span>
                <span className="text-slate-400">
                  Jul 12, 2026
                </span>
                <button 
                  onClick={() => setVisibleWidgets(prev => ({ ...prev, seoOverview: false }))}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Two-Row metrics grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              
              {/* Authority Score */}
              <div className="flex flex-col justify-between h-full pt-4 md:pt-0 first:pl-0 md:pl-4 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[14px] text-slate-400">
                    Authority Score
                    <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="relative w-8 h-8 rounded-full border border-slate-100 bg-white shadow-sm flex items-center justify-center shrink-0">
                      <svg className="w-7 h-7 transform -rotate-90">
                        <circle cx="14" cy="14" r="11" className="stroke-slate-100 fill-none" strokeWidth="2" />
                        <circle cx="14" cy="14" r="11" className="stroke-amber-500 fill-none" strokeWidth="2.5" strokeDasharray="69.1" strokeDashoffset={69.1 * (1 - 6/100)} strokeLinecap="round" />
                      </svg>
                      {/* Golden needle marker matching the SEMrush image */}
                      <div className="absolute w-[2px] h-[10px] bg-amber-500 rounded-full transform rotate-[20deg]" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[20px] font-semibold text-indigo-700 leading-none">6</span>
                      <span className="text-[12px] text-slate-400 font-normal">0</span>
                    </div>
                  </div>
                  {/* Semrush Rank */}
                  <div className="text-[12px] text-slate-400 mt-2 font-normal">
                    Semrush Rank <span className="text-blue-600 hover:underline cursor-pointer">35.8M</span>
                  </div>
                </div>
              </div>

              {/* Organic Traffic */}
              <div className="flex flex-col justify-between h-full pt-4 md:pt-0 md:pl-4 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[14px] text-slate-400">
                    Organic Traffic
                    <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[20px] font-semibold text-indigo-700 leading-none">
                      {seoData.website.organicTraffic}
                    </span>
                    <span className="text-[12px] text-slate-400 font-normal">0%</span>
                  </div>
                  {/* Interactive Sparkline graph for Traffic */}
                  <div 
                    className="relative w-full h-8 cursor-pointer mt-2"
                    onMouseEnter={() => setHoveredTraffic(true)}
                    onMouseLeave={() => setHoveredTraffic(false)}
                    onMouseMove={handleMouseMoveTraffic}
                  >
                    <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                      <line x1="0" y1="18" x2="100" y2="18" className="stroke-blue-200" strokeWidth="1" strokeDasharray="2 2" />
                      <line x1="0" y1="18" x2="100" y2="18" className="stroke-blue-500" strokeWidth="1.5" />
                      
                      {hoveredTraffic && (
                        <line 
                          x1={trafficTooltipPos.x ? (trafficTooltipPos.x / 140) * 100 : 50} 
                          y1="0" 
                          x2={trafficTooltipPos.x ? (trafficTooltipPos.x / 140) * 100 : 50} 
                          y2="24" 
                          className="stroke-slate-300" 
                          strokeWidth="1" 
                          strokeDasharray="2 2" 
                        />
                      )}
                    </svg>
                    
                    {hoveredTraffic && (
                      <div 
                        className="absolute bg-slate-800 text-white text-[11px] rounded py-1 px-2 shadow-md z-20 pointer-events-none transition-all duration-75"
                        style={{
                          left: `${Math.min(Math.max(trafficTooltipPos.x - 40, 0), 120)}px`,
                          bottom: '36px'
                        }}
                      >
                        <div className="font-semibold whitespace-nowrap">Jul 12, 2026</div>
                        <div className="text-slate-300 whitespace-nowrap">Traffic: 0</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Organic Keywords */}
              <div className="flex flex-col justify-between h-full pt-4 md:pt-0 md:pl-4 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[14px] text-slate-400">
                    Organic Keywords
                    <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[20px] font-semibold text-indigo-700 leading-none">
                      {seoData.website.organicKeywords}
                    </span>
                    <span className="text-[12px] text-slate-400 font-normal">0%</span>
                  </div>
                  {/* Interactive Step Graph for Keywords */}
                  <div 
                    className="relative w-full h-8 cursor-pointer mt-2"
                    onMouseEnter={() => setHoveredKeywords(true)}
                    onMouseLeave={() => setHoveredKeywords(false)}
                    onMouseMove={handleMouseMoveKeywords}
                  >
                    <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="keywords-fill-svg-seo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      
                      <path 
                        d="M 0 18 L 80 18 L 82 6 L 100 6 L 100 24 L 0 24 Z" 
                        fill="url(#keywords-fill-svg-seo)" 
                      />
                      
                      <path 
                        d="M 0 18 L 80 18 L 82 6 L 100 6" 
                        className="stroke-blue-500 fill-none" 
                        strokeWidth="1.5" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {hoveredKeywords && (
                        <line 
                          x1={keywordsTooltipPos.x ? (keywordsTooltipPos.x / 140) * 100 : 85} 
                          y1="0" 
                          x2={keywordsTooltipPos.x ? (keywordsTooltipPos.x / 140) * 100 : 85} 
                          y2="24" 
                          className="stroke-slate-300" 
                          strokeWidth="1" 
                          strokeDasharray="2 2" 
                        />
                      )}
                    </svg>

                    {hoveredKeywords && (
                      <div 
                        className="absolute bg-slate-800 text-white text-[11px] rounded py-1 px-2 shadow-md z-20 pointer-events-none transition-all duration-75"
                        style={{
                          left: `${Math.min(Math.max(keywordsTooltipPos.x - 40, 0), 120)}px`,
                          bottom: '36px'
                        }}
                      >
                        <div className="font-semibold whitespace-nowrap">Jul 12, 2026</div>
                        <div className="text-slate-300 whitespace-nowrap">Keywords: {keywordsTooltipPos.x > 110 ? 1 : 0}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Row 2 split in two-row metrics grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-t border-slate-100 mt-6 pt-4">
              
              {/* Paid Keywords */}
              <div className="flex flex-col justify-between h-full pt-4 md:pt-0 first:pl-0 md:pl-4 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[14px] text-slate-400">
                    Paid Keywords
                    <Info className="w-3 h-3" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[20px] font-semibold text-indigo-700 leading-none">0</span>
                    <span className="text-[12px] text-slate-400">0%</span>
                  </div>
                  <div className="text-[12px] text-slate-400  mt-1">
                    Paid Traffic 0
                  </div>
                </div>
              </div>

              {/* Ref. Domains */}
              <div className="flex flex-col justify-between h-full pt-4 md:pt-0 md:pl-4 text-left">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[14px] text-slate-400">
                    Ref. Domains
                    <Info className="w-3 h-3" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[20px] font-semibold text-indigo-700 leading-none">
                      157
                    </span>
                    <span className="text-xs text-emerald-500 ">+2.61%</span>
                  </div>
                  <div className="text-[12px] text-slate-400  mt-1 font-sans">
                    Backlinks <span className="text-indigo-700 ">2.7K</span>
                  </div>
                </div>
              </div>

              {/* Empty placeholder block or summary card */}
              <div className="flex flex-col justify-center items-center h-full pt-4 md:pt-0 md:pl-4 text-center">
              </div>

            </div>
          </div>
        </div>
      )}

      </div>
      )}

      {/* Position Tracking Card */}
      {visibleWidgets.positionTracking && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 text-left">
        
        {/* Card Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-800">
              Position Tracking
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </div>
            <div className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              India (Google) • English
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
            <span className="text-slate-400">
              Updated: 2 hours ago
            </span>
            <span className="text-slate-400">
              | Jul 7 – Jul 13, 2026
            </span>
            <span className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
              last 7 days
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </span>
            <button 
              onClick={() => setVisibleWidgets(prev => ({ ...prev, positionTracking: false }))}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Grid 2: Left graph placeholder, Middle Top 3, Right Top Keywords Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 1. Visibility (Col Span 4) */}
          <div className="lg:col-span-4 border-r border-slate-100 pr-4 flex flex-col justify-between h-full min-h-[220px]">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-[14px] text-slate-400">
                Visibility
                <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
              </div>
              <div className="text-[20px] font-semibold text-indigo-700 leading-none mt-1">
                {positionTracking ? `${positionTracking.visibility}%` : "14.85%"}
              </div>
            </div>

            {positionTracking ? (
              <div className="my-2 h-[230px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsAreaChart
                    data={positionTracking.visibilityHistory}
                    margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorVisibility" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.10}/>
                      </linearGradient>
                    </defs>
                    <RechartsTooltip content={<VisibilityTooltip />} />
                    <RechartsArea
                      type="monotone"
                      dataKey="value"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorVisibility)"
                    />
                  </RechartsAreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              /* High-fidelity SVG of a browser card with a trend line */
              <div className="my-3 flex flex-col items-center justify-center text-center py-2 bg-slate-50/30 rounded-lg p-2">
                <svg className="w-32 h-20 mb-2" viewBox="0 0 120 80" fill="none">
                  {/* Shadow glow */}
                  <rect x="12" y="10" width="96" height="58" rx="6" fill="#f8fafc" />
                  {/* Main Card */}
                  <rect x="14" y="8" width="92" height="54" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
                  {/* Header line */}
                  <path d="M 14 16 L 106 16" stroke="#e2e8f0" strokeWidth="1" />
                  {/* Three dots */}
                  <circle cx="20" cy="12" r="1" fill="#ef4444" />
                  <circle cx="24" cy="12" r="1" fill="#eab308" />
                  <circle cx="28" cy="12" r="1" fill="#22c55e" />
                  
                  {/* Grid line */}
                  <line x1="22" y1="26" x2="98" y2="26" stroke="#f1f5f9" strokeWidth="0.75" />
                  <line x1="22" y1="38" x2="98" y2="38" stroke="#f1f5f9" strokeWidth="0.75" />
                  <line x1="22" y1="50" x2="98" y2="50" stroke="#f1f5f9" strokeWidth="0.75" />
                  
                  {/* Sparkline curve */}
                  <path d="M 22 42 L 38 34 L 54 38 L 70 24 L 86 28 L 98 22" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <circle cx="38" cy="34" r="2.5" fill="#64748b" />
                  <circle cx="70" cy="24" r="2.5" fill="#64748b" />
                  <circle cx="86" cy="28" r="2.5" fill="#64748b" />
                  
                  {/* Bubbles */}
                  <circle cx="8" cy="35" r="3" fill="#cbd5e1" opacity="0.4" />
                  <circle cx="112" cy="25" r="4" fill="#cbd5e1" opacity="0.4" />
                  <circle cx="108" cy="50" r="2.5" fill="#cbd5e1" opacity="0.3" />
                </svg>
                <p className="text-[12px] text-slate-400 font-normal leading-relaxed max-w-[180px]">
                  The trend will be displayed after repeated data analysis
                </p>
              </div>
            )}

          </div>

          {/* 2. Keywords (Col Span 4) */}
          <div className="lg:col-span-4 border-r border-slate-100 pr-4 flex flex-col justify-start h-full">
            <div className="text-left space-y-1">
              <div className="flex items-center gap-1 text-[14px] text-slate-400">
                Keywords
                <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
              </div>
            </div>

            {/* Keyword Brackets 2x2 Grid */}
            {(() => {
              const top3Val = positionTracking ? positionTracking.keywords.top3.value : 1;
              const top10Val = positionTracking ? positionTracking.keywords.top10.value : 1;
              const top20Val = positionTracking ? positionTracking.keywords.top20.value : 1;
              const top100Val = positionTracking ? positionTracking.keywords.top100.value : 4;
              const totalKeywordsVal = top3Val + top10Val + top20Val + top100Val;

              return (
                <div className="grid grid-cols-2 gap-x-4 gap-y-5 mt-6 pb-2">
                  
                  {/* Top 3 */}
                  <div className="space-y-1.5 text-left">
                    <span className="text-[12px] text-slate-400 font-normal">Top 3</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 shrink-0 relative">
                        <svg className="w-6 h-6 transform -rotate-90">
                          <circle cx="12" cy="12" r="9" className="stroke-slate-300 fill-none" strokeWidth="4" />
                          <circle cx="12" cy="12" r="9" className="stroke-teal-300 fill-none" strokeWidth="4" strokeDasharray="56.5" strokeDashoffset={56.5 * (1 - top3Val / totalKeywordsVal)} strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="text-[20px] font-semibold text-indigo-500 leading-none">
                        {top3Val}
                      </span>
                    </div>
                    {positionTracking && (() => {
                      const { linePath, areaPath } = generateSparklinePath(positionTracking.keywords.top3.history);
                      return (
                        <>
                          <div className="text-[11px] text-slate-400 space-y-0.5 mt-1 font-normal leading-tight">
                            <div className="flex gap-2">
                              <span className="w-8">new</span>
                              <span className="font-semibold text-slate-700">{positionTracking.keywords.top3.new}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="w-8">lost</span>
                              <span className="font-semibold text-slate-700">{positionTracking.keywords.top3.lost}</span>
                            </div>
                          </div>
                          <div className="w-full h-7 mt-2.5 relative rounded overflow-hidden border border-indigo-100/40">
                            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                              <path d={areaPath} fill="#e0e7ff" opacity="0.6" />
                              <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Top 10 */}
                  <div className="space-y-1.5 text-left">
                    <span className="text-[12px] text-slate-400 font-normal">Top 10</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 shrink-0 relative">
                        <svg className="w-6 h-6 transform -rotate-90">
                          <circle cx="12" cy="12" r="9" className="stroke-slate-300 fill-none" strokeWidth="4" />
                          <circle cx="12" cy="12" r="9" className="stroke-teal-300 fill-none" strokeWidth="4" strokeDasharray="56.5" strokeDashoffset={56.5 * (1 - top10Val / totalKeywordsVal)} strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="text-[20px] font-semibold text-indigo-500 leading-none">
                        {top10Val}
                      </span>
                    </div>
                    {positionTracking && (() => {
                      const { linePath, areaPath } = generateSparklinePath(positionTracking.keywords.top10.history);
                      return (
                        <>
                          <div className="text-[11px] text-slate-400 space-y-0.5 mt-1 font-normal leading-tight">
                            <div className="flex gap-2">
                              <span className="w-8">new</span>
                              <span className="font-semibold text-slate-700">{positionTracking.keywords.top10.new}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="w-8">lost</span>
                              <span className="font-semibold text-slate-700">{positionTracking.keywords.top10.lost}</span>
                            </div>
                          </div>
                          <div className="w-full h-7 mt-2.5 relative rounded overflow-hidden border border-indigo-100/40">
                            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                              <path d={areaPath} fill="#e0e7ff" opacity="0.6" />
                              <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Top 20 */}
                  <div className="space-y-1.5 text-left">
                    <span className="text-[12px] text-slate-400 font-normal">Top 20</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 shrink-0 relative">
                        <svg className="w-6 h-6 transform -rotate-90">
                          <circle cx="12" cy="12" r="9" className="stroke-slate-300 fill-none" strokeWidth="4" />
                          <circle cx="12" cy="12" r="9" className="stroke-teal-300 fill-none" strokeWidth="4" strokeDasharray="56.5" strokeDashoffset={56.5 * (1 - top20Val / totalKeywordsVal)} strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="text-[20px] font-semibold text-indigo-500 leading-none">
                        {top20Val}
                      </span>
                    </div>
                    {positionTracking && (() => {
                      const { linePath, areaPath } = generateSparklinePath(positionTracking.keywords.top20.history);
                      return (
                        <>
                          <div className="text-[11px] text-slate-400 space-y-0.5 mt-1 font-normal leading-tight">
                            <div className="flex gap-2">
                              <span className="w-8">new</span>
                              <span className="font-semibold text-slate-700">{positionTracking.keywords.top20.new}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="w-8">lost</span>
                              <span className="font-semibold text-slate-700">{positionTracking.keywords.top20.lost}</span>
                            </div>
                          </div>
                          <div className="w-full h-7 mt-2.5 relative rounded overflow-hidden border border-indigo-100/40">
                            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                              <path d={areaPath} fill="#e0e7ff" opacity="0.6" />
                              <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Top 100 */}
                  <div className="space-y-1.5 text-left">
                    <span className="text-[12px] text-slate-400 font-normal">Top 100</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 shrink-0 relative">
                        <svg className="w-6 h-6 transform -rotate-90">
                          <circle cx="12" cy="12" r="9" className="stroke-slate-300 fill-none" strokeWidth="4" />
                          <circle cx="12" cy="12" r="9" className="stroke-teal-300 fill-none" strokeWidth="4" strokeDasharray="56.5" strokeDashoffset={56.5 * (1 - top100Val / totalKeywordsVal)} strokeLinecap="round" />
                        </svg>
                      </div>
                      <span className="text-[20px] font-semibold text-indigo-500 leading-none">
                        {top100Val}
                      </span>
                    </div>
                    {positionTracking && (() => {
                      const { linePath, areaPath } = generateSparklinePath(positionTracking.keywords.top100.history);
                      return (
                        <>
                          <div className="text-[11px] text-slate-400 space-y-0.5 mt-1 font-normal leading-tight">
                            <div className="flex gap-2">
                              <span className="w-8">new</span>
                              <span className="font-semibold text-slate-700">{positionTracking.keywords.top100.new}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="w-8">lost</span>
                              <span className="font-semibold text-slate-700">{positionTracking.keywords.top100.lost}</span>
                            </div>
                          </div>
                          <div className="w-full h-7 mt-2.5 relative rounded overflow-hidden border border-emerald-100/40">
                            <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                              <path d={areaPath} fill="#e0e7ff" opacity="0.6" />
                              <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                </div>
              );
            })()}
          </div>

          {/* 3. Top Keywords Table (Col Span 4) */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div className="text-left space-y-1.5">
              <div className="flex items-center gap-1 text-[14px] text-slate-400">
                Top Keywords
                <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
              </div>

              {/* Table Container */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-normal">
                      <th className="py-2 font-normal text-[14px]">Keywords</th>
                      <th className="py-2 font-normal text-[14px] text-right pr-6">Position</th>
                      <th className="py-2 font-normal text-[14px] text-right">Visibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {positionTracking ? (
                      positionTracking.topKeywords.map((kw, index) => (
                        <tr key={index}>
                          <td className="py-2.5 font-normal text-blue-600 hover:underline cursor-pointer max-w-[200px] truncate" title={kw.keyword}>
                            {kw.keyword}
                          </td>
                          <td className={`py-2.5 text-right pr-6 font-normal ${kw.position !== null ? "text-slate-700" : "text-slate-400"}`}>
                            {kw.position !== null ? (
                              <>
                                {kw.position}
                                <span className="text-[12px] text-slate-400 ml-1 ">{kw.positionChange}</span>
                              </>
                            ) : (
                              "–"
                            )}
                          </td>
                          <td className="py-2.5 text-right font-normal text-slate-700">
                            {kw.visibility}%
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        {/* Fallback hardcoded static rows */}
                        {/* Row 1 */}
                        <tr>
                          <td className="py-2.5 font-normal text-blue-600 hover:underline cursor-pointer">
                            preconet technologies
                          </td>
                          <td className="py-2.5 text-right pr-6 font-normal text-slate-700">
                            1 <span className="text-[12px] text-slate-400 ml-1 font-mono">0</span>
                          </td>
                          <td className="py-2.5 text-right font-normal text-slate-700">
                            14.29%
                          </td>
                        </tr>

                        {/* Row 2 */}
                        <tr>
                          <td className="py-2.5 font-normal text-blue-600 hover:underline cursor-pointer">
                            bassetti india
                          </td>
                          <td className="py-2.5 text-right pr-6 font-normal text-slate-700">
                            43 <span className="text-[12px] text-slate-400 ml-1 font-mono">0</span>
                          </td>
                          <td className="py-2.5 text-right font-normal text-slate-700">
                            0.23%
                          </td>
                        </tr>

                        {/* Row 3 */}
                        <tr>
                          <td className="py-2.5 font-normal text-blue-600 hover:underline cursor-pointer">
                            bassetti ites private limited
                          </td>
                          <td className="py-2.5 text-right pr-6 font-normal text-slate-700">
                            57 <span className="text-[12px] text-slate-400 ml-1 font-mono">0</span>
                          </td>
                          <td className="py-2.5 text-right font-normal text-slate-700">
                            0.17%
                          </td>
                        </tr>

                        {/* Row 4 */}
                        <tr>
                          <td className="py-2.5 font-normal text-blue-600 hover:underline cursor-pointer max-w-[200px] truncate">
                            perennation computer solutions globa...
                          </td>
                          <td className="py-2.5 text-right pr-6 font-normal text-slate-700">
                            60 <span className="text-[12px] text-slate-400 ml-1 font-mono">0</span>
                          </td>
                          <td className="py-2.5 text-right font-normal text-slate-700">
                            0.16%
                          </td>
                        </tr>

                        {/* Row 5 */}
                        <tr>
                          <td className="py-2.5 font-normal text-blue-600 hover:underline cursor-pointer">
                            abipet technologies private limited
                          </td>
                          <td className="py-2.5 text-right pr-6 font-normal text-slate-400">
                            –
                          </td>
                          <td className="py-2.5 text-right font-normal text-slate-700">
                            0%
                          </td>
                        </tr>

                        {/* Row 6 */}
                        <tr>
                          <td className="py-2.5 font-normal text-blue-600 hover:underline cursor-pointer">
                            prepaid netbanking
                          </td>
                          <td className="py-2.5 text-right pr-6 font-normal text-slate-400">
                            –
                          </td>
                          <td className="py-2.5 text-right font-normal text-slate-700">
                            0%
                          </td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom report button */}
        <div className="pt-2 text-left">
          <button className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs transition-colors shadow-sm">
            View full report
          </button>
        </div>

      </div>
      )}

      {/* Shortcut Cards Section */}
      {(visibleWidgets.siteAudit || visibleWidgets.onPageSeo || visibleWidgets.backlinkAudit || visibleWidgets.organicTrafficInsights) && (
        <div className={`grid gap-4 mt-6 ${shortcutGridClass}`}>
        
          {/* Site Audit Card */}
          {visibleWidgets.siteAudit && (
            <div className="bg-gray-200 rounded-xl p-4 flex flex-col justify-between min-h-[160px] text-left border border-slate-200/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300/80 pb-2">
              <span className="font-bold text-slate-800 text-[14px] flex items-center gap-1">
                Site Audit
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </span>
              <X 
                onClick={() => setVisibleWidgets(prev => ({ ...prev, siteAudit: false }))}
                className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" 
              />
            </div>
            <p className="text-[13px] text-slate-500 font-normal leading-relaxed">
              Detect issues related to crawlability, content, links and coding.
            </p>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => router.push("/audit")}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[12px] py-1.5 px-3.5 rounded-lg shadow-sm transition-colors"
            >
              Set up
            </button>
          </div>
        </div>
        )}

        {/* On Page SEO Checker Card */}
        {visibleWidgets.onPageSeo && (
          <div className="bg-gray-200 rounded-xl p-4 flex flex-col justify-between min-h-[160px] text-left border border-slate-200/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300/80 pb-2">
              <span className="font-bold text-slate-800 text-[14px] flex items-center gap-1">
                On Page SEO Checker
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </span>
              <X 
                onClick={() => setVisibleWidgets(prev => ({ ...prev, onPageSeo: false }))}
                className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" 
              />
            </div>
            <p className="text-[13px] text-slate-500 font-normal leading-relaxed">
              Collect ideas on strategy, content, backlinks and more.
            </p>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => router.push("/on-page-seo")}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[12px] py-1.5 px-3.5 rounded-lg shadow-sm transition-colors"
            >
              Set up
            </button>
          </div>
        </div>
        )}

        {/* Backlink Audit Card */}
        {visibleWidgets.backlinkAudit && (
          <div className="bg-gray-200 rounded-xl p-4 flex flex-col justify-between min-h-[160px] text-left border border-slate-200/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300/80 pb-2">
              <span className="font-bold text-slate-800 text-[14px] flex items-center gap-1">
                Backlink Audit
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </span>
              <X 
                onClick={() => setVisibleWidgets(prev => ({ ...prev, backlinkAudit: false }))}
                className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" 
              />
            </div>
            <p className="text-[13px] text-slate-500 font-normal leading-relaxed">
              Detoxify your backlink portfolio and strengthen your website rankings.
            </p>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => router.push("/backlink-audit")}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[12px] py-1.5 px-3.5 rounded-lg shadow-sm transition-colors"
            >
              Set up
            </button>
          </div>
        </div>
        )}

        {/* Organic Traffic Insights Card */}
        {visibleWidgets.organicTrafficInsights && (
          <div className="bg-gray-200 rounded-xl p-4 flex flex-col justify-between min-h-[160px] text-left border border-slate-200/50">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-300/80 pb-2">
              <span className="font-bold text-slate-800 text-[14px] flex items-center gap-1">
                Organic Traffic Insights
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </span>
              <X 
                onClick={() => setVisibleWidgets(prev => ({ ...prev, organicTrafficInsights: false }))}
                className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600" 
              />
            </div>
            <p className="text-[13px] text-slate-555 font-normal leading-relaxed">
              Uncover "not provided" keywords combining GA, GSC and Semrush data.
            </p>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => router.push("/organic-traffic-insights")}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[12px] py-1.5 px-3.5 rounded-lg shadow-sm transition-colors"
            >
              Set up
            </button>
          </div>
        </div>
        )}

      </div>
      )}

      
      {/* Traffic Analytics Card */}
      {visibleWidgets.trafficAnalytics && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 text-left">
        
        {/* Card Top Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-bold text-slate-800 text-[16px] flex items-center gap-1">
              Traffic Analytics
              <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
            </h2>
            
            {/* Source Pills */}
            <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200">
              <button 
                onClick={() => setDataSource("semrush")}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                  dataSource === "semrush" 
                    ? "bg-slate-800 text-white shadow-sm" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                SEO Data
              </button>
              <button 
                onClick={() => setDataSource("google")}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                  dataSource === "google" 
                    ? "bg-slate-800 text-white shadow-sm" 
                    : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                {/* GSC Mini Logo */}
                <svg className="w-3 h-3 text-orange-500" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M14 13.5v-11c0-.8-.7-1.5-1.5-1.5h-9C2.7 1 2 1.7 2 2.5v11c0 .8.7 1.5 1.5 1.5h9c.8 0 1.5-.7 1.5-1.5zM3.5 13V3h9v10h-9zM5 8h1.5v3.5H5V8zm2.2-2.5h1.5V11.5H7.2V5.5zm2.3 3.5H11v2.5H9.5V9z" />
                </svg>
                Google Data
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-550">
            <span className="text-slate-400">Scope: Root Domain</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">Historical data: Jun 2026</span>
            <button 
              onClick={() => setVisibleWidgets(prev => ({ ...prev, trafficAnalytics: false }))}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Five Metrics Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 border-b border-slate-100 pb-4 mb-4">
          
          {/* Visits */}
          <div className="space-y-1">
            <span className="text-[12px] text-slate-400 font-semibold uppercase tracking-wider">Visits</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-bold text-slate-800">87</span>
              <span className="text-xs text-red-500 font-bold font-mono">-49.42%</span>
            </div>
          </div>

          {/* Unique Visitors */}
          <div className="space-y-1 border-l border-slate-100 pl-4">
            <span className="text-[12px] text-slate-400 font-semibold uppercase tracking-wider">Unique Visitors</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-bold text-slate-800">87</span>
              <span className="text-xs text-red-500 font-bold font-mono">-27.5%</span>
            </div>
          </div>

          {/* Pages / Visit */}
          <div className="space-y-1 border-l border-slate-100 pl-4">
            <span className="text-[12px] text-slate-400 font-semibold uppercase tracking-wider">Pages / Visit</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-bold text-slate-800">1</span>
              <span className="text-xs text-red-500 font-bold font-mono">-28.33%</span>
            </div>
          </div>

          {/* Avg. Visit Duration */}
          <div className="space-y-1 border-l border-slate-100 pl-4">
            <span className="text-[12px] text-slate-400 font-semibold uppercase tracking-wider">Avg. Visit Duration</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-bold text-slate-800">00:00:00</span>
              <span className="text-xs text-slate-400 font-bold font-mono">0%</span>
            </div>
          </div>

          {/* Bounce Rate */}
          <div className="space-y-1 border-l border-slate-100 pl-4">
            <span className="text-[12px] text-slate-400 font-semibold uppercase tracking-wider">Bounce Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-bold text-slate-800">100%</span>
              <span className="text-xs text-red-500 font-bold font-mono">39.53%</span>
            </div>
          </div>

        </div>

        {/* Timeframe Dropdown Row */}
        <div className="flex items-center justify-end relative z-20 mb-3">
          <div className="relative">
            <button 
              onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              {timeframe}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {showTimeframeDropdown && (
              <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl w-36 text-left py-1">
                {["Last 30 days", "Last 6 months", "Last 12 months"].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setTimeframe(item);
                      setShowTimeframeDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-slate-50 font-semibold ${
                      timeframe === item ? "text-blue-600 bg-blue-50/50" : "text-slate-600"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recharts Canvas Section */}
        <div className="h-64 w-full relative">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart 
                data={getChartData()} 
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                  domain={[0, 150]}
                  ticks={[0, 50, 100, 150]}
                />
                <RechartsTooltip 
                  content={<CustomTooltip />} 
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} 
                />
                
                {channels.map((chan) => (
                  visibleChannels[chan.id] && (
                    <RechartsLine
                      key={chan.id}
                      type="monotone"
                      dataKey={chan.id}
                      stroke={chan.color}
                      strokeWidth={2}
                      dot={{ r: 0 }}
                      activeDot={{ r: 4, strokeWidth: 1 }}
                      name={chan.id}
                      animationDuration={800}
                    />
                  )
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
              Loading Recharts analytics...
            </div>
          )}
        </div>

        {/* Custom Interactive Legend Checkboxes */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-4 border-t border-slate-100 pt-4">
          {channels.map((chan) => (
            <label 
              key={chan.id} 
              className="flex items-center gap-2 cursor-pointer select-none text-[13px] font-semibold text-slate-600 hover:text-slate-800 transition-colors"
            >
              <input
                type="checkbox"
                checked={visibleChannels[chan.id]}
                onChange={() => toggleChannel(chan.id)}
                style={{ accentColor: chan.color }}
                className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer"
              />
              {chan.name}
            </label>
          ))}
        </div>

        {/* Report Footer */}
        <div className="mt-4 pt-3 flex justify-between items-center border-t border-slate-50">
          <button 
            onClick={() => router.push("/dashboard")}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs transition-colors shadow-sm"
          >
            View full report
          </button>
        </div>

      </div>
      )}

      {/* Organic Rankings & Backlinks Cards */}
      {(visibleWidgets.organicRankings || visibleWidgets.backlinks) && (
        <div className={`grid grid-cols-1 ${(visibleWidgets.organicRankings && visibleWidgets.backlinks) ? "lg:grid-cols-2" : "lg:grid-cols-1"} gap-6 mt-6`}>
          
          {/* Organic Rankings Card */}
          {visibleWidgets.organicRankings && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col min-h-[560px] text-left">
          
          <div>
            {/* Header row */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="font-bold text-slate-800 text-[16px] flex items-center gap-1.5">
                Organic Rankings
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </span>
              <div className="flex items-center gap-1.5 text-[14px] text-slate-400 font-semibold">
                Last month
                <button 
                  onClick={() => setVisibleWidgets(prev => ({ ...prev, organicRankings: false }))}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Sub-header controls */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[14px] font-semibold text-slate-555 pb-3 border-b border-slate-100">
              <span className="text-slate-400 font-normal">Scope: Root Domain</span>
              <span className="text-slate-200">|</span>
              <div className="flex items-center gap-1 cursor-pointer hover:underline text-blue-600">
                <img src="https://flagcdn.com/w20/us.png" className="w-3.5 h-2.5 object-contain rounded-sm" alt="US" />
                United States
                <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <span className="text-slate-200">|</span>
              <div className="flex items-center gap-1 cursor-pointer hover:underline text-blue-600">
                <Monitor className="w-3.5 h-3.5 text-blue-600" />
                Desktop
                <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
              </div>
            </div>
          </div>
          
          {/* Illustrative Center Block */}
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="relative w-24 h-24 flex items-center justify-center mb-4">
              {/* Glow circle background */}
              <div className="absolute inset-0 bg-slate-100/60 rounded-full scale-90" />
              
              {/* Slanted illustrated browser */}
              <svg className="w-14 h-14 transform -rotate-6 relative z-10" viewBox="0 0 64 64" fill="none">
                <rect x="4" y="10" width="56" height="44" rx="5" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
                <path d="M 4 20 L 60 20" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="9" cy="15" r="1.5" fill="#94a3b8" />
                <circle cx="14" cy="15" r="1.5" fill="#94a3b8" />
                <circle cx="19" cy="15" r="1.5" fill="#94a3b8" />
                
                {/* Tiny bars inside browser */}
                <rect x="12" y="32" width="6" height="14" rx="1" fill="#cbd5e1" />
                <rect x="22" y="26" width="6" height="20" rx="1" fill="#94a3b8" />
                <rect x="32" y="36" width="6" height="10" rx="1" fill="#cbd5e1" />
                <rect x="42" y="29" width="6" height="17" rx="1" fill="#94a3b8" />
              </svg>
            </div>
            <h4 className="font-bold text-slate-800 text-[14px]">Nothing found</h4>
            <p className="text-[14px] text-slate-400 font-semibold mt-1 max-w-[200px] leading-relaxed">
              We haven't found any data for the analyzed domain
            </p>
          </div>

        </div>
        )}

        {/* Backlinks Card */}
        {visibleWidgets.backlinks && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col justify-between min-h-[560px] text-left">
          
          <div>
            {/* Header row */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <span className="font-bold text-slate-800 text-[16px] flex items-center gap-1.5">
                Backlinks
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </span>
              <div className="flex items-center gap-1.5 text-[14px] text-slate-400 font-semibold">
                Scope: Root Domain
                <button 
                  onClick={() => setVisibleWidgets(prev => ({ ...prev, backlinks: false }))}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Referring Domains Sub-Section */}
            <div className="flex items-center justify-between text-[14px] font-semibold text-slate-500 mb-2">
              <span className="flex items-center gap-1 text-slate-700 font-bold text-[14px]">
                Referring Domains
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </span>
              
              {/* Backlinks Timeframe Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowBacklinksDropdown(!showBacklinksDropdown)}
                  className="text-[14px] font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded border border-slate-200/50"
                >
                  {backlinksTimeframe}
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {showBacklinksDropdown && (
                  <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl w-32 text-left py-1 z-30">
                    {["Last 30 days", "Last 6 months", "Last 12 months"].map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setBacklinksTimeframe(item);
                          setShowBacklinksDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors hover:bg-slate-50 font-semibold ${
                          backlinksTimeframe === item ? "text-blue-600 bg-blue-50/50" : "text-slate-600"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Referring Domains Area Chart */}
            <div className="h-60 w-full mb-4">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsAreaChart 
                    data={getBacklinksData()} 
                    margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="backlinksGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                      domain={[120, 180]}
                      ticks={[125, 150, 175]}
                    />
                    <RechartsTooltip 
                      content={<BacklinksTooltip />} 
                      cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} 
                    />
                    <RechartsArea
                      type="monotone"
                      dataKey="value"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      fill="url(#backlinksGrad)"
                      animationDuration={800}
                    />
                  </RechartsAreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg" />
              )}
            </div>

            {/* Referring Domains by Authority Score Sub-Section */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-[14px] font-semibold text-slate-500">
                <span className="flex items-center gap-1 text-slate-700 font-bold text-[14px]">
                  Referring Domains by Authority Score
                  <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                </span>
                <span className="text-slate-400 text-[14px]">Jul 2026</span>
              </div>

              {/* Score Horizontal Distribution */}
              <div className="space-y-2">
                {[
                  { range: "81-100", percentage: "0.64%", barWidth: "1.5%", count: 1, color: "bg-teal-400" },
                  { range: "61-80", percentage: "0%", barWidth: "0%", count: 0, color: "bg-slate-200" },
                  { range: "41-60", percentage: "2.56%", barWidth: "3.5%", count: 4, color: "bg-[#5f63e8]" },
                  { range: "21-40", percentage: "8.33%", barWidth: "10%", count: 13, color: "bg-[#5f63e8]" },
                  { range: "0-20", percentage: "88.46%", barWidth: "88.46%", count: 138, color: "bg-[#5f63e8]" }
                ].map((score, idx) => (
                  <div 
                    key={idx} 
                    className="relative flex items-center justify-between text-[14px] text-slate-600 gap-3 h-5 font-sans cursor-pointer hover:bg-slate-50/50 px-1 rounded transition-colors"
                    onMouseEnter={() => setHoveredBarIdx(idx)}
                    onMouseLeave={() => setHoveredBarIdx(null)}
                    onMouseMove={handleMouseMoveBar}
                  >
                    <span className="w-12 text-slate-400 text-left">{score.range}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full ${score.color} rounded-full`} 
                        style={{ width: score.barWidth }}
                      />
                    </div>
                    <span className="w-12 text-right text-slate-400 font-normal">{score.percentage}</span>
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("/audit");
                      }}
                      className="w-8 text-right text-blue-600 hover:underline cursor-pointer"
                    >
                      {score.count}
                    </span>

                    {/* Authority Score Custom Tooltip */}
                    {hoveredBarIdx === idx && (
                      <div 
                        className="absolute bg-slate-800 text-white text-[11px] font-bold rounded py-1.5 px-2.5 shadow-xl z-30 pointer-events-none transition-all duration-75 whitespace-nowrap"
                        style={{
                          left: `${Math.min(Math.max(barTooltipPos.x - 50, 0), 180)}px`,
                          top: `${barTooltipPos.y - 42}px`
                        }}
                      >
                        <div className="font-bold">Authority Score {score.range}</div>
                        <div className="text-slate-300 font-medium">Share: {score.percentage} ({score.count} domains)</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Footer View report */}
          <div className="pt-4 border-t border-slate-100 mt-2">
            <button 
              onClick={() => router.push("/dashboard")}
              className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-[14px] transition-colors shadow-sm"
            >
              View full report
            </button>
          </div>

        </div>
        )}

      </div>
      )}

      {/* Google Connect Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 mt-6 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[220px]">
        
        {/* Left Side: Illustrative SVG */}
        <div className="flex-shrink-0 w-full md:w-auto flex justify-center">
          <svg className="w-[300px] h-[180px]" viewBox="0 0 300 180" fill="none">
            {/* Main Browser Window */}
            <rect x="10" y="20" width="220" height="140" rx="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
            {/* Header bar */}
            <rect x="10.75" y="20.75" width="218.5" height="15" fill="#f1f5f9" />
            <circle cx="18" cy="28" r="2.5" fill="#cbd5e1" />
            <circle cx="25" cy="28" r="2.5" fill="#cbd5e1" />
            <circle cx="32" cy="28" r="2.5" fill="#cbd5e1" />

            {/* Sidebar inside browser */}
            <rect x="10" y="35" width="40" height="125" fill="#f8fafc" />
            <rect x="18" y="45" width="24" height="4" rx="1" fill="#e2e8f0" />
            <rect x="18" y="55" width="24" height="4" rx="1" fill="#e2e8f0" />
            <rect x="18" y="65" width="24" height="4" rx="1" fill="#e2e8f0" />

            {/* Main area inside browser */}
            <line x1="50" y1="35" x2="50" y2="160" stroke="#e2e8f0" strokeWidth="1" />
            <rect x="60" y="45" width="50" height="4" rx="1" fill="#cbd5e1" />
            
            {/* Area chart in browser */}
            <path d="M 60 110 L 80 90 L 100 95 L 120 75 L 140 85 L 160 65 L 180 70 L 200 55 L 200 110 Z" fill="#eff6ff" />
            <path d="M 60 110 L 80 90 L 100 95 L 120 75 L 140 85 L 160 65 L 180 70 L 200 55" fill="none" stroke="#93c5fd" strokeWidth="1.5" />

            {/* Donut chart in browser */}
            <circle cx="85" cy="135" r="14" stroke="#e2e8f0" strokeWidth="4" fill="none" />
            <circle cx="85" cy="135" r="14" stroke="#bfdbfe" strokeWidth="4" strokeDasharray="88" strokeDashoffset="35" strokeLinecap="round" fill="none" />
            
            {/* Mini rects in browser */}
            <rect x="110" y="125" width="18" height="20" rx="2" fill="#e2e8f0" />
            <rect x="135" y="125" width="18" height="20" rx="2" fill="#e2e8f0" />

            {/* Floating Connection Pop-up Card */}
            <g filter="url(#dropShadowPop)">
              <rect x="140" y="65" width="145" height="100" rx="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              
              {/* Authenticated Google G Logo */}
              <g transform="translate(150, 75) scale(1.1)">
                <path d="M19.6 10.2c0-.7-.1-1.4-.2-2H10v3.8h5.4c-.2 1.2-.9 2.2-2 2.9v2.4h3.2c1.9-1.7 3-4.3 3-7.1z" fill="#4285F4"/>
                <path d="M10 20c2.7 0 5-1 6.6-2.6l-3.2-2.4c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.7-5.6-4.1H1.1v2.5C2.8 17.5 6.1 20 10 20z" fill="#34A853"/>
                <path d="M4.4 11.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V5.7H1.1C.4 7 .0 8.5.0 10s.4 3 1.1 4.3l3.3-2.5z" fill="#FBBC05"/>
                <path d="M10 4c1.5 0 2.8.5 3.8 1.4l2.9-2.9C15 1.0 12.7.0 10 .0 6.1.0 2.8 2.5 1.1 5.7l3.3 2.5C5.2 5.7 7.4 4 10 4z" fill="#EA4335"/>
              </g>

              {/* Text label */}
              <text x="152" y="112" fill="#94a3b8" fontSize="6.5" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.2">CONNECT YOUR ACCOUNT</text>

              {/* Lines and dots */}
              <circle cx="155" cy="123.75" r="1.5" fill="#cbd5e1" />
              <circle cx="155" cy="131.75" r="1.5" fill="#cbd5e1" />
              <rect x="162" y="122" width="110" height="3.5" rx="1" fill="#e2e8f0" />
              <rect x="162" y="130" width="110" height="3.5" rx="1" fill="#e2e8f0" />

              {/* Blue button */}
              <rect x="205" y="142" width="68" height="14" rx="3.5" fill="#1d9bf0" />
            </g>
            <defs>
              <filter id="dropShadowPop" x="135" y="62" width="155" height="110" filterUnits="userSpaceOnUse">
                <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.08" />
              </filter>
            </defs>
          </svg>
        </div>

        {/* Right Side: Copy & Buttons */}
        <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start gap-4">
          <div className="space-y-1.5">
            <h3 className="text-[18px] font-bold text-slate-800 leading-tight">
              Connect Google services
            </h3>
            <p className="text-[14px] text-slate-400 font-semibold max-w-lg leading-relaxed">
              Enrich your analysis with real-time data from Google Analytics and Google Search Console to your SEO Dashboard.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 bg-white text-slate-700 font-bold rounded-lg text-sm shadow-sm transition-all duration-150">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Connect
            </button>
            <span className="text-slate-400 hover:text-slate-600 underline decoration-dashed underline-offset-4 cursor-pointer text-sm font-semibold transition-colors">
              Disclaimer
            </span>
          </div>
        </div>

      </div>

      {/* Hidden Widgets Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 text-left mt-6">
        
        {/* Card Header Row */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <span className="font-bold text-slate-800 text-[16px] flex items-center gap-1.5">
            Hidden Widgets
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
          </span>
        </div>

        {/* Hidden Widgets List */}
        <div className="space-y-3 mb-4">
          {Object.entries(visibleWidgets).map(([key, visible]) => {
            if (visible) return null;
            return (
              <div key={key} className="flex items-center gap-2 text-[14px]">
                <button
                  onClick={() => setVisibleWidgets(prev => ({ ...prev, [key]: true }))}
                  className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-bold text-xs"
                >
                  Restore
                </button>
                <span className="text-slate-700 font-semibold">{widgetTitles[key]}</span>
                <Info className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
              </div>
            );
          })}
          {Object.values(visibleWidgets).every(Boolean) && (
            <div className="text-[14px] text-slate-400 font-semibold">
              No hidden widgets
            </div>
          )}
        </div>

        {/* Restore All Widgets Button */}
        <div>
          <button
            onClick={() => setVisibleWidgets({
              aiSearch: true,
              seoOverview: true,
              positionTracking: true,
              siteAudit: true,
              onPageSeo: true,
              backlinkAudit: true,
              organicTrafficInsights: true,
              trafficAnalytics: true,
              organicRankings: true,
              backlinks: true
            })}
            disabled={Object.values(visibleWidgets).every(Boolean)}
            className={`px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs transition-colors shadow-sm ${
              Object.values(visibleWidgets).every(Boolean) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            Restore all widgets
          </button>
        </div>

      </div>

    </div>
  );
   
}
