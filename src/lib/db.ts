import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "@/lib/db/schema";

function createDb(connectionString: string) {
  const client = neon(connectionString);
  return drizzle(client, { schema });
}

let cachedConnectionString: string | undefined;
let cachedDb: ReturnType<typeof createDb> | undefined;

export function getDb() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  if (cachedDb && cachedConnectionString === connectionString) {
    return cachedDb;
  }

  cachedDb = createDb(connectionString);
  cachedConnectionString = connectionString;

  return cachedDb;
}
