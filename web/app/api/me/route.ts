import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ user: null });
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, username: true, isGuest: true, favoriteGenres: true },
  });
  return NextResponse.json({ user });
}
