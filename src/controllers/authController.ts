import { NextFunction, Request, Response } from "express";
import logging from "../config/logging";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "models/userModel";
import {
  ACCESS_TOKEN_EXPIRETIME_IN_SECONDS,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRETIME_IN_SECONDS,
  REFRESH_TOKEN_SECRET,
} from "constants/env";

import RefreshTokenModel from "models/RefreshTokenModel";

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
              message: "Successfuly created user",
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

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
  variant: Variant
) => {
  let { login, password } = req.body;

  UserModel.find({ login, ...(variant === "cms" && { isAdmin: true }) })
    .exec()
    .then((users) => {
      if (!users.length) {
        return res.status(401).json({
          message: "Account with that login and password does not exist",
        });
      }

      const user = users[0];

      bcryptjs.compare(password, user.password, async (error, result) => {
        if (error) {
          return res.status(401).json({
            message: "Unauthorized",
          });
        } else if (result) {
          const timeSinceEpochInMs = new Date().getTime();
          const accessTokenExpirationTime = Number(
            Math.floor(
              timeSinceEpochInMs +
                Number(ACCESS_TOKEN_EXPIRETIME_IN_SECONDS) * 1000
            )
          );

          const refreshTokenExpirationTime = Number(
            Math.floor(
              timeSinceEpochInMs +
                Number(REFRESH_TOKEN_EXPIRETIME_IN_SECONDS) * 1000
            )
          );

          try {
            const accessToken = jwt.sign(
              {
                login: user.login,
              },
              ACCESS_TOKEN_SECRET as string,
              {
                expiresIn: accessTokenExpirationTime,
              }
            );

            const refreshToken = jwt.sign(
              {
                login: user.login,
              },
              REFRESH_TOKEN_SECRET as string,
              {
                expiresIn: refreshTokenExpirationTime,
              }
            );

            const newRefreshTokenInDB = new RefreshTokenModel({
              value: refreshToken,
              forAccount: user.login,
              isAccountAdmin: variant === "cms",
            });

            await newRefreshTokenInDB.save();

            return res.status(200).json({
              accessToken,
              refreshToken,
            });
          } catch (error) {
            logging.error(
              "Login",
              "Could not sign tokens when trying to login"
            );
            return res.status(401).json({
              message: "Unauthorized",
              error,
            });
          }
        }
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

export default { register, login };
