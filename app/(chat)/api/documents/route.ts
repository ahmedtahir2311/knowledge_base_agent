import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/drizzle";
import { knowledgeDocument } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { deleteDocumentsByDocumentId } from "@/lib/ai/qdrant";
import { del } from "@vercel/blob";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const docs = await db
    .select()
    .from(knowledgeDocument)
    .where(eq(knowledgeDocument.userId, session.user.id))
    .orderBy(desc(knowledgeDocument.createdAt));

  return Response.json(docs);
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const [doc] = await db
    .select()
    .from(knowledgeDocument)
    .where(and(eq(knowledgeDocument.id, id), eq(knowledgeDocument.userId, session.user.id)));

  if (!doc) {
    return new Response("Not found", { status: 404 });
  }

  try {
    await deleteDocumentsByDocumentId(id);

    if (doc.blobUrl) {
      await del(doc.blobUrl);
    }

    await db.delete(knowledgeDocument).where(eq(knowledgeDocument.id, id));

    return Response.json({ success: true });
  } catch (error) {
    console.error("Delete failed:", error);
    return new Response("Deletion failed", { status: 500 });
  }
}
