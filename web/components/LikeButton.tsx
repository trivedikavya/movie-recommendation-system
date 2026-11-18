"use client";

import { useState } from "react";

export default function LikeButton({ onLike }: { onLike: () => void }) {
  const [liked, setLiked] = useState(false);

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
