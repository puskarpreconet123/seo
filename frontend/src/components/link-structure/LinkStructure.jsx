"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Lightbulb,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Unlock,
  ChevronRight,
  TrendingUp,
  GitFork,
  Hash,
  Anchor,
  Copy,
  Ban,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from "lucide-react";
import { useSeo } from "@/context/SeoContext";

export default function LinkStructure() {
  const { currentDomain } = useSeo();
  const svgRef = useRef(null);
  
  // Interactive Panel Tabs
  const [activePanelTab, setActivePanelTab] = useState("suggestions");

  const suggestionsData = [
    {
      from: "/",
      to: "refund.html",
      anchor: "Refund Policy",
      desc: "Linking to the Refund Policy page from the homepage ensures users can easily find and understand the refund terms, improving user experience and trust.",
      priority: "High"
    },
    {
      from: "/",
      to: "privacy.html",
      anchor: "Privacy Policy",
      desc: "Adding a link to the Privacy Policy from the homepage helps meet legal requirements and improves site transparency, which is crucial for user trust.",
      priority: "High"
    },
    {
      from: "/",
      to: "reviews.html",
      anchor: "Customer Reviews",
      desc: "Linking to the Customer Reviews page from the homepage can enhance credibility and provide social proof, encouraging potential clients to engage with the company.",
      priority: "High"
    },
    {
      from: "/",
      to: "chatbot.html",
      anchor: "Chatbot Development Services",
      desc: "Linking to the Chatbot Development Services page from the homepage highlights a specific service offering, improving topical relevance and aiding user navigation.",
      priority: "High"
    },
    {
      from: "/",
      to: "digital-marketing.html",
      anchor: "Digital Marketing Solutions",
      desc: "Linking to the Digital Marketing Solutions page from the homepage emphasizes a key service area, enhancing topical relevance and user engagement.",
      priority: "High"
    },
    {
      from: "/",
      to: "cloud.html",
      anchor: "Cloud Solutions",
      desc: "Adding a link to the Cloud Solutions page from the homepage helps distribute page authority and guides users to explore cloud services offered.",
      priority: "High"
    },
    {
      from: "/",
      to: "contact.html",
      anchor: "Contact Us",
      desc: "Linking to the Contact Us page from the homepage is essential for user interaction, allowing visitors to easily reach out for inquiries or services.",
      priority: "High"
    },
    {
      from: "/",
      to: "cyber-security.html",
      anchor: "Cyber Security Services",
      desc: "Linking to the Cyber Security Services page from the homepage highlights this critical service, improving topical relevance and guiding users interested in security solutions.",
      priority: "High"
    },
    {
      from: "/",
      to: "mobile-app-dev.html",
      anchor: "Mobile App Development",
      desc: "Linking to the Mobile App Development page from the homepage showcases a core service, enhancing topical relevance and aiding user navigation.",
      priority: "High"
    },
    {
      from: "/",
      to: "industries.html",
      anchor: "Industries We Serve",
      desc: "Linking to the Industries We Serve page from the homepage provides users with insights into the sectors the company specializes in, improving topical relevance.",
      priority: "High"
    },
    {
      from: "/",
      to: "ui-ux.html",
      anchor: "UI/UX Design Services",
      desc: "Linking to the UI/UX Design Services page from the homepage highlights this specialized service, improving topical relevance and guiding users interested in design solutions.",
      priority: "High"
    },
    {
      from: "/",
      to: "about.html",
      anchor: "About Preconet Technologies",
      desc: "Linking to the About page from the homepage provides users with company background information, which is essential for building trust and credibility.",
      priority: "High"
    },
    {
      from: "/",
      to: "web-development.html",
      anchor: "Web Development Services",
      desc: "Linking to the Web Development Services page from the homepage emphasizes a key service offering, enhancing topical relevance and aiding user navigation.",
      priority: "High"
    },
    {
      from: "/",
      to: "terms.html",
      anchor: "Terms and Conditions",
      desc: "Linking to the Terms and Conditions page from the homepage ensures users can easily access legal information, which is crucial for compliance and transparency.",
      priority: "High"
    }
  ];

  const [expandedSection, setExpandedSection] = useState("orphan");

  const accordionSections = [ ];

  const toggleSection = (sectionName) => {
    setExpandedSection((prev) => (prev === sectionName ? null : sectionName));
  };

  // Graph state: Zoom and Pan
  const [zoom, setZoom] = useState(1.3);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState(null);

  // Define Nodes and Links
  const [nodes, setNodes] = useState(() => {
    const list = [
      { id: 0, label: "Preconet | Digital Marketing", type: "root", x: 220, y: 200, vx: 0, vy: 0 },
      // Internal nodes
      { id: 1, label: "contact", type: "internal", x: 180, y: 150, vx: 0, vy: 0 },
      { id: 2, label: "about", type: "internal", x: 220, y: 150, vx: 0, vy: 0 },
      { id: 3, label: "services", type: "internal", x: 150, y: 200, vx: 0, vy: 0 },
      { id: 4, label: "industries", type: "internal", x: 260, y: 200, vx: 0, vy: 0 },
      { id: 5, label: "blog", type: "internal", x: 190, y: 250, vx: 0, vy: 0 },
      { id: 6, label: "portfolio", type: "internal", x: 230, y: 250, vx: 0, vy: 0 },
      { id: 7, label: "careers", type: "internal", x: 140, y: 160, vx: 0, vy: 0 },
      { id: 8, label: "team", type: "internal", x: 270, y: 160, vx: 0, vy: 0 },
      { id: 9, label: "case-studies", type: "internal", x: 140, y: 240, vx: 0, vy: 0 },
      { id: 10, label: "news", type: "internal", x: 270, y: 240, vx: 0, vy: 0 },
      { id: 11, label: "cloud", type: "internal", x: 200, y: 110, vx: 0, vy: 0 },
      { id: 12, label: "aws", type: "internal", x: 200, y: 290, vx: 0, vy: 0 },
      { id: 13, label: "security", type: "internal", x: 110, y: 200, vx: 0, vy: 0 },
      { id: 14, label: "mobile-apps", type: "internal", x: 290, y: 200, vx: 0, vy: 0 },
      { id: 15, label: "industries#finance", type: "internal", x: 120, y: 130, vx: 0, vy: 0 },
      { id: 16, label: "industries#insurance", type: "internal", x: 280, y: 130, vx: 0, vy: 0 },
      { id: 17, label: "industries#retail", type: "internal", x: 120, y: 270, vx: 0, vy: 0 },
      { id: 18, label: "industries#healthcare", type: "internal", x: 280, y: 270, vx: 0, vy: 0 },
      { id: 19, label: "privacy", type: "internal", x: 160, y: 90, vx: 0, vy: 0 },
      { id: 20, label: "terms", type: "internal", x: 240, y: 90, vx: 0, vy: 0 },
      { id: 21, label: "cookie-policy", type: "internal", x: 160, y: 310, vx: 0, vy: 0 },
      { id: 22, label: "sitemap.xml", type: "internal", x: 240, y: 310, vx: 0, vy: 0 },
      { id: 23, label: "web-development", type: "internal", x: 90, y: 170, vx: 0, vy: 0 },

      // Orphans (Pink nodes, clustered separately to mimic screenshots)
      { id: 24, label: "refund.html", type: "orphan", x: 380, y: 160, vx: 0, vy: 0 },
      { id: 25, label: "privacy.html", type: "orphan", x: 410, y: 170, vx: 0, vy: 0 },
      { id: 26, label: "reviews.html", type: "orphan", x: 370, y: 190, vx: 0, vy: 0 },
      { id: 27, label: "chatbot.html", type: "orphan", x: 400, y: 200, vx: 0, vy: 0 },
      { id: 28, label: "whitepaper.pdf", type: "orphan", x: 430, y: 210, vx: 0, vy: 0 },
      { id: 29, label: "brochure.pdf", type: "orphan", x: 410, y: 240, vx: 0, vy: 0 },
      { id: 30, label: "marketing.html", type: "orphan", x: 380, y: 260, vx: 0, vy: 0 },
      { id: 31, label: "security.html", type: "orphan", x: 440, y: 160, vx: 0, vy: 0 },
      { id: 32, label: "faq.html", type: "orphan", x: 450, y: 190, vx: 0, vy: 0 },
      { id: 33, label: "support.html", type: "orphan", x: 440, y: 230, vx: 0, vy: 0 },
      { id: 34, label: "api-docs.html", type: "orphan", x: 450, y: 250, vx: 0, vy: 0 },
      { id: 35, label: "status.html", type: "orphan", x: 350, y: 180, vx: 0, vy: 0 },
      { id: 36, label: "terms.html", type: "orphan", x: 350, y: 210, vx: 0, vy: 0 },
      { id: 37, label: "jobs.html", type: "orphan", x: 360, y: 240, vx: 0, vy: 0 },
      { id: 38, label: "press.html", type: "orphan", x: 400, y: 130, vx: 0, vy: 0 },
      { id: 39, label: "blog-feed.xml", type: "orphan", x: 430, y: 120, vx: 0, vy: 0 }
    ];
    return list;
  });

  const links = useRef([
    // Internal linkings to root
    { source: 0, target: 1 },
    { source: 0, target: 2 },
    { source: 0, target: 3 },
    { source: 0, target: 4 },
    { source: 0, target: 5 },
    { source: 0, target: 6 },
    { source: 0, target: 7 },
    { source: 0, target: 8 },
    { source: 0, target: 9 },
    { source: 0, target: 10 },
    { source: 1, target: 11 },
    { source: 2, target: 11 },
    { source: 3, target: 13 },
    { source: 4, target: 14 },
    { source: 5, target: 12 },
    { source: 6, target: 12 },
    { source: 7, target: 15 },
    { source: 8, target: 16 },
    { source: 9, target: 17 },
    { source: 10, target: 18 },
    { source: 11, target: 19 },
    { source: 11, target: 20 },
    { source: 12, target: 21 },
    { source: 12, target: 22 },
    { source: 13, target: 23 },

    // Orphan cluster linking together separately (not connected to root)
    { source: 24, target: 25 },
    { source: 25, target: 26 },
    { source: 26, target: 27 },
    { source: 27, target: 28 },
    { source: 28, target: 29 },
    { source: 29, target: 30 },
    { source: 30, target: 36 },
    { source: 36, target: 37 },
    { source: 25, target: 31 },
    { source: 26, target: 32 },
    { source: 27, target: 33 },
    { source: 28, target: 34 },
    { source: 35, target: 24 },
    { source: 38, target: 39 }
  ]);

  // Handle graph force simulation
  useEffect(() => {
    let animationFrameId;

    const tick = () => {
      setNodes((currentNodes) => {
        return currentNodes.map((node) => {
          // Skip force simulation if dragging this node or if it's pinned
          if (node.id === draggingNodeId || node.pinned) return node;

          let vx = node.vx || 0;
          let vy = node.vy || 0;

          // 1. Repel force between all nodes
          let fx = 0;
          let fy = 0;
          currentNodes.forEach((other) => {
            if (node.id === other.id) return;
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const distSq = dx * dx + dy * dy + 0.1;
            const dist = Math.sqrt(distSq);
            if (dist < 120) {
              const repel = 300 / distSq;
              fx += (dx / dist) * repel;
              fy += (dy / dist) * repel;
            }
          });

          // 2. Link spring forces (pulling connected nodes together)
          links.current.forEach((link) => {
            const isSource = link.source === node.id;
            const isTarget = link.target === node.id;
            if (!isSource && !isTarget) return;

            const otherId = isSource ? link.target : link.source;
            const other = currentNodes.find((n) => n.id === otherId);
            if (!other) return;

            const dx = other.x - node.x;
            const dy = other.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
            const restLength = node.type === "root" || other.type === "root" ? 85 : 55;
            const k = 0.025;
            const stretch = dist - restLength;
            
            fx += (dx / dist) * stretch * k;
            fy += (dy / dist) * stretch * k;
          });

          // 3. Gravity center forces (Internal cluster pulls left, Orphan pulls right)
          let targetX = 300;
          let targetY = 180;
          
          if (node.type === "orphan") {
            targetX = 700;
            targetY = 180;
          }

          const dcx = targetX - node.x;
          const dcy = targetY - node.y;
          fx += dcx * 0.005;
          fy += dcy * 0.005;

          // Apply forces to velocity and coordinate update with damping
          vx = (vx + fx) * 0.85;
          vy = (vy + fy) * 0.85;

          // Cap speed
          const speed = Math.sqrt(vx * vx + vy * vy);
          if (speed > 8) {
            vx = (vx / speed) * 8;
            vy = (vy / speed) * 8;
          }

          let x = node.x + vx;
          let y = node.y + vy;

          // Border boundaries (stay within 1000x400 SVG box)
          const margin = 20;
          x = Math.max(margin, Math.min(1000 - margin, x));
          y = Math.max(margin, Math.min(400 - margin, y));

          return { ...node, x, y, vx, vy };
        });
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [draggingNodeId]);

  // Zooming Handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(3, prev + 0.15));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.5, prev - 0.15));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  
  const handleReleaseNodes = () => {
    // Unpin all nodes and shake them to let them settle
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        pinned: false,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8
      }))
    );
  };

  // Node Dragging pointer handlers
  const handleNodePointerDown = (e, nodeId) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    setDraggingNodeId(nodeId);
  };

  const handleSVGPointerMove = (e) => {
    if (draggingNodeId !== null) {
      const svgRect = svgRef.current.getBoundingClientRect();
      // Translate mouse coordinates to local viewBox scale (SVG viewBox="0 0 1000 400")
      // Deducting pan and dividing by zoom to align drag to current zoom state
      const localX = (e.clientX - svgRect.left) * (1000 / svgRect.width);
      const localY = (e.clientY - svgRect.top) * (400 / svgRect.height);

      const targetX = (localX - pan.x) / zoom;
      const targetY = (localY - pan.y) / zoom;

      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNodeId
            ? { ...n, x: targetX, y: targetY, vx: 0, vy: 0 }
            : n
        )
      );
    } else if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleSVGPointerDown = (e) => {
    if (draggingNodeId === null) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleSVGPointerUp = () => {
    if (draggingNodeId !== null) {
      setNodes((prev) =>
        prev.map((n) => (n.id === draggingNodeId ? { ...n, pinned: true } : n))
      );
      setDraggingNodeId(null);
    }
    setIsPanning(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          <h2 className="text-md font-bold text-slate-800 tracking-tight uppercase">
            Link Graph & Structure
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-400">Internal Pages:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-extrabold">24</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-400">Orphans:</span>
            <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-extrabold">16</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-400">Broken Links:</span>
            <span className="px-2 py-0.5 rounded bg-rose-500 text-white font-extrabold">0</span>
          </div>
        </div>
      </div>

      {/* Vertical Dashboard Content */}
      <div className="flex flex-col gap-6">
        
        {/* SECTION 1: Interactive Link Graph Explorer */}
        <div className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/50">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Interactive Link Graph Explorer
              </h3>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Drag nodes to organize, Scroll to zoom
              </span>
            </div>

            {/* Link Graph Canvas Area */}
            <div className="relative border border-slate-200/70 bg-white rounded-xl overflow-hidden shadow-inner h-[400px]">
              <svg
                ref={svgRef}
                className="w-full h-full cursor-grab active:cursor-grabbing select-none"
                viewBox="0 0 1000 400"
                onPointerDown={handleSVGPointerDown}
                onPointerMove={handleSVGPointerMove}
                onPointerUp={handleSVGPointerUp}
                onPointerLeave={handleSVGPointerUp}
              >
                {/* Faint Grid Background with ClipPath for Performance */}
                <defs>
                  <pattern
                    id="graph-grid"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                  </pattern>
                  <clipPath id="canvas-clip">
                    <rect width="1000" height="400" />
                  </clipPath>
                </defs>

                {/* Outer group clipped to viewBox size to prevent background bleeding */}
                <g clipPath="url(#canvas-clip)">
                  {/* Transform group for Zoom and Pan centered at (500, 200) */}
                  <g transform={`translate(${pan.x + 500}, ${pan.y + 200}) scale(${zoom}) translate(-500, -200)`}>
                    {/* Render a large grid rect inside the transform group so it scales and pans dynamically */}
                    <rect x="-5000" y="-5000" width="10000" height="10000" fill="url(#graph-grid)" />
                  
                  {/* Drawing Links */}
                  {links.current.map((link, idx) => {
                    const sourceNode = nodes.find((n) => n.id === link.source);
                    const targetNode = nodes.find((n) => n.id === link.target);
                    if (!sourceNode || !targetNode) return null;
                    return (
                      <line
                        key={idx}
                        x1={sourceNode.x}
                        y1={sourceNode.y}
                        x2={targetNode.x}
                        y2={targetNode.y}
                        stroke="#e2e8f0"
                        strokeWidth="1.2"
                      />
                    );
                  })}

                  {/* Drawing Nodes */}
                  {nodes.map((node) => {
                    const isRoot = node.type === "root";
                    const isOrphan = node.type === "orphan";
                    const isWeak = node.type === "weak";
                    const isBroken = node.type === "broken";

                    // Determine fill, stroke and radius
                    let fill = "fill-sky-500";
                    let stroke = "stroke-sky-600";
                    let radius = 8;

                    if (isRoot) {
                      fill = "fill-emerald-400";
                      stroke = "stroke-emerald-600";
                      radius = 16;
                    } else if (isOrphan) {
                      fill = "fill-pink-500";
                      stroke = "stroke-pink-600";
                    } else if (isWeak) {
                      fill = "fill-amber-400";
                      stroke = "stroke-amber-600";
                    } else if (isBroken) {
                      fill = "fill-rose-500";
                      stroke = "stroke-rose-600";
                    }

                    return (
                      <g key={node.id} className="group">
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={radius}
                          className={`${fill} ${stroke} stroke-[1.5] cursor-pointer hover:stroke-slate-900 transition-colors`}
                          onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                        />
                        {/* Labels for root or hovered nodes */}
                        <text
                          x={node.x}
                          y={node.y + radius + 12}
                          className={`${
                            isRoot
                              ? "text-[11px] font-bold fill-slate-800"
                              : "text-[8.5px] fill-slate-500 font-semibold group-hover:fill-slate-800 group-hover:font-bold"
                          } select-none text-center pointer-events-none transition-all`}
                          textAnchor="middle"
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                  </g>
                </g>
              </svg>

              {/* Legend overlay inside graph */}
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-x-3 gap-y-1 bg-white/95 border border-slate-100 px-3 py-1.5 rounded-lg shadow-sm text-[10px] font-bold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-600"></span>
                  <span>Root URL</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 border border-sky-600"></span>
                  <span>Internal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500 border border-pink-600"></span>
                  <span>Orphan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600"></span>
                  <span>Weak</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-600"></span>
                  <span>Broken</span>
                </div>
              </div>
            </div>
          </div>

          {/* Zoom and release action controls */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              onClick={handleZoomIn}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 shadow-sm transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              Zoom In
            </button>
            <button
              onClick={handleZoomOut}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 shadow-sm transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
              Zoom Out
            </button>
            <button
              onClick={handleResetView}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 shadow-sm transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset View
            </button>
            <button
              onClick={handleReleaseNodes}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 shadow-sm transition-colors"
            >
              <Unlock className="w-3.5 h-3.5" />
              Release Nodes
            </button>
          </div>
        </div>

        {/* SECTION 2: Linking recommendations and detections panel */}
        <div className="w-full bg-slate-50/50 border border-slate-200/60 rounded-xl p-5 flex flex-col justify-between min-h-[485px]">
          <div>
            {/* Header Tabs switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-200/50 p-1 rounded-xl mb-4">
              <button
                onClick={() => setActivePanelTab("suggestions")}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                  activePanelTab === "suggestions"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Suggestions
              </button>
              <button
                onClick={() => setActivePanelTab("detections")}
                className={`py-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                  activePanelTab === "detections"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                Detections
              </button>
            </div>

            {/* Panel main lists */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-[380px] flex flex-col overflow-hidden">
              {activePanelTab === "suggestions" ? (
                // Suggestions Panel View
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Scrollable list */}
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                    {suggestionsData.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50/40 border border-slate-200/50 hover:bg-slate-50 hover:border-slate-300/80 rounded-xl p-4 flex flex-col gap-2 transition-all duration-200 shadow-sm text-left"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 tracking-wide">
                            <span className="uppercase">Link:</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-[10px]">
                              {item.from}
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-600 font-mono font-bold text-[10px] hover:underline cursor-pointer">
                              {item.to}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-100 text-rose-600 font-extrabold text-[9px] uppercase tracking-wider">
                            {item.priority}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Anchor:</span>
                          <span className="px-2 py-0.5 border border-indigo-100 bg-indigo-50/40 text-indigo-600 text-[10px] font-mono font-bold rounded shadow-sm">
                            {item.anchor}
                          </span>
                        </div>
                        
                        <p className="text-[12px] text-slate-500 leading-relaxed font-semibold">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Detections Accordion Panel View
                <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                  {accordionSections.map((section) => {
                    const isExpanded = expandedSection === section.id;
                    const Icon = section.icon;
                    return (
                      <div key={section.id} className="border-b border-slate-100 last:border-0 pb-1">
                        {/* Header Row */}
                        <div
                          onClick={() => toggleSection(section.id)}
                          className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/50 cursor-pointer rounded-lg transition-colors select-none"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-slate-50 rounded-lg">
                              <Icon className={`w-4 h-4 ${section.iconColor}`} />
                            </div>
                            <span className="text-sm font-bold text-slate-700">
                              {section.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-4 flex items-center justify-center rounded text-[10px] font-extrabold text-white ${section.badgeColor}`}>
                              {section.count}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="px-3 py-2 bg-slate-50/40 rounded-lg border border-slate-100 mt-1 max-h-[250px] overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                            {section.data.length > 0 ? (
                              section.data.map((item, idx) => (
                                <div key={idx} className="space-y-1 text-left border-b border-slate-100/70 last:border-0 pb-2.5 last:pb-0">
                                  <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] font-semibold text-slate-500">
                                    {item.from && (
                                      <span>
                                        From <span className="text-slate-700 font-bold">{item.from}</span> to{" "}
                                      </span>
                                    )}
                                    <a
                                      href={item.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs font-bold text-sky-600 hover:underline break-all"
                                    >
                                      {item.url}
                                    </a>
                                  </div>
                                  {item.anchor && (
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[10px] font-bold text-slate-400">Anchor:</span>
                                      <span className="px-1.5 py-0.5 border border-slate-200 bg-slate-100 text-slate-600 text-[10px] font-mono rounded font-bold">
                                        {item.anchor}
                                      </span>
                                    </div>
                                  )}
                                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                                    {item.desc}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-4 text-xs font-semibold text-slate-400">
                                No issues detected. Fully optimized!
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
