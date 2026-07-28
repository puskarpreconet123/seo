import React, { useState } from "react";
import { Search, Globe, RefreshCw, User, Bell } from "lucide-react";

export default function TopBar({ currentDomain, onSearch, lastUpdated, isLoading }) {
  const [searchInput, setSearchInput] = useState(currentDomain);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim().toLowerCase());
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 gap-6">
      {/* Brand Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <img
          src="/logo.png"
          alt="RankGenie Logo"
          className="h-14 w-auto object-contain"
        />
        <span className="px-1.5 py-0.5 bg-rankgenie-orange/10 text-rankgenie-orange text-[10px] font-black uppercase tracking-wider rounded-md border border-rankgenie-orange/20 shadow-sm ml-[-4px]">Beta</span>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-lg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Analyze any website domain (e.g., example.com, mybusiness.org)..."
            className="block w-full pl-10 pr-24 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-rankgenie-orange transition-all"
          />
          <div className="absolute inset-y-1.5 right-1.5">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1 bg-rankgenie-orange hover:bg-rankgenie-orange/95 text-white font-semibold text-xs rounded-md shadow-sm transition-all flex items-center gap-2 h-full disabled:opacity-90"
            >
              {isLoading ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white/90"></span>
                  </span>
                  <span>Scanning...</span>
                </>
              ) : (
                "Analyze"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Domain Info & Badges */}
      <div className="flex items-center gap-6 ml-4">
        {currentDomain && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Analyzing: <span className="text-rankgenie-orange font-bold">{currentDomain}</span></span>
          </div>
        )}

        {lastUpdated && (
          <div className="hidden lg:block text-xs text-slate-400 font-medium">
            Data from: <span className="font-semibold text-slate-500">{lastUpdated}</span>
          </div>
        )}

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        {/* Notifications & Profile */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rankgenie-danger rounded-full border border-white"></span>
          </button>
          <div className="flex items-center gap-2 pl-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer transition-all">
              <User className="w-4.5 h-4.5" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-none">Puskar Das</span>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Administrator</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
