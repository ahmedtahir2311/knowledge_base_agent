import { QdrantClient } from "@qdrant/js-client-rest";

export const QDRANT_COLLECTION_NAME = "knowledge_base";

// Helper to determine Qdrant config
function getQdrantConfig() {
  const unparsedUrl = process.env.QDRANT_URL || "http://localhost:6333";
  let url = unparsedUrl;
  let port = undefined;

  if (url.includes(":6333")) {
    url = url.replace(":6333", "");
    port = 80;
  }

  if (url.startsWith("http://") && !url.split("://")[1].includes(":")) {
    port = 80;
  }

  return {
    url,
    port,
    apiKey: process.env.QDRANT_API_KEY,
    timeout: 60000,
    checkCompatibility: false,
  };
}

// Export a function to get a fresh client instance to avoid socket closure issues
// with stale connections through proxies/load balancers.
export const getQdrantClient = () => {
    return new QdrantClient(getQdrantConfig());
};

// Deprecated export for backward compatibility during refactor, 
// using a getter catch accessing it if possible or just remove it.
// To avoid breaking external imports immediately, we can try to keep it but user reported socket issues.
// We really should force usage of getQdrantClient.
// I'll update the usages in this file first.

export async function initQdrantCollection() {
  const client = getQdrantClient();
  try {
    const result = await client.getCollections();
    const exists = result.collections.some(
      (collection) => collection.name === QDRANT_COLLECTION_NAME
    );

    if (!exists) {
      await client.createCollection(QDRANT_COLLECTION_NAME, {
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
    await client.createPayloadIndex(QDRANT_COLLECTION_NAME, {
      field_name: "document_id",
      field_schema: "keyword", // Use keyword for exact UUID matching
      wait: true,
    });
    console.log("Verified payload index for document_id");

    // Create payload index for user_id to allow filtering by user
    await client.createPayloadIndex(QDRANT_COLLECTION_NAME, {
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
  const client = getQdrantClient();
  
  try {
    const results = await client.search(QDRANT_COLLECTION_NAME, {
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
    const count = await client.count(QDRANT_COLLECTION_NAME);
    console.log(`Total points in collection: ${count.count}`);

    if (results.length > 0) {
        console.log(`Top result score: ${results[0].score}`);
    } else {
        // Double check total counts for user to debug "0 results"
        const userCount = await client.count(QDRANT_COLLECTION_NAME, {
          filter: { must: [{ key: "user_id", match: { value: userId } }] }
        });
        console.log(`Total points found for this user in DB: ${userCount.count}`);
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
    if (!documentId) return;
    const client = getQdrantClient();

    const result = await client.delete(QDRANT_COLLECTION_NAME, {
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
  }
}
