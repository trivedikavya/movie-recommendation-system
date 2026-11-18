import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app is fully personalised/auth-gated -- every page depends on the
  // logged-in user's session and data, so there is nothing to statically
  // prerender. Cache Components' strict prerendering checks are disabled
  // to avoid needing Suspense boilerplate on every single page.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
