"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IconWrapperProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "brand" | "contrast" | "muted";
  className?: string;
}

export function IconWrapper({ 
  children, 
  size = "md", 
  variant = "default", 
  className 
}: IconWrapperProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  
  const variantClasses = {
    default: "text-current",
    brand: "text-brand-primary",
    contrast: "text-gray-700",
    muted: "text-gray-500"
  };
  
  return (
    <span className={cn(
      "inline-flex items-center justify-center flex-shrink-0",
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
}