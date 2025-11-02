"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn("text-center space-y-6 py-16", className)}>
      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-400">
        {icon}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        {description && (
          <p className="text-gray-600 max-w-md mx-auto">{description}</p>
        )}
      </div>
      
      {action && (
        <div>
          {action.href ? (
            <Button asChild className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90">
              <a href={action.href}>{action.label}</a>
            </Button>
          ) : (
            <Button 
              onClick={action.onClick}
              className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90"
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}