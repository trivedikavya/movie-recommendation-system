"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import GenreChip from "@/components/GenreChip";
import MovieCard, { type MovieCardData } from "@/components/MovieCard";
import { apiGet } from "@/lib/api-client";
import { useInteractionState, withInteractionState } from "@/lib/use-interaction-state";

type Me = { id: string; name: string; username: string };
type Movie = { id: number; title: string; year: number | null; genres: string[] };

export default function BrowsePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [genres, setGenres] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const interactionState = useInteractionState();

  useEffect(() => {
    apiGet<{ user: Me }>("/api/me").then((res) => setMe(res.user));
    apiGet<{ genres: string[] }>("/api/genres").then((res) => setGenres(res.genres));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (genreFilter) params.set("genre", genreFilter);
    const timeout = setTimeout(() => {
      apiGet<{ movies: Movie[] }>(`/api/movies/search?${params.toString()}`).then((res) =>
        setMovies(res.movies)
      );
    }, 200); // small debounce so we don't fire a request on every keystroke
    return () => clearTimeout(timeout);
  }, [query, genreFilter]);

  if (!me) return null;

  const cards: MovieCardData[] = withInteractionState(
    movies.map((m) => ({
      movieId: m.id,
      title: m.title,
      year: m.year,
      genres: m.genres,
    })),
    interactionState
  );

  return (
    <div className="min-h-screen bg-background">
      <TopBar username={me.username} name={me.name} />
      <main className="px-4 py-6 sm:px-8">
        <h1 className="mb-4 text-xl font-bold text-text">Browse movies</h1>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title..."
          className="mb-4 w-full max-w-md rounded-lg border border-border-color bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent"
        />

        <div className="mb-6 flex flex-wrap gap-2">
          <GenreChip
            label="All"
            active={genreFilter === null}
            onClick={() => setGenreFilter(null)}
          />
          {genres.map((g) => (
            <GenreChip
              key={g}
              label={g}
              active={genreFilter === g}
              onClick={() => setGenreFilter(genreFilter === g ? null : g)}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          {cards.map((m) => (
            <MovieCard key={m.movieId} movie={m} />
          ))}
        </div>
        {cards.length === 0 && (
          <p className="text-sm text-muted">No movies match your search.</p>
        )}
      </main>
    </div>
  );
}
