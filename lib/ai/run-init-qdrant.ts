import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { initQdrantCollection } = await import("./qdrant");
  console.log("Initializing Qdrant...");
  await initQdrantCollection();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
