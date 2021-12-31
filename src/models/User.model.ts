import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface GameSave {
  actId: string;
  actTitle: string;
  sceneIndex: number;
  dialogIndex: number;
  characterSayingText?: string;
  text: string;
}

export interface ExtendedGameSave extends GameSave {
  _id: ObjectId;
  createdAt: string;
  updatedAt: string;
}

export interface User extends Document {
  password: string;
  isAdmin?: boolean;
  data: {
    name: string;
    surname: string;
    email: string;
    avatar?: string;
  };
  gameSaves?: ExtendedGameSave[];
}

const UserSchema: Schema = new Schema(
  {
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true },
    data: {
      type: Object,
      required: true,
    },
    gameSaves: [
      {
        type: {
          actId: { type: String, required: true },
          actTitle: { type: String, required: true },
          sceneIndex: { type: Number, required: true },
          dialogIndex: { type: Number, required: true },
          characterSayingText: { type: String },
          text: { type: String, required: true },
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model<User>("User", UserSchema);

export default userModel;
