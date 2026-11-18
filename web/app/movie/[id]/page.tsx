"use client";

import { useEffect, useState, use } from "react";
import TopBar from "@/components/TopBar";
import GenreChip from "@/components/GenreChip";
import LikeButton from "@/components/LikeButton";
import RatingStars from "@/components/RatingStars";
import MovieRow from "@/components/MovieRow";
import MoviePoster from "@/components/MoviePoster";
import { apiGet, apiPost } from "@/lib/api-client";
import type { MovieCardData } from "@/components/MovieCard";

type Me = { id: string; name: string; username: string };
type Movie = { id: number; title: string; year: number | null; genres: string[] };

export default function MovieDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [me, setMe] = useState<Me | null>(null);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);

  useEffect(() => {
    apiGet<{ user: Me }>("/api/me").then((res) => setMe(res.user));
    apiGet<{ movie: Movie; similarMovies: Movie[] }>(`/api/movies/${id}`).then((res) => {
      setMovie(res.movie);
      setSimilar(res.similarMovies);
    });
  }, [id]);

  if (!me || !movie) return null;

  async function handleLike() {
    await apiPost("/api/interactions", { movieId: movie!.id, action: "like" });
  }
  async function handleRate(value: number) {
    await apiPost("/api/interactions", {
      movieId: movie!.id,
      action: "rating",
      ratingValue: value,
    });
  }

  const similarCards: MovieCardData[] = similar.map((m) => ({
    movieId: m.id,
    title: m.title,
    year: m.year,
    genres: m.genres,
  }));

  return (
    <div className="min-h-screen bg-background">
      <TopBar username={me.username} name={me.name} />
      <main className="px-4 py-6 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="h-80 w-full shrink-0 overflow-hidden rounded-xl border border-border-color shadow-lg sm:w-56">
            <MoviePoster movieId={movie.id} title={movie.title} className="h-full w-full" />
          </div>

          <div className="flex-1">
            <h1 className="mb-1 text-2xl font-bold text-text">{movie.title}</h1>
            <p className="mb-3 text-sm text-muted">{movie.year ?? "Year unknown"}</p>
            <div className="mb-5 flex flex-wrap gap-2">
              {movie.genres.map((g) => (
                <GenreChip key={g} label={g} />
              ))}
            </div>
            <div className="flex items-center gap-4">
              <LikeButton onLike={handleLike} />
              <RatingStars onRate={handleRate} size="md" />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <MovieRow title="Similar movies" movies={similarCards} />
        </div>
      </main>
    </div>
  );
}
