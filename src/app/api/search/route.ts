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

    // Reduce network payload size for users
    const records = JSON.parse(JSON.stringify(results))["records"];
    records.forEach((book: Record<string, any>) => {
      book.title = book.xata.highlight.title[0];
      delete book.embeddings;
      delete book.xata;
    });

    return NextResponse.json({ records });
  } catch (error) {
    return customError("A strange error has ocurred", 500);
  }
}
