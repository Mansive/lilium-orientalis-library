import {
  bigint,
  integer,
  pgSchema,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const xataSchema = pgSchema("xata");

export const books = xataSchema.table("Books", {
  xataId: text("xata_id").notNull().primaryKey(),
  xataVersion: integer("xata_version").notNull().default(0),
  xataCreatedAt: timestamp("xata_createdat", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  xataUpdatedAt: timestamp("xata_updatedat", {
    mode: "date",
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
  title: text("title").notNull().default(""),
  trueTitle: text("true_title").notNull().default(""),
  extension: text("extension").notNull().default(""),
  size: bigint("size", { mode: "number" }).notNull().default(0),
  sources: text("sources").array(),
  md5: text("md5"),
  description: text("description").notNull().default(""),
  cover: text("cover").notNull().default(""),
  thumbnail: text("thumbnail").notNull().default(""),
  author: text("author").notNull().default(""),
  embeddings: real("embeddings").array(),
});

export type BookRow = typeof books.$inferSelect;
