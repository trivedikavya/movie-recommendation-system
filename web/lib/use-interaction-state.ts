"use client";

import { useEffect, useState } from "react";
import { apiGet } from "./api-client";

type InteractionRow = {
  movieId: number;
  action: "click" | "like" | "rating";
  weight: number;
};

export type InteractionState = {
  likedIds: Set<number>;
  ratings: Map<number, number>;
  loaded: boolean;
};

/**
 * Fetches the current user's full interaction history once and derives two
 * quick lookups: which movies they've liked, and their most recent rating
 * per movie. Used so Like buttons / rating stars show the CORRECT saved
 * state instead of always starting blank, even on a page the user has
 * visited before.
 */
export function useInteractionState(): InteractionState {
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [ratings, setRatings] = useState<Map<number, number>>(new Map());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiGet<{ interactions: InteractionRow[] }>("/api/interactions").then((res) => {
      const liked = new Set<number>();
      const ratingMap = new Map<number, number>();
      // /api/interactions returns newest-first (orderBy createdAt desc), so
      // the FIRST "rating" row we see for a movie is its most recent rating.
      for (const i of res.interactions) {
        if (i.action === "like") liked.add(i.movieId);
        if (i.action === "rating" && !ratingMap.has(i.movieId)) {
          ratingMap.set(i.movieId, i.weight);
        }
      }
      setLikedIds(liked);
      setRatings(ratingMap);
      setLoaded(true);
    });
  }, []);

  return { likedIds, ratings, loaded };
}

/** Stamps userLiked/userRating onto a list of movies from the interaction state. */
export function withInteractionState<T extends { movieId: number }>(
  movies: T[],
  state: InteractionState
): (T & { userLiked: boolean; userRating: number })[] {
  return movies.map((m) => ({
    ...m,
    userLiked: state.likedIds.has(m.movieId),
    userRating: state.ratings.get(m.movieId) ?? 0,
  }));
}
