"use client";

import { useState } from "react";

export default function RatingStars({
  value = 0,
  onRate,
  size = "sm",
}: {
  /** The user's currently saved rating for this movie (0 = not rated yet). */
  value?: number;
  onRate: (value: number) => void;
  size?: "sm" | "md";
}) {
  // Local copy of the saved rating, so clicking a star updates the display
  // immediately without waiting for a page refetch.
  const [rating, setRating] = useState(value);
  const [hovered, setHovered] = useState<number | null>(null);

  // Keep in sync if the parent later loads the real saved value (e.g. after
  // the initial /api/interactions fetch resolves on page load). Adjusting
  // state directly during render (React's recommended pattern for this,
  // instead of a useEffect) avoids an extra render pass.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setRating(value);
  }

  const starSize = size === "sm" ? "text-base" : "text-xl";
  // While hovering, preview the hovered value; otherwise show the saved rating.
  const displayValue = hovered ?? rating;

  return (
    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
      {[1, 2, 3, 4, 5].map((v) => {
        const filled = v <= displayValue;
        return (
          <button
            key={v}
            type="button"
            aria-label={`Rate ${v} stars`}
            className={`${starSize} leading-none transition-colors ${
              filled ? "text-accent" : "text-muted hover:text-accent-hover"
            }`}
            onMouseEnter={() => setHovered(v)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => {
              setRating(v);
              onRate(v);
            }}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
