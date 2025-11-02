"use client";

import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
  variant?: "default" | "gradient";
}

export function FeatureCard({ 
  icon, 
  title, 
  description, 
  className,
  variant = "default"
}: FeatureCardProps) {
  return (
    <Card className={cn(
      "group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0",
      variant === "gradient" 
        ? "bg-gradient-to-br from-white to-gray-50/50 shadow-lg" 
        : "bg-white/80 backdrop-blur-sm shadow-md",
      className
    )}>
      <CardContent className="p-8 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 grid place-items-center group-hover:scale-110 transition-transform duration-300">
          <div className="text-2xl">{icon}</div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}