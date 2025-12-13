import { Schema, model, Document, models, Types } from "mongoose";

// Define the interface for Client document
export interface ILayer extends Document {
  layerLevel: "General" | "Contract" | "Project";
  layerName: string;
  files: Array<any>; // Using any for now, can be refined based on file structure
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for Client
const LayerSchema = new Schema<ILayer>(
  {
    layerLevel: {
      type: String,
      required: [true, "Layer Level is required"],
      trim: true,
      enum: ["General", "Contract", "Project"],
      default: "General",
    },
    layerName: {
      type: String,
      required: [true, "Layer Name is required"],
      trim: true,
    },
    files: [
      {
        type: Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

//creating indexes
LayerSchema.index({ layerName: 1 });

// Export the Layer model
const LayerModel = models?.Layer || model<any>("Layer", LayerSchema);

export { LayerModel };
