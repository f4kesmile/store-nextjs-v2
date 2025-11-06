import React from 'react';
import { SiteNavbar } from '@/components/site-navbar';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <SiteNavbar />
      <main className={className}>
        {children}
      </main>
    </div>
  );
}