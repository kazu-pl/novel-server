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
        const result = await UserModel.findOne({ _id: decoded._id }).exec();

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

const updateUserData = (req: Request, res: Response) => {
  const { name, surname, email } = req.body;
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!email.includes("@") || !email.includes(".")) {
    return res.status(422).json({
      message: "wrong email format",
    });
  }

  if (!accessToken) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (!name || !surname || !email) {
    return res.status(422).json({
      message: "Missing required data (name or surname or email)",
    });
  }

  if (
    typeof name !== "string" ||
    typeof surname !== "string" ||
    typeof email !== "string"
  ) {
    return res.status(422).json({
      message:
        "Incorect data type. Fields name, surname and email should be of type string",
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
        const result = await UserModel.findOne({ _id: decoded._id })
          // .where("_id")
          // .in([decoded._id])
          .exec();

        if (!result) {
          return res.status(404).json({
            message: "User profile not found",
          });
        }

        result
          .updateOne({
            data: {
              name,
              surname,
              email,
            },
          })
          .then(() => {
            return res.status(200).json({
              message: "Updated successfuly",
            });
          })
          .catch((error) => {
            return res.status(500).json({
              message: "Could not update user profile",
              error,
            });
          });
      } catch (error) {
        return res.status(500).json({
          message: "An error occured",
          error,
        });
      }
    }
  });
};

export default { getUserData, updateUserData };
