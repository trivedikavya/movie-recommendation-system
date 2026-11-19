"use client";

import { useState } from "react";

export default function LikeButton({
  initialLiked = false,
  onLike,
}: {
  /** Whether the user already liked this movie before this page loaded. */
  initialLiked?: boolean;
  onLike: () => void;
}) {
  const [liked, setLiked] = useState(initialLiked);

  // Keep in sync once the parent's /api/interactions fetch resolves.
  // Adjusting state directly during render (React's recommended pattern
  // for this) instead of a useEffect avoids an extra render pass.
  const [prevInitialLiked, setPrevInitialLiked] = useState(initialLiked);
  if (initialLiked !== prevInitialLiked) {
    setPrevInitialLiked(initialLiked);
    setLiked(initialLiked);
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setLiked(true);
        onLike();
      }}
      disabled={liked}
      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
        liked
          ? "bg-accent/20 text-accent cursor-default"
          : "bg-surface border border-border-color text-text hover:border-accent hover:text-accent"
      }`}
    >
      {liked ? "♥ Liked" : "♡ Like"}
    </button>
  );
}
