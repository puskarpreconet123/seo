"use client";

import React, { use } from "react";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DynamicTab({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const tab = resolvedParams.tab;

  return (
    <div className="bg-white p-12 rounded-xl border border-slate-200 text-center max-w-xl mx-auto my-12 shadow-sm">
      <Sparkles className="w-12 h-12 mx-auto mb-4 text-semrush-orange animate-pulse" />
      <h3 className="font-bold text-lg text-slate-800">Feature Under Development</h3>
      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
        We are working hard to integrate this analytics intelligence module. Soon you will be able to perform live tracking and analysis here.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => router.push("/settings")}
          className="px-4 py-2 bg-semrush-orange text-white text-xs font-bold rounded-lg shadow hover:bg-semrush-orange/95 transition-colors"
        >
          Configure Keys
        </button>
      </div>
    </div>
  );
}
