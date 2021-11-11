import mongoose, { Schema, Document } from "mongoose";

export interface SceneryImage {
  originalName: string;
  url: string;
  filename: string;
}

export interface Scenery extends Document {
  title: string;
  description: string;
  imagesList: SceneryImage[];
}

const ScenerySchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    imagesList: [
      {
        type: {
          originalName: { type: String, required: true },
          url: { type: String, required: true },
          filename: { type: String, required: true },
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Scenery>(`scenery`, ScenerySchema);
