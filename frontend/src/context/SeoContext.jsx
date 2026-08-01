"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const SeoContext = createContext(null);

export function SeoProvider({ children }) {
  const [currentDomain, setCurrentDomain] = useState("example.com");
  const [seoData, setSeoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [triggerRefresh, setTriggerRefresh] = useState(0);
  const [forceNext, setForceNext] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
    const forceParam = forceNext ? "&force=true" : "";

    fetch(`${API_BASE_URL}/api/seo-data?domain=${encodeURIComponent(currentDomain)}${forceParam}`)
      .then(async (res) => {
        if (!res.ok) {
          let msg = "Failed to fetch dashboard intelligence data";
          try {
            const data = await res.json();
            if (data && data.error) msg = data.error;
          } catch (e) {}
          throw new Error(msg);
        }
        return res.json();
      })
      .then((data) => {
        if (active) {
          setSeoData(data);
          setError(null);
          setIsLoading(false);
          setForceNext(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setError(err.message || "An unexpected error occurred");
          setIsLoading(false);
          setForceNext(false);
        }
      });

    return () => {
      active = false;
    };
  }, [currentDomain, triggerRefresh]);

  // Set up background polling if an audit/check is currently running in the background
  useEffect(() => {
    const isChecking = seoData?.website?.fullAudit?.robots_sitemap_report?.sitemap_report?.is_checking;
    if (!isChecking || isLoading) return;

    const pollInterval = setInterval(() => {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
      fetch(`${API_BASE_URL}/api/seo-data?domain=${encodeURIComponent(currentDomain)}`)
        .then((res) => {
          if (res.ok) return res.json();
        })
        .then((data) => {
          if (data) {
            // Verify if is_checking status has changed or resolved
            const stillChecking = data?.website?.fullAudit?.robots_sitemap_report?.sitemap_report?.is_checking;
            setSeoData(data);
            if (!stillChecking) {
              clearInterval(pollInterval);
            }
          }
        })
        .catch((err) => console.error("Polling background updates error:", err));
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [seoData, currentDomain, isLoading]);

  const handleSearch = (newDomain) => {
    let clean = newDomain.trim().toLowerCase();
    if (clean.includes("://")) {
      try { clean = new URL(clean).hostname; } catch (e) {}
    }
    clean = clean.replace(/^www\./, "").split("/")[0];

    setIsLoading(true);
    setError(null);
    if (clean === currentDomain) {
      setForceNext(true);
      setTriggerRefresh((prev) => prev + 1);
    } else {
      setCurrentDomain(clean);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    setForceNext(true);
    setTriggerRefresh((prev) => prev + 1);
  };

  return (
    <SeoContext.Provider
      value={{
        currentDomain,
        setCurrentDomain,
        seoData,
        isLoading,
        error,
        handleSearch,
        handleRefresh
      }}
    >
      {children}
    </SeoContext.Provider>
  );
}

export function useSeo() {
  const context = useContext(SeoContext);
  if (!context) {
    throw new Error("useSeo must be used within an SeoProvider");
  }
  return context;
}
