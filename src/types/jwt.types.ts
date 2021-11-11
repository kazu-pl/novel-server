import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";
import { Role } from "controllers/auth.controller";

export interface RequestWithJWT extends Request {
  jwt?: JwtPayload & {
    _id: string;
    role: Role;
  };
}
