import PDFParser from "pdf2json";

export interface Chunk {
  id: string;
  text: string;
  metadata: {
    page: number;
    fileName: string;
  };
}

export async function processPdf(file: File): Promise<Chunk[]> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const text = await new Promise<string>((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      reject(new Error(errData.parserError));
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      const rawText = pdfParser.getRawTextContent();
      resolve(rawText);
    });

    pdfParser.parseBuffer(buffer);
  });

  // Smart chunking
  const chunks: Chunk[] = [];
  const chunkSize = 1000;
  const overlap = 200;

  // Clean up text (pdf2json might leave some artifacts)
  const cleanText = text.replace(/----------------Page \(\d+\) Break----------------/g, "\n");

  // Improved chunking logic
  let startIndex = 0;
  while (startIndex < cleanText.length) {
    const endIndex = Math.min(startIndex + chunkSize, cleanText.length);
    let chunkText = cleanText.slice(startIndex, endIndex);

    // Try to break at a sentence or paragraph end if possible
    if (endIndex < cleanText.length) {
      const lastPeriod = chunkText.lastIndexOf(".");
      const lastNewline = chunkText.lastIndexOf("\n");
      const breakPoint = Math.max(lastPeriod, lastNewline);
      
      if (breakPoint > chunkSize * 0.5) { // Only if it's not too early
        chunkText = chunkText.slice(0, breakPoint + 1);
        startIndex += breakPoint + 1 - overlap; // Overlap
      } else {
        startIndex += chunkSize - overlap;
      }
    } else {
      startIndex = cleanText.length; // End of loop
    }

    chunks.push({
      id: crypto.randomUUID(),
      text: chunkText.trim(),
      metadata: {
        page: 1, // pdf2json gives full text, page mapping is complex
        fileName: file.name,
      },
    });
  }

  return chunks;
}
