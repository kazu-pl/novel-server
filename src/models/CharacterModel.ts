import mongoose, { Schema, Document } from "mongoose";

export interface CharacterImage {
  originalName: string;
  url: string;
  filename: string;
}

export interface Character extends Document {
  title: string;
  description: string;
  imagesList: CharacterImage[];
}

const CharacterSchema: Schema = new Schema(
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

export default mongoose.model<Character>(`character`, CharacterSchema);
