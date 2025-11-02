"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type StoreSettings = {
  storeName: string;
  storeDescription?: string;
  supportWhatsApp?: string;
  supportEmail?: string;
  storeLocation?: string;
  businessAddress?: string; // added to match ContactPage usage
  aboutTitle?: string;
  aboutDescription?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  theme: "light" | "dark";
  locale: string;
};

const defaultSettings: StoreSettings = {
  storeName: "Store Saya",
  storeDescription: "Toko online modern dengan sistem manajemen lengkap",
  supportWhatsApp: "",
  supportEmail: "",
  storeLocation: "",
  businessAddress: "", // default empty
  aboutTitle: "",
  aboutDescription: "",
  logoUrl: "",
  faviconUrl: "",
  primaryColor: "#2563EB",
  secondaryColor: "#10B981",
  theme: "light",
  locale: "id",
};

type Ctx = {
  settings: StoreSettings;
  loading: boolean;
  refresh: () => Promise<void>;
  setSettingsLocal: (s: Partial<StoreSettings>) => void;
};

const SettingsCtx = createContext<Ctx | null>(null);

// cache sederhana di client agar pindah halaman tidak selalu fetch
let cachedSettings: StoreSettings | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function SettingsProvider({ children, initial }: { children: ReactNode; initial?: StoreSettings | null }) {
  const [settings, setSettings] = useState<StoreSettings>(initial || cachedSettings || defaultSettings);
  const [loading, setLoading] = useState<boolean>(!initial && (!cachedSettings || Date.now() - cacheTime > CACHE_DURATION));

  useEffect(() => {
    if (initial) {
      cachedSettings = initial;
      cacheTime = Date.now();
      setLoading(false);
      return;
    }
    
    if (cachedSettings && Date.now() - cacheTime < CACHE_DURATION) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }
    
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/settings", { cache: "no-store" });
        const data = (await res.json()) as StoreSettings;
        if (!abort) {
          cachedSettings = data;
          cacheTime = Date.now();
          setSettings({ ...defaultSettings, ...data });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    
    return () => {
      abort = true;
    };
  }, [initial]);

  const refresh = async () => {
    const res = await fetch("/api/settings", { cache: "no-store" });
    const data = (await res.json()) as StoreSettings;
    cachedSettings = data;
    cacheTime = Date.now();
    setSettings({ ...defaultSettings, ...data });
  };

  const setSettingsLocal = (s: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...s };
      cachedSettings = next;
      cacheTime = Date.now();
      return next;
    });
  };

  return (
    <SettingsCtx.Provider value={{ settings, loading, refresh, setSettingsLocal }}>
      <ThemeVariables settings={settings} />
      {children}
    </SettingsCtx.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsCtx);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

// Inject CSS variable untuk warna
function ThemeVariables({ settings }: { settings: StoreSettings }) {
  return (
    <style
      id="settings-theme-vars"
      dangerouslySetInnerHTML={{
        __html: `
        :root {
          --brand-primary: ${settings.primaryColor};
          --brand-secondary: ${settings.secondaryColor};
        }
        .brand-primary { color: var(--brand-primary) !important; }
        .bg-brand-primary { background: var(--brand-primary) !important; }
        .border-brand-primary { border-color: var(--brand-primary) !important; }
        .bg-brand-soft { background: color-mix(in srgb, var(--brand-primary) 10%, white) !important; }
      `,
      }}
    />
  );
}
