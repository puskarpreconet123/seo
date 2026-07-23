"use client";

import React from "react";
import { useSeo } from "@/context/SeoContext";
import HomeDashboard from "@/components/home/HomeDashboard";

export default function Home() {
  const { seoData, currentDomain } = useSeo();

  return (
    <HomeDashboard
      seoData={seoData}
      currentDomain={currentDomain}
    />
  );
}
