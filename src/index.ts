import { PORT, HOSTNAME, MONGO_DB_URI } from "constants/env";
import express from "express";
import CORS from "middleware/CORS";
import logger from "middleware/logger";
import logging from "./config/logging";
import Router from "Router";
import mongoose from "mongoose";

const NAMESPACE = "server";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** connect to mongo */
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

/** Log the request */
app.use(logger);

/** Rules of our API */
app.use(CORS);

app.use(Router);

app.listen(PORT, () =>
  logging.info(NAMESPACE, `Server is running on ${HOSTNAME}:${PORT}`)
);
