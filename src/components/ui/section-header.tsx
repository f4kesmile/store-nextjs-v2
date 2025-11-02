"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  centered?: boolean;
}

export function SectionHeader({ 
  title, 
  description, 
  icon, 
  className, 
  centered = false 
}: SectionHeaderProps) {
  return (
    <div className={cn(
      "space-y-4",
      centered && "text-center",
      className
    )}>
      <div className={cn(
        "flex items-center gap-3",
        centered && "justify-center"
      )}>
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary grid place-items-center text-white shadow-lg">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
      </div>
      {description && (
        <p className="text-xl text-muted-foreground max-w-3xl">
          {description}
        </p>
      )}
    </div>
  );
}