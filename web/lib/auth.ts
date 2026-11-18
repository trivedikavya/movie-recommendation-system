// Minimal, hand-rolled auth: bcrypt for password hashing, a signed JWT
// (via `jose`) stored in an httpOnly cookie for the session. No external
// auth library -- easy to read end-to-end and explain in a viva.
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

// ---------------------------------------------------------------------
// Password hashing
// ---------------------------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---------------------------------------------------------------------
// Session token (JWT) create / verify
// ---------------------------------------------------------------------
export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.userId === "string") {
      return { userId: payload.userId };
    }
    return null;
  } catch {
    return null; // expired, tampered, or malformed token
  }
}

// ---------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------
export const SESSION_COOKIE = SESSION_COOKIE_NAME;
export const SESSION_MAX_AGE = SESSION_DURATION_SECONDS;

/** Read the current logged-in user's id from the session cookie, or null. */
export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  return session?.userId ?? null;
}
