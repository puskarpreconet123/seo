import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Globe,
  MapPin,
  KeyRound,
  FileSpreadsheet,
  AlertCircle,
  Settings,
  LineChart,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Home,
  Sparkles,
  Image,
  Link,
  Brain,
  Code,
  FileText,
  Bot
} from "lucide-react";

export default function Sidebar({ isScrolled }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getTabFromPathname = (path) => {
    if (!path || path === "/") return "home-dashboard";
    return path.substring(1) || "home-dashboard";
  };
  const activeTab = getTabFromPathname(pathname);

  const setActiveTab = (tab) => {
    const route = tab === "home-dashboard" ? "/" : `/${tab}`;
    router.push(route);
  };
  // Define toolkits and their nested structures
  const toolkits = [
    {
      id: "home",
      name: "Home",
      icon: Home,
      defaultTab: "home-dashboard",
    },
    {
      id: "seo",
      name: "SEO Toolkit",
      icon: TrendingUp,
      defaultTab: "dashboard",
      categories: [
        {
          title: "",
          items: [
            { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
          ]
        },
        {
          title: "Site Performance",
          items: [
            { id: "audit", name: "Site Audit", icon: AlertCircle },
            { id: "position-tracking", name: "Position Tracking", icon: LineChart },
          ]
        },
        {
          title: "Link Optimization",
          items: [
            { id: "link-analysis", name: "Link Analysis", icon: Link },
            { id: "link-structure", name: "Link Structure", icon: Globe },
          ]
        },
        {
          title: "Competitive Analysis",
          items: [
            { id: "organic", name: "Organic Research", icon: Search },
            { id: "competitor", name: "Competitor Audit", icon: Globe }
          ]
        },
        {
          title: "Others",
          items: [
            { id: "content-seo", name: "Content SEO", icon: Sparkles },
            { id: "image-seo", name: "Image SEO", icon: Image },
          ]
        }
      ]
    },
    {
      id: "local",
      name: "Local SEO",
      icon: MapPin,
      defaultTab: "gbp",
      categories: [
        {
          title: "Local Listings",
          items: [
            { id: "gbp", name: "Google Business Profile", icon: MapPin },
            { id: "local-keywords", name: "Local Keyword Tracking", icon: TrendingUp },
          ]
        }
      ]
    },
    {
      id: "content",
      name: "Content Marketing",
      icon: Sparkles,
      defaultTab: "content-dashboard",
      categories: [
        {
          title: "",
          items: [
            { id: "content-dashboard", name: "Dashboard", icon: LayoutDashboard },
          ]
        },
        {
          title: "Content Audit & Optimization",
          items: [
            { id: "content-seo", name: "Content SEO", icon: Search },
          ]
        },
        {
          title: "Content Creation",
          items: [
            { id: "content-generator", name: "Content Generator", icon: Sparkles },
            { id: "writing-assistant", name: "Writing Assistant", icon: FileText },
          ]
        }
      ]
    },
    {
      id: "ai-visibility",
      name: "AI Visibility",
      icon: Brain,
      defaultTab: "ai-simulator",
      categories: [
        {
          title: "Simulation & Tracking",
          items: [
            { id: "ai-simulator", name: "LLM Preference", icon: Bot },
            { id: "generative-geo", name: "Generative GEO", icon: FileText },
            { id: "technical-aeo", name: "Technical AEO", icon: Code },
          ]
        }
      ]
    },
    {
      id: "settings",
      name: "Settings",
      icon: Settings,
      defaultTab: "settings",
      categories: [
        {
          title: "Configuration",
          items: [
            { id: "settings", name: "Developer Settings", icon: Settings },
          ]
        }
      ]
    }
  ];

  // Helper to find toolkit based on active tab
  const findToolkitForTab = (tab) => {
    if (tab === "home-dashboard") return "home";
    for (const toolkit of toolkits) {
      if (toolkit.categories) {
        for (const cat of toolkit.categories) {
          if (cat.items.find(item => item.id === tab)) {
            return toolkit.id;
          }
        }
      }
    }
    return "seo"; // fallback
  };

  // State management
  const [selectedToolkitId, setSelectedToolkitId] = useState(() => findToolkitForTab(activeTab));
  const [isSecondPanelOpen, setIsSecondPanelOpen] = useState(true);

  // Sync selected toolkit with active tab changes from parent page
  useEffect(() => {
    if (activeTab === "home-dashboard") {
      setSelectedToolkitId("home");
      setIsSecondPanelOpen(false);
      return;
    }
    
    // Find if activeTab is in current selected toolkit
    const currentToolkit = toolkits.find(t => t.id === selectedToolkitId);
    const hasTab = currentToolkit?.categories?.some(cat => cat.items.some(i => i.id === activeTab));
    
    if (!hasTab) {
      // Find toolkit that has this tab
      const newToolkit = toolkits.find(t => t.categories?.some(cat => cat.items.some(i => i.id === activeTab)));
      if (newToolkit) {
        setSelectedToolkitId(newToolkit.id);
        setIsSecondPanelOpen(true);
      }
    }
  }, [activeTab]);

  // Handle toolkit clicks on the narrow sidebar
  const handleToolkitClick = (toolkit) => {
    if (toolkit.id === "home") {
      setSelectedToolkitId("home");
      setIsSecondPanelOpen(false);
      setActiveTab("home-dashboard");
    } else {
      if (selectedToolkitId === toolkit.id && isSecondPanelOpen) {
        // Toggle collapse if clicking the already open toolkit
        setIsSecondPanelOpen(false);
      } else {
        // Open panel and select toolkit
        setSelectedToolkitId(toolkit.id);
        setIsSecondPanelOpen(true);
        
        // If current activeTab is not in this toolkit, switch to its default tab
        const hasTab = toolkit.categories?.some(cat => cat.items.some(item => item.id === activeTab));
        if (!hasTab && toolkit.defaultTab) {
          setActiveTab(toolkit.defaultTab);
        }
      }
    }
  };

  const selectedToolkit = toolkits.find(t => t.id === selectedToolkitId);

  if (!mounted) {
    return (
      <div
        className="sticky top-0 shrink-0 z-20 select-none flex transition-all duration-300"
        style={{
          height: isScrolled ? "100vh" : "calc(100vh - 64px)",
        }}
      >
        <aside className="w-[60px] bg-slate-50 border-r border-slate-200 shrink-0 h-full" />
      </div>
    );
  }

  return (
    <div
      className="sticky top-0 shrink-0 z-20 select-none flex transition-all duration-300"
      style={{
        height: isScrolled ? "100vh" : "calc(100vh - 64px)",
      }}
    >
      {/* Primary Narrow Sidebar Column */}
      <aside className="w-[60px] bg-slate-50 border-r border-slate-200 flex flex-col justify-between shrink-0 h-full z-30 overflow-visible">
        <div className="flex flex-col items-center w-full">
          {/* Navigation Toolkit Icons */}
          <nav className="flex flex-col items-center gap-3 w-full px-2 pt-4">
            {toolkits.filter(t => t.id !== "settings").map((toolkit) => {
              const Icon = toolkit.icon;
              const isActive = selectedToolkitId === toolkit.id;
              return (
                <div key={toolkit.id} className="relative group w-full flex justify-center">
                  <button
                    onClick={() => handleToolkitClick(toolkit)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      isActive
                        ? "bg-orange-50 text-rankgenie-orange border border-orange-100 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>

                  {/* Hover Popover Tooltip */}
                  <div className={`absolute left-full top-0 pl-3 z-50 w-64 pointer-events-auto transition-all duration-200 ${
                    isSecondPanelOpen && selectedToolkitId === toolkit.id ? "hidden" : "hidden group-hover:block"
                  }`}>
                    <div className="bg-white border border-slate-200 rounded-xl shadow-2xl p-4 text-left">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1.5">
                        {toolkit.name}
                      </div>
                      
                      {toolkit.categories ? (
                        <div className="space-y-3">
                          {toolkit.categories.map((cat, catIdx) => (
                            <div key={catIdx} className="space-y-1">
                              {cat.title && (
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">
                                  {cat.title}
                                </div>
                              )}
                              <div className="space-y-0.5">
                                {cat.items.map((item) => {
                                  const SubIcon = item.icon;
                                  const isItemActive = activeTab === item.id;
                                  return (
                                    <button
                                      key={item.id}
                                      onClick={() => {
                                        setSelectedToolkitId(toolkit.id);
                                        setIsSecondPanelOpen(true);
                                        setActiveTab(item.id);
                                      }}
                                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left text-sm transition-colors font-medium ${
                                        isItemActive
                                          ? "bg-orange-50 text-rankgenie-orange font-semibold"
                                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                      }`}
                                    >
                                      <SubIcon className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{item.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-500 font-medium px-1">
                          Click to open main dashboard view.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Settings Icon */}
        <div className="p-2 border-t border-slate-200 flex flex-col items-center w-full">
          {toolkits.filter(t => t.id === "settings").map((toolkit) => {
            const Icon = toolkit.icon;
            const isActive = selectedToolkitId === toolkit.id;
            return (
              <div key={toolkit.id} className="relative group w-full flex justify-center">
                <button
                  onClick={() => handleToolkitClick(toolkit)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-slate-200 text-slate-800"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>

                {/* Hover Popover Tooltip for Settings */}
                <div className={`absolute left-full bottom-0 pl-3 z-50 w-64 pointer-events-auto transition-all duration-200 ${
                  isSecondPanelOpen && selectedToolkitId === toolkit.id ? "hidden" : "hidden group-hover:block"
                }`}>
                  <div className="bg-white border border-slate-200 rounded-xl shadow-2xl p-4 text-left">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1.5">
                      {toolkit.name}
                    </div>
                    {toolkit.categories.map((cat, catIdx) => (
                      <div key={catIdx} className="space-y-1">
                        {cat.title && (
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">
                            {cat.title}
                          </div>
                        )}
                        <div className="space-y-0.5">
                          {cat.items.map((item) => {
                            const SubIcon = item.icon;
                            const isItemActive = activeTab === item.id;
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setSelectedToolkitId(toolkit.id);
                                  setIsSecondPanelOpen(true);
                                  setActiveTab(item.id);
                                }}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-left text-sm transition-colors font-medium ${
                                  isItemActive
                                    ? "bg-orange-50 text-rankgenie-orange font-semibold"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                }`}
                              >
                                <SubIcon className="w-3.5 h-3.5 text-slate-400" />
                                <span>{item.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Secondary Collapsible Panel */}
      <aside
        className={`flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out h-full overflow-hidden ${
          isSecondPanelOpen ? "w-[220px]" : "w-0 border-r-0"
        }`}
      >
        <div className="w-[220px] h-full flex flex-col shrink-0">
          {/* Header */}
          <div className="pt-5 pb-3 flex items-center justify-between px-4 shrink-0">
            <span className="font-extrabold text-slate-400 tracking-wider text-[10px] uppercase leading-none">
              {selectedToolkit?.name || "Navigation"}
            </span>
            <button
              onClick={() => setIsSecondPanelOpen(false)}
              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded transition-colors"
              title="Collapse Panel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-6">
            {selectedToolkit?.categories ? (
              selectedToolkit.categories.map((cat, catIdx) => (
                <div key={catIdx} className="space-y-1">
                  {cat.title && (
                    <h3 className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                      {cat.title}
                    </h3>
                  )}
                  <ul className="space-y-0.5 mt-1">
                    {cat.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <li key={item.id}>
                          <button
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                              isActive
                                ? "bg-slate-100 text-slate-900 font-bold"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon
                                className={`w-3.5 h-3.5 ${
                                  isActive ? "text-rankgenie-orange" : "text-slate-400"
                                }`}
                              />
                              <span>{item.name}</span>
                            </div>
                            {isActive && <div className="w-1 h-3.5 rounded-full bg-rankgenie-orange" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-sm font-medium text-slate-400 text-center">
                No sub-features available
              </div>
            )}
          </nav>
        </div>
      </aside>
    </div>
  );
}

