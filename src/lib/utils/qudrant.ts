import { openai } from "@/lib/config/open-ai";

import { v4 as uuidv4 } from "uuid";
import { qdrantClient } from "@/lib/config/qdrant";
import { createVectors } from "@/lib/utils/open-ai";
import fs from "fs";
import path from "path";

interface UnstructuredElement {
  [key: string]: any;
}

interface ProcessedFile {
  elementsBlock: UnstructuredElement[];
  type?: string;
  size?: number;
}

interface FileVector {
  vectorIds: string[];
  name: string;
  fileUrl: string;
  type: string;
  size: number;
}

// Collection names for different layers
const GENERAL_COLLECTION = "general";
const CONTRACT_COLLECTION = "contract";
const PROJECT_COLLECTION_PREFIX = "client";

// Ensure collections exist
const ensureCollectionExists = async (
  collectionName: string,
  vectorSize: number = 1536
) => {
  try {
    console.log(`Checking if collection ${collectionName} exists...`);

    // First check if collection exists
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(
      (c) => c.name === collectionName
    );

    if (!exists) {
      console.log(`Collection ${collectionName} does not exist. Creating...`);

      // Create collection with proper configuration
      await qdrantClient.createCollection(collectionName, {
        vectors: {
          size: vectorSize,
          distance: "Cosine",
        },
        optimizers_config: {
          default_segment_number: 2,
        },
        replication_factor: 1,
      });

      console.log(`Successfully created collection: ${collectionName}`);
    } else {
      console.log(`Collection ${collectionName} already exists`);
    }

    // Verify collection was created successfully
    const collectionInfo = await qdrantClient.getCollection(collectionName);
    console.log(`Collection info for ${collectionName}:`, collectionInfo);
  } catch (error: any) {
    console.error(`Error ensuring collection ${collectionName} exists:`, error);

    if (error.response) {
      console.error("Error details:", {
        status: error.response.status,
        data: error.response.data,
      });
    }

    throw error;
  }
};

const uploadLayerLevelFiles = async (
  rawFile: File,
  file: ProcessedFile,
  layer: "general" | "contract" | "project",
  contractType?: string | null
) => {
  console.log(`Starting upload for layer: ${layer}, file: ${rawFile.name}`);

  const blocks = file.elementsBlock
    .map((b) => {
      return {
        ...b,
      };
    })
    .filter(Boolean) as any[];

  console.log(`Extracted ${blocks.length} blocks from file`);

  // Ensure collection exists
  await ensureCollectionExists(layer);

  //Upload file to server
  const { fileUrl, fileName } = await uploadFileToServer(rawFile, layer);

  console.log(`Creating vectors for ${blocks.length} blocks`);

  const points = await Promise.all(
    blocks.map(async (element: any, index) => {
      try {
        const vector = await createVectors(element.text);

        console.log(`Created vector for block ${index + 1}/${blocks.length}`);

        return {
          id: uuidv4(),
          vector,
          payload: {
            layer,
            contractType,
            ...element,
            filename: fileName,
            fileUrl: fileUrl,
          },
        };
      } catch (error) {
        console.error(`Error creating vector for block ${index + 1}:`, error);
        throw error;
      }
    })
  );

  console.log(
    `Successfully created ${points.length} vectors, preparing to upload`
  );

  try {
    await uploadPointsInBatches(points, layer);
    console.log(`Successfully uploaded all points to ${layer}`);
  } catch (error) {
    console.error(`Error uploading vectors to Qdrant (${layer}):`, error);
    throw error;
  }

  return {
    vectorIds: points.map((p) => p.id),
    name: fileName,
    fileUrl: fileUrl,
    type: file.type || "application/octet-stream",
    size: file.size || 0,
  };
};

const uploadFileToVectorDatabase = async (
  rawFile: File,
  file: ProcessedFile,
  clientId: string
): Promise<FileVector> => {
  console.log(`Starting upload for client: ${clientId}, file: ${rawFile.name}`);

  const blocks = file.elementsBlock
    .map((b) => {
      return {
        ...b,
      };
    })
    .filter(Boolean) as any[];

  console.log(`Extracted ${blocks.length} blocks from file`);

  const collectionName = `${PROJECT_COLLECTION_PREFIX}_${clientId}`;

  // Ensure collection exists
  await ensureCollectionExists(collectionName);

  console.log(`Creating vectors for ${blocks.length} blocks`);

  //Upload file to server
  const { fileUrl, fileName } = await uploadFileToServer(
    rawFile,
    collectionName
  );

  const points = await Promise.all(
    blocks.map(async (element: any, index) => {
      try {
        const vector = await createVectors(element.text);
        const pointId = `${uuidv4()}`;

        console.log(`Created vector for block ${index + 1}/${blocks.length}`);

        return {
          id: pointId,
          vector,
          payload: {
            layer: "client",
            clientId,
            ...element,
            filename: fileName,
            fileUrl: fileUrl,
          },
        };
      } catch (error) {
        console.error(`Error creating vector for block ${index + 1}:`, error);
        throw error;
      }
    })
  );

  console.log(
    `Successfully created ${points.length} vectors, preparing to upload`
  );

  try {
    await uploadPointsInBatches(points, collectionName);
    console.log(`Successfully uploaded all points to ${collectionName}`);
  } catch (error) {
    console.error(
      `Error uploading vectors to Qdrant (${collectionName}):`,
      error
    );
    throw error;
  }

  return {
    vectorIds: points.map((p) => p.id),
    name: fileName,
    fileUrl: fileUrl,
    type: file.type || "application/octet-stream",
    size: file.size || 0,
  };
};

