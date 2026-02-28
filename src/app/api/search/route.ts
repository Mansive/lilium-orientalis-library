import { search, vectorSearch } from "@/lib/search";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function customError(msg: string, code: number) {
  return NextResponse.json({ message: msg }, { status: code });
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  const searchMode = request.nextUrl.searchParams.get("mode");

  if (query === null || searchMode === null) {
    return customError("Invalid parameters", 400);
  } else if (query.length > 128) {
    return customError("Search query is too long", 400);
  } else if (query.length === 0) {
    return NextResponse.json({ records: [] });
  } else if (!["normal", "vector"].includes(searchMode)) {
    return customError("Invalid mode", 400);
  }

  try {
    const results =
      searchMode === "normal" ? await search(query) : await vectorSearch(query);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    if (message.includes("DATABASE_URL is required")) {
      return NextResponse.json(
        {
          message: "Server misconfiguration",
          code: "MISSING_DATABASE_URL",
        },
        { status: 500 },
      );
    }

    if (message.includes("fetch failed")) {
      return NextResponse.json(
        {
          message: "Database connection failed",
          code: "DATABASE_CONNECTION_FAILED",
        },
        { status: 500 },
      );
    }

    if (
      message.includes("@neondatabase/serverless") ||
      message.includes("drizzle-orm/neon-http")
    ) {
      return NextResponse.json(
        {
          message: "Database driver initialization failed",
          code: "DB_DRIVER_INIT_FAILED",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "A strange error has ocurred", code: "UNKNOWN_SEARCH_ERROR" },
      { status: 500 },
    );
  }
}
