import mongoose, { Schema, Document } from "mongoose";

export interface User extends Document {
  password: string;
  isAdmin?: boolean;
  data: {
    name: string;
    surname: string;
    email: string;
  };
}

const UserSchema: Schema = new Schema(
  {
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: false },
    data: {
      type: Object,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model<User>("User", UserSchema);

export default userModel;
