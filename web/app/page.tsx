"use client";

import { useEffect, useState } from "react";
import TopBar from "@/components/TopBar";
import MovieRow from "@/components/MovieRow";
import { apiGet } from "@/lib/api-client";
import type { MovieCardData } from "@/components/MovieCard";

type Me = { id: string; name: string; username: string; isGuest: boolean };

export default function HomePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [forYou, setForYou] = useState<MovieCardData[]>([]);
  const [popular, setPopular] = useState<MovieCardData[]>([]);
  const [becauseLiked, setBecauseLiked] = useState<MovieCardData[]>([]);
  const [becauseLikedTitle, setBecauseLikedTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const meRes = await apiGet<{ user: Me | null }>("/api/me");
      setMe(meRes.user);

      const [forYouRes, popularRes, becauseRes] = await Promise.all([
        apiGet<{ recommendations: MovieCardData[] }>("/api/recommendations?type=for-you"),
        apiGet<{ recommendations: MovieCardData[] }>("/api/recommendations?type=popular"),
        apiGet<{ recommendations: MovieCardData[]; basedOnMovieId?: number }>(
          "/api/recommendations?type=because-liked"
        ),
      ]);
      setForYou(forYouRes.recommendations);
      setPopular(popularRes.recommendations);
      setBecauseLiked(becauseRes.recommendations);
      if (becauseRes.recommendations[0]?.reason) {
        const match = becauseRes.recommendations[0].reason.match(/because you liked '(.+)'/);
        setBecauseLikedTitle(match ? match[1] : null);
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
          <p className="text-muted">Loading your recommendations...</p>
        ) : (
          <>
            <MovieRow
              title="Recommended for you"
              movies={forYou}
              emptyMessage="Like or rate a few movies in Browse to get personalised picks."
            />
            <MovieRow title="Popular right now" movies={popular} />
            {becauseLiked.length > 0 && (
              <MovieRow
                title={
                  becauseLikedTitle
                    ? `Because you liked "${becauseLikedTitle}"`
                    : "Because you liked a movie"
                }
                movies={becauseLiked}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
