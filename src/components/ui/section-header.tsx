import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  icon,
  centered = false,
  className
}: SectionHeaderProps) {
  return (
    <div className={cn(
      "relative z-10", // Always above overlays
      centered ? "text-center" : "text-left",
      className
    )}>
      {icon && (
        <div className={cn(
          "flex items-center gap-3 mb-3",
          centered && "justify-center"
        )}>
          <span className="text-gray-900">{icon}</span>
        </div>
      )}
      
      <h2 className={cn(
        "section-title text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4",
        centered && "mx-auto"
      )}>
        {title}
      </h2>
      
      {description && (
        <p className={cn(
          "section-desc text-lg sm:text-xl text-gray-600 max-w-3xl leading-relaxed",
          centered && "mx-auto"
        )}>
          {description}
        </p>
      )}
    </div>
  );
}