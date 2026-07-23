"use client";

import React from "react";
import { useSeo } from "@/context/SeoContext";
import SeoDashboard from "@/components/dashboard/SeoDashboard";

export default function DashboardPage() {
  const { seoData, currentDomain } = useSeo();

  return (
    <SeoDashboard
      seoData={seoData}
      currentDomain={currentDomain}
    />
  );
}
