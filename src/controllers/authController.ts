import { NextFunction, Request, Response } from "express";
import logging from "../config/logging";
import bcryptjs from "bcryptjs";

import UserModel from "models/userModel";

type Variant = "users" | "cms";

const register = (
  req: Request,
  res: Response,
  next: NextFunction,
  variant: Variant
) => {
  const { login, password, repeatedPassword } = req.body;

  if (!repeatedPassword) {
    return res.status(400).json({
      message: "Repeated password was not provided",
    });
  }

  if (password !== repeatedPassword) {
    return res.status(400).json({
      message: "Different passwords",
    });
  }

  if (typeof password === "string" && password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });
  }

  UserModel.find({ login })
    .exec()
    .then((users) => {
      if (
        users.filter((user) => {
          return variant === "cms" ? user.isAdmin : !user.isAdmin;
        }).length
      ) {
        return res.status(422).json({
          message:
            variant === "cms"
              ? "Admin with that login already exists"
              : "User with that login already exists",
        });
      }

      bcryptjs.hash(password, 10, (hashError, hashedPassword) => {
        if (hashError) {
          return res.status(500).json({
            message: hashError.message,
            error: hashError,
          });
        }

        const newUser = new UserModel({
          login,
          password: hashedPassword,
          ...(variant === "cms" && { isAdmin: true }),
        });

        return newUser
          .save()
          .then((user) => {
            logging.info(
              "userController",
              `New ${
                variant === "cms" ? "admin" : "user"
              } with login ${login} was added to the database`
            );
            return res.status(201).json({
              user,
            });
          })
          .catch((error) => {
            return res.status(500).json({
              message: error.message,
              error,
            });
          });
      });
    });
};

export default { register };
