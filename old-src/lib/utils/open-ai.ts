import { openai } from "@/lib/config/open-ai";
import { searchVectorDatabase } from "./qudrant";

const createVectors = async (element: string, maxRetries = 5) => {
  let retries = 0;
  let lastError;

  while (retries < maxRetries) {
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: element,
      });
      return embeddingResponse.data[0].embedding;
    } catch (error) {
      lastError = error;
      retries++;

      // Log the retry attempt
      console.log(
        `Embedding API call failed (attempt ${retries}/${maxRetries}):`,
        error
      );

      if (retries >= maxRetries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, 16s
      const delay = Math.min(1000 * Math.pow(2, retries - 1), 16000);
      console.log(`Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError;
};

const getDocsContext = async (
  query: string,
  clientId: string,
  contractType: string,
  limit?: number
) => {
  const queryVector = await createVectors(query);

  const { general, contract, client } = await searchVectorDatabase(
    queryVector,
    clientId,
    contractType,
    limit
  );

  console.log(
    "contract",
    contract.points.map((x) => x.payload)
  );
  const results = [
    ...general.points.map((x) => ({
      ...x.payload,
    })),
    ...contract.points.map((x) => ({
      ...x.payload,
    })),
    ...client.points.map((x) => ({
      ...x.payload,
    })),
  ];

  return results;
};

export { getDocsContext, createVectors };
