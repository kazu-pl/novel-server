import { Request, Response, NextFunction } from "express";
import logging from "config/logging";
import { NAMESPACES } from "constants/namespaces";

const logger = (req: Request, res: Response, next: NextFunction) => {
  /** Log the req */
  logging.info(
    NAMESPACES.SERVER,
    `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
  );

  res.on("finish", () => {
    /** Log the res */
    logging.info(
      NAMESPACES.SERVER,
      `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`
    );
  });

  next();
};

export default logger;
