"use client";

import Link from "next/link";
import { apiPost } from "@/lib/api-client";
import LikeButton from "./LikeButton";
import RatingStars from "./RatingStars";
import MoviePoster from "./MoviePoster";

export type MovieCardData = {
  movieId: number;
  title: string;
  year: number | null;
  genres: string[];
  reason?: string;
  /** Whether the current user already liked this movie (so the button
   * shows "Liked" immediately instead of resetting to blank). */
  userLiked?: boolean;
  /** The current user's saved rating for this movie, if any (0 = none). */
  userRating?: number;
};

export default function MovieCard({ movie }: { movie: MovieCardData }) {
  async function handleLike() {
    await apiPost("/api/interactions", { movieId: movie.movieId, action: "like" });
  }

  async function handleRate(value: number) {
    await apiPost("/api/interactions", {
      movieId: movie.movieId,
      action: "rating",
      ratingValue: value,
    });
  }

  return (
    <div className="group w-44 shrink-0">
      <Link href={`/movie/${movie.movieId}`} className="block">
        <div className="relative h-64 w-44 overflow-hidden rounded-xl border border-border-color shadow-lg transition-transform duration-200 group-hover:scale-105 group-hover:shadow-accent/20">
          <MoviePoster movieId={movie.movieId} title={movie.title} className="h-full w-full" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
            <p className="truncate text-xs font-medium text-text">{movie.title}</p>
            <p className="text-[11px] text-muted">{movie.year ?? "—"}</p>
          </div>
        </div>
      </Link>

      {movie.reason && (
        <p className="mt-1 truncate text-[11px] italic text-muted" title={movie.reason}>
          {movie.reason}
        </p>
      )}

      <div className="mt-1.5 flex items-center justify-between gap-1">
        <LikeButton initialLiked={movie.userLiked} onLike={handleLike} />
        <RatingStars value={movie.userRating} onRate={handleRate} />
      </div>
    </div>
  );
}
