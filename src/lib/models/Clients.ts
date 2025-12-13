import { Schema, model, Document, models, Types } from "mongoose";

// Define the interface for Client document
export interface IClient extends Document {
  userId: string;
  clientId: string;
  clientName: string;
  country: string;
  instructions: string;
  contractType: string;
  files: Array<any>; // Using any for now, can be refined based on file structure
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema for Client
const ClientSchema = new Schema<IClient>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      trim: true,
    },
    clientId: {
      type: String,
      required: [true, "Client ID is required"],
      unique: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
    contractType: {
      type: String,
      required: [true, "Contract type is required"],
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
ClientSchema.index({ clientName: 1, userId: 1, clientId: 1 });

// Export the Client model
const ClientModel = models?.Client || model<any>("Client", ClientSchema);

export { ClientModel };
