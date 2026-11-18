// Loads the plain JSON files exported from the Python notebook
// (web/model-data/*.json) once per server process, and caches them in
// module-level variables. This is the ONLY place that reads those files --
// every other server file (lib/recommender.ts, API routes) goes through
// these getters instead of touching the filesystem directly.
import fs from "node:fs";
import path from "node:path";

export type Movie = {
  id: number;
  title: string;
  year: number | null;
  genres: string[];
  cluster: number;
};

export type Rule = {
  antecedent: number[];
  consequent: number[];
  lift: number;
};

// Each neighbor entry is [movieId, cosineSimilarity], sorted by similarity desc.
export type NeighborList = [number, number][];

let _movies: Movie[] | null = null;
let _movieById: Map<number, Movie> | null = null;
let _similarity: Record<string, NeighborList> | null = null;
let _popularity: Record<string, number> | null = null;
let _rules: Rule[] | null = null;
let _genres: string[] | null = null;

const DATA_DIR = path.join(process.cwd(), "model-data");

function loadJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function getMovies(): Movie[] {
  if (!_movies) {
    _movies = loadJson<Movie[]>("movies.json");
  }
  return _movies;
}

export function getMovieById(id: number): Movie | undefined {
  if (!_movieById) {
    const map = new Map<number, Movie>();
    for (const m of getMovies()) map.set(m.id, m);
    _movieById = map;
  }
  return _movieById.get(id);
}

function getSimilarityTable(): Record<string, NeighborList> {
  if (!_similarity) {
    _similarity = loadJson<Record<string, NeighborList>>(
      "similarity_topk.json"
    );
  }
  return _similarity;
}

/** The top ~40 most rating-pattern-similar movies to the given movie. */
export function getNeighbors(movieId: number): NeighborList {
  return getSimilarityTable()[String(movieId)] ?? [];
}

function getPopularityTable(): Record<string, number> {
  if (!_popularity) {
    _popularity = loadJson<Record<string, number>>("popularity.json");
  }
  return _popularity;
}

/** Normalised (0-1) weighted-rating popularity score for a movie. */
export function getPopularityScore(movieId: number): number {
  return getPopularityTable()[String(movieId)] ?? 0;
}

/** All movies ranked most-to-least popular (same order every time). */
export function getMoviesByPopularity(): Movie[] {
  const table = getPopularityTable();
  return [...getMovies()].sort(
    (a, b) => (table[String(b.id)] ?? 0) - (table[String(a.id)] ?? 0)
  );
}

export function getRules(): Rule[] {
  if (!_rules) {
    _rules = loadJson<Rule[]>("rules.json");
  }
  return _rules;
}

export function getGenres(): string[] {
  if (!_genres) {
    _genres = loadJson<string[]>("genres.json");
  }
  return _genres;
}
