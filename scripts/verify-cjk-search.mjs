import pg from "pg";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run verification");
}

const pool = new Pool({ connectionString, max: 1 });

const cjkSearchSql = `
WITH query_tokens AS (
  SELECT public.cjk_ngrams(regexp_replace(lower($1), '\\s+', '', 'g')) AS grams
)
SELECT
  b.xata_id AS id,
  b.title,
  (
    SELECT COUNT(*)::float
    FROM (
      SELECT DISTINCT gram FROM unnest(b.search_cjk_ngrams) AS gram
      INTERSECT
      SELECT DISTINCT gram FROM unnest(q.grams) AS gram
    ) overlap
  ) / GREATEST(cardinality(q.grams), 1) AS score
FROM xata."Books" b, query_tokens q
WHERE b.search_cjk_ngrams && q.grams
ORDER BY score DESC, b.xata_updatedat DESC
LIMIT 5;
`;

const testQueries = ["魔王学院", "魔王学園", "龍神様"];

try {
  for (const query of testQueries) {
    const result = await pool.query(cjkSearchSql, [query]);
    console.log(`Query: ${query}`);
    console.log(`Result count: ${result.rowCount}`);
    for (const row of result.rows) {
      console.log(`- ${row.id} | score=${Number(row.score).toFixed(3)} | ${row.title}`);
    }
    console.log("");
  }

  const partialResult = await pool.query(cjkSearchSql, ["魔王学院"]);
  const typoResult = await pool.query(cjkSearchSql, ["魔王学園"]);

  if (partialResult.rowCount === 0) {
    throw new Error("CJK partial search verification failed: no results for 魔王学院");
  }

  if (typoResult.rowCount === 0) {
    throw new Error("CJK fuzzy search verification failed: no results for 魔王学園");
  }

  console.log("CJK search verification passed.");
} finally {
  await pool.end();
}
