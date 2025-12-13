import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import connectToDatabase from "@/lib/config/mongodb";
import { ClientModel } from "@/lib/models/Clients";
import { LayerModel } from "@/lib/models/Layers";
import { CoreToolMessage, ToolInvocation } from "ai";
import { Message } from "@ai-sdk/react";
import { CoreMessage } from "ai";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getProperFileExtension = (file: File) => {
  const fileExtension = file.type.split("/")[1];
  switch (fileExtension) {
    // Document File Types
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return ".docx";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.template":
      return ".dotx";
    case "application/msword":
      return ".doc";
    case "application/vnd.oasis.opendocument.text":
      return ".odt";
    case "application/rtf":
      return ".rtf";
    case "text/plain":
      return ".txt";
    case "text/markdown":
      return ".md";

    // PDF & eBook Formats
    case "application/pdf":
      return ".pdf";
    case "application/epub+zip":
      return ".epub";
    case "application/x-mobipocket-ebook":
      return ".mobi";
    case "application/vnd.amazon.ebook":
      return ".azw";
    case "image/vnd.djvu":
      return ".djvu";

    // Image File Types
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/gif":
      return ".gif";
    case "image/bmp":
      return ".bmp";
    case "image/webp":
      return ".webp";
    case "image/svg+xml":
      return ".svg";
    case "image/tiff":
      return ".tiff";
    case "image/heif":
      return ".heif";
    case "image/heic":
      return ".heic";
    case "image/x-icon":
      return ".ico";

    // Spreadsheet File Types
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return ".xlsx";
    case "application/vnd.ms-excel.sheet.macroEnabled.12":
      return ".xlsm";
    case "application/vnd.ms-excel":
      return ".xls";
    case "application/vnd.oasis.opendocument.spreadsheet":
      return ".ods";
    case "text/csv":
      return ".csv";
    case "text/tab-separated-values":
      return ".tsv";

    // Presentation File Types
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return ".pptx";
    case "application/vnd.openxmlformats-officedocument.presentationml.template":
      return ".potx";
    case "application/vnd.openxmlformats-officedocument.presentationml.slideshow":
      return ".ppsx";
    case "application/vnd.ms-powerpoint":
      return ".ppt";
    case "application/vnd.oasis.opendocument.presentation":
      return ".odp";

    // Archive / Compressed Formats
    case "application/zip":
      return ".zip";
    case "application/vnd.rar":
      return ".rar";
    case "application/x-7z-compressed":
      return ".7z";
    case "application/x-tar":
      return ".tar";
    case "application/gzip":
      return ".gz";

    // Other Useful Types
    case "application/json":
      return ".json";
    case "application/xml":
      return ".xml";
    case "text/yaml":
      return ".yaml";
    case "text/html":
      return ".html";
    case "text/css":
      return ".css";
    case "application/javascript":
      return ".js";

    // OpenDocument Additional Types
    case "application/vnd.oasis.opendocument.graphics":
      return ".odg";
    case "application/vnd.oasis.opendocument.chart":
      return ".odc";
    case "application/vnd.oasis.opendocument.formula":
      return ".odf";
    case "application/vnd.oasis.opendocument.database":
      return ".odb";
    case "application/vnd.oasis.opendocument.image":
      return ".odi";
    case "application/vnd.oasis.opendocument.text-master":
      return ".odm";
    case "application/vnd.oasis.opendocument.text-template":
      return ".odt";
    case "application/vnd.oasis.opendocument.text-web":
      return ".oth";
    default:
      return fileExtension;
  }
};

let isConnected = false;

export const loadModels = async () => {
  if (!isConnected) {
    try {
      await connectToDatabase();
      isConnected = true;
      console.log("MongoDB connected and models loaded");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  return {
    ClientModel,
    LayerModel,
  };
};

export function convertToUIMessages(
  messages: Array<CoreMessage>
): Array<Message> {
  return messages.reduce((chatMessages: Array<Message>, message) => {
    if (message.role === "tool") {
      return addToolMessageToChat({
        toolMessage: message as CoreToolMessage,
        messages: chatMessages,
      });
    }

    let textContent = "";
    let toolInvocations: Array<ToolInvocation> = [];

    if (typeof message.content === "string") {
      textContent = message.content;
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        if (content.type === "text") {
          textContent += content.text;
        } else if (content.type === "tool-call") {
          toolInvocations.push({
            state: "call",
            toolCallId: content.toolCallId,
            toolName: content.toolName,
            args: content.args,
          });
        }
      }
    }

    chatMessages.push({
      id: uuidv4(),
      role: message.role,
      content: textContent,
      toolInvocations,
    });

    return chatMessages;
  }, []);
}
function addToolMessageToChat({
  toolMessage,
  messages,
}: {
  toolMessage: CoreToolMessage;
  messages: Array<Message>;
}): Array<Message> {
  return messages.map((message) => {
    if (message.toolInvocations) {
      return {
        ...message,
        toolInvocations: message.toolInvocations.map((toolInvocation) => {
          const toolResult = toolMessage.content.find(
            (tool) => tool.toolCallId === toolInvocation.toolCallId
          );

          if (toolResult) {
            return {
              ...toolInvocation,
              state: "result",
              result: toolResult.result,
            };
          }

          return toolInvocation;
        }),
      };
    }

    return message;
  });
}
