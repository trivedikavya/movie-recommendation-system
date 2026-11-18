"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import TopBar from "@/components/TopBar";
import GenreChip from "@/components/GenreChip";
import { apiGet } from "@/lib/api-client";

type Me = { id: string; name: string; username: string; favoriteGenres: string[] };
type InteractionRow = {
  id: string;
  movieId: number;
  title: string;
  genres: string[];
  action: "click" | "like" | "rating";
  weight: number;
  createdAt: string;
};

const ACTION_LABEL: Record<InteractionRow["action"], string> = {
  click: "Viewed",
  like: "Liked",
  rating: "Rated",
};

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [interactions, setInteractions] = useState<InteractionRow[]>([]);

  useEffect(() => {
    apiGet<{ user: Me }>("/api/me").then((res) => setMe(res.user));
    apiGet<{ interactions: InteractionRow[] }>("/api/interactions").then((res) =>
      setInteractions(res.interactions)
    );
  }, []);

  const topGenres = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of interactions) {
      for (const g of i.genres) {
        counts.set(g, (counts.get(g) ?? 0) + i.weight);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([g]) => g);
  }, [interactions]);

  const likedMovies = interactions.filter((i) => i.action === "like");
  const ratedMovies = interactions.filter((i) => i.action === "rating");

  if (!me) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopBar username={me.username} name={me.name} />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-8">
        <h1 className="mb-1 text-xl font-bold text-text">{me.name}</h1>
        <p className="mb-6 text-sm text-muted">@{me.username}</p>

        <section className="mb-8">
          <h2 className="mb-2 text-sm font-semibold text-muted">Your taste profile</h2>
          <div className="flex flex-wrap gap-2">
            {topGenres.length > 0 ? (
              topGenres.map((g) => <GenreChip key={g} label={g} />)
            ) : me.favoriteGenres.length > 0 ? (
              me.favoriteGenres.map((g) => <GenreChip key={g} label={g} />)
            ) : (
              <p className="text-sm text-muted">
                No interactions yet.{" "}
                <Link href="/browse" className="text-accent hover:text-accent-hover">
                  Browse movies
                </Link>{" "}
                to build your profile.
              </p>
            )}
          </div>
        </section>

        <section className="mb-8 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-border-color bg-surface p-4">
            <p className="text-2xl font-bold text-text">{likedMovies.length}</p>
            <p className="text-xs text-muted">Liked</p>
          </div>
          <div className="rounded-xl border border-border-color bg-surface p-4">
            <p className="text-2xl font-bold text-text">{ratedMovies.length}</p>
            <p className="text-xs text-muted">Rated</p>
          </div>
          <div className="rounded-xl border border-border-color bg-surface p-4">
            <p className="text-2xl font-bold text-text">{interactions.length}</p>
            <p className="text-xs text-muted">Total interactions</p>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted">Recent activity</h2>
          <ul className="divide-y divide-border-color rounded-xl border border-border-color bg-surface">
            {interactions.slice(0, 25).map((i) => (
              <li key={i.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <Link href={`/movie/${i.movieId}`} className="truncate text-text hover:text-accent">
                  {i.title}
                </Link>
                <span className="shrink-0 text-xs text-muted">
                  {ACTION_LABEL[i.action]}
                  {i.action === "rating" ? ` ${i.weight}★` : ""}
                </span>
              </li>
            ))}
            {interactions.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted">No activity yet.</li>
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}
