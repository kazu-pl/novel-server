import { PORT, HOSTNAME, MONGO_DB_URI } from "constants/env";
import express from "express";
import CORS from "middleware/CORS";
import logger from "middleware/logger";
import logging from "./config/logging";
import Router from "Router";
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { photosBucketName } from "middleware/fileUpload";
import PhotoFileModel from "models/PhotoFileModel";
import { PATHS_FILES } from "constants/paths";

export let gridFSBucket: GridFSBucket;

const conn = mongoose.connection;
conn.once("open", () => {
  gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: photosBucketName,
  });
});

const NAMESPACE = "server";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(MONGO_DB_URI, {
    retryWrites: true,
    w: "majority",
  })
  .then((result) => {
    logging.info(NAMESPACE, `Connected to MongoDB!`);
  })
  .catch((err) => {
    logging.error(NAMESPACE, err.message, err);
  });

app.use(logger);

app.use(CORS);

/**
 * @swagger
 * path:
 * /files/{filename}:
 *  get:
 *    summary: Used to get any image
 *    tags: [Files]
 *    parameters:
 *      - in: path
 *        name: filename
 *        schema:
 *          type: string
 *        required: true
 *        description: filename
 *    responses:
 *      200:
 *        description: A successful resposne with image
 *      404:
 *        description: image not found
 *      500:
 *        description: An error occured while trying to get image
 */
app.get(PATHS_FILES.SINGLE_FILE, (req, res) => {
  // this endpoint will produce error if it is applied onto Router and not directly here
  PhotoFileModel.findOne({ filename: req.params.filename })
    .exec()
    .then((file) => {
      if (file === undefined || file === null) {
        return res.status(404).json({ message: "Photo Not found" });
      }

      //  below line produces an error when you build server via `yarn build` and run via `yarn start`.
      const readStream = gridFSBucket.openDownloadStream(file._id);
      readStream.pipe(res);
    })
    .catch((error) => {
      res.status(500).json({
        message: "an error occured",
        error,
      });
    });
});

app.use(Router);

app.listen(PORT, () =>
  logging.info(NAMESPACE, `Server is running on ${HOSTNAME}:${PORT}`)
);
