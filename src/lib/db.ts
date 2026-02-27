import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/lib/db/schema";

type Database = NodePgDatabase<typeof schema>;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  pgPool?: Pool;
  drizzleDb?: Database;
};

const pool =
  globalForDb.pgPool ??
  new Pool({
    connectionString,
    max: 10,
  });

const db = globalForDb.drizzleDb ?? drizzle(pool, { schema });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
  globalForDb.drizzleDb = db;
}

export { db };
