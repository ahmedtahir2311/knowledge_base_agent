# Ultimate RAG Agent

A production-ready RAG application built with Next.js 15, Vercel AI SDK v5, and Qdrant.

## Features

- **Modern Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS.
- **AI Powered**: Vercel AI SDK v5 with OpenAI GPT-4o.
- **Vector Search**: Qdrant for high-performance vector retrieval.
- **Local Processing**: Fast, secure PDF parsing using `pdf-parse` (no external APIs).
- **Smart Chunking**: Intelligent text splitting for better context preservation.
- **Agentic RAG**: Uses AI tools to decide when to search the knowledge base.

## Setup

1.  **Environment Variables**:
    Ensure `.env.local` has the following:
    ```bash
    OPENAI_API_KEY=sk-...
    QDRANT_URL=http://your-qdrant-instance:6333
    QDRANT_API_KEY=your-key (optional)
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Build for Production**:
    ```bash
    npm run build
    npm start
    ```

## Architecture

- **`/api/upload`**: Handles PDF upload, text extraction, chunking, embedding (text-embedding-3-small), and Qdrant upsert.
- **`/api/chat`**: Handles chat stream. Uses `retrieveKnowledge` tool to query Qdrant when needed.
- **`src/lib/pdf-loader.ts`**: Local PDF processing logic.
- **`src/lib/qdrant.ts`**: Qdrant client configuration.
