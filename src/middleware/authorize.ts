import { Request, Response, NextFunction } from "express";
import { Role } from "controllers/authController";
import { JwtPayload } from "jsonwebtoken";
import logging from "config/logging";

const NAMESPACE = "authorize middleware";

const authorize = (allowedRole: Role) => {
  const authorizeRole = (
    req: Request & { jwt?: JwtPayload },
    res: Response,
    next: NextFunction
  ) => {
    logging.info(NAMESPACE, "authorizing role from token");

    if (req.jwt && req.jwt.role !== allowedRole) {
      return res.status(403).json({
        message: "Forbidden",
      });
    } else {
      next();
    }
  };

  return authorizeRole;
};

export default authorize;
