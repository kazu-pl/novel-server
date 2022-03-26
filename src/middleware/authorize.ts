import { Response, NextFunction } from "express";
import { Role } from "controllers/auth.controller";
import logging from "config/logging";
import { RequestWithJWT } from "types/jwt.types";
import getTranslatedMessage from "utils/getTranslatedMessage";
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
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Dostep zabroniony",
          en: "Forbidden",
          de: "Verboten",
        }),
      });
    } else {
      next();
    }
  };

  return authorizeRole;
};

export default authorize;
