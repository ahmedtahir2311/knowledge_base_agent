import { processPdf } from "@/lib/pdf-loader";
import { qdrantClient, COLLECTION_NAME } from "@/lib/qdrant";
import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Invalid file" }, { status: 400 });
    }

    console.log(`Processing file: ${file.name}`);
    const chunks = await processPdf(file);
    console.log(`Generated ${chunks.length} chunks` , chunks);

    // Create embeddings
    const { embeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: chunks.map((c) => c.text),
    });

    // Ensure collection exists
    const collections = await qdrantClient.getCollections();
    if (!collections.collections.some((c) => c.name === COLLECTION_NAME)) {
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: { size: 1536, distance: "Cosine" },
      });
    }

    // Upload to Qdrant
    const points = chunks.map((chunk, i) => ({
      id: chunk.id,
      vector: embeddings[i],
      payload: {
        text: chunk.text,
        fileName: chunk.metadata.fileName,
        page: chunk.metadata.page,
      },
    }));

    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points,
    });

    return NextResponse.json({ success: true, chunks: chunks.length });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
