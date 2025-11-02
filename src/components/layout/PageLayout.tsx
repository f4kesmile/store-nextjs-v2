"use client";

import { ReactNode } from "react";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useSettings } from "@/contexts/SettingsContext";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  showNavbar?: boolean;
  showFooter?: boolean;
}

export function PageLayout({ 
  children, 
  className, 
  showNavbar = true, 
  showFooter = true 
}: PageLayoutProps) {
  const { settings, loading } = useSettings();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin brand-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <SiteNavbar />}
      
      <main className={cn("flex-1", className)}>
        {children}
      </main>
      
      {showFooter && <SiteFooter />}
    </div>
  );
}