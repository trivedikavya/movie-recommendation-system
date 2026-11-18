import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import {
  getRecommendationsForUser,
  getPopularRecommendations,
  getBecauseYouLikedRow,
} from "@/lib/recommender";

// GET /api/recommendations?type=for-you|popular|because-liked&n=10
export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "for-you";
  const n = Number(searchParams.get("n") ?? "10");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Ordered oldest-first: lib/recommender.ts's buildUserProfile() relies on
  // this exact ordering to apply recency weighting correctly.
  const interactions = await prisma.interaction.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  const excludeIds = new Set(interactions.map((i) => i.movieId));

  if (type === "popular") {
    return NextResponse.json({
      recommendations: getPopularRecommendations(excludeIds, n),
    });
  }

  if (type === "because-liked") {
    // Key the row on the user's most recently liked movie, if any.
    const mostRecentLike = await prisma.interaction.findFirst({
      where: { userId, action: "like" },
      orderBy: { createdAt: "desc" },
    });
    if (!mostRecentLike) {
      return NextResponse.json({ recommendations: [] });
    }
    return NextResponse.json({
      recommendations: getBecauseYouLikedRow(mostRecentLike.movieId, excludeIds, n),
      basedOnMovieId: mostRecentLike.movieId,
    });
  }

  // default: "for-you"
  const interactionInputs = interactions.map((i) => ({
    movieId: i.movieId,
    weight: i.weight,
  }));
  return NextResponse.json({
    recommendations: getRecommendationsForUser(interactionInputs, user.favoriteGenres, n),
  });
}
