"use client";

import { useEffect, useState } from "react";

export type StoreSettings = {
  storeName: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  theme: "light" | "dark";
  locale?: string;
};

const defaults: StoreSettings = {
  storeName: "",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "#2563EB",
  secondaryColor: "#10B981",
  theme: "light",
  locale: "id",
};

export function useSettings() {
  const [settings, setSettings] = useState<StoreSettings>(defaults);

  useEffect(() => {
    let mounted = true;
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setSettings({ ...defaults, ...data });
      })
      .catch(() => setSettings(defaults));
    return () => {
      mounted = false;
    };
  }, []);

  return settings;
}
