"use client";

import React from "react";
import LinkStructure from "@/components/LinkStructure";
import { Globe } from "lucide-react";

export default function LinkStructurePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="text-left">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-500" />
            Link Structure
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Visualize site architecture and connections between core and orphan pages.
          </p>
        </div>
      </div>
      
      <LinkStructure />
    </div>
  );
}
