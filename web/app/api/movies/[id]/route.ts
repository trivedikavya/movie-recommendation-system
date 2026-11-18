import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getMovieById, getNeighbors } from "@/lib/model-data";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { id } = await params;
  const movieId = Number(id);
  const movie = getMovieById(movieId);
  if (!movie) {
    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
  }

  // Log an implicit "click" interaction every time a user views a movie's
  // detail page -- this is the weak, passive signal (weight 1) described
  // in the original spec, on top of explicit likes/ratings.
  await prisma.interaction.create({
    data: { userId, movieId, action: "click", weight: 1 },
  });

  const similarMovieIds = getNeighbors(movieId).slice(0, 10).map(([id]) => id);
  const similarMovies = similarMovieIds
    .map((id) => getMovieById(id))
    .filter((m) => m !== undefined);

  return NextResponse.json({ movie, similarMovies });
}
