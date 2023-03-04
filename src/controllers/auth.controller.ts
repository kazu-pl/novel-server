import { Request, Response } from "express";
import logging from "../config/logging";
import bcryptjs from "bcryptjs";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import UserModel from "models/User.model";
import {
  ACCESS_TOKEN_EXPIRETIME_IN_SECONDS,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRETIME_IN_SECONDS,
  REFRESH_TOKEN_SECRET,
} from "constants/env";

import cache, {
  createAccessTokenName,
  createRefreshTokenName,
} from "config/cache";
import getTranslatedMessage from "utils/getTranslatedMessage";
import { TranslationKey, TranslationNamespaces } from "locales/locales.types";
import i18n from "i18n";

type Variant = "users" | "cms";
export type Role = "admin" | "user";

const register = async (req: Request, res: Response, variant: Variant) => {
  const { password, repeatedPassword, email, name, surname } = req.body;

  if (!password) {
    return res.status(422).json({
      message: i18n.t("passwordNotProvided" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  if (!repeatedPassword) {
    return res.status(422).json({
      message: i18n.t("repeatedPasswordNotProvided" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  if (password !== repeatedPassword) {
    return res.status(422).json({
      message: i18n.t("differentPasswords" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  if (!email) {
    return res.status(422).json({
      message: i18n.t("emailNotProvided" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }
  if (!name) {
    return res.status(422).json({
      message: i18n.t("nameNotProvided" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }
  if (!surname) {
    return res.status(422).json({
      message: i18n.t("surnameNotProvided" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
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
      message: i18n.t(
        "basicFieldsShouldBeOfTypeString" as TranslationKey["auth"],
        {
          lng: req.headers["accept-language"],
          ns: "auth" as TranslationNamespaces,
        }
      ),
    });
  }

  if (typeof password === "string" && password.length < 8) {
    return res.status(422).json({
      message: i18n.t("passwordAtLeast8Chars" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  if (!email.includes("@") || !email.includes(".")) {
    return res.status(422).json({
      message: i18n.t("emailIncorrectFormat" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
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
              ? i18n.t(
                  "adminWithThisEmailAlreadyExists" as TranslationKey["auth"],
                  {
                    lng: req.headers["accept-language"],
                    ns: "auth" as TranslationNamespaces,
                  }
                )
              : i18n.t(
                  "userWithThisEmailAlreadyExists" as TranslationKey["auth"],
                  {
                    lng: req.headers["accept-language"],
                    ns: "auth" as TranslationNamespaces,
                  }
                ),
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
          ...(variant === "users" && { isAdmin: false }),
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
              message: i18n.t("createdNewUser" as TranslationKey["auth"], {
                lng: req.headers["accept-language"],
                ns: "auth" as TranslationNamespaces,
              }),
            });
          })
          .catch((error) => {
            return res.status(500).json({
              message: i18n.t("anErrorOccured" as TranslationKey["common"], {
                lng: req.headers["accept-language"],
                ns: "common" as TranslationNamespaces,
              }),
              error,
            });
          });
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: i18n.t("anErrorOccured" as TranslationKey["common"], {
          lng: req.headers["accept-language"],
          ns: "common" as TranslationNamespaces,
        }),
        error,
      });
    });
};

export const login = async (req: Request, res: Response, variant: Variant) => {
  let { email, password } = req.body;

  if (!email) {
    return res.status(422).json({
      message: i18n.t("emailNotProvided" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  if (!password) {
    return res.status(422).json({
      message: i18n.t("passwordNotProvided" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  if (typeof email !== "string") {
    return res.status(422).json({
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "Email",
        type: "string",
      }),
    });
  }

  if (typeof password !== "string") {
    return res.status(422).json({
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "password",
        type: "string",
      }),
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
          message: i18n.t(
            "accountWithThisPasswordAndEmailNotExist" as TranslationKey["auth"],
            {
              lng: req.headers["accept-language"],
              ns: "auth" as TranslationNamespaces,
            }
          ),
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
                _id: user._id,
                role: variant === "cms" ? "admin" : "user",
              },
              ACCESS_TOKEN_SECRET,
              {
                expiresIn: ACCESS_TOKEN_EXPIRETIME_IN_SECONDS,
              }
            );

            const refreshToken = jwt.sign(
              {
                _id: user._id,
              },
              REFRESH_TOKEN_SECRET,
              {
                expiresIn: REFRESH_TOKEN_EXPIRETIME_IN_SECONDS,
              }
            );

            return res.status(200).json({
              accessToken,
              refreshToken,
            });
          } catch (error) {
            logging.error(
              "login",
              "Could not sign tokens when trying to login"
            );
            return res.status(401).json({
              message: i18n.t("unauthorized" as TranslationKey["auth"], {
                lng: req.headers["accept-language"],
                ns: "auth" as TranslationNamespaces,
              }),
              error,
            });
          }
        } else {
          return res.status(401).json({
            message: i18n.t(
              "accountWithThisPasswordAndEmailNotExist" as TranslationKey["auth"],
              {
                lng: req.headers["accept-language"],
                ns: "auth" as TranslationNamespaces,
              }
            ),
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

const refreshAccessToken = (req: Request, res: Response, variant: Variant) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(422).json({
      message: i18n.t("refreshTokenNotProvided" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  if (typeof refreshToken !== "string") {
    return res.status(422).json({
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "RefreshToken",
        type: "string",
      }),
    });
  }
  if (cache.has(createRefreshTokenName(refreshToken))) {
    return res.status(401).json({
      message: i18n.t("blacklistedRefreshToken" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (error, data) => {
    if (error) {
      const err = error as TokenExpiredError;
      if (err.message === "jwt expired") {
        return res.status(403).json({
          message: i18n.t("sessionExpired" as TranslationKey["auth"], {
            lng: req.headers["accept-language"],
            ns: "auth" as TranslationNamespaces,
          }),
          error,
        });
      } else {
        return res.status(403).json({
          message: i18n.t("forbiddenErrorOccured" as TranslationKey["auth"], {
            lng: req.headers["accept-language"],
            ns: "auth" as TranslationNamespaces,
          }),
          error,
        });
      }
    }

    jwt.sign(
      {
        _id: data && data._id,
        role: variant === "cms" ? "admin" : "user",
      },
      ACCESS_TOKEN_SECRET,
      {
        expiresIn: ACCESS_TOKEN_EXPIRETIME_IN_SECONDS,
      },
      (error, encodedAccessToken) => {
        if (error) {
          return res.status(500).json({
            message: i18n.t(
              "couldNotRegenerateAccessToken" as TranslationKey["auth"],
              {
                lng: req.headers["accept-language"],
                ns: "auth" as TranslationNamespaces,
              }
            ),
            error,
          });
        }

        return res.status(200).json({
          accessToken: encodedAccessToken,
        });
      }
    );
  });
};

const logout = (req: Request, res: Response) => {
  const { refreshToken, accessToken } = req.body;

  if (!accessToken) {
    return res.status(422).json({
      message: i18n.t("accessTokenNotProvided" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }
  if (!refreshToken) {
    return res.status(422).json({
      message: i18n.t("refreshTokenNotProvided" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  if (typeof accessToken !== "string") {
    return res.status(422).json({
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "AccessToken",
        type: "string",
      }),
    });
  }
  if (typeof refreshToken !== "string") {
    return res.status(422).json({
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "RefreshToken",
        type: "string",
      }),
    });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      const err = error as TokenExpiredError;
      if (err.message !== "jwt expired") {
        return res.status(500).json({
          message: error.message,
          error,
        });
      }
    } else {
      const expireBlacklistedRefreshTokenAt =
        decoded && decoded.exp
          ? decoded.exp - Math.floor(new Date().getTime() / 1000)
          : 0;

      cache.set(
        createRefreshTokenName(refreshToken),
        {
          refreshToken,
          ...(decoded && { _id: decoded._id, role: decoded.role }),
        },
        expireBlacklistedRefreshTokenAt
      );
    }
  });

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) {
      const err = error as TokenExpiredError;
      if (err.message !== "jwt expired") {
        return res.status(500).json({
          message: error.message,
          error,
        });
      }
    } else {
      const expireBlacklistedAccessTokenAt =
        decoded && decoded.exp
          ? decoded.exp - Math.floor(new Date().getTime() / 1000)
          : 0;

      cache.set(
        createAccessTokenName(accessToken),
        {
          accessToken,
          ...(decoded && { _id: decoded._id, role: decoded.role }),
        },
        expireBlacklistedAccessTokenAt
      );
    }
  });

  return res.status(200).json({
    message: i18n.t("logoutSuccessed" as TranslationKey["auth"], {
      lng: req.headers["accept-language"],
      ns: "auth" as TranslationNamespaces,
    }),
  });
};

export default { register, login, refreshAccessToken, logout };
