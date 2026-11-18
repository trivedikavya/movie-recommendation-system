"use client";

import { useState } from "react";
import { gradientForMovie } from "@/lib/poster-gradient";

/**
 * Shows a manually-provided poster image if one exists at
 * public/posters/<movieId>.jpg or .png, otherwise falls back to a
 * deterministic dark gradient card with the title text. Tries .jpg first,
 * then .png, then gives up and shows the gradient -- no server-side file
 * check needed, so dropping a new image into public/posters/ just works
 * on the next page load with no code changes.
 */
export default function MoviePoster({
  movieId,
  title,
  className = "",
}: {
  movieId: number;
  title: string;
  className?: string;
}) {
  const [stage, setStage] = useState<"jpg" | "png" | "none">("jpg");

  if (stage === "none") {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br p-4 text-center ${gradientForMovie(
          movieId
        )} ${className}`}
      >
        <span className="text-sm font-semibold text-text/90">{title}</span>
      </div>
    );
  }

  // Plain <img> (not next/image) is intentional: these are local,
  // user-supplied files of unknown/varying dimensions that we probe for
  // existence at runtime via onError, which doesn't fit next/image's
  // optimization pipeline well.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/posters/${movieId}.${stage}`}
      alt={title}
      className={`object-cover ${className}`}
      onError={() => setStage(stage === "jpg" ? "png" : "none")}
    />
  );
}
