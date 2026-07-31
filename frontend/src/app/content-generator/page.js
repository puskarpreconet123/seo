"use client";

import React, { Suspense } from "react";
import ContentGeneratorStudio from "@/components/content-seo/ContentGeneratorStudio";

export default function ContentGeneratorPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-sm text-slate-500 font-bold">Loading Blog Studio...</p>
      </div>
    }>
      <ContentGeneratorStudio />
    </Suspense>
  );
}
