// Manually creates Prisma's `_prisma_migrations` bookkeeping table and
// records this migration as already applied, since `prisma migrate
// resolve` (like `migrate dev`) needs a raw TCP connection that this local
// network can't make to Neon. This keeps a FUTURE `prisma migrate dev`
// run (e.g. on a machine with normal networking) from trying to re-apply
// a migration whose tables already exist.
import "../lib/fix-local-dns.mjs";
import { neon } from "@neondatabase/serverless";
import fs from "node:fs";
import crypto from "node:crypto";
import "dotenv/config";

const migrationDir = process.argv[2];
if (!migrationDir) {
  console.error("Usage: node scripts/mark-migration-applied.mjs <migrations/XXXX_name>");
  process.exit(1);
}

const migrationName = migrationDir.split(/[\\/]/).filter(Boolean).pop();
const sqlPath = `${migrationDir}/migration.sql`;
const sqlContent = fs.readFileSync(sqlPath, "utf-8");
const checksum = crypto.createHash("sha256").update(sqlContent).digest("hex");
const id = crypto.randomUUID();

const sql = neon(process.env.DATABASE_URL);

await sql.query(`
  CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
  )
`);

await sql.query(
  `INSERT INTO "_prisma_migrations"
     (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
   VALUES ($1, $2, now(), $3, now(), 1)`,
  [id, checksum, migrationName]
);

console.log(`Marked migration '${migrationName}' as applied (checksum ${checksum.slice(0, 12)}...).`);
