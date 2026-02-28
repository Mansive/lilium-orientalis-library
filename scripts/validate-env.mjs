import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const requiredVars = ["DATABASE_URL"];

function fail(message) {
  console.error(`[env] ${message}`);
  process.exit(1);
}

function validateDatabaseUrl(rawValue) {
  let parsed;

  try {
    parsed = new URL(rawValue);
  } catch {
    fail("DATABASE_URL is not a valid URL");
  }

  if (!parsed) {
    fail("DATABASE_URL could not be parsed");
  }

  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    fail("DATABASE_URL must use the postgres:// or postgresql:// protocol");
  }

  if (!parsed.hostname) {
    fail("DATABASE_URL is missing a hostname");
  }

  if (!parsed.pathname || parsed.pathname === "/") {
    fail("DATABASE_URL is missing a database name in the path");
  }
}

for (const envName of requiredVars) {
  const value = process.env[envName];

  if (!value) {
    fail(`${envName} is required`);
  }
}

validateDatabaseUrl(process.env.DATABASE_URL);

console.log("[env] Environment validation passed");
