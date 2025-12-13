import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
import * as path from "path";
import { getProperFileExtension } from ".";
import { client } from "@/lib/config/unstructured";
import { Strategy } from "unstructured-client/sdk/models/shared";
import { splitPdfIntoChunks } from "./pdf-splitter";

interface UnstructuredElement {
  [key: string]: any;
}

interface ProcessedFile {
  elementsBlock: UnstructuredElement[];
  type?: string;
  size?: number;
}

/**
 * Processes a single file using the Unstructured.io API
 * @param file The file to process
 * @param chunkPdfPages If true and file is PDF, split into smaller chunks (default: false)
 * @param pagesPerChunk Number of pages per chunk when splitting PDFs (default: 5)
 * @returns A ProcessedFile object or null if processing failed
 */
export async function parseUnstructuredFile(
  file: File,
  chunkPdfPages = false,
  pagesPerChunk = 5
): Promise<ProcessedFile | null> {
  console.log(
    `[UNSTRUCTURED] Starting to process file: ${file.name} (${file.size} bytes)`
  );
  const tmpDir = path.resolve("/tmp");
  let tempFilePath: string | null = null;

  try {
    if (!file) {
      throw new Error("No file provided");
    }

    // Ensure temp directory exists
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    // Save file temporarily
    const fileExtension = getProperFileExtension(file);
    console.log(`[UNSTRUCTURED] Detected file extension: ${fileExtension}`);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sanitizedFilename =
      file.name?.replace(/[^a-zA-Z0-9]/g, ".") || `document-${uuidv4()}`;
    tempFilePath = path.resolve(
      tmpDir,
      `${sanitizedFilename}.${fileExtension}`
    );
    fs.writeFileSync(tempFilePath, buffer);
    console.log(`[UNSTRUCTURED] Saved temporary file to: ${tempFilePath}`);

    // Read the file as a Buffer for the SDK
    const fileBuffer = fs.readFileSync(tempFilePath);

    // Determine file type for specific settings
    const isPdf = fileExtension.toLowerCase() === "pdf";
    const isOfficeDoc = ["docx", "doc", "pptx", "ppt", "xlsx", "xls"].includes(
      fileExtension.toLowerCase()
    );
    const isImage = ["jpg", "jpeg", "png", "tiff", "bmp", "gif"].includes(
      fileExtension.toLowerCase()
    );
    console.log(
      `[UNSTRUCTURED] File type: ${
        isPdf
          ? "PDF"
          : isOfficeDoc
          ? "Office Document"
          : isImage
          ? "Image"
          : "Other"
      }`
    );

    // For PDFs, optionally split into chunks and process each chunk
    if (isPdf && chunkPdfPages) {
      console.log(
        `Splitting PDF ${file.name} into chunks of ${pagesPerChunk} pages...`
      );
      try {
        const { chunks, chunkFilenames } = await splitPdfIntoChunks(
          fileBuffer,
          file.name || sanitizedFilename,
          pagesPerChunk
        );

        console.log(`Split PDF into ${chunks.length} chunks`);

        // Process each chunk and combine results
        const allElements: UnstructuredElement[] = [];

        for (let i = 0; i < chunks.length; i++) {
          console.log(
            `Processing PDF chunk ${i + 1}/${chunks.length}: ${
              chunkFilenames[i]
            }`
          );

          try {
            console.log(`[UNSTRUCTURED] Starting API call for chunk ${i + 1}`);
            const chunkResult = await processFileWithUnstructured(
              chunks[i],
              chunkFilenames[i],
              isPdf,
              isOfficeDoc,
              isImage
            );
            console.log(
              `[UNSTRUCTURED] API call successful for chunk ${i + 1}, got ${
                chunkResult?.length || 0
              } elements`
            );

            if (chunkResult) {
              allElements.push(...chunkResult);
            }
          } catch (chunkError: any) {
            console.error(
              `Error processing chunk ${i + 1}/${chunks.length}:`,
              chunkError
            );
            // Continue with next chunk even if this one fails
          }
        }

        if (allElements.length === 0) {
          throw new Error("Failed to process any PDF chunks successfully");
        }

        console.log(
          `[UNSTRUCTURED] Successfully processed all chunks, total elements: ${allElements.length}`
        );

        // Return combined results
        return {
          elementsBlock: allElements.map((block) => ({
            id: block.id,
            type: block.type,
            text: block.text,
            page_number: block.metadata.page_number,
            parent_id: block.metadata.parent_id,
            language: block.metadata.language,
          })),
          type: file.type,
          size: file.size,
        };
      } catch (splitError: any) {
        console.error("Error splitting PDF:", splitError);
        console.log("Falling back to processing entire PDF...");
        // Fall back to processing the entire file
      }
    }

    // Process the entire file (non-PDF or if PDF chunking failed/disabled)
    console.log(`[UNSTRUCTURED] Processing entire file: ${file.name}`);
    const data = await processFileWithUnstructured(
      fileBuffer,
      `${sanitizedFilename}.${fileExtension}`,
      isPdf,
      isOfficeDoc,
      isImage
    );

    if (!data || data.length === 0) {
      throw new Error("API returned no elements");
    }

    console.log(
      `[UNSTRUCTURED] Successfully processed file, got ${data.length} elements`
    );

    // Return processed file data
    return {
      elementsBlock: data.map((block) => ({
        id: block.id,
        type: block.type,
        text: block.text,
        page_number: block.metadata.page_number,
        parent_id: block.metadata.parent_id,
        language: block.metadata.language,
      })),
      type: file.type,
      size: file.size,
    };
  } catch (error: any) {
    console.error(`Error processing file ${file.name}:`, error);
    // Log more detailed network error information
    if (error.cause) {
      console.error("Error cause:", error.cause);
    }
    return null;
  } finally {
    // Cleanup: Delete temporary file
    try {
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log(
          `[UNSTRUCTURED] Cleaned up temporary file: ${tempFilePath}`
        );
      }
    } catch (cleanupError) {
      console.error("Error cleaning up temporary file:", cleanupError);
    }
  }
}

