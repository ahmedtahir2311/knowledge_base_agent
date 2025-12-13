import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { openai } from "@/lib/config/open-ai";

export function isSupportedFileType(mimeType: string): boolean {
  const supportedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    "text/plain",
  ];

  return supportedTypes.includes(mimeType);
}

const uploadFile = async (
  file: File,
  layerLevel: string,
  layerName: string
) => {
  // Upload the files to the server and return a link with {host}/public/uploads/{file.name}
  const fileBuffer = await file.arrayBuffer();
  const fileData = new Uint8Array(fileBuffer);

  const file_id = uuidv4();
  const fileName = `${file_id}-${file.name}`;

  // Ensure uploads directory exists
  const uploadsDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    layerLevel,
    layerName
  );
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Save file to public/uploads directory
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, fileData);

  // Create accessible URL for the file
  const fileLink = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }${filePath.split("public")[1]}`;

  return {
    fileLink,
    fileName,
    file_id,
    filePath: filePath.split("public")[1],
  };
};

const CheckForExistingVectorStore = async () => {
  const store = await openai.vectorStores.retrieve(
    process.env.VECTOR_STORE_ID || "vs_686e3413a03481919670b5db55838a8f"
  );
  if (store) {
    return store;
  }
  const newStore = await openai.vectorStores.create({
    name: "knowledge_base",
    chunking_strategy: {
      type: "auto",
    },
  });

  return newStore;
};

const uploadFileToOpenAIVectorStore = async (
  file: File,
  layerLevel: string,
  layerName: string
) => {
  const store = await CheckForExistingVectorStore();
  const fileBuffer = await file.arrayBuffer();
  const fileData = new Uint8Array(fileBuffer);
  const buffer = Buffer.from(fileBuffer);
  const fileName = `${uuidv4()}-${file.name}`;
  const fileToUpload = new File([buffer], fileName);
  const result = await openai.files.create({
    file: fileToUpload,
    purpose: "assistants",
  });
  const file_id = result.id;

  // Ensure uploads directory exists
  const uploadsDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    layerLevel,
    layerName
  );
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Save file to public/uploads directory
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, fileData);

  // Create accessible URL for the file
  const fileLink = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }${filePath.split("public")[1]}`;

  await openai.vectorStores.files.create(store.id, {
    file_id: file_id,
    attributes: {
      LayerType: layerLevel,
      LayerName: layerName,
      title: fileName,
      file_link: fileLink,
    },
  });

  return {
    file_id,
    fileLink,
    fileName,
    filePath: filePath.split("public")[1],
  };
};

const deleteFileFromVectorDatabase = async (file_id: string) => {
  await openai.vectorStores.files.delete(file_id, {
    vector_store_id: process.env.VECTOR_STORE_ID || "",
  });
};

const deleteFile = async (file: any) => {
  // get file path from file.file_link"

  console.log(file);
  const filePath = file.file_path;
  fs.unlinkSync(path.join(process.cwd(), "public", filePath));
};

export {
  uploadFile,
  deleteFile,
  uploadFileToOpenAIVectorStore,
  CheckForExistingVectorStore,
  deleteFileFromVectorDatabase,
};
