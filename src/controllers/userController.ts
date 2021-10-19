import { Request, Response } from "express";
import UserModel from "models/userModel";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "constants/env";

const getUserData = (req: Request, res: Response) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    } else {
      if (!decoded) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      try {
        const result = await UserModel.findOne({ login: decoded.login }).exec();

        if (!result) {
          return res.status(404).json({
            message: "User profile not found",
          });
        }

        return res.status(200).json(result.data);
      } catch (error) {
        return res.status(500).json({
          message: "User profile not found",
          error,
        });
      }
    }
  });
};

export default { getUserData };
