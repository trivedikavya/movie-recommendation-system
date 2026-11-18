import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Middleware runs on the Edge runtime, which doesn't support the same
// next/headers cookies() API as Server Components -- so session
// verification here reads the cookie directly off the request instead of
// going through lib/auth.ts's getCurrentUserId().
const SESSION_COOKIE = "session";
const PUBLIC_PATHS = ["/login", "/signup"];

function getSecretKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  if (isPublic) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let isValid = false;
  if (token) {
    try {
      await jwtVerify(token, getSecretKey());
      isValid = true;
    } catch {
      isValid = false;
    }
  }

  if (!isValid) {
    // API routes get a clean 401 instead of a redirect (no HTML page to redirect to).
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files, so we protect pages AND API
     * routes but don't try to run the session check on images/CSS/etc.
     */
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
