import * as schema from "@/lib/db/schema";

let cachedConnectionString: string | undefined;
let cachedDb: unknown | undefined;
let cachedDbPromise: Promise<unknown> | undefined;

async function createDb(connectionString: string) {
  const [{ neon }, { drizzle }] = await Promise.all([
    import("@neondatabase/serverless"),
    import("drizzle-orm/neon-http"),
  ]);

  const client = neon(connectionString);
  return drizzle(client, { schema });
}

function getConnectionString() {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env.DATABASE_URL;
}

export async function getDb() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  if (cachedDb && cachedConnectionString === connectionString) {
    return cachedDb;
  }

  if (!cachedDbPromise || cachedConnectionString !== connectionString) {
    cachedConnectionString = connectionString;
    cachedDbPromise = createDb(connectionString).then((db) => {
      cachedDb = db;
      return db;
    });
  }

  cachedDb = await cachedDbPromise;
  cachedConnectionString = connectionString;

  return cachedDb;
}
