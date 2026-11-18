"use client";

import { useState } from "react";

export default function RatingStars({
  onRate,
  size = "sm",
}: {
  onRate: (value: number) => void;
  size?: "sm" | "md";
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const starSize = size === "sm" ? "text-base" : "text-xl";

  return (
    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = hovered !== null && value <= hovered;
        return (
          <button
            key={value}
            type="button"
            aria-label={`Rate ${value} stars`}
            className={`${starSize} leading-none transition-colors ${
              filled ? "text-accent" : "text-muted hover:text-accent-hover"
            }`}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onRate(value)}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
