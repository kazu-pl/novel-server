import mongoose, { Schema, Document } from "mongoose";
import { photosBucketName } from "middleware/fileUpload";

interface PhotoFile extends Document {
  length: number;
  chunkSize: number;
  uploadDate: Date;
  filename: string;
  contentType: string;
}

const PhotoFileSchema: Schema = new Schema({
  length: { type: Number, required: true },
  chunkSize: { type: Number, required: true },
  uploadDate: { type: Date, required: true },
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
});

export default mongoose.model<PhotoFile>(
  `${photosBucketName}.file`,
  PhotoFileSchema
);
