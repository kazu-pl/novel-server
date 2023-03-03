import { Response, NextFunction } from "express";
import { Role } from "controllers/auth.controller";
import logging from "config/logging";
import { RequestWithJWT } from "types/jwt.types";
import {
  TranslationKeysAuth,
  TranslationNamespaces,
} from "locales/locales.types";
import i18n from "i18n";
const NAMESPACE = "authorize middleware";

const authorize = (allowedRole: Role) => {
  const authorizeRole = (
    req: RequestWithJWT,
    res: Response,
    next: NextFunction
  ) => {
    logging.info(NAMESPACE, "authorizing role from token");

    if (req.jwt && req.jwt.role !== allowedRole) {
      return res.status(403).json({
        message: i18n.t("forbidden" as TranslationKeysAuth, {
          lng: req.headers["accept-language"],
          ns: "auth" as TranslationNamespaces,
        }),
      });
    } else {
      next();
    }
  };

  return authorizeRole;
};

export default authorize;
