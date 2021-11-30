import mongoose, { Schema, Document } from "mongoose";

export type ActType = "start" | "normal" | "end";

export interface Scene {
  title: string;
  bgImgUrl: string;
  dialogs: [
    {
      text: string;
      characterSayingText: string;
      charactersOnScreen: {
        name: string;
        leftPosition: number;
        zIndex: number;
        imgUrl: string;
      }[];
    }
  ];
}

export interface Act {
  title: string;
  description: string;
  type: ActType;
  nextActId?: string;
  scenes: Scene[];
}

export interface ActDocument extends Act, Document {}

const ActSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    nextActId: { type: String, required: true },
    scenes: [
      {
        type: {
          title: { type: String, required: true },
          bgImgUrl: { type: String, required: true },
          dialogs: [
            {
              type: {
                text: { type: String, required: true },
                characterSayingText: { type: String, required: true },
                charactersOnScreen: [
                  {
                    type: {
                      name: { type: String, required: true },
                      leftPosition: { type: Number, required: true },
                      zIndex: { type: Number, required: true },
                      imgUrl: { type: String, required: true },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ActDocument>(`act`, ActSchema);
