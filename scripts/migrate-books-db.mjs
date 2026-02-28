import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";

import pg from "pg";
import pgCopyStreams from "pg-copy-streams";

const { Pool } = pg;
const { from: copyFrom } = pgCopyStreams;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run migration");
}

const csvPath = process.env.BOOKS_CSV_PATH
  ? path.resolve(process.env.BOOKS_CSV_PATH)
  : path.resolve(process.cwd(), "Books.csv");

const tableColumns = [
  "id",
  "title",
  "true_title",
  "extension",
  "size",
  "sources",
  "md5",
  "description",
  "cover",
  "thumbnail",
  "author",
  "embeddings",
  "xata.createdAt",
  "xata.updatedAt",
  "xata.version",
];

const bootstrapSql = `
CREATE SCHEMA IF NOT EXISTS xata_private;
CREATE SCHEMA IF NOT EXISTS xata;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    INNER JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'xid' AND n.nspname = 'xata_private'
  ) THEN
    CREATE DOMAIN xata_private.xid AS character(20)
      CONSTRAINT xid_check CHECK ((VALUE ~ '^[a-v0-9]{20}$'::text));
  END IF;
END
$$;

CREATE SEQUENCE IF NOT EXISTS xata_private.xid_serial
    START WITH 0
    INCREMENT BY 1
    MINVALUE 0
    MAXVALUE 16777215
    CACHE 1
    CYCLE;

CREATE OR REPLACE FUNCTION xata_private._xid_machine_id() RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    RETURN (SELECT system_identifier & 16777215 FROM pg_control_system());
END;
$$;

CREATE OR REPLACE FUNCTION xata_private.xid_encode(_id integer[]) RETURNS xata_private.xid
    LANGUAGE plpgsql
    AS $$
DECLARE
    _encoding CHAR(1)[] = '{0, 1, 2, 3, 4, 5, 6, 7, 8, 9, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v}';
BEGIN
    RETURN _encoding[1 + (_id[1] >> 3)]
               || _encoding[1 + ((_id[2] >> 6) & 31 | (_id[1] << 2) & 31)]
               || _encoding[1 + ((_id[2] >> 1) & 31)]
               || _encoding[1 + ((_id[3] >> 4) & 31 | (_id[2] << 4) & 31)]
               || _encoding[1 + (_id[4] >> 7 | (_id[3] << 1) & 31)]
               || _encoding[1 + ((_id[4] >> 2) & 31)]
               || _encoding[1 + (_id[5] >> 5 | (_id[4] << 3) & 31)]
               || _encoding[1 + (_id[5] & 31)]
               || _encoding[1 + (_id[6] >> 3)]
               || _encoding[1 + ((_id[7] >> 6) & 31 | (_id[6] << 2) & 31)]
               || _encoding[1 + ((_id[7] >> 1) & 31)]
               || _encoding[1 + ((_id[8] >> 4) & 31 | (_id[7] << 4) & 31)]
               || _encoding[1 + (_id[9] >> 7 | (_id[8] << 1) & 31)]
               || _encoding[1 + ((_id[9] >> 2) & 31)]
               || _encoding[1 + ((_id[10] >> 5) | (_id[9] << 3) & 31)]
               || _encoding[1 + (_id[10] & 31)]
               || _encoding[1 + (_id[11] >> 3)]
               || _encoding[1 + ((_id[12] >> 6) & 31 | (_id[11] << 2) & 31)]
               || _encoding[1 + ((_id[12] >> 1) & 31)]
        || _encoding[1 + ((_id[12] << 4) & 31)];
END;
$$;

CREATE OR REPLACE FUNCTION xata_private.xid(_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP) RETURNS xata_private.xid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    _t INT;
    _m INT;
    _p INT;
    _c INT;
BEGIN
    _t := floor(EXTRACT(epoch FROM _at));
    _m := xata_private._xid_machine_id();
    _p := pg_backend_pid();
    _c := nextval('xata_private.xid_serial')::INT;

    return xata_private.xid_encode(ARRAY [
            (_t >> 24) & 255, (_t >> 16) & 255, (_t >> 8) & 255 , _t & 255,
            (_m >> 16) & 255, (_m >> 8) & 255 , _m & 255,
            (_p >> 8) & 255, _p & 255,
            (_c >> 16) & 255, (_c >> 8) & 255 , _c & 255
        ]);
END;
$$;

CREATE OR REPLACE FUNCTION public.cjk_ngrams(input text) RETURNS text[]
    LANGUAGE SQL
    IMMUTABLE
    AS $$
SELECT CASE
  WHEN input IS NULL OR input = '' THEN ARRAY[]::text[]
  WHEN char_length(input) = 1 THEN ARRAY[input]
  ELSE (
    SELECT array_agg(token)
    FROM (
      SELECT substr(input, g, 1) AS token
      FROM generate_series(1, char_length(input)) AS g
      UNION ALL
      SELECT substr(input, g, 2) AS token
      FROM generate_series(1, char_length(input) - 1) AS g
    ) ngrams
  )
END;
$$;
`;

