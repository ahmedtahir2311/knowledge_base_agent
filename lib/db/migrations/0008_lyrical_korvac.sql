CREATE TABLE IF NOT EXISTS "DocumentChunk" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"documentId" uuid NOT NULL,
	"chunkIndex" integer NOT NULL,
	"content" text NOT NULL,
	"tokenCount" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "KnowledgeDocument" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"title" text NOT NULL,
	"blobUrl" text NOT NULL,
	"status" varchar DEFAULT 'processing' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"metadata" json
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_KnowledgeDocument_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."KnowledgeDocument"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "KnowledgeDocument" ADD CONSTRAINT "KnowledgeDocument_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "Chat" DROP COLUMN IF EXISTS "lastContext";