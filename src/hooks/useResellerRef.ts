// src/hooks/useResellerRef.ts
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const KEY = "resellerRef";

export function useResellerRef() {
  const params = useSearchParams();
  const urlRef = params.get("ref");
  const [storedRef, setStoredRef] = useState<string | null>(null);

  // Load from storage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(KEY);
      setStoredRef(stored);
    } catch {
      setStoredRef(null);
    }
  }, []);

  // Save URL ref to storage when present
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (urlRef && urlRef !== storedRef) {
      try {
        localStorage.setItem(KEY, urlRef);
        setStoredRef(urlRef);
        document.cookie = `${KEY}=${urlRef}; path=/; max-age=2592000`;
      } catch {}
    }
  }, [urlRef, storedRef]);

  const clearRef = () => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(KEY);
      setStoredRef(null);
      document.cookie = `${KEY}=; Max-Age=0; path=/`;
    } catch {}
  };

  // Return current ref (URL takes priority over stored)
  const currentRef = urlRef || storedRef;

  return { resellerRef: currentRef, clearRef } as const;
}