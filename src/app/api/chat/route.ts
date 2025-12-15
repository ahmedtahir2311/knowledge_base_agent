import { qdrantClient, COLLECTION_NAME } from "@/lib/qdrant";
import { openai } from "@ai-sdk/openai";
import { streamText, tool, embed } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const retrieveKnowledge = (tool as any)({
    description: "Search the knowledge base for relevant information",
    parameters: z.object({
      query: z.string().describe("The search query to find relevant context"),
    }),
    execute: async ({ query }: { query: string }) => {
      try {
        // Create embedding for query
        const { embedding } = await embed({
          model: openai.embedding("text-embedding-3-small"),
          value: query,
        });

        // Search Qdrant
        const searchResults = await qdrantClient.query(COLLECTION_NAME, {
          query: embedding,
          limit: 5,
          with_payload: true,
        });

        return searchResults.points.map((hit: any) => ({
          text: hit.payload?.text,
          source: hit.payload?.fileName,
          score: hit.score,
        }));
      } catch (error) {
        console.error("Search error:", error);
        return [];
      }
    },
  }) as any;

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: `You are a helpful knowledge base assistant. 
    You have access to a knowledge base of uploaded documents.
    ALWAYS use the 'retrieveKnowledge' tool to find information before answering questions about specific topics.
    If the tool returns relevant information, use it to answer the user's question.
    If the tool returns nothing relevant, admit you don't know based on the documents.`,
    tools: {
      retrieveKnowledge,
    },
  });

  return result.toUIMessageStreamResponse();
}
