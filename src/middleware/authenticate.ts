import { Request, Response, NextFunction } from "express";
import logging from "../config/logging";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "constants/env";
import cache, { createAccessTokenName } from "config/cache";
import i18n from "i18n";
import { TranslationKey, TranslationNamespaces } from "locales/locales.types";
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
      message: i18n.t("unauthorized" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  const accessToken = token[1];

  if (typeof accessToken !== "string") {
    return res.status(401).json({
      message: i18n.t("accessTokenShouldBeString" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  if (cache.has(createAccessTokenName(accessToken))) {
    return res.status(401).json({
      message: i18n.t("blacklistedAccessToken" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: i18n.t("unauthorized" as TranslationKey["auth"], {
          lng: req.headers["accept-language"],
          ns: "auth" as TranslationNamespaces,
        }),
      });
    } else {
      req.jwt = decoded;
      next();
    }
  });
};

export default authenticate;
