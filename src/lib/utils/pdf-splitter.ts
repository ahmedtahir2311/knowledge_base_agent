import * as fs from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { PDFDocument } from "pdf-lib";

/**
 * Splits a PDF file into smaller chunks using pdf-lib
 * @param pdfBuffer The PDF file buffer to split
 * @param originalFilename Original filename for naming chunks
 * @param pagesPerChunk Number of pages per chunk (default: 5)
 * @returns Array of file buffers for each chunk and their filenames
 */
export async function splitPdfIntoChunks(
  pdfBuffer: Buffer,
  originalFilename: string,
  pagesPerChunk = 5
): Promise<{ chunks: Buffer[]; chunkFilenames: string[] }> {
  const tmpDir = path.resolve("/tmp");
  const uniqueId = uuidv4();
  const sanitizedFilename =
    originalFilename.replace(/[^a-zA-Z0-9]/g, ".") || `document-${uniqueId}`;

  // Ensure temp directory exists
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  try {
    // Load the PDF document
    const srcPdfDoc = await PDFDocument.load(pdfBuffer);
    const totalPages = srcPdfDoc.getPageCount();

    if (totalPages <= 0) {
      throw new Error("PDF has no pages");
    }

    const chunks: Buffer[] = [];
    const chunkFilenames: string[] = [];

    // Split the PDF into chunks
    for (
      let startPage = 0;
      startPage < totalPages;
      startPage += pagesPerChunk
    ) {
      // Create a new PDF document for this chunk
      const chunkPdfDoc = await PDFDocument.create();

      // Calculate the end page for this chunk
      const endPage = Math.min(startPage + pagesPerChunk, totalPages);

      // Copy pages from the source document to the chunk
      const pagesToCopy = Array.from(
        { length: endPage - startPage },
        (_, i) => startPage + i
      );

      // Copy the pages
      const copiedPages = await chunkPdfDoc.copyPages(srcPdfDoc, pagesToCopy);
      copiedPages.forEach((page) => chunkPdfDoc.addPage(page));

      // Save the chunk to a buffer
      const chunkBuffer = Buffer.from(await chunkPdfDoc.save());

      // Create a filename for this chunk
      const chunkFilename = `${sanitizedFilename}-chunk-${
        startPage + 1
      }-${endPage}.pdf`;

      chunks.push(chunkBuffer);
      chunkFilenames.push(chunkFilename);
    }

    return { chunks, chunkFilenames };
  } catch (error) {
    console.error("Error splitting PDF:", error);
    throw error;
  }
}

/**
 * Fallback method using PDF.js if pdftk is not available
 * This is a placeholder - you would need to implement this with PDF.js
 */
export async function splitPdfWithoutPdftk(
  pdfBuffer: Buffer,
  pagesPerChunk = 5
): Promise<Buffer[]> {
  // This would require PDF.js or another PDF library
  // Placeholder for future implementation
  throw new Error("PDF.js implementation not available");
}