const createBooksTableSql = `
DROP TABLE IF EXISTS xata."Books";

CREATE TABLE xata."Books" (
    xata_id text DEFAULT ('rec_'::text || (xata_private.xid())::text) NOT NULL,
    xata_version integer DEFAULT 0 NOT NULL,
    xata_createdat timestamp with time zone DEFAULT now() NOT NULL,
    xata_updatedat timestamp with time zone DEFAULT now() NOT NULL,
    title text DEFAULT '' NOT NULL,
    true_title text DEFAULT '' NOT NULL,
    extension text DEFAULT '' NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    sources text[],
    md5 text,
    description text DEFAULT '' NOT NULL,
    cover text DEFAULT '' NOT NULL,
    thumbnail text DEFAULT '' NOT NULL,
    author text DEFAULT '' NOT NULL,
    embeddings real[],
    search_tsv tsvector GENERATED ALWAYS AS (
      setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
      setweight(to_tsvector('simple', coalesce(true_title, '')), 'A') ||
      setweight(to_tsvector('simple', coalesce(author, '')), 'B') ||
      setweight(to_tsvector('simple', coalesce(description, '')), 'C')
    ) STORED,
    search_cjk_ngrams text[] GENERATED ALWAYS AS (
      public.cjk_ngrams(regexp_replace(lower(coalesce(title, '') || coalesce(true_title, '') || coalesce(author, '')), '\\s+', '', 'g'))
    ) STORED,
    CONSTRAINT books_xata_id_pk PRIMARY KEY (xata_id),
    CONSTRAINT books_xata_id_length CHECK ((length(xata_id) < 256))
);
`;

const createStagingTableSql = `
DROP TABLE IF EXISTS xata_private.books_import_staging;

CREATE UNLOGGED TABLE xata_private.books_import_staging (
  "id" text,
  "title" text,
  "true_title" text,
  "extension" text,
  "size" text,
  "sources" text,
  "md5" text,
  "description" text,
  "cover" text,
  "thumbnail" text,
  "author" text,
  "embeddings" text,
  "xata.createdAt" text,
  "xata.updatedAt" text,
  "xata.version" text
);
`;

const copyIntoStagingSql = `
COPY xata_private.books_import_staging (${tableColumns.map((column) => `"${column}"`).join(", ")})
FROM STDIN WITH (FORMAT csv, HEADER true);
`;

