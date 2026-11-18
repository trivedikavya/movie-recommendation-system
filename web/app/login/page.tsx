"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiPost<{ needsOnboarding: boolean }>("/api/auth/login", {
        username,
        password,
      });
      router.push(res.needsOnboarding ? "/onboarding" : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGuest() {
    setError(null);
    setLoading(true);
    try {
      await apiPost("/api/auth/guest", {});
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start guest session");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border-color bg-surface p-8 shadow-xl">
        <h1 className="mb-1 text-2xl font-bold">
          Cine<span className="text-accent">Mind</span>
        </h1>
        <p className="mb-6 text-sm text-muted">Log in to see your recommendations.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border border-border-color bg-background px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-border-color bg-background px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
          </div>

          {error && <p className="text-xs text-accent">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-2 text-xs text-muted">
          <div className="h-px flex-1 bg-border-color" />
          or
          <div className="h-px flex-1 bg-border-color" />
        </div>

        <button
          type="button"
          onClick={handleGuest}
          disabled={loading}
          className="w-full rounded-lg border border-border-color py-2 text-sm font-semibold text-text transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          Continue as Guest
        </button>

        <p className="mt-4 text-center text-xs text-muted">
          No account yet?{" "}
          <Link href="/signup" className="text-accent hover:text-accent-hover">
            Sign up
          </Link>
        </p>

        <p className="mt-4 rounded-lg bg-background p-3 text-center text-[11px] text-muted">
          Demo account: <span className="text-text">demo</span> / password{" "}
          <span className="text-text">demo123</span>
        </p>
      </div>
    </main>
  );
}
