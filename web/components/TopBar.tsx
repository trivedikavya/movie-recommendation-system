"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api-client";

export default function TopBar({
  username,
  name,
}: {
  username: string;
  name: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    await apiPost("/api/auth/logout", {});
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border-color bg-background/90 px-4 py-3 backdrop-blur sm:px-8">
      <Link href="/" className="text-lg font-bold tracking-tight text-text">
        Cine<span className="text-accent">Mind</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/" className="text-muted hover:text-text">
          Home
        </Link>
        <Link href="/browse" className="text-muted hover:text-text">
          Browse
        </Link>
        <Link href="/profile" className="text-muted hover:text-text">
          Profile
        </Link>
        <span className="hidden text-muted sm:inline">
          {name} <span className="text-muted/60">@{username}</span>
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-border-color px-3 py-1 text-xs font-semibold text-text hover:border-accent hover:text-accent"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
