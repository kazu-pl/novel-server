import { Request, Response, NextFunction } from "express";
import logging from "../config/logging";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "constants/env";
import cache, { createAccessTokenName } from "config/cache";
import getTranslatedMessage from "utils/getTranslatedMessage";
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
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nieautoryzowany",
        en: "Unauthorized",
        de: "Unbefugt",
      }),
    });
  }

  const accessToken = token[1];

  if (typeof accessToken !== "string") {
    return res.status(401).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nieautoryzowany - accessToken powinien być typu string",
        en: "Unauthorized - accessToken should be of type string",
        de: "Unbefugt - accessToken sollte vom Typ string sein",
      }),
    });
  }

  if (cache.has(createAccessTokenName(accessToken))) {
    return res.status(401).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nieautoryzowany - token dostępu na czarnej liście",
        en: "Unauthorized - blacklisted access token",
        de: "Unbefugt - Zugriffstoken auf der schwarzen Liste",
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Nieautoryzowany",
          en: "Unauthorized",
          de: "Unbefugt",
        }),
      });
    } else {
      req.jwt = decoded;
      next();
    }
  });
};

export default authenticate;
