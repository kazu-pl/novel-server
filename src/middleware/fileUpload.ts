import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import { MONGO_DB_URI } from "constants/env";
import { File } from "types/multer.types";
import { RequestWithJWT } from "types/jwt.types";

export const photosBucketName = "photos";

const allowedExtensions = ["image/png", "image/jpeg", "image/jpg", "image/gif"];

const storage = new GridFsStorage({
  url: MONGO_DB_URI,
  file: (req: RequestWithJWT, file: File) => {
    if (allowedExtensions.indexOf(file.mimetype) === -1) {
      return file.originalname;
    }

    const originalNameWithoutSpaces =
      file.originalname.split(" ").length > 1
        ? file.originalname.split(" ").join("_")
        : file.originalname;

    return {
      bucketName: "photos",
      filename: `${Date.now()}-${originalNameWithoutSpaces}`,
    };
  },
});

export default multer({ storage });
