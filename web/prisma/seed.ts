// Seeds the fixed demo account (username: demo, password: demo123) shown
// on the login page, so anyone (e.g. an examiner) can try the app
// immediately without signing up. Safe to re-run -- it only creates the
// account if it doesn't already exist.
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";

async function main() {
  if (process.env.LOCAL_DNS_FIX === "true") {
    await import("../lib/fix-local-dns.mjs");
  }

  neonConfig.webSocketConstructor = ws;
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const existing = await prisma.user.findUnique({ where: { username: "demo" } });
  if (existing) {
    console.log("Demo account already exists, skipping.");
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash("demo123", 10);
  await prisma.user.create({
    data: {
      name: "Demo User",
      username: "demo",
      passwordHash,
      favoriteGenres: ["Action", "Sci-Fi", "Comedy"],
    },
  });
  console.log("Created demo account: username='demo', password='demo123'");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
