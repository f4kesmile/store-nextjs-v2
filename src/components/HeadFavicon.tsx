"use client";
import { useEffect } from "react";
import { useSettings } from "@/contexts/SettingsContext";

export default function HeadFavicon() {
  const { settings } = useSettings();
  
  useEffect(() => {
    const linkId = "dynamic-favicon";
    let link = document.getElementById(linkId) as HTMLLinkElement | null;
    
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "icon";
      document.head.appendChild(link);
    }
    
    link.href = settings.faviconUrl || "/favicon.ico";
  }, [settings.faviconUrl]);
  
  return null;
}