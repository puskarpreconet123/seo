"use client";

import React from "react";
import ImageSeoAnalysis from "@/components/ImageSeoAnalysis";
import { ImageIcon } from "lucide-react";

export default function ImageSeoPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="text-left">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-indigo-500" />
            Image SEO
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Optimize website images, alt attributes, compress files and reduce layout shifts
          </p>
        </div>
      </div>
      
      <ImageSeoAnalysis />
    </div>
  );
}
