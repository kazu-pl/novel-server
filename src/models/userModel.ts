import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  login: string;
  password: string;
  isAdmin?: boolean;
}

const UserSchema: Schema = new Schema(
  {
    login: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: false },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model<User>("User", UserSchema);

export default userModel;
