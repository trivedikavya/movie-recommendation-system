"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import MovieRow from "@/components/MovieRow";
import { apiGet } from "@/lib/api-client";
import type { MovieCardData } from "@/components/MovieCard";
import { useInteractionState, withInteractionState } from "@/lib/use-interaction-state";

type Me = {
  id: string;
  name: string;
  username: string;
  isGuest: boolean;
  favoriteGenres: string[];
};

type RecMode = "cold-start" | "personalized";

// Shown as genre-browsing rows for guests / users with no onboarding
// genres -- the two largest genres in the dataset (Phase A1 of the
// notebook), so they're guaranteed to always have plenty of movies.
const DEFAULT_GENRES = ["Drama", "Comedy"];
const MAX_GENRE_ROWS = 4;

export default function HomePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [mode, setMode] = useState<RecMode | null>(null);
  const [forYou, setForYou] = useState<MovieCardData[]>([]);
  const [popular, setPopular] = useState<MovieCardData[]>([]);
  const [genreRows, setGenreRows] = useState<{ genre: string; movies: MovieCardData[] }[]>([]);
  const [becauseLiked, setBecauseLiked] = useState<MovieCardData[]>([]);
  const [becauseLikedTitle, setBecauseLikedTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const interactionState = useInteractionState();

  useEffect(() => {
    async function load() {
      const meRes = await apiGet<{ user: Me | null }>("/api/me");
      setMe(meRes.user);

      const [forYouRes, popularRes] = await Promise.all([
        apiGet<{ mode: RecMode; recommendations: MovieCardData[] }>(
          "/api/recommendations?type=for-you"
        ),
        apiGet<{ recommendations: MovieCardData[] }>("/api/recommendations?type=popular"),
      ]);
      setMode(forYouRes.mode);
      setPopular(popularRes.recommendations);

      if (forYouRes.mode === "personalized") {
        // Real behaviour exists -- show the personalised rows.
        setForYou(forYouRes.recommendations);
        const becauseRes = await apiGet<{
          recommendations: MovieCardData[];
          basedOnMovieId?: number;
        }>("/api/recommendations?type=because-liked");
        setBecauseLiked(becauseRes.recommendations);
        if (becauseRes.recommendations[0]?.reason) {
          const match = becauseRes.recommendations[0].reason.match(/because you liked '(.+)'/);
          setBecauseLikedTitle(match ? match[1] : null);
        }
      } else {
        // Brand-new user: nothing has actually been "recommended" yet, so
        // show honest genre-browsing rows instead of a misleading
        // "Recommended for you" label.
        const genres = (
          meRes.user?.favoriteGenres.length ? meRes.user.favoriteGenres : DEFAULT_GENRES
        ).slice(0, MAX_GENRE_ROWS);

        const genreResults = await Promise.all(
          genres.map((g) =>
            apiGet<{ recommendations: MovieCardData[] }>(
              `/api/recommendations?type=genre&genre=${encodeURIComponent(g)}`
            )
          )
        );
        setGenreRows(genres.map((genre, i) => ({ genre, movies: genreResults[i].recommendations })));
      }

      setLoading(false);
    }
    load();
  }, []);

  if (!me) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted">Loading...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar username={me.username} name={me.name} />
      <main className="px-4 py-6 sm:px-8">
        {loading ? (
          <p className="text-muted">Loading recommendations...</p>
        ) : mode === "personalized" ? (
          <>
            <MovieRow
              title="Recommended for you"
              movies={withInteractionState(forYou, interactionState)}
              emptyMessage="Like or rate a few movies in Browse to get personalised picks."
            />
            <MovieRow
              title="Popular right now"
              movies={withInteractionState(popular, interactionState)}
            />
            {becauseLiked.length > 0 && (
              <MovieRow
                title={
                  becauseLikedTitle
                    ? `Because you liked "${becauseLikedTitle}"`
                    : "Because you liked a movie"
                }
                movies={withInteractionState(becauseLiked, interactionState)}
              />
            )}
          </>
        ) : (
          <>
            <MovieRow
              title="Popular right now"
              movies={withInteractionState(popular, interactionState)}
            />
            {genreRows.map(({ genre, movies }) => (
              <MovieRow
                key={genre}
                title={genre}
                movies={withInteractionState(movies, interactionState)}
              />
            ))}
          </>
        )}
      </main>
    </div>
  );
}
