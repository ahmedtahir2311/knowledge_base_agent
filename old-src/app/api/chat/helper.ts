import { openai } from "@ai-sdk/openai";
import { generateObject, generateText, streamText } from "ai";
import { Message } from "ai";
import pdf from "pdf-parse-new";
import { saveChat, saveMessages } from "@/lib/utils/chat";
import { getChatById } from "@/lib/utils/chat";
import { loadModels } from "@/lib/utils";
import {
  parseUnstructuredFile,
  processFileWithUnstructured,
} from "@/lib/utils/unstructure-io";
import { z } from "zod";

async function generateTitleFromUserMessage({ message }: { message: Message }) {
  const { text: title } = await generateText({
    model: openai("gpt-4.1-nano-2025-04-14"),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export const getAndCreateChat = async (
  id: string,
  messages: any,
  userId: string,
  clientId: string
) => {
  if (!id || !clientId || !userId) {
    console.error("Missing required parameters:", { id, clientId, userId });
    throw new Error("Missing required parameters for chat creation");
  }

  //Get chat from db
  const chat = await getChatById(id, clientId);

  //If chat is not found, generate title and save chat and messages
  if (!chat) {
    try {
      if (!messages || messages.length === 0) {
        throw new Error("No messages provided for chat creation");
      }

      const title = await generateTitleFromUserMessage({
        message: messages[0].content,
      });

      // First save the chat
      await saveChat(id, clientId, userId, title);

      // Then save the initial messages
      await saveMessages(id, clientId, messages);

      return true;
    } catch (error) {
      console.error("Error in creating chat:", error);
      throw new Error(
        `Failed to create chat: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  return true;
};

export const getFilesWithMetadataFromDB = async (
  clientId: string,
  contractType: string
) => {
  try {
    const { LayerModel, ClientModel } = await loadModels();

    const generalLayerFiles = await LayerModel.aggregate([
      { $match: { layerLevel: "General" } },
      { $project: { files: 1, _id: 0 } },
      { $unwind: "$files" },
      { $replaceRoot: { newRoot: "$files" } },
    ]);

    const contractLayerFiles = await LayerModel.aggregate([
      { $match: { layerName: contractType } },
      { $project: { files: 1, _id: 0 } },
      { $unwind: "$files" },
      { $replaceRoot: { newRoot: "$files" } },
    ]);

    const ClientLayerFiles = await ClientModel.aggregate([
      { $match: { clientId: clientId } },
      { $project: { files: 1, _id: 0 } },
      { $unwind: "$files" },
      { $replaceRoot: { newRoot: "$files" } },
    ]);

    return [
      ...generalLayerFiles,
      ...contractLayerFiles,
      ...ClientLayerFiles,
    ].map((x) => ({
      ...x,
      file_link: x.file_link.replace(
        "https://localhost:3000",
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      ),
    }));
  } catch (error) {
    console.error("Error in getting files with metadata:", error);
    throw new Error(
      `Failed to get files with metadata: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
};

export async function SummarizeText(filebuffer: Buffer, userQuery: string) {
  const { object } = await generateObject({
    model: openai.chat("gpt-4.1-2025-04-14"),
    messages: [
      {
        role: "system",
        content: `You are a senior Quantity Surveyor and Contracts Analyst.
        Your task is to summarize in 250-300 words ,the uploaded contract/report file with proper structure and references.
        - Always use markdown formatting (headings, bullets, code blocks)
        - Extract only relevant insights with relevant anchored references (key clauses, risk points, payment terms, etc.). e.g. [file_link](file_Name)[clause_number/page_number].
        - Always mention page numbers or clause numbers with clickable anchors e.g. [file_link](file_Name)[clause_number/page_number]`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `For the following User Query: ${userQuery}. Summarize the following PDF File`,
          },
          {
            type: "file",
            data: filebuffer,
            mimeType: "application/pdf",
            filename: "document.pdf",
          },
        ],
      },
    ],
    schema: z.object({
      summary: z.string(),
    }),
  });

  return object.summary; // return to the LLM in safe size
}
