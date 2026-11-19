// The recommendation "brain" of the app -- a direct TypeScript port of the
// Hybrid model built and evaluated in the Python notebook (Phases A3/A4).
// No machine learning runs here; it only does weighted arithmetic over the
// numbers already computed offline and exported to web/model-data/*.json.
import {
  getMovies,
  getMovieById,
  getNeighbors,
  getPopularityScore,
  getMoviesByPopularity,
  type Movie,
} from "./model-data";

export type InteractionInput = {
  movieId: number;
  weight: number; // click = 1, like = 3, rating = the 1-5 value
};
// IMPORTANT: callers MUST pass interactions in chronological order, OLDEST
// FIRST. buildUserProfile() uses each interaction's position in this array
// (not a real timestamp) to decide how recent it is, so the order is what
// actually drives the recency weighting below.

export type Recommendation = {
  movieId: number;
  title: string;
  year: number | null;
  genres: string[];
  score: number;
  reason: string;
};

// Same default weights as Phase A3.6 in the notebook -- change these to
// experiment with how much each signal should count.
export const HYBRID_WEIGHTS = { knn: 0.5, cluster: 0.3, pop: 0.2 };

// A user needs at least this many DISTINCT interacted movies before we trust
// a personalised profile over a cold-start popularity fallback.
export const MIN_INTERACTIONS_FOR_PERSONALIZATION = 3;

// How strongly recent interactions outweigh older ones when building a
// user's taste profile. Each interaction's weight is multiplied by
// RECENCY_DECAY_RATE ^ (how many interactions more recent than it exist).
// 1.0 = no decay at all (every interaction counts equally, however old).
// Lower values (e.g. 0.5) make the system "forget" old taste much faster,
// so a handful of recent likes in a new genre can quickly outweigh a
// larger but older history in a different genre.
//
// 0.6 was chosen empirically: tested live against the real database with
// 2 Drama likes followed by 2 Comedy likes (Comedy most recent) -- at 0.6,
// Comedy-based picks clearly take the top of "Recommended for you" (e.g.
// "Tommy Boy" ranked #1) while Drama still appears further down, rather
// than either being ignored (too low a decay) or still dominating despite
// being older (too high a decay, i.e. the old flat-sum behaviour).
export const RECENCY_DECAY_RATE = 0.6;

/**
 * Collapse a user's raw interaction rows (which can contain many rows for
 * the same movie -- a click, then later a like, then later a rating) into
 * one total weight per distinct movie, with MORE RECENT interactions
 * counted more heavily than older ones.
 *
 * Example: a user likes 2 Drama movies, then later likes 2 Comedy movies.
 * A flat sum would call it a tie. With decay = 0.8, the two most-recent
 * (Comedy) interactions keep ~100% and ~80% of their weight, while the two
 * older (Drama) interactions have decayed to ~64% and ~51% -- so Comedy
 * now outweighs Drama, reflecting the user's more recent taste shift,
 * without completely discarding the older Drama signal.
 */
function buildUserProfile(
  interactions: InteractionInput[]
): Map<number, number> {
  const profile = new Map<number, number>();
  const n = interactions.length;

  interactions.forEach(({ movieId, weight }, index) => {
    const ageRank = n - 1 - index; // 0 = most recent interaction, increasing with age
    const decay = Math.pow(RECENCY_DECAY_RATE, ageRank);
    const effectiveWeight = weight * decay;
    profile.set(movieId, (profile.get(movieId) ?? 0) + effectiveWeight);
  });

  return profile;
}

function toRecommendation(
  movie: Movie,
  score: number,
  reason: string
): Recommendation {
  return {
    movieId: movie.id,
    title: movie.title,
    year: movie.year,
    genres: movie.genres,
    score: Math.round(score * 10000) / 10000,
    reason,
  };
}

/**
 * Cold-start recommendations for a brand-new user (fewer than
 * MIN_INTERACTIONS_FOR_PERSONALIZATION interactions): popular movies,
 * boosted towards the genres they picked at onboarding, if any.
 */
