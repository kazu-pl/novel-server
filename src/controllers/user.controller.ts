import { Request, Response } from "express";
import UserModel, { ExtendedGameSave, GameSave } from "models/User.model";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET,
  FRONT_APP_URL,
  RENEW_PASSWORD_EXPIRATION_TIME_IN_SECONDS,
} from "constants/env";
import { transporter, SendMailOptions } from "config/nodemailer";
import bcryptjs from "bcryptjs";
import cache, { createNewPasswdLinkName } from "config/cache";
import { Request as MulterRequest } from "types/multer.types";
import PhotoFileModel from "models/PhotoFile.model";
import PhotoChunkModel from "models/PhotoChunk.model";
import { RequestWithJWT } from "types/jwt.types";
import getTranslatedMessage from "utils/getTranslatedMessage";

const getUserData = (req: Request, res: Response) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nieautoryzowany",
        en: "Unauthorized",
        de: "Unbefugt",
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Nieautoryzowany",
          en: "Unauthorized",
          de: "Unbefugt",
        }),
      });
    } else {
      if (!decoded) {
        return res.status(401).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Nieautoryzowany",
            en: "Unauthorized",
            de: "Unbefugt",
          }),
        });
      }

      try {
        const result = await UserModel.findOne({ _id: decoded._id }).exec();

        if (!result) {
          return res.status(404).json({
            message: getTranslatedMessage(req.headers["accept-language"], {
              pl: "Nie znaleziono profilu użytkownika",
              en: "User profile not found",
              de: "Benutzerprofil nicht gefunden",
            }),
          });
        }

        return res.status(200).json(result.data);
      } catch (error) {
        return res.status(500).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Nie znaleziono profilu użytkownika",
            en: "User profile not found",
            de: "Benutzerprofil nicht gefunden",
          }),
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
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "niewłaściwy format e-maila",
        en: "wrong email format",
        de: "Falsches E-Mail-Format",
      }),
    });
  }

  if (!accessToken) {
    return res.status(401).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nieautoryzowany",
        en: "Unauthorized",
        de: "Unbefugt",
      }),
    });
  }

  if (!name || !surname || !email) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Brak wymaganych danych (imię lub nazwisko lub e-mail)",
        en: "Missing required data (name or surname or email)",
        de: "Fehlende erforderliche Daten (Vor- oder Nachname oder E-Mail)",
      }),
    });
  }

  if (
    typeof name !== "string" ||
    typeof surname !== "string" ||
    typeof email !== "string"
  ) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nieprawidłowy typ danych. Pola imię, nazwisko i email powinny być typu string",
        en: "Incorect data type. Fields name, surname and email should be of type string",
        de: "Falscher Datentyp. Die Felder Name, Nachname und E-Mail sollten vom Typ Zeichenfolge sein",
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Nieautoryzowany",
          en: "Unauthorized",
          de: "Unbefugt",
        }),
      });
    } else {
      if (!decoded) {
        return res.status(401).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Nieautoryzowany",
            en: "Unauthorized",
            de: "Unbefugt",
          }),
        });
      }

      try {
        const result = await UserModel.findOne({ _id: decoded._id }).exec();

        if (!result) {
          return res.status(404).json({
            message: getTranslatedMessage(req.headers["accept-language"], {
              pl: "Nie znaleziono profilu użytkownika",
              en: "User profile not found",
              de: "Benutzerprofil nicht gefunden",
            }),
          });
        }

        result
          .updateOne({
            data: {
              ...result.data,
              name,
              surname,
              email,
            },
          })
          .then(() => {
            return res.status(200).json({
              message: getTranslatedMessage(req.headers["accept-language"], {
                pl: "Zaktualizowano pomyślnie",
                en: "Updated successfuly",
                de: "Aktualisiert erfolgreich",
              }),
            });
          })
          .catch((error) => {
            return res.status(500).json({
              message: getTranslatedMessage(req.headers["accept-language"], {
                pl: "Nie można zaktualizować profilu użytkownika",
                en: "Could not update user profile",
                de: "Benutzerprofil konnte nicht aktualisiert werden",
              }),
              error,
            });
          });
      } catch (error) {
        return res.status(500).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Wystąpił błąd",
            en: "An error occured",
            de: "Es ist ein Fehler aufgetreten",
          }),
          error,
        });
      }
    }
  });
};

