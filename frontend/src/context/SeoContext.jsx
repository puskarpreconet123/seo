"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const SeoContext = createContext(null);

export function SeoProvider({ children }) {
  const [currentDomain, setCurrentDomain] = useState("example.com");
  const [seoData, setSeoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [triggerRefresh, setTriggerRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    fetch(`http://127.0.0.1:5000/api/seo-data?domain=${encodeURIComponent(currentDomain)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard intelligence data");
        }
        return res.json();
      })
      .then((data) => {
        if (active) {
          setSeoData(data);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setError(err.message || "An unexpected error occurred");
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [currentDomain, triggerRefresh]);

  const handleSearch = (newDomain) => {
    setIsLoading(true);
    setError(null);
    setCurrentDomain(newDomain);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
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
