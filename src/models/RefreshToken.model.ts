import mongoose, { Schema, Document } from "mongoose";

interface RefreshToken extends Document {
  value: string;
  forAccount: string;
  isAccountAdmin: boolean;
}

const RefreshTokenSchema: Schema = new Schema({
  value: { type: String, required: true },
  forAccount: { type: String, required: true },
  isAccountAdmin: { type: Boolean, required: true },
});

export default mongoose.model<RefreshToken>("refreshToken", RefreshTokenSchema);
