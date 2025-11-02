"use client";

import { ReactNode } from "react";
import { useSettings } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  actions?: ReactNode;
  backgroundImage?: string;
  className?: string;
  variant?: "default" | "gradient" | "minimal";
}

export function HeroSection({
  title,
  subtitle,
  description,
  actions,
  backgroundImage,
  className,
  variant = "gradient"
}: HeroSectionProps) {
  const { settings } = useSettings();

  const getBackgroundStyle = () => {
    if (backgroundImage) {
      return {
        backgroundImage: `linear-gradient(135deg, ${settings.primaryColor}CC, ${settings.secondaryColor}CC), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      };
    }

    switch (variant) {
      case "gradient":
        return {
          background: `linear-gradient(135deg, 
            color-mix(in srgb, ${settings.primaryColor} 8%, white), 
            color-mix(in srgb, ${settings.secondaryColor} 12%, white)
          )`
        };
      case "minimal":
        return {
          backgroundColor: "white"
        };
      default:
        return {
          background: `linear-gradient(135deg, 
            ${settings.primaryColor}15, 
            ${settings.secondaryColor}20
          )`
        };
    }
  };

  return (
    <section 
      className={cn(
        "relative py-24 px-4",
        variant === "minimal" ? "" : "min-h-[60vh] flex items-center",
        className
      )}
      style={getBackgroundStyle()}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10"
          style={{ backgroundColor: settings.primaryColor }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: settings.secondaryColor }}
        />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {subtitle && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/20 text-sm font-medium">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: settings.primaryColor }}
              />
              {subtitle}
            </div>
          )}
          
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>
            
            {description && (
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {description}
              </p>
            )}
          </div>
          
          {actions && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}