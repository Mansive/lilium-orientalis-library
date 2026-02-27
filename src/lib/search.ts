import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

const SEARCH_LIMIT = 50;
const cjkRegex = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;

type RawSearchRow = {
  id: string;
  title: string | null;
  true_title: string | null;
  extension: string | null;
  size: number | string;
  sources: string[] | null;
  md5: string | null;
  description: string | null;
  cover: string | null;
  thumbnail: string | null;
  author: string | null;
};

function normalizeRecord(row: RawSearchRow) {
  return {
    id: row.id,
    title: row.title ?? "",
    true_title: row.true_title ?? "",
    extension: row.extension ?? "",
    size: Number(row.size) || 0,
    sources: Array.isArray(row.sources) ? row.sources : [],
    md5: row.md5 ?? "",
    description: row.description ?? "",
    cover: row.cover ?? "",
    thumbnail: row.thumbnail ?? "",
    author: row.author ?? "",
  };
}

function isCjkQuery(query: string) {
  return cjkRegex.test(query);
}

async function fullTextSearch(query: string) {
  const result = await db.execute(sql<RawSearchRow>`
    SELECT
      b.xata_id AS id,
      b.title,
      b.true_title,
      b.extension,
      b.size,
      b.sources,
      b.md5,
      b.description,
      b.cover,
      b.thumbnail,
      b.author
    FROM xata."Books" b
    WHERE b.search_tsv @@ websearch_to_tsquery('simple', ${query})
    ORDER BY ts_rank(b.search_tsv, websearch_to_tsquery('simple', ${query})) DESC, b.xata_updatedat DESC
    LIMIT ${SEARCH_LIMIT};
  `);

  return (result.rows as RawSearchRow[]).map(normalizeRecord);
}

async function cjkHybridSearch(query: string) {
  const result = await db.execute(sql<RawSearchRow>`
    WITH query_tokens AS (
      SELECT public.cjk_ngrams(regexp_replace(lower(${query}), '\\s+', '', 'g')) AS grams
    )
    SELECT
      b.xata_id AS id,
      b.title,
      b.true_title,
      b.extension,
      b.size,
      b.sources,
      b.md5,
      b.description,
      b.cover,
      b.thumbnail,
      b.author
    FROM xata."Books" b, query_tokens q
    WHERE b.search_cjk_ngrams && q.grams
    ORDER BY
      (
        SELECT COUNT(*)::float
        FROM (
          SELECT DISTINCT gram FROM unnest(b.search_cjk_ngrams) AS gram
          INTERSECT
          SELECT DISTINCT gram FROM unnest(q.grams) AS gram
        ) overlap
      ) / GREATEST(cardinality(q.grams), 1) DESC,
      b.xata_updatedat DESC
    LIMIT ${SEARCH_LIMIT};
  `);

  return (result.rows as RawSearchRow[]).map(normalizeRecord);
}

export async function search(query: string) {
  const records = isCjkQuery(query)
    ? await cjkHybridSearch(query)
    : await fullTextSearch(query);

  return { records };
}

export async function vectorSearch(query: string) {
  return await search(query);
}