const remindPassword = (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "e-mail nie został podany",
        en: "email was not provided",
        de: "E-Mail wurde nicht angegeben",
      }),
    });
  }
  if (typeof email !== "string") {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "e-mail musi być typu string",
        en: "email has to be of type string",
        de: "E-Mail muss vom Typ String sein",
      }),
    });
  }

  UserModel.findOne()
    .where("data.email")
    .in([email])
    .exec()
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Konto z tym adresem e-mail nie istnieje",
            en: "Account with that email does not exist",
            de: "Konto mit dieser E-Mail existiert nicht",
          }),
        });
      }

      cache.has(createNewPasswdLinkName(result._id)) &&
        cache.del(createNewPasswdLinkName(result._id));

      cache.set(
        createNewPasswdLinkName(result._id),
        {
          user_id: result._id,
        },
        RENEW_PASSWORD_EXPIRATION_TIME_IN_SECONDS
      );

      const mailOptions: SendMailOptions = {
        from: "emailer.test777",
        to: email,
        subject: "Novel - renew email",
        text: `You can reset your password here: ${FRONT_APP_URL}/reset-password/${
          result._id
        }. Link expires in ${
          RENEW_PASSWORD_EXPIRATION_TIME_IN_SECONDS / 60
        } minutes`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(500).json({
            error,
          });
        } else {
          return res.status(200).json({
            message: getTranslatedMessage(req.headers["accept-language"], {
              pl: "Właśnie wysłaliśmy Ci link, który pozwoli Ci zmienić hasło. Sprawdź pocztę.",
              en: "We've just sent you a link that will allow you to change your password. Check your email.",
              de: "Wir haben Ihnen gerade einen Link geschickt, mit dem Sie Ihr Passwort ändern können. Überprüfen Sie Ihre E-Mail.",
            }),
          });
        }
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Wystąpił błąd podczas wyszukiwania e-maila",
          en: "An error occured when searching for email",
          de: "Bei der Suche nach E-Mail ist ein Fehler aufgetreten",
        }),
        error,
      });
    });
};

const renewPassword = (req: Request, res: Response) => {
  const { password, repeatedPassword } = req.body;

  if (!password) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Hasło nie zostało podane",
        en: "Password was not provided",
        de: "Passwort wurde nicht angegeben",
      }),
    });
  }

  if (!repeatedPassword) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nie podano powtórzonego hasła",
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

  if (typeof password !== "string" || typeof repeatedPassword !== "string") {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "hasło, repeatPassword powinno być typu string",
        en: "password, repeatedPassword should be of type string",
        de: "password, repeatedPassword sollte vom Typ string sein",
      }),
    });
  }

  if (typeof password === "string" && password.length < 8) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Hasło musi zawierać co najmniej 8 znaków",
        en: "Password must be at least 8 characters",
        de: "Passwort muss mindestens 8 Zeichen lang sein",
      }),
    });
  }

  if (!cache.has(createNewPasswdLinkName(req.params.id))) {
    return res.status(401).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Link do zmiany hasła wygasł lub użytkownik nie prosił o zmianę hasła",
        en: "Changing password link expired or user didn't request to change password",
        de: "Der Link zum Ändern des Passworts ist abgelaufen oder der Benutzer hat keine Änderung des Passworts angefordert",
      }),
    });
  }

  UserModel.findOne({ _id: req.params.id })
    .exec()
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Nie znaleziono profilu użytkownika",
            en: "User profile not found",
            de: "Benutzerprofil nicht gefunden",
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

        result
          .updateOne({
            password: hashedPassword,
          })
          .then(() => {
            cache.has(createNewPasswdLinkName(req.params.id)) &&
              cache.del(createNewPasswdLinkName(req.params.id));
            return res.status(200).json({
              message: getTranslatedMessage(req.headers["accept-language"], {
                pl: "Zaktualizowano pomyślnie",
                en: "Updated successfuly",
                de: "Aktualisiert erfolgreich",
              }),
            });
          })
          .catch((error) => {
            return res.status(500).json({
              message: getTranslatedMessage(req.headers["accept-language"], {
                pl: "Nie można zaktualizować profilu użytkownika",
                en: "Could not update user profile",
                de: "Benutzerprofil konnte nicht aktualisiert werden",
              }),
              error,
            });
          });
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Wystąpił błąd",
          en: "An error occured",
          de: "Es ist ein Fehler aufgetreten",
        }),
        error,
      });
    });
};

