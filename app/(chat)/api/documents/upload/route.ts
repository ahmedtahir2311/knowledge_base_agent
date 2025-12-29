
import { auth } from "@/app/(auth)/auth";
import { generateEmbeddings } from "@/lib/ai/embedding";
import { chunkText } from "@/lib/ai/chunking";
import { qdrantClient, QDRANT_COLLECTION_NAME } from "@/lib/ai/qdrant";
import { db } from "@/lib/db/drizzle";
import { knowledgeDocument, documentChunk } from "@/lib/db/schema";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { after } from "next/server";
// @ts-ignore
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";


export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");
  const type = searchParams.get("type");

  if (!request.body || !filename) {
    return new Response("No file provided", { status: 400 });
  }

  // Manually read stream to bypass Next.js 10MB limit on request.arrayBuffer()
  const chunks = [];
  const reader = request.body.getReader();
  let receivedLength = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    receivedLength += value.length;
  }

  const reqBuffer = Buffer.concat(chunks);
  const reqArrayBuffer = reqBuffer.buffer.slice(reqBuffer.byteOffset, reqBuffer.byteOffset + reqBuffer.byteLength) as ArrayBuffer;

  console.log("Upload received manual stream size:", receivedLength);

  // Create a file-like object to maintain compatibility with existing logic
  const file = new File([reqArrayBuffer], filename, { type: type || "application/octet-stream" });

  if (!file) {
    return new Response("No file provided", { status: 400 });
  }

  if (file.size > 50 * 1024 * 1024) {
    return new Response("File too large (max 50MB)", { status: 400 });
  }

  // Create document record
  const [doc] = await db
    .insert(knowledgeDocument)
    .values({
      userId: session.user.id,
      title: file.name,
      blobUrl: "", // pending
      status: "processing",
      metadata: {
        size: file.size,
        type: file.type,
      },
    })
    .returning();

  // Background processing
  after(async () => {
    try {
      const buffer = Buffer.from(reqArrayBuffer);
      console.log("Processing buffer size:", buffer.length);
      let textContent = "";

      if (file.type === "application/pdf") {
        // Configure worker for Node.js environment
        pdfjsLib.GlobalWorkerOptions.workerSrc = await import("path").then((path) => 
          path.join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs")
        );

        const uint8Array = new Uint8Array(buffer);
        const loadingTask = pdfjsLib.getDocument({
          data: uint8Array,
          useSystemFonts: true,
          disableRange: true,
          disableStream: true,
        });

        const pdfDocument = await loadingTask.promise;
        const numPages = pdfDocument.numPages;
        
        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDocument.getPage(i);
          const textContentParams = await page.getTextContent();
          const pageText = textContentParams.items
            .map((item: any) => item.str)
            .join(" ");
          textContent += pageText + "\n";
        }
      } else {
        textContent = buffer.toString("utf-8");
      }

      // Upload to Blob (if configured)
      let blobUrl = "";
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          const blob = await put(file.name, file, { access: "public" });
          blobUrl = blob.url;
        } catch (e) {
          console.error("Blob upload failed:", e);
        }
      }

      // Chunking
      const chunks = chunkText(textContent);

      // Embeddings
      const embeddings = await generateEmbeddings(chunks);

      // Prepare Qdrant points
      const points = chunks.map((chunk, i) => {
        const chunkId = crypto.randomUUID();
        return {
          id: chunkId,
          vector: embeddings[i],
          payload: {
            document_id: doc.id,
            chunk_index: i,
            content: chunk,
            user_id: session.user.id,
          },
        };
      });

      // Upsert to Qdrant
      // Upsert to Qdrant in batches
      const BATCH_SIZE = 50;
      for (let i = 0; i < points.length; i += BATCH_SIZE) {
        const batch = points.slice(i, i + BATCH_SIZE);
        console.log(`Upserting Qdrant batch ${i / BATCH_SIZE + 1} of ${Math.ceil(points.length / BATCH_SIZE)}`);
        await qdrantClient.upsert(QDRANT_COLLECTION_NAME, {
          wait: true,
          points: batch,
        });
      }

      // Save chunks to DB in batches
      if (chunks.length > 0) {
        const DB_BATCH_SIZE = 500;
        for (let i = 0; i < points.length; i += DB_BATCH_SIZE) {
            const batch = points.slice(i, i + DB_BATCH_SIZE);
             await db.insert(documentChunk).values(
                batch.map((p, index) => ({
                    documentId: doc.id,
                    chunkIndex: i + index,
                    content: p.payload!.content as string,
                    tokenCount: 0, 
                }))
            );
        }
      }

      // Update document status
      await db
        .update(knowledgeDocument)
        .set({
          status: "completed",
          blobUrl: blobUrl,
        })
        .where(eq(knowledgeDocument.id, doc.id));

    } catch (error) {
      console.error("Processing failed:", error);
      await db
        .update(knowledgeDocument)
        .set({ status: "failed" })
        .where(eq(knowledgeDocument.id, doc.id));
    }
  });

  return Response.json({ id: doc.id, status: "processing" });
}
