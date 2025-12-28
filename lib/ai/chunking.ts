export function chunkText(
  text: string,
  maxChars: number = 2000,
  overlap: number = 200
): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + maxChars;

    if (endIndex < text.length) {
      // Find the last period, newline, or space to split cleanly
      const lastPeriod = text.lastIndexOf(".", endIndex);
      const lastNewline = text.lastIndexOf("\n", endIndex);
      const lastSpace = text.lastIndexOf(" ", endIndex);

      const splitIndex = Math.max(lastPeriod, lastNewline, lastSpace);

      // Only use splitIndex if it's reasonably close to the end (e.g., within last 20%)
      // or at least better than splitting in the middle of a word (lastSpace)
      if (splitIndex > startIndex + maxChars * 0.5) {
        endIndex = splitIndex + 1; // Include the delimiter
      }
    }

    const chunk = text.slice(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    startIndex = endIndex - overlap;

    // Prevent infinite loop if overlap is too large or progress isn't made
    if (startIndex >= text.length) break;
    if (startIndex <= endIndex - maxChars) {
        // We are stuck, force move
        startIndex = endIndex; 
    }
  }

  return chunks;
}
