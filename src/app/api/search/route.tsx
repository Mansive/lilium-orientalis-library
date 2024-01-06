import { getXataClient } from "@/lib/xata";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const xata = getXataClient();

export async function GET(request: NextRequest) {
  const searchParams: string = decodeURIComponent(
    request.nextUrl.searchParams.toString()
  );
  if (searchParams.length > 128) {
    return NextResponse.json(
      { message: "Search entry is too long" },
      { status: 403 }
    );
  }

  try {
    const results = await xata.db.Books.search(searchParams, {
      target: ["title"],
      fuzziness: 0,
      page: { size: 50, offset: 0 },
    });

    // Pasted from Copilot; could probably be done better
    const records = JSON.parse(JSON.stringify(results))["records"];
    records.forEach((book: Record<string, any>) => {
      delete book.id;
      delete book.embeddings;
      delete book.xata;
    });

    return NextResponse.json({ records });
  } catch (error) {
    return NextResponse.json(
      { message: "A strange error has ocurred" },
      { status: 500 }
    );
  }
}