const updatePassword = (req: Request, res: Response) => {
  const { password, repeatedPassword } = req.body;
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!password) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Hasło nie zostało podane",
        en: "Password was not provided",
        de: "Passwort wurde nicht angegeben",
      }),
    });
  }

  if (!repeatedPassword) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nie podano powtórzonego hasła",
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

  if (typeof password !== "string" || typeof repeatedPassword !== "string") {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "hasło, powtórzone hasło powinno być typu string",
        en: "password, repeatedPassword should be of type string",
        de: "password, repeatedPassword sollte vom Typ string sein",
      }),
    });
  }

  if (!accessToken) {
    return res.status(401).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nieautoryzowany",
        en: "Unauthorized",
        de: "Nicht autorisiert",
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Nieautoryzowany",
          en: "Unauthorized",
          de: "Nicht autorisiert",
        }),
      });
    } else {
      if (!decoded) {
        return res.status(401).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Nieautoryzowany",
            en: "Unauthorized",
            de: "Nicht autorisiert",
          }),
        });
      }

      try {
        const result = await UserModel.findOne({ _id: decoded._id }).exec();

        if (!result) {
          return res.status(404).json({
            message: getTranslatedMessage(req.headers["accept-language"], {
              pl: "Nie znaleziono profilu użytkownika",
              en: "User profile not found",
              de: "Benutzerprofil nicht gefunden",
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

          result
            .updateOne({
              password: hashedPassword,
            })
            .then(() => {
              return res.status(200).json({
                message: getTranslatedMessage(req.headers["accept-language"], {
                  pl: "Zaktualizowano pomyślnie",
                  en: "Updated successfuly",
                  de: "Aktualisiert erfolgreich",
                }),
              });
            })
            .catch((error) => {
              return res.status(500).json({
                message: getTranslatedMessage(req.headers["accept-language"], {
                  pl: "Nie można zaktualizować profilu użytkownika",
                  en: "Could not update user profile",
                  de: "Benutzerprofil konnte nicht aktualisiert werden",
                }),
                error,
              });
            });
        });
      } catch (error) {
        return res.status(500).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Wystąpił błąd",
            en: "An error occured",
            de: "Es ist ein Fehler aufgetreten",
          }),
          error,
        });
      }
    }
  });
};

const putAvatar = (req: Request & MulterRequest, res: Response) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nieautoryzowany",
        en: "Unauthorized",
        de: "Nicht autorisiert",
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error || !decoded) {
      return res.status(401).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Nieautoryzowany",
          en: "Unauthorized",
          de: "Nicht autorisiert",
        }),
      });
    }

    try {
      if (req.file === undefined) return res.send("you must select a file.");

      const user = await UserModel.findOne({ _id: decoded._id }).exec();

      if (!user) {
        return res.status(404).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Nie znaleziono profilu użytkownika",
            en: "User profile not found",
            de: "Benutzerprofil nicht gefunden",
          }),
        });
      }

      if (req.file === undefined) return res.send("you must select a file.");

      const prevAvatar = await PhotoFileModel.findOne({
        filename: user.data.avatar?.split("/")[2], // path will be like "/files/photoName.png" and [2] is "photoName.png"
      });
      await PhotoChunkModel.deleteMany({ files_id: prevAvatar?._id });
      await prevAvatar?.delete();

      const newAvatarUrl = `/files/${req.file.filename}`;
      await user.update({
        data: {
          ...user.data,
          avatar: newAvatarUrl,
        },
      });

      return res.status(201).json({ avatarUrl: newAvatarUrl });
    } catch (error) {
      return res.status(500).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Wystąpił błąd",
          en: "An error occured",
          de: "Es ist ein Fehler aufgetreten",
        }),
        error,
      });
    }
  });
};

