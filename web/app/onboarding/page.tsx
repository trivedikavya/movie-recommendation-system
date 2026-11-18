"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api-client";
import GenreChip from "@/components/GenreChip";

export default function OnboardingPage() {
  const router = useRouter();
  const [genres, setGenres] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiGet<{ genres: string[] }>("/api/genres").then((res) => setGenres(res.genres));
  }, []);

  function toggle(genre: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
  }

  async function handleContinue() {
    if (selected.size < 3) {
      setError("Please pick at least 3 genres.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await apiPost("/api/onboarding", { favoriteGenres: [...selected] });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border-color bg-surface p-8 shadow-xl">
        <h1 className="mb-1 text-xl font-bold text-text">Pick 3 or more genres you like</h1>
        <p className="mb-6 text-sm text-muted">
          We will use these to recommend movies until we learn more about your taste.
        </p>

        <div className="mb-6 flex flex-wrap gap-2">
          {genres.map((g) => (
            <GenreChip key={g} label={g} active={selected.has(g)} onClick={() => toggle(g)} />
          ))}
        </div>

        {error && <p className="mb-3 text-xs text-accent">{error}</p>}

        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className="w-full rounded-lg bg-accent py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {loading ? "Saving..." : `Continue (${selected.size} selected)`}
        </button>
      </div>
    </main>
  );
}
