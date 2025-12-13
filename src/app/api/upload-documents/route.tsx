import { loadModels } from "@/lib/utils";
import { parseUnstructuredFile } from "@/lib/utils/unstructure-io";
import { uploadLayerLevelFiles } from "@/lib/utils/qudrant";
import { NextRequest, NextResponse } from "next/server";

type layerLevelType = "general" | "contract" | "project";
interface FileVector {
  vectorIds: string[];
  name: string;
  type: string;
  size: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const { LayerModel } = await loadModels();

    const layerLevel = formData.get("layerLevel") as layerLevelType;
    const layerName = formData.get("layerName") as string;
    const contractType = formData.get("contractType") as string;
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let fileVector: any[] = [];
    for (const file of files) {
      //unparse the file
      const parsedFile = await parseUnstructuredFile(file as File, true, 5);

      //Upload the file to the vector database
      if (parsedFile?.elementsBlock) {
        const vectors = await uploadLayerLevelFiles(
          file as File,
          parsedFile,
          layerLevel,
          layerName ? layerName : contractType
        );
        fileVector.push(vectors);
      }
    }

    const newLayer = await LayerModel.findOneAndUpdate(
      { layerName: layerLevel },
      { $push: { files: { $each: fileVector } } },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Layer created successfully.",
        layer: newLayer,
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