/**
 * Helper function to process a file buffer with Unstructured.io API
 */
export async function processFileWithUnstructured(
  fileBuffer: Buffer,
  fileName: string,
  isPdf: boolean,
  isOfficeDoc: boolean,
  isImage: boolean
): Promise<UnstructuredElement[]> {
  console.log(`[UNSTRUCTURED] Preparing API call for: ${fileName}`);

  // Process file with Unstructured SDK with type-specific parameters
  const partitionParams: any = {
    files: {
      content: fileBuffer,
      fileName: fileName,
    },
    strategy: Strategy.Auto,
    // Common parameters for all file types
    hierarchical: true,
    languages: ["eng"],
    include_page_breaks: true,
  };

  // Add file-type specific parameters
  console.log(
    `[UNSTRUCTURED] Sending request to Unstructured.io API with ${
      isPdf ? "PDF" : isOfficeDoc ? "Office" : isImage ? "Image" : "Standard"
    } settings`
  );

  try {
    const response = await client.general.partition({
      partitionParameters: {
        ...partitionParams,
        // PDF specific settings
        ...(isPdf && {
          splitPdfPage: true,
          splitPdfConcurrencyLevel: 3, // Reduced from 5 to be more conservative
          splitPdfAllowFailed: true,
          pdfInferTableStructure: true,
          // Additional PDF settings
          ocrEnabled: true,
          ocrLanguages: ["eng"],
          pdfDetectRotation: true,
        }),
        // Office document specific settings
        ...(isOfficeDoc && {
          xmlKeepTags: false,
          skipInferTableTypes: false,
        }),
        // Image specific settings
        ...(isImage && {
          ocrEnabled: true,
          ocrLanguages: ["eng"],
          imageDetectRotation: true,
        }),
      },
    });

    console.log(`[UNSTRUCTURED] API request successful for ${fileName}`);

    // The SDK returns the elements directly if successful
    if (!response) {
      throw new Error("API returned no response");
    }

    return response as unknown as UnstructuredElement[];
  } catch (apiError: any) {
    console.error(
      `[UNSTRUCTURED] API request failed for ${fileName}:`,
      apiError
    );
    console.error(`[UNSTRUCTURED] Error details:`, apiError.message);
    throw apiError;
  }
}
