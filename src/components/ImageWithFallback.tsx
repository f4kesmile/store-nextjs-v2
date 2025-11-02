// src/components/ImageWithFallback.tsx
import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function ImageWithFallback({
  src,
  alt,
  className = "",
  width = 80,
  height = 80,
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  const fallbackSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23374151' font-size='${Math.floor(
    width / 6
  )}'%3ENo Image%3C/text%3E%3C/svg%3E`;

  if (!src || hasError) {
    return <img src={fallbackSvg} alt={alt} className={className} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
