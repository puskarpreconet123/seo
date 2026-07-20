"use client";

import React from "react";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl text-left">
      <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
        <Settings className="w-5 h-5 text-slate-500" />
        Developer Settings & GBP Integrations
      </h2>
      <div className="mt-4 space-y-4 text-sm text-slate-600">
        <p className="leading-relaxed">
          This dashboard is set up with dummy data served from the Next.js API route{" "}
          <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono text-xs">
            /api/seo-data
          </code>
          .
        </p>
        <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-xs space-y-2">
          <span className="font-bold text-rankgenie-orange uppercase tracking-wider">How to connect your backend:</span>
          <p className="leading-relaxed">
            1. Deploy your Node/Express/Mongo backend that crawls search metrics or Google Business Profile API.
            <br />
            2. Update the fetch request in{" "}
            <code className="bg-orange-100/50 px-1 py-0.5 rounded font-mono text-[11px]">
              src/context/SeoContext.jsx
            </code>{" "}
            to fetch from your production endpoint instead of the mock API route.
            <br />
            3. Keep the JSON schema exactly as detailed in the mock API route to ensure seamless visual rendering!
          </p>
        </div>
      </div>
    </div>
  );
}
