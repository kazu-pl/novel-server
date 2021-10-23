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
import cache from "config/cache";

type Variant = "users" | "cms";
export type Role = "admin" | "user";

const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
  variant: Variant
) => {
  const { password, repeatedPassword, email, name, surname } = req.body;

  if (!password) {
    return res.status(422).json({
      message: "Password was not provided",
    });
  }

  if (!repeatedPassword) {
    return res.status(422).json({
      message: "Repeated password was not provided",
    });
  }

  if (password !== repeatedPassword) {
    return res.status(422).json({
      message: "Different passwords",
    });
  }

  if (!email) {
    return res.status(422).json({
      message: "email was not provided",
    });
  }
  if (!name) {
    return res.status(422).json({
      message: "name was not provided",
    });
  }
  if (!surname) {
    return res.status(422).json({
      message: "surname was not provided",
    });
  }

  if (
    typeof email !== "string" ||
    typeof name !== "string" ||
    typeof surname !== "string" ||
    typeof password !== "string" ||
    typeof repeatedPassword !== "string"
  ) {
    return res.status(422).json({
      message:
        "login, password, repeatedPassword, name, surname and email should be of type string",
    });
  }

  if (typeof password === "string" && password.length < 8) {
    return res.status(422).json({
      message: "Password must be at least 8 characters",
    });
  }

  if (!email.includes("@") || !email.includes(".")) {
    return res.status(422).json({
      message: "wrong email format",
    });
  }

  UserModel.find()
    .where("data.email")
    .in([email])
    .where("isAdmin")
    .in([variant === "cms"])
    .exec()
    .then((results) => {
      if (results.length && results[0].data.email === email) {
        return res.status(422).json({
          message:
            variant === "cms"
              ? "Admin with that email already exists"
              : "User with that email already exists",
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
          password: hashedPassword,
          ...(variant === "cms" && { isAdmin: true }),
          data: {
            email,
            name,
            surname,
          },
        });

        return newUser
          .save()
          .then((user) => {
            logging.info(
              "userController",
              `New ${
                variant === "cms" ? "admin" : "user"
              } with email ${email} was added to the database`
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
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
  variant: Variant
) => {
  let { email, password } = req.body;

  if (!email) {
    return res.status(422).json({
      message: "email was not provided",
    });
  }

  if (!password) {
    return res.status(422).json({
      message: "login was not provided",
    });
  }

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(422).json({
      message: "email and password should be of type string",
    });
  }

  UserModel.find()
    .where("data.email")
    .in([email])
    .where("isAdmin")
    .in([variant === "cms"])
    .exec()
    .then((users) => {
      if (!users.length) {
        return res.status(401).json({
          message: "Account with that email and password does not exist",
        });
      }

      const user = users[0];

      bcryptjs.compare(password, user.password, async (error, result) => {
        if (error) {
          return res.status(401).json({
            message: error.message,
            error,
          });
        } else if (result) {
          try {
            const accessToken = jwt.sign(
              {
                email: user.data.email,
                role: variant === "cms" ? "admin" : "user",
              },
              ACCESS_TOKEN_SECRET,
              {
                expiresIn: ACCESS_TOKEN_EXPIRETIME_IN_SECONDS,
              }
            );

            const refreshToken = jwt.sign(
              {
                email: user.data.email,
              },
              REFRESH_TOKEN_SECRET,
              {
                expiresIn: REFRESH_TOKEN_EXPIRETIME_IN_SECONDS,
              }
            );

            const newRefreshTokenInDB = new RefreshTokenModel({
              value: refreshToken,
              forAccount: user.data.email,
              isAccountAdmin: variant === "cms",
            });

            await newRefreshTokenInDB.save();
            return res.status(200).json({
              accessToken,
              refreshToken,
            });
          } catch (error) {
            logging.error(
              "email",
              "Could not sign tokens when trying to email"
            );
            return res.status(401).json({
              message: "Unauthorized",
              error,
            });
          }
        } else {
          return res.status(401).json({
            message: "Account with that email and password does not exist",
            error,
          });
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

const refreshAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction,
  variant: Variant
) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(422).json({
      message: "refreshToken was not provided",
    });
  }

  if (typeof refreshToken !== "string") {
    return res.status(422).json({
      message: "refreshToken should be of type string",
    });
  }

  RefreshTokenModel.find({ value: refreshToken })
    .exec()
    .then((tokens) => {
      if (tokens.length !== 1) {
        return res.status(403).json({
          message: "Forbidden",
        });
      }

      jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (error, data) => {
        if (error) {
          await RefreshTokenModel.deleteOne({ value: refreshToken });

          return res.status(403).json({
            message: "Forbidden - refresh token expired or other error occured",
            error,
          });
        }

        jwt.sign(
          {
            email: data && data.email,
            role: variant === "cms" ? "admin" : "user",
          },
          ACCESS_TOKEN_SECRET,
          {
            expiresIn: ACCESS_TOKEN_EXPIRETIME_IN_SECONDS,
          },
          (error, encodedAccessToken) => {
            if (error) {
              return res.status(500).json({
                message: "Could not regenerate access token",
                error,
              });
            }

            return res.status(200).json({
              accessToken: encodedAccessToken,
            });
          }
        );
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: error.message,
        error,
      });
    });
};

const logout = (req: Request, res: Response, next: NextFunction) => {
  const { refreshToken, accessToken } = req.body;

  if (!refreshToken || !accessToken) {
    return res.status(422).json({
      message: "refreshToken and/or accessToken was not provided",
    });
  }

  if (typeof refreshToken !== "string" || typeof accessToken !== "string") {
    return res.status(422).json({
      message: "refreshToken and accessToken should be of type string",
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (error, decoded) => {
    const removeRefreshTokenFromDB = () => {
      RefreshTokenModel.deleteOne({ value: refreshToken })
        .then(() => {
          return res.status(200).json({ message: "logout successed" });
        })
        .catch((error) => {
          return res.status(500).json({
            message: error.message,
            error,
          });
        });
    };

    if (error) {
      removeRefreshTokenFromDB();
      // error means accessToken expired already so there's no need to blacklist it
    } else {
      const expireBlacklistedTokenAt =
        decoded && decoded.exp
          ? decoded.exp - Math.floor(new Date().getTime() / 1000)
          : 0;

      cache.set(
        accessToken,
        {
          accessToken,
          ...(decoded && { login: decoded.login, role: decoded.role }),
        },
        expireBlacklistedTokenAt
      );

      removeRefreshTokenFromDB();
    }
  });
};

export default { register, login, refreshAccessToken, logout };
