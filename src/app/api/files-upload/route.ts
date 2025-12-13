import { loadModels } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { isSupportedFileType, uploadFile } from "./helper";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import fs from "fs";
import path from "path";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const { LayerModel } = await loadModels();

    const layerLevel = formData.get("layerLevel") as string;
    const layerName = formData.get("layerName") as string;
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

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
        layerLevel,
        layerName
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

    const newLayer = await LayerModel.findOneAndUpdate(
      { layerName: layerName, layerLevel: layerLevel },
      { $push: { files: { $each: fileVector } } },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Layer created successfully.",
        // layer: newLayer,
        newLayer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading documents:", error);

    return NextResponse.json(
      { error: "Failed to upload documents" },
      { status: 500 }
    );
  }
}
