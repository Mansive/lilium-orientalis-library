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
    // const results = await xata.db.Books.search(searchParams, {
    //   target: ["title"],
    //   prefix: "phrase",
    //   fuzziness: 0,
    //   page: { size: 35, offset: 0 },
    // });

    // Generate embeddings
    const embeddings = await fetch("https://api.embaas.io/v1/embeddings/", {
      method: "POST",
      body: JSON.stringify({
        texts: ["query: " + searchParams],
        model: "multilingual-e5-large",
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.EMBAAS_API_KEY,
      },
    }).then((response) => response.json());

    const results = await xata.db.Books.vectorSearch(
      "embeddings",
      embeddings["data"][0]["embedding"],
      {
        similarityFunction: "cosineSimilarity",
        size: 35,
      }
    );

    // Reduce network payload size for users
    const records = JSON.parse(JSON.stringify(results))["records"];
    records.forEach((book: Record<string, any>) => {
      delete book.id;
      delete book.embeddings;
      //delete book.xata;
      console.log(book);
    });

    return NextResponse.json({ records });
  } catch (error) {
    return NextResponse.json(
      { message: "A strange error has ocurred" },
      { status: 500 }
    );
  }
}