const deleteAvatar = (req: Request & MulterRequest, res: Response) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nieautoryzowany",
        en: "Unauthorized",
        de: "Nicht autorisiert",
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error || !decoded) {
      return res.status(401).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Nieautoryzowany",
          en: "Unauthorized",
          de: "Nicht autorisiert",
        }),
      });
    }

    try {
      const user = await UserModel.findOne({ _id: decoded._id }).exec();

      if (!user) {
        return res.status(404).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Nie znaleziono profilu użytkownika",
            en: "User profile not found",
            de: "Benutzerprofil nicht gefunden",
          }),
        });
      }

      const avatar = await PhotoFileModel.findOne({
        filename: user.data.avatar?.split("/")[2], // path will be like "/files/photoName.png" and [2] is "photoName.png"
      });
      await PhotoChunkModel.deleteMany({ files_id: avatar?._id });
      await avatar?.delete();

      await user.update({
        data: {
          ...user.data,
          avatar: "",
        },
      });

      return res.status(200).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "awatar został usunięty",
          en: "avatar was deleted",
          de: "Avatar wurde gelöscht",
        }),
      });
    } catch (error) {
      return res.status(500).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Wystąpił błąd",
          en: "An error occured",
          de: "Es ist ein Fehler aufgetreten",
        }),
        error,
      });
    }
  });
};

const deleteAccount = (req: RequestWithJWT, res: Response) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nieautoryzowany",
        en: "Unauthorized",
        de: "Nicht autorisiert",
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error || !decoded) {
      return res.status(401).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Nieautoryzowany",
          en: "Unauthorized",
          de: "Nicht autorisiert",
        }),
      });
    }

    try {
      const userToDelete = await UserModel.findOne({ _id: decoded._id }).exec();

      if (!userToDelete) {
        return res.status(404).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Nie znaleziono profilu użytkownika",
            en: "User profile not found",
            de: "Benutzerprofil nicht gefunden",
          }),
        });
      }

      if (userToDelete.data.avatar) {
        const photoToDelete = await PhotoFileModel.findOne({
          filename: `${userToDelete.data.avatar.slice(
            "/files/".length,
            userToDelete.data.avatar.length
          )}`,
        }).exec();

        if (photoToDelete) {
          await Promise.all([photoToDelete.delete(), userToDelete.delete()]);
          return res.status(200).json({
            message: getTranslatedMessage(req.headers["accept-language"], {
              pl: "Konto zostało usunięte",
              en: "Account was deleted",
              de: "Konto wurde gelöscht",
            }),
          });
        } else {
          await userToDelete.delete();
          return res.status(200).json({
            message: getTranslatedMessage(req.headers["accept-language"], {
              pl: "Konto zostało usunięte",
              en: "Account was deleted",
              de: "Konto wurde gelöscht",
            }),
          });
        }
      } else {
        await userToDelete.delete();
        return res.status(200).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Konto zostało usunięte",
            en: "Account was deleted",
            de: "Konto wurde gelöscht",
          }),
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Wystąpił błąd",
          en: "An error occured",
          de: "Es ist ein Fehler aufgetreten",
        }),
        error,
      });
    }
  });
};

