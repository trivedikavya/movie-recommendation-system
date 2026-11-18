// One-off helper: executes a migration.sql file against Neon over HTTPS
// (using @neondatabase/serverless's plain SQL-over-HTTP mode), bypassing
// the need for a raw TCP connection on port 5432. Only needed because the
// sandboxed dev environment used to build this app blocks non-443 TCP
// ports; on a normal machine or on Vercel, `prisma migrate deploy` works
// directly and this script isn't needed.
import "../lib/fix-local-dns.mjs";
import { neon } from "@neondatabase/serverless";
import fs from "node:fs";
import "dotenv/config";

const sqlFilePath = process.argv[2];
if (!sqlFilePath) {
  console.error("Usage: node scripts/apply-migration.mjs <path-to-migration.sql>");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const fullScript = fs.readFileSync(sqlFilePath, "utf-8");

// Split on semicolons -- good enough for Prisma-generated migration
// scripts, which don't contain semicolons inside string literals. Strip
// comment-only lines (both "--" line comments and blank lines) from each
// statement before checking if anything executable remains.
const statements = fullScript
  .split(";")
  .map((stmt) =>
    stmt
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .trim()
  )
  .filter((s) => s.length > 0);

for (const stmt of statements) {
  console.log("Running:", stmt.split("\n")[0].slice(0, 80), "...");
  await sql.query(stmt);
}

console.log(`\nDone. Executed ${statements.length} statements.`);
