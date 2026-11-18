// Runs once when the Next.js server starts. Used here purely to work
// around a local-network DNS quirk (some ISP/router resolvers fail on
// Neon's long compute hostnames) during development. Gated behind
// LOCAL_DNS_FIX so it never runs on Vercel, where normal DNS works fine.
export async function register() {
  if (process.env.LOCAL_DNS_FIX === "true" && process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/fix-local-dns.mjs");
    console.log("[instrumentation] Local DNS fix for Neon applied.");
  }
}
