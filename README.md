# Knowledge Base Agent

## AI-Powered Chatbot with Document Management

A powerful AI chatbot built with Next.js and OpenAI, featuring document creation, code execution, and real-time collaboration.

## Features

- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering and increased performance
- [AI SDK](https://ai-sdk.dev/docs/introduction)
  - Unified API for generating text, structured objects, and tool calls with LLMs
  - Hooks for building dynamic chat and generative user interfaces
  - Direct OpenAI integration
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility and flexibility
- Data Persistence
  - PostgreSQL for saving chat history and user data
  - Vercel Blob for efficient file storage
- [Auth.js](https://authjs.dev)
  - Simple and secure authentication

## Model Provider

This application uses **OpenAI** models directly:

- **GPT-4o** - Most capable model
- **GPT-4o Mini** - Fast and cost-effective
- **O1 Mini** - Reasoning model for complex problems

## Running Locally

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- OpenAI API key

### Setup

1. **Clone and install dependencies:**

```bash
pnpm install
```

2. **Configure environment variables:**

Create a `.env.local` file with:

```bash
# OpenAI API Key (Required)
OPENAI_API_KEY=sk-your-openai-api-key

# PostgreSQL Database (Required)
POSTGRES_URL=postgresql://username:password@host:port/database

# Auth Secret (Required)
AUTH_SECRET=your-random-secret

# Optional
BLOB_READ_WRITE_TOKEN=your-blob-token
REDIS_URL=your-redis-url
```

3. **Run database migrations:**

```bash
pnpm db:migrate
```

4. **Start the development server:**

```bash
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000).

## Database Commands

```bash
pnpm db:generate    # Generate migrations
pnpm db:migrate     # Run migrations
pnpm db:studio      # Open Drizzle Studio
pnpm db:push        # Push schema changes
```

## Production Build

```bash
pnpm build
pnpm start
```
