import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText, tool } from "ai";

// Remove fs import as we won't need it
// import fs from "fs";

import { saveMessages } from "@/lib/utils/chat";
import {
  getAndCreateChat,
  getFilesWithMetadataFromDB,
  SummarizeText,
} from "./helper";
import { z } from "zod";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  try {
    //Request body
    const { messages, chatId, language } = await req.json();

    // Default values for generic version
    const clientId = "global-public-context";
    const userId = "public-user"; // Or generate a session ID if needed

    //Convert messages from ui messages to core messages
    const coreMessages = convertToCoreMessages(messages);

    // Ensure chat exists (simplified for public usage)
    await getAndCreateChat(chatId, messages, userId, clientId);

    let collectedReasoning = "";
    const stream = streamText({
      model: openai("gpt-4o"), // Switched to cheaper/faster model for generic chat, or keep user preference
      system: `You are a helpful, witty, and intelligent AI Assistant.
      You are designed to assist users with their questions, creative writing, and general tasks.
      You have a modern, "cool" personality but remain professional.
      
      You have access to a File Knowledge Base.
      - If the user asks about uploaded files, use the 'list_files' or 'read_files' tools.
      - If the user just wants to chat, just chat naturally.
      - Always respond in this language: ${language || "English"}
      `,
      messages: coreMessages,
      tools: tools(clientId, "Generic"),
      toolChoice: "auto",
      maxSteps: 5,
      onChunk: async (chunk: any) => {
        if (chunk.chunk.type === "reasoning") {
          collectedReasoning += chunk.chunk.textDelta || "";
        }
      },
      onStepFinish: async (step: any) => {
         // Optional: Keep the debug step logging if useful
        const filePath = path.join(process.cwd(), "step.json");
        fs.writeFileSync(filePath, JSON.stringify(step, null, 2));
      },
      onError: async (error: any) => {
        console.log("Error", error);
      },
      onFinish: async ({ response }: { response: any }) => {
        const finalMessages = [...messages, ...response.messages];
        // Save messages using the dummy user/client
        await saveMessages(chatId, clientId, finalMessages);
      },
    });

    return stream.toDataStreamResponse({
      sendReasoning: true,
      getErrorMessage: () => {
        return `An error occurred, please try again!`;
      },
    });
  } catch (error) {
    console.log(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Simplified GET to just return empty or dummy, as we are doing session persistence on frontend mostly
// But if we want to support reload-persistence, we might keep this.
// For now, let's keep it but remove Auth.
export async function GET(request: Request) {
    // In a real "no-auth" app, we might rely on a session cookie or localstorage ID passed as a param.
    // For now, return empty or mock.
    return new Response(JSON.stringify({ chats: [] }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
 
const tools = (clientId: string, contractType: string) => {
  return {
    read_files: tool({
      description: "Reads a specific file and returns its content",
      parameters: z.object({
        fileLink: z.string().describe("link of the file to read"),
        userQuery: z.string().describe("Exactly Original user query"),
      }),
      execute: async ({ fileLink, userQuery }: { fileLink: string, userQuery: string }) => {
        const fileContent = await fetch(fileLink).then((res) =>
          res.arrayBuffer()
        );
        const fileBuffer = Buffer.from(fileContent);
        const summary = await SummarizeText(fileBuffer, userQuery);
        return summary;
      },
    }),
    list_files: tool({
      description: "Lists all available files with metadata",
      parameters: z.object({}),
      execute: async () => {
        // return await ();
        return await getFilesWithMetadataFromDB(clientId, contractType);
      },
    }),
  };
};
