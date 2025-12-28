import { embedMany, embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const embeddingModel = openai.embedding("text-embedding-3-small");

export async function generateEmbeddings(chunks: string[]) {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings;
}

export async function generateEmbedding(text: string) {
  const { embedding } = await embed({
    model: embeddingModel,
    value: text,
  });
  return embedding;
}