export function getColdStartRecommendations(
  favoriteGenres: string[],
  excludeIds: Set<number>,
  n = 10
): Recommendation[] {
  const genreSet = new Set(favoriteGenres.map((g) => g.toLowerCase()));
  const ranked = getMoviesByPopularity()
    .filter((m) => !excludeIds.has(m.id))
    .map((m) => {
      const popScore = getPopularityScore(m.id);
      const matchesGenre = m.genres.some((g) => genreSet.has(g.toLowerCase()));
      // A small, fixed boost for matching a chosen genre -- enough to reorder
      // within the popularity ranking without completely ignoring popularity.
      const score = matchesGenre ? popScore + 0.3 : popScore;
      return { movie: m, score, matchesGenre };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, n);

  return ranked.map(({ movie, score, matchesGenre }) =>
    toRecommendation(
      movie,
      score,
      matchesGenre ? "matches your favourite genres" : "popular pick"
    )
  );
}

/**
 * Personalised recommendations for a returning user, blending:
 *  - knn score: weighted similarity to the movies they've interacted with,
 *    using each movie's precomputed top-K neighbour list
 *  - cluster score: fraction of their interaction weight that falls into
 *    the same content cluster as the candidate
 *  - popularity score: the global weighted-rating popularity
 */
export function getPersonalizedRecommendations(
  interactions: InteractionInput[],
  n = 10,
  weights = HYBRID_WEIGHTS
): Recommendation[] {
  const profile = buildUserProfile(interactions);
  const interactedIds = new Set(profile.keys());

  // --- KNN score: accumulate weighted similarity from every interacted
  // movie's neighbour list onto each candidate, and remember which single
  // interacted movie contributed the most (for the "because you liked X"
  // reason). ---
  const knnScoreSum = new Map<number, number>();
  const knnWeightSum = new Map<number, number>();
  const bestKnnContributor = new Map<number, { movieId: number; contribution: number }>();

  for (const [movieId, weight] of profile.entries()) {
    for (const [neighborId, similarity] of getNeighbors(movieId)) {
      if (interactedIds.has(neighborId)) continue;
      const contribution = weight * similarity;
      knnScoreSum.set(neighborId, (knnScoreSum.get(neighborId) ?? 0) + contribution);
      knnWeightSum.set(neighborId, (knnWeightSum.get(neighborId) ?? 0) + weight);

      const prevBest = bestKnnContributor.get(neighborId);
      if (!prevBest || contribution > prevBest.contribution) {
        bestKnnContributor.set(neighborId, { movieId, contribution });
      }
    }
  }

  // --- Cluster score: what fraction of the user's total interaction
  // weight belongs to each cluster. We also track, per cluster, which
  // interacted movie has the HIGHEST decayed weight -- since more recent
  // interactions have more weight, this naturally tends to be the user's
  // most recent movie in that cluster, which is what gets named in the
  // "same cluster as X" reason text below. ---
  const clusterWeight = new Map<number, number>();
  let totalWeight = 0;
  const topMovieByCluster = new Map<number, { movieId: number; weight: number }>();
  for (const [movieId, weight] of profile.entries()) {
    const movie = getMovieById(movieId);
    if (!movie) continue;
    clusterWeight.set(movie.cluster, (clusterWeight.get(movie.cluster) ?? 0) + weight);
    totalWeight += weight;

    const currentTop = topMovieByCluster.get(movie.cluster);
    if (!currentTop || weight > currentTop.weight) {
      topMovieByCluster.set(movie.cluster, { movieId, weight });
    }
  }
  const clusterFraction = new Map<number, number>();
  for (const [cluster, w] of clusterWeight.entries()) {
    clusterFraction.set(cluster, totalWeight > 0 ? w / totalWeight : 0);
  }

  // --- Combine all three signals for every unseen movie. ---
  const scored: { movie: Movie; score: number; reason: string }[] = [];

  for (const movie of getMovies()) {
    if (interactedIds.has(movie.id)) continue;

    const knnScore =
      knnWeightSum.get(movie.id) && knnWeightSum.get(movie.id)! > 0
        ? knnScoreSum.get(movie.id)! / knnWeightSum.get(movie.id)!
        : 0;
    const clusterScore = clusterFraction.get(movie.cluster) ?? 0;
    const popScore = getPopularityScore(movie.id);

    const contribKnn = weights.knn * knnScore;
    const contribCluster = weights.cluster * clusterScore;
    const contribPop = weights.pop * popScore;
    const finalScore = contribKnn + contribCluster + contribPop;

    let reason: string;
    if (contribKnn >= contribCluster && contribKnn >= contribPop && contribKnn > 0) {
      const bestLikedId = bestKnnContributor.get(movie.id)?.movieId;
      const bestLikedTitle = bestLikedId ? getMovieById(bestLikedId)?.title : undefined;
      reason = bestLikedTitle
        ? `because you liked '${bestLikedTitle}'`
        : "similar to your taste";
    } else if (contribCluster >= contribPop && contribCluster > 0) {
      const sameClusterMovieId = topMovieByCluster.get(movie.cluster)?.movieId;
      const sameClusterTitle = sameClusterMovieId
        ? getMovieById(sameClusterMovieId)?.title
        : undefined;
      reason = sameClusterTitle
        ? `same cluster as '${sameClusterTitle}'`
        : "similar genre/theme";
    } else {
      reason = "popular pick";
    }

    scored.push({ movie, score: finalScore, reason });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored
    .slice(0, n)
    .map(({ movie, score, reason }) => toRecommendation(movie, score, reason));
}

export type RecommendationMode = "cold-start" | "personalized";

/**
 * Top-level entry point, mirroring the notebook's recommend(): decides
 * cold-start vs personalised based on how many distinct movies the user
 * has interacted with. Returns which mode was used alongside the
 * recommendations, so the UI can show genre-browsing rows during
 * cold-start and only switch to "Recommended for you" / "Because you
 * liked X" language once real personalisation has kicked in.
 */
export function getRecommendationsForUser(
  interactions: InteractionInput[],
  favoriteGenres: string[],
  n = 10
): { mode: RecommendationMode; recommendations: Recommendation[] } {
  const distinctMovieCount = new Set(interactions.map((i) => i.movieId)).size;
  const excludeIds = new Set(interactions.map((i) => i.movieId));

  if (distinctMovieCount < MIN_INTERACTIONS_FOR_PERSONALIZATION) {
    return {
      mode: "cold-start",
      recommendations: getColdStartRecommendations(favoriteGenres, excludeIds, n),
    };
  }
  return {
    mode: "personalized",
    recommendations: getPersonalizedRecommendations(interactions, n),
  };
}

/** Global "Popular right now" row -- same for every user, no personalisation. */
export function getPopularRecommendations(
  excludeIds: Set<number>,
  n = 10
): Recommendation[] {
  return getMoviesByPopularity()
    .filter((m) => !excludeIds.has(m.id))
    .slice(0, n)
    .map((m) => toRecommendation(m, getPopularityScore(m.id), "popular pick"));
}

/**
 * Most popular movies within a single genre -- used for the cold-start
 * "browse by genre" rows (e.g. a dedicated "Drama" row, a dedicated
 * "Comedy" row) shown to brand-new users instead of a single, slightly
 * dishonest "Recommended for you" row before there is any real behaviour
 * to personalise from.
 */
export function getGenreRecommendations(
  genre: string,
  excludeIds: Set<number>,
  n = 10
): Recommendation[] {
  const genreLower = genre.toLowerCase();
  return getMoviesByPopularity()
    .filter((m) => !excludeIds.has(m.id) && m.genres.some((g) => g.toLowerCase() === genreLower))
    .slice(0, n)
    .map((m) => toRecommendation(m, getPopularityScore(m.id), `popular in ${genre}`));
}

/**
 * "Because you liked X" row -- movies rating-pattern-similar to one
 * specific movie, used to explain a shelf keyed on the user's most
 * recent like.
 */
export function getBecauseYouLikedRow(
  likedMovieId: number,
  excludeIds: Set<number>,
  n = 10
): Recommendation[] {
  const likedMovie = getMovieById(likedMovieId);
  if (!likedMovie) return [];
  return getNeighbors(likedMovieId)
    .filter(([neighborId]) => !excludeIds.has(neighborId))
    .slice(0, n)
    .map(([neighborId, similarity]) => {
      const movie = getMovieById(neighborId);
      return movie
        ? toRecommendation(movie, similarity, `because you liked '${likedMovie.title}'`)
        : null;
    })
    .filter((r): r is Recommendation => r !== null);
}

/** Simple title search + optional genre filter, for the Browse page. */
export function searchMovies(
  query: string,
  genreFilter: string | null,
  limit = 40
): Movie[] {
  const q = query.trim().toLowerCase();
  return getMovies()
    .filter((m) => {
      const matchesQuery = q === "" || m.title.toLowerCase().includes(q);
      const matchesGenre =
        !genreFilter || m.genres.some((g) => g.toLowerCase() === genreFilter.toLowerCase());
      return matchesQuery && matchesGenre;
    })
    .slice(0, limit);
}
