// A single shared Prisma Client instance, reused across hot-reloads in dev
// and across warm serverless invocations in production. Creating a new
// PrismaClient on every request would quickly exhaust database connections.
//
// Uses the Neon serverless driver adapter (connects over HTTP/WebSocket on
// port 443) instead of a raw TCP connection -- Neon's own recommended setup
// for serverless platforms like Vercel, where many short-lived function
// instances would otherwise exhaust Postgres' direct connection limit.
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
