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

type Variant = "users" | "cms";
export type Role = "admin" | "user";

const register = async (req: Request, res: Response, variant: Variant) => {
  const { password, repeatedPassword, email, name, surname } = req.body;

  if (!password) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nie podano hasła",
        en: "Password was not provided",
        de: "Passwort wurde nicht angegeben",
      }),
    });
  }

  if (!repeatedPassword) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nie podano powtarzającego się hasła",
        en: "Repeated password was not provided",
        de: "Wiederholtes Passwort wurde nicht angegeben",
      }),
    });
  }

  if (password !== repeatedPassword) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Różne hasła",
        en: "Different passwords",
        de: "Unterschiedliche Passwörter",
      }),
    });
  }

  if (!email) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "e-mail nie został podany",
        en: "email was not provided",
        de: "E-Mail wurde nicht angegeben",
      }),
    });
  }
  if (!name) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "imię nie zostało podane",
        en: "name was not provided",
        de: "Name wurde nicht angegeben",
      }),
    });
  }
  if (!surname) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "nie podano nazwiska",
        en: "surname was not provided",
        de: "Nachname wurde nicht angegeben",
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
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "email, hasło, ponownie hasło, imię, nazwisko i email powinny być typu string",
        en: "email, password, repeatedPassword, name, surname and email should be of type string",
        de: "email, password, repeatPassword, name, surname und email sollten vom Typ string sein",
      }),
    });
  }

  if (typeof password === "string" && password.length < 8) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Hasło musi zawierać co najmniej 8 znaków",
        en: "Password must be at least 8 characters",
        de: "Das Passwort muss mindestens 8 Zeichen lang sein",
      }),
    });
  }

  if (!email.includes("@") || !email.includes(".")) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "zły format e-maila",
        en: "wrong email format",
        de: "falsches E-Mail-Formatn",
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
              ? getTranslatedMessage(req.headers["accept-language"], {
                  pl: "Administrator z tym adresem e-mail już istnieje",
                  en: "Admin with that email already exists",
                  de: "Der Administrator mit dieser E-Mail-Adresse existiert bereits",
                })
              : getTranslatedMessage(req.headers["accept-language"], {
                  pl: "Użytkownik z tym adresem e-mail już istnieje",
                  en: "User with that email already exists",
                  de: "Benutzer mit dieser E-Mail existiert bereits",
                }),
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
              message: getTranslatedMessage(req.headers["accept-language"], {
                pl: "Pomyślnie utworzono użytkownika",
                en: "Successfuly created user",
                de: "Benutzer erfolgreich erstellt",
              }),
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

export const login = async (req: Request, res: Response, variant: Variant) => {
  let { email, password } = req.body;

  if (!email) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "e-mail nie został podany",
        en: "email was not provided",
        de: "E-Mail wurde nicht angegeben",
      }),
    });
  }

  if (!password) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "hasło nie zostało podane",
        en: "password was not provided",
        de: "Passwort wurde nicht angegeben",
      }),
    });
  }

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "e-mail i hasło powinny być typu string",
        en: "email and password should be of type string",
        de: "E-Mail und Passwort sollten vom Typ Zeichenfolge sein",
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
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Konto z tym adresem e-mail i hasłem nie istnieje",
            en: "Account with that email and password does not exist",
            de: "Konto mit dieser E-Mail-Adresse und diesem Passwort existiert nicht",
          }),
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
              message: "Unauthorized",
              error,
            });
          }
        } else {
          return res.status(401).json({
            message: getTranslatedMessage(req.headers["accept-language"], {
              pl: "Konto z tym adresem e-mail i hasłem nie istnieje",
              en: "Account with that email and password does not exist",
              de: "Konto mit dieser E-Mail-Adresse und diesem Passwort existiert nicht",
            }),
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
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "refreshToken nie został dostarczony",
        en: "refreshToken was not provided",
        de: "refreshToken wurde nicht bereitgestellt",
      }),
    });
  }

  if (typeof refreshToken !== "string") {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "refreshToken powinien być typu string",
        en: "refreshToken should be of type string",
        de: "refreshToken sollte vom Typ Zeichenfolge sein",
      }),
    });
  }
  if (cache.has(createRefreshTokenName(refreshToken))) {
    return res.status(401).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Unauthorized - refreshToken jest na czarnej liście ",
        en: "Unauthorized - blacklisted refreshToken",
        de: "Unauthorized -  RefreshToken auf der schwarzen Liste",
      }),
    });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (error, data) => {
    if (error) {
      const err = error as TokenExpiredError;
      if (err.message === "jwt expired") {
        return res.status(403).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Twoja sesja odświeżania tokena wygasła. Zaloguj się jeszcze raz",
            en: "Your refresh token session expired. Log in again",
            de: "Ihre Sitzung mit dem Aktualisierungstoken ist abgelaufen. Nochmal anmelden",
          }),
          error,
        });
      } else {
        return res.status(403).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Zabronione - wystąpił błąd",
            en: "Forbidden - some error occured",
            de: "Verboten - ein Fehler ist aufgetreten",
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
            message: getTranslatedMessage(req.headers["accept-language"], {
              pl: "Nie udało się ponownie wygenerować tokena dostępu",
              en: "Could not regenerate access token",
              de: "Zugriffstoken konnte nicht neu generiert werden",
            }),
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

  if (!refreshToken || !accessToken) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nie podano refreshToken i/lub accessToken",
        en: "refreshToken and/or accessToken was not provided",
        de: "refreshToken und/oder accessToken wurde nicht bereitgestellt",
      }),
    });
  }

  if (typeof refreshToken !== "string" || typeof accessToken !== "string") {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "refreshToken i accessToken powinny być typu string",
        en: "refreshToken and accessToken should be of type string",
        de: "refreshToken und accessToken sollten vom Typ string sein",
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
    message: getTranslatedMessage(req.headers["accept-language"], {
      pl: "Wylogowanie powiodło się",
      en: "Logout successed",
      de: "Abmeldung erfolgreich",
    }),
  });
};

export default { register, login, refreshAccessToken, logout };
