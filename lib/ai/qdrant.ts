import { QdrantClient } from "@qdrant/js-client-rest";

export const QDRANT_COLLECTION_NAME = "knowledge_base";

export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY,
});

export async function initQdrantCollection() {
  try {
    const result = await qdrantClient.getCollections();
    const exists = result.collections.some(
      (collection) => collection.name === QDRANT_COLLECTION_NAME
    );

    if (!exists) {
      await qdrantClient.createCollection(QDRANT_COLLECTION_NAME, {
        vectors: {
          size: 1536,
          distance: "Cosine",
        },
      });
      console.log(`Created collection: ${QDRANT_COLLECTION_NAME}`);
    } else {
      console.log(`Collection ${QDRANT_COLLECTION_NAME} already exists`);
    }

    // Create payload index for document_id to allow deletion by filter
    // Qdrant requires an index for filtering in delete operations
    await qdrantClient.createPayloadIndex(QDRANT_COLLECTION_NAME, {
      field_name: "document_id",
      field_schema: "keyword", // Use keyword for exact UUID matching
      wait: true,
    });
    console.log("Verified payload index for document_id");

    // Create payload index for user_id to allow filtering by user
    await qdrantClient.createPayloadIndex(QDRANT_COLLECTION_NAME, {
      field_name: "user_id",
      field_schema: "keyword",
      wait: true,
    });
    console.log("Verified payload index for user_id");

  } catch (error) {
    console.error("Failed to check/create Qdrant collection:", error);
    throw error;
  }
}

export async function retrieveRelevantChunks(
  embedding: number[],
  userId: string,
  limit = 5
) {
  console.log(`Searching Qdrant for user: ${userId}`);
  
  try {
    const results = await qdrantClient.search(QDRANT_COLLECTION_NAME, {
      vector: embedding,
      limit,
      filter: {
        must: [
          {
            key: "user_id",
            match: {
              value: userId,
            },
          },
        ],
      },
      with_payload: true,
    });

    console.log(`Qdrant search found ${results.length} results`);
    if (results.length > 0) {
        console.log(`Top result score: ${results[0].score}`);
    }

    return results;
  } catch (error: any) {
    console.error("Failed to search Qdrant:", error);
    if (error?.data) {
        console.error("Qdrant search error details:", JSON.stringify(error.data, null, 2));
    }
    throw error;
  }
}

export async function deleteDocumentsByDocumentId(documentId: string) {
  try {
    // Ensure documentId is valid
    if (!documentId) return;

    // Use specific points deletion endpoint via client helper
    // The library method 'delete' typically calls /points/delete
    // Payload should be { filter: { ... } }
    const result = await qdrantClient.delete(QDRANT_COLLECTION_NAME, {
      filter: {
        must: [
          {
            key: "document_id",
            match: {
              value: documentId,
            },
          },
        ],
      },
      wait: true,
    });

    console.log("Qdrant delete result:", result);
    return result;
  } catch (error: any) {
    console.error("Failed to delete documents from Qdrant:", error);
    if (error?.data) {
        console.error("Qdrant error details:", JSON.stringify(error.data, null, 2));
    }
    // Don't throw logic error to break the whole delete flow if only Qdrant fails
    // or maybe we should? For now, we allow partial failure but log it.
    // throw error; 
  }
}
