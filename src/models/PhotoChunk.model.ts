import mongoose, { Schema, Document } from "mongoose";
import { photosBucketName } from "middleware/fileUpload";

interface PhotoChunk extends Document {
  files_id: string;
  n: number;
  data: string;
}

const PhotoChunkSchema: Schema = new Schema({
  files_id: { type: Schema.Types.ObjectId, required: true },
  n: { type: Number, required: true },
  data: { type: Buffer, required: true },
});

export default mongoose.model<PhotoChunk>(
  `${photosBucketName}.chunk`,
  PhotoChunkSchema
);
