"use client";

import React from "react";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { RefreshCw, ShieldAlert } from "lucide-react";
import { useSeo } from "@/context/SeoContext";

export default function DashboardLayoutShell({ children }) {
  const { currentDomain, handleSearch, seoData, isLoading, error, handleRefresh } = useSeo();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 64);
    };
    window.addEventListener("scroll", handleScroll);
    // Call once initially to set initial state
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderInnerContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col flex-1 items-center justify-center min-h-[400px]">
          <RefreshCw className="w-8 h-8 text-rankgenie-orange animate-spin mb-3" />
          <span className="text-sm font-semibold text-slate-500">
            Analyzing {currentDomain}... Fetching SEO & Local search metrics
          </span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-700 p-5 rounded-xl text-center max-w-xl mx-auto my-12">
          <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-rankgenie-danger" />
          <h4 className="font-bold text-sm">Failed to Load Dashboard Data</h4>
          <p className="text-xs mt-1 text-red-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-rankgenie-orange text-white text-xs font-bold rounded-lg shadow hover:bg-rankgenie-orange/90 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      );
    }

    if (!seoData) return null;

    return children;
  };

  return (
    <div className="min-h-screen bg-rankgenie-lightBg text-slate-800 font-sans w-full flex flex-col">
      {/* Top bar header */}
      <TopBar
        currentDomain={currentDomain}
        onSearch={handleSearch}
        lastUpdated={seoData?.lastUpdated}
        isLoading={isLoading}
      />

      {/* Main viewport area */}
      <div className="flex flex-1 relative items-start w-full">
        {/* Sidebar navigation */}
        <Sidebar isScrolled={isScrolled} />

        {/* Scrollable page body */}
        <main className="flex-1 p-6 min-w-0">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Quick Header */}
            {!isLoading && seoData && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    SEO & Local Visibility Dashboard
                  </h1>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Search engine diagnostics and customer review tracking dashboard
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRefresh}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs shadow-sm transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh Stats
                  </button>
                </div>
              </div>
            )}

            {renderInnerContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