const insertBooksSql = `
INSERT INTO xata."Books" (
  xata_id,
  xata_version,
  xata_createdat,
  xata_updatedat,
  title,
  true_title,
  extension,
  size,
  sources,
  md5,
  description,
  cover,
  thumbnail,
  author,
  embeddings
)
SELECT
  COALESCE(NULLIF("id", ''), 'rec_'::text || (xata_private.xid())::text) AS xata_id,
  COALESCE(NULLIF("xata.version", ''), '0')::integer AS xata_version,
  COALESCE(NULLIF("xata.createdAt", ''), now()::text)::timestamptz AS xata_createdat,
  COALESCE(NULLIF("xata.updatedAt", ''), COALESCE(NULLIF("xata.createdAt", ''), now()::text))::timestamptz AS xata_updatedat,
  COALESCE("title", '') AS title,
  COALESCE("true_title", '') AS true_title,
  COALESCE("extension", '') AS extension,
  COALESCE(NULLIF("size", ''), '0')::bigint AS size,
  CASE
    WHEN NULLIF("sources", '') IS NULL THEN NULL
    ELSE (
      SELECT array_agg(value)
      FROM jsonb_array_elements_text("sources"::jsonb) AS value
    )
  END AS sources,
  NULLIF("md5", '') AS md5,
  COALESCE("description", '') AS description,
  COALESCE("cover", '') AS cover,
  COALESCE("thumbnail", '') AS thumbnail,
  COALESCE("author", '') AS author,
  CASE
    WHEN NULLIF("embeddings", '') IS NULL THEN NULL
    ELSE (
      SELECT array_agg(value::real)
      FROM jsonb_array_elements_text("embeddings"::jsonb) AS value
    )
  END AS embeddings
FROM xata_private.books_import_staging;
`;

const indexSql = `
CREATE INDEX books_search_tsv_gin_idx
  ON xata."Books"
  USING gin (search_tsv);

CREATE INDEX books_search_cjk_ngrams_gin_idx
  ON xata."Books"
  USING gin (search_cjk_ngrams);

CREATE INDEX books_xata_updatedat_idx
  ON xata."Books" (xata_updatedat DESC);
`;

const pool = new Pool({
  connectionString,
  max: 1,
});

await access(csvPath);

const client = await pool.connect();

try {
  console.log("Step 1: creating schemas, functions, and table definitions...");
  await client.query("BEGIN");
  await client.query("SET LOCAL statement_timeout = 0");
  await client.query("SET LOCAL lock_timeout = 0");
  await client.query(bootstrapSql);
  await client.query(createBooksTableSql);
  await client.query(createStagingTableSql);

  console.log(`Step 2: streaming CSV into staging table from ${csvPath}...`);
  const copyStream = client.query(copyFrom(copyIntoStagingSql));
  await pipeline(createReadStream(csvPath), copyStream);

  const stagingCountResult = await client.query(
    "SELECT COUNT(*)::bigint AS count FROM xata_private.books_import_staging",
  );
  const stagingCount = Number(stagingCountResult.rows[0].count);
  console.log(`Staging rows: ${stagingCount}`);

  console.log("Step 3: transforming and importing rows into xata.\"Books\"...");
  await client.query(insertBooksSql);

  console.log("Step 4: creating search indexes and analyzing table...");
  await client.query(indexSql);
  await client.query("ANALYZE xata.\"Books\"");

  const importedCountResult = await client.query(
    'SELECT COUNT(*)::bigint AS count FROM xata."Books"',
  );
  const importedCount = Number(importedCountResult.rows[0].count);

  if (importedCount !== stagingCount) {
    throw new Error(
      `Imported row count (${importedCount}) does not match staging count (${stagingCount})`,
    );
  }

  const sampleSearchResult = await client.query(`
    WITH query_tokens AS (
      SELECT public.cjk_ngrams(regexp_replace(lower($1), '\\s+', '', 'g')) AS grams
    )
    SELECT b.xata_id, b.title
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
    LIMIT 5
  `, ["魔王学院"]);

  await client.query("COMMIT");

  console.log(`Imported rows: ${importedCount}`);
  console.log("Sample CJK query: 魔王学院");
  for (const row of sampleSearchResult.rows) {
    console.log(`- ${row.xata_id} | ${row.title}`);
  }
  console.log("Migration completed successfully.");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