const addGameSave = (req: RequestWithJWT, res: Response) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  const newGameSave = req.body as GameSave;

  if (!accessToken) {
    return res.status(401).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nieautoryzowany",
        en: "Unauthorized",
        de: "Nicht autorisiert",
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error || !decoded) {
      return res.status(401).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Nieautoryzowany",
          en: "Unauthorized",
          de: "Nicht autorisiert",
        }),
      });
    }

    try {
      const user = await UserModel.findOne({ _id: decoded._id }).exec();
      if (!user) {
        return res.status(404).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Nie znaleziono profilu użytkownika",
            en: "User profile not found",
            de: "Benutzerprofil nicht gefunden",
          }),
        });
      }

      const prevUserGameSaves = user.gameSaves;

      user
        .updateOne({
          gameSaves: prevUserGameSaves
            ? [...prevUserGameSaves, newGameSave as ExtendedGameSave]
            : [newGameSave as ExtendedGameSave],
        })
        .then(() => {
          return res.status(200).json({
            message: getTranslatedMessage(req.headers["accept-language"], {
              pl: "Zaktualizowano pomyślnie",
              en: "Updated successfuly",
              de: "Aktualisiert erfolgreich",
            }),
          });
        })
        .catch((error) => {
          return res.status(500).json({
            message: getTranslatedMessage(req.headers["accept-language"], {
              pl: "Nie można zaktualizować profilu użytkownika",
              en: "Could not update user profile",
              de: "Benutzerprofil konnte nicht aktualisiert werden",
            }),
            error,
          });
        });
    } catch (error) {
      return res.status(500).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Wystąpił błąd",
          en: "An error occured",
          de: "Es ist ein Fehler aufgetreten",
        }),
        error,
      });
    }
  });
};

const deleteGameSave = (req: RequestWithJWT, res: Response) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  const { saveId } = req.params as { saveId: string };

  if (!accessToken) {
    return res.status(401).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nieautoryzowany",
        en: "Unauthorized",
        de: "Unbefugt",
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error || !decoded) {
      return res.status(401).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Nieautoryzowany",
          en: "Unauthorized",
          de: "Unbefugt",
        }),
      });
    }

    try {
      const user = await UserModel.findOne({ _id: decoded._id }).exec();
      if (!user) {
        return res.status(404).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Nie znaleziono profilu użytkownika",
            en: "User profile not found",
            de: "Benutzerprofil nicht gefunden",
          }),
        });
      }

      user
        .updateOne({
          gameSaves: user.gameSaves?.filter(
            (save) => save._id.toString() !== saveId
          ),
        })
        .then(() => {
          return res.status(200).json({
            message: getTranslatedMessage(req.headers["accept-language"], {
              pl: "Usunięto pomyślnie",
              en: "Removed successfuly",
              de: "Erfolgreich entfernt",
            }),
          });
        })
        .catch((error) => {
          return res.status(500).json({
            message: getTranslatedMessage(req.headers["accept-language"], {
              pl: "Nie udało się usunąć zapisu",
              en: "Could not remove save",
              de: "Speichern konnte nicht entfernt werden",
            }),
            error,
          });
        });
    } catch (error) {
      return res.status(500).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Wystąpił błąd",
          en: "An error occured",
          de: "Es ist ein Fehler aufgetreten",
        }),
        error,
      });
    }
  });
};

const getAllGameSaves = (req: RequestWithJWT, res: Response) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nieautoryzowany",
        en: "Unauthorized",
        de: "Unbefugt",
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error || !decoded) {
      return res.status(401).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Nieautoryzowany",
          en: "Unauthorized",
          de: "Unbefugt",
        }),
      });
    }

    try {
      const user = await UserModel.findOne({ _id: decoded._id }).exec();
      if (!user) {
        return res.status(404).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Nie znaleziono profilu użytkownika",
            en: "User profile not found",
            de: "Benutzerprofil nicht gefunden",
          }),
        });
      }

      return res.status(200).json({
        data: user.gameSaves?.sort(() => -1),
      });
    } catch (error) {
      return res.status(500).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Wystąpił błąd",
          en: "An error occured",
          de: "Es ist ein Fehler aufgetreten",
        }),
        error,
      });
    }
  });
};

export default {
  getUserData,
  updateUserData,
  remindPassword,
  renewPassword,
  updatePassword,
  putAvatar,
  deleteAvatar,
  deleteAccount,
  addGameSave,
  deleteGameSave,
  getAllGameSaves,
};
