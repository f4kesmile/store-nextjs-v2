// src/hooks/useResellerRef.ts
"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const KEY = "resellerRef";

export function useResellerRef() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const urlRef = params.get("ref");

  // Read from storage when url not present
  const storedRef = useMemo(() => {
    if (typeof window === "undefined") return null;
    try { return localStorage.getItem(KEY); } catch { return null; }
  }, [pathname]);

  // Persist url ref into storage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (urlRef) {
      try { localStorage.setItem(KEY, urlRef); document.cookie = `${KEY}=${urlRef}; path=/; max-age=2592000`; } catch {}
    }
  }, [urlRef]);

  // Ensure URL always has ref when stored exists
  useEffect(() => {
    if (!urlRef && storedRef) {
      const qs = new URLSearchParams(Array.from(params.entries()));
      qs.set("ref", storedRef);
      router.replace(`${pathname}?${qs.toString()}`);
    }
  }, [storedRef, urlRef, params, pathname, router]);

  const clearRef = () => {
    try { localStorage.removeItem(KEY); document.cookie = `${KEY}=; Max-Age=0; path=/`; } catch {}
  };

  return { resellerRef: urlRef || storedRef, clearRef } as const;
}
