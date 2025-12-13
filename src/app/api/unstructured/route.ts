import { NextResponse, NextRequest } from "next/server";
import { parseUnstructuredFile } from "@/lib/utils/unstructure-io";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const parsedFile = await parseUnstructuredFile(file, true, 5);

    if (!parsedFile) {
      return NextResponse.json(
        { error: "Failed to process file" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parsedFile,
    });
  } catch (error: any) {
    console.error("Error processing file:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