const deleteFileFromVectorDatabase = async (
  clientId: string,
  deleteCollection: boolean = false,
  pointIds?: string[],
  fileName?: string
) => {
  const collectionName = `${PROJECT_COLLECTION_PREFIX}_${clientId}`;

  try {
    if (deleteCollection) {
      await qdrantClient.deleteCollection(collectionName);
      //Delete folder from server
      const targetDir = path.join(
        process.cwd(),
        "public",
        "files",
        collectionName
      );
      fs.rmSync(targetDir, { recursive: true });
      console.log(`Deleted collection: ${collectionName}`);
    } else if (pointIds && pointIds.length > 0) {
      await qdrantClient.delete(collectionName, {
        points: pointIds,
      });
      if (fileName) {
        const targetDir = path.join(
          process.cwd(),
          "public",
          "files",
          collectionName,
          fileName
        );
        fs.rmSync(targetDir);
      }

      console.log(`Deleted ${pointIds.length} points from ${collectionName}`);
    }
  } catch (error) {
    console.error(`Error deleting from Qdrant (${collectionName}):`, error);
    throw error;
  }
};

const uploadPointsInBatches = async (points: any[], collectionName: string) => {
  // Process points in batches of 100
  const BATCH_SIZE = 100;

  for (let i = 0; i < points.length; i += BATCH_SIZE) {
    const batch = points.slice(i, i + BATCH_SIZE);
    try {
      // Format points according to Qdrant API requirements

      console.log(
        `Attempting to upload batch to ${collectionName} with ${batch.length} points`
      );

      await qdrantClient.upsert(collectionName, {
        points: batch,
        wait: true,
      });

      console.log(
        `Uploaded batch ${i / BATCH_SIZE + 1}/${Math.ceil(
          points.length / BATCH_SIZE
        )} to ${collectionName}`
      );
    } catch (error: any) {
      console.error(
        `Error uploading batch ${i / BATCH_SIZE + 1} to Qdrant:`,
        error
      );

      // Log more detailed error information
      if (error.response) {
        console.error("Error details:", {
          status: error.response.status,
          data: error.response.data,
        });
      }

      throw error;
    }
  }
};

const uploadFileToServer = async (file: File, collectionName: string) => {
  //Writing File to Public Folder in  there respective clients folder
  try {
    // ✅ Read file data
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ Define target path
    const fileExtension = file.name.split(".").pop() || "";
    const fileNameWithoutExt = file.name.split(".").slice(0, -1).join(".");
    const sanitizedName = fileNameWithoutExt.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${sanitizedName}_${uuidv4()}.${fileExtension}`; // sanitize and preserve extension

    const targetDir = path.join(
      process.cwd(),
      "public",
      "files",
      collectionName
    );
    const targetPath = path.join(targetDir, fileName);

    // ✅ Create directory if not exists
    fs.mkdirSync(targetDir, { recursive: true });

    // ✅ Write file
    fs.writeFileSync(targetPath, buffer);

    return { fileUrl: targetPath, fileName };
  } catch (error) {
    console.error("Error uploading file to server:", error);
    throw error;
  }
};

const searchVectorDatabase = async (
  queryVector: number[],
  clientId: string,
  contractType: string,
  limit: number = 10
) => {
  const generalCollection = `${GENERAL_COLLECTION}`;
  const contractCollection = `${CONTRACT_COLLECTION}`;
  const clientCollection = `${PROJECT_COLLECTION_PREFIX}_${clientId}`;

  const [general, contract, client] = await Promise.all([
    qdrantClient.query(generalCollection, {
      query: queryVector,
      limit,
      with_payload: true,
    }),
    qdrantClient.query(contractCollection, {
      query: queryVector,
      limit,
      with_payload: true,
      filter: {
        must: [
          {
            key: "contractType",
            match: {
              value: contractType,
            },
          },
        ],
      },
    }),
    qdrantClient.query(clientCollection, {
      query: queryVector,
      limit,
      with_payload: true,
    }),
  ]);

  return { general, contract, client };
};

export {
  uploadFileToVectorDatabase,
  deleteFileFromVectorDatabase,
  uploadLayerLevelFiles,
  uploadPointsInBatches,
  searchVectorDatabase,
};
