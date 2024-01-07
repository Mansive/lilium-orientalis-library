import { vectorSearch } from "@/lib/search";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const searchParams: string | null = request.nextUrl.searchParams.get("query");
  let query: string;
  if (searchParams === null) {
    query = "";
  } else {
    query = searchParams;
  }
  if (query.length > 128) {
    return NextResponse.json(
      { message: "Search entry is too long" },
      { status: 403 }
    );
  }

  try {
    const results = await vectorSearch(query);

    // Reduce network payload size for users
    const records = JSON.parse(JSON.stringify(results))["records"];
    records.forEach((book: Record<string, any>) => {
      delete book.id;
      delete book.embeddings;
      //delete book.xata;
      //console.log(book);
    });

    return NextResponse.json({ records });
  } catch (error) {
    return NextResponse.json(
      { message: "A strange error has ocurred" },
      { status: 500 }
    );
  }
}
