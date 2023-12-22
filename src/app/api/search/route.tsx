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

  const results = await xata.db.Books.search(searchParams, {
    target: ["title"],
    fuzziness: 0,
  });

  return NextResponse.json(results);
}
