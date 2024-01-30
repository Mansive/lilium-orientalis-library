import { getXataClient } from "@/lib/xata";

const xata = getXataClient();

export async function search(query: string) {
  return await xata.db.Books.search(query, {
    target: ["title"],
    prefix: "phrase",
    fuzziness: 0,
    page: { size: 35, offset: 0 },
  });
}

export async function vectorSearch(query: string) {
  const results = await fetch("https://api.mixedbread.ai/v1/embeddings/", {
    method: "POST",
    body: JSON.stringify({
      texts: [query],
      model: "multilingual-e5-large",
      instruction: "query"
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.EMBAAS_API_KEY,
    },
  });

  const embeddings = await results.json();

  return await xata.db.Books.vectorSearch(
    "embeddings",
    embeddings["data"][0]["embedding"],
    {
      similarityFunction: "cosineSimilarity",
      size: 35,
    }
  );
}
