"use client";

import { useRef } from "react";
import MovieCard, { type MovieCardData } from "./MovieCard";

export default function MovieRow({
  title,
  movies,
  emptyMessage = "Nothing to show yet.",
}: {
  title: string;
  movies: MovieCardData[];
  emptyMessage?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8); // scroll ~80% of a screen's worth of cards at a time
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  }

  return (
    <section className="mb-8">
      <h2 className="mb-3 px-1 text-lg font-semibold text-text">{title}</h2>
      {movies.length === 0 ? (
        <p className="px-1 text-sm text-muted">{emptyMessage}</p>
      ) : (
        <div className="group/row relative">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border-color bg-background/80 p-2 text-text opacity-0 shadow-lg backdrop-blur transition-opacity hover:border-accent hover:text-accent group-hover/row:opacity-100"
          >
            ←
          </button>

          <div ref={scrollRef} className="scroll-row px-1">
            {movies.map((m) => (
              <MovieCard key={m.movieId} movie={m} />
            ))}
          </div>

          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border-color bg-background/80 p-2 text-text opacity-0 shadow-lg backdrop-blur transition-opacity hover:border-accent hover:text-accent group-hover/row:opacity-100"
          >
            →
          </button>
        </div>
      )}
    </section>
  );
}
