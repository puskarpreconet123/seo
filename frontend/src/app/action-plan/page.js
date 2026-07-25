"use client";

import React from "react";
import SeoPriorityActionPlan from "@/components/audit/SeoPriorityActionPlan";
import ConsolidatedSeoChecklist from "@/components/audit/ConsolidatedSeoChecklist";
import { CheckSquare } from "lucide-react";

export default function ActionPlanPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-800">Personalized SEO Action Plan</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized task roadmap classified into Today, This Week, This Month, Quick Wins, and High Impact.
          </p>
        </div>
      </div>

      <SeoPriorityActionPlan />
      <ConsolidatedSeoChecklist />
    </div>
  );
}
