import { Request, Response, NextFunction } from "express";
import logging from "../config/logging";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "constants/env";
import cache, { createAccessTokenName } from "config/cache";

const NAMESPACE = "authenticate middleware";

const authenticate = (
  req: Request & { jwt?: JwtPayload },
  res: Response,
  next: NextFunction
) => {
  logging.info(NAMESPACE, "authenticating Token");

  const token = req.headers.authorization?.split(" ");

  if (!token || token.length > 2) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const accessToken = token[1];

  if (typeof accessToken !== "string") {
    return res.status(401).json({
      message: "Unauthorized - accessToken should be of type string",
    });
  }

  if (cache.has(createAccessTokenName(accessToken))) {
    return res.status(401).json({
      message: "Unauthorized - blacklisted access token",
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    } else {
      req.jwt = decoded;
      next();
    }
  });
};

export default authenticate;
