
import { config } from "dotenv";
config({ path: ".env.local" });

import { getQdrantClient, QDRANT_COLLECTION_NAME } from "./qdrant";

async function main() {
  const client = getQdrantClient();
  console.log(`Inspecting collection: ${QDRANT_COLLECTION_NAME}`);
  
  try {
    const response = await client.scroll(QDRANT_COLLECTION_NAME, {
      limit: 10,
      with_payload: true,
    });
    
    console.log(`Found ${response.points.length} points.`);
    response.points.forEach((p, i) => {
      console.log(`Point ${i} ID: ${p.id}`);
      console.log(`Payload:`, JSON.stringify(p.payload, null, 2));
    });

  } catch (error) {
    console.error("Error inspecting Qdrant:", error);
  }
}

main();
