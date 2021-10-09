import { PORT, HOSTNAME } from "constants/env";
import { NAMESPACES } from "constants/namespaces";
import express from "express";
import CORS from "middleware/CORS";
import logger from "middleware/logger";
import logging from "./config/logging";
import Router from "Router";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * connect to mongo ...
 *
 *
 *
 * */

/** Log the request */
app.use(logger);

/** Rules of our API */
app.use(CORS);

app.use(Router);

app.listen(PORT, () =>
  logging.info(NAMESPACES.SERVER, `Server is running on ${HOSTNAME}:${PORT}`)
);
