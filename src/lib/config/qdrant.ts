import { QdrantClient } from "@qdrant/js-client-rest";

console.log("Qdrant URL:", process.env.QDRANT_URL);
console.log(
  "Qdrant API Key configured:",
  process.env.QDRANT_API_KEY ? "Yes" : "No"
);

// Ensure the URL is properly formatted for HTTPS with no trailing slash
let qdrantUrl = process.env.QDRANT_URL || "";
if (qdrantUrl.endsWith("/")) {
  qdrantUrl = qdrantUrl.slice(0, -1);
}

const qdrantClient = new QdrantClient({
  url: qdrantUrl,
  port: 443, // Use 443 for HTTPS
  apiKey: process.env.QDRANT_API_KEY,
  https: true, // Force HTTPS
  checkCompatibility: false,
  timeout: 300000,
});

export { qdrantClient };
