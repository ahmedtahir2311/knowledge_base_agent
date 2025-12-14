import { QdrantClient } from "@qdrant/js-client-rest";

const url = process.env.QDRANT_URL;
const apiKey = process.env.QDRANT_API_KEY;

if (!url) {
  throw new Error("QDRANT_URL is not defined");
}

const urlObj = new URL(url);
const port = urlObj.port ? parseInt(urlObj.port) : (urlObj.protocol === "https:" ? 443 : 80);

export const qdrantClient = new QdrantClient({
  url,
  apiKey,
  port,
});

export const COLLECTION_NAME = "knowledge_base";
