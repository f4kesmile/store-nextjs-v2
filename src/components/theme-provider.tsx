"use client";
import { useEffect } from "react";
import { useSettings } from "@/lib/hooks/use-settings";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useSettings();
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", settings.primaryColor || "#2563EB");
    root.style.setProperty("--secondary", settings.secondaryColor || "#10B981");
    root.setAttribute("data-theme", settings.theme || "light");
  }, [settings.primaryColor, settings.secondaryColor, settings.theme]);

  return <>{children}</>;
}
