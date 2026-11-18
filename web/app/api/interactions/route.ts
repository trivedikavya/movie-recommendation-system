import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { interactionSchema } from "@/lib/validation";
import { computeWeight } from "@/lib/interaction-weight";
import { getMovieById } from "@/lib/model-data";

// Records a click, like, or rating. Every row written here is later read
// back by lib/recommender.ts to build the user's taste profile.
export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = interactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }
  const { movieId, action, ratingValue } = parsed.data;

  if (!getMovieById(movieId)) {
    return NextResponse.json({ error: "Unknown movieId" }, { status: 404 });
  }

  const weight = computeWeight(action, ratingValue);
  await prisma.interaction.create({
    data: { userId, movieId, action, weight },
  });

  return NextResponse.json({ ok: true });
}

// Returns the current user's full interaction history, used by the Profile page.
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const interactions = await prisma.interaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const enriched = interactions.map((i) => {
    const movie = getMovieById(i.movieId);
    return {
      id: i.id,
      movieId: i.movieId,
      title: movie?.title ?? "Unknown movie",
      genres: movie?.genres ?? [],
      action: i.action,
      weight: i.weight,
      createdAt: i.createdAt,
    };
  });

  return NextResponse.json({ interactions: enriched });
}
