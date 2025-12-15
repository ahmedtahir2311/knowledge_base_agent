import { NextResponse, NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { clerkClient, auth } from "@clerk/nextjs/server";
import { loadModels } from "@/lib/utils";
import { deleteChat } from "@/lib/utils/chat";
import {
  isSupportedFileType,
  deleteFile,
  uploadFile,
} from "../files-upload/helper";
import path from "path";
import z from "zod";
import fs from "fs";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const clientName = formData.get("clientName");
    const country = formData.get("country");
    const instructions = formData.get("instructions");
    const contractType = formData.get("contractType");
    const files = formData.getAll("files") as File[];

    const { ClientModel } = await loadModels();
    const clientId = uuidv4();

    //Making New Files Vectors
    let fileVector: any[] = [];
    for (const file of files) {
      // Check if file type is supported
      if (!isSupportedFileType(file.type)) {
        return NextResponse.json(
          {
            error: `File type ${file.type} is not supported. Please upload PDF, DOCX, or TXT files.`,
          },
          { status: 400 }
        );
      }

      const { fileLink, fileName, file_id, filePath } = await uploadFile(
        file,
        "Clients",
        clientName as string
      );

      // Use gpt-4o model which has better PDF support
      const { object } = await generateObject({
        model: openai.chat("gpt-4.1-2025-04-14"),
        messages: [
          {
            role: "system",
            content: `You are a professional document analyst.
            You are given the full content of a file. Your task is to:
            1. Write a clear and concise summary of the file in 250–300 words.
            2. Explain what kind of questions this file would be most useful for answering, based on its contents.
            Be precise, formal, and informative. Do not make up content. Mention specific sections or types of data if relevant (e.g., tables, clauses, client details).`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please generate the summary and potential uses of this document as instructed above.",
              },
              {
                type: "file",
                data: fs.readFileSync(
                  path.join(process.cwd(), "public", filePath)
                ),
                mimeType: file.type,
                filename: fileName,
              },
            ],
          },
        ],
        schema: z.object({
          summary: z.string(),
          tags: z.array(z.string()),
        }),
      });

      fileVector.push({
        file_id,
        file_name: fileName,
        file_link: fileLink,
        file_path: filePath,
        type: file.type,
        size: file.size,
        summary: object.summary,
        tags: object.tags,
      });
    }

    const client = {
      userId,
      clientId,
      clientName,
      country,
      instructions,
      contractType,
      files: fileVector,
    };

    const newClient = await ClientModel.create(client);

    return NextResponse.json(
      {
        success: true,
        message: "Client created successfully.",
        user: userId,
        client: newClient,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error while Creating Client:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId");
    const { ClientModel } = await loadModels();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerk = await clerkClient();
    if (!clerk) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const clients = clientId
      ? await ClientModel.findOne({ userId, clientId })
      : await ClientModel.find({ userId });

    return NextResponse.json(clientId ? { client: clients } : { clients }, {
      status: 200,
    });
  } catch (error: any) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerk = await clerkClient();
    if (!clerk) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clientId } = await request.json();
    const { ClientModel } = await loadModels();

    const client = await ClientModel.findOne({ userId, clientId });

    if (client) {
      for (const file of client.files) {
        await deleteFile(file);
      }
    }
    if (client) {
      await deleteChat(userId, true, clientId);
    }

    await ClientModel.findOneAndDelete({ userId, clientId });

    return NextResponse.json(
      { success: true, message: "Client deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerk = await clerkClient();
    if (!clerk) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const clientId = formData.get("clientId") as string;
    const clientName = formData.get("clientName") as string;
    const country = formData.get("country") as string;
    const instructions = formData.get("instructions") as string;
    const contractType = formData.get("contractType") as string;
    const files = formData.getAll("files") as File[];
    const filesToDeleteJson = formData.get("filesToDelete") as string;

    if (!clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }
    const { ClientModel } = await loadModels();

    const client = await ClientModel.findOne({ userId, clientId });

    // Process files to delete
    if (filesToDeleteJson) {
      try {
        const filesToDelete = JSON.parse(filesToDeleteJson) as any[];

        // Delete files from vector database
        for (const file of filesToDelete) {
          await deleteFile(file);
        }

        // Remove deleted files from client's files array
        const filesToDeleteIds = filesToDelete.map(
          (file) => file.file_id // Create a unique identifier for each file
        );

        client.files = client.files.filter(
          (file: any) => !filesToDeleteIds.includes(file.file_id)
        );
      } catch (error) {
        console.error("Error processing files to delete:", error);
        return NextResponse.json(
          { error: "Invalid filesToDelete format" },
          { status: 400 }
        );
      }
    }

    // // Process new files
    let newFileVectors: any[] = [];
    if (files && files.length > 0) {
      for (const file of files) {
        // Check if file type is supported
        if (!isSupportedFileType(file.type)) {
          return NextResponse.json(
            {
              error: `File type ${file.type} is not supported. Please upload PDF, DOCX, or TXT files.`,
            },
            { status: 400 }
          );
        }

        const { fileLink, fileName, file_id, filePath } = await uploadFile(
          file,
          "Clients",
          clientName as string
        );

        // Use gpt-4o model which has better PDF support
        const { object } = await generateObject({
          model: openai.chat("gpt-4.1-2025-04-14"),
          messages: [
            {
              role: "system",
              content: `You are a professional document analyst.
            You are given the full content of a file. Your task is to:
            1. Write a clear and concise summary of the file in 250–300 words.
            2. Explain what kind of questions this file would be most useful for answering, based on its contents.
            Be precise, formal, and informative. Do not make up content. Mention specific sections or types of data if relevant (e.g., tables, clauses, client details).`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Please generate the summary and potential uses of this document as instructed above.",
                },
                {
                  type: "file",
                  data: fs.readFileSync(
                    path.join(process.cwd(), "public", filePath)
                  ),
                  mimeType: file.type,
                  filename: fileName,
                },
              ],
            },
          ],
          schema: z.object({
            summary: z.string(),
            tags: z.array(z.string()),
          }),
        });

        newFileVectors.push({
          file_id,
          file_name: fileName,
          file_link: fileLink,
          file_path: filePath,
          type: file.type,
          size: file.size,
        });
      }

      // Add new files to client's files array
      client.files = [...client.files, ...newFileVectors];
    }

    // // Update client information
    const updatedClient = {
      ...client,
      clientName,
      country,
      instructions,
      contractType,
    };

    await ClientModel.findOneAndUpdate({ userId, clientId }, updatedClient);

    return NextResponse.json(
      {
        success: true,
        message: "Client updated successfully.",
        client: updatedClient,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating client:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
