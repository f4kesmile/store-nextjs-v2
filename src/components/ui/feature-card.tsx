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
  action?: ReactNode;
}

export function FeatureCard({
  icon,
  title,
  description,
  className,
  variant = "default",
  action
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        "p-6",
        variant === "gradient" && "bg-gradient-to-br from-primary/5 to-secondary/5",
        className
      )}
    >
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {icon}
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-600">{description}</p>
        {action && <div className="pt-2">{action}</div>}
      </CardContent>
    </Card>
  );
}
