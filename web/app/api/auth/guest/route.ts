import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import crypto from "node:crypto";

// "Continue as Guest": creates a brand-new, ephemeral guest account every
// time, so each guest's interactions don't mix with anyone else's. Guests
// skip the genre-picking onboarding screen entirely for a true one-click
// experience, and their cold-start recommendations fall back to plain
// popularity until they interact with a few movies.
export async function POST() {
  const suffix = crypto.randomBytes(4).toString("hex");
  const username = `guest_${suffix}`;
  const randomPassword = crypto.randomBytes(16).toString("hex");

  const user = await prisma.user.create({
    data: {
      name: "Guest",
      username,
      passwordHash: await hashPassword(randomPassword),
      isGuest: true,
    },
  });

  const token = await createSessionToken(user.id);
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, username: user.username },
    needsOnboarding: false,
  });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
