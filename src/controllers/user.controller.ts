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
import getAccessTokenFromHeaders from "utils/getAccessTokenFromHeaders";
import i18n from "i18n";
import { TranslationKey, TranslationNamespaces } from "locales/locales.types";

const getUserData = (req: Request, res: Response) => {
  const accessToken = getAccessTokenFromHeaders(req.headers);

  if (!accessToken) {
    return res.status(401).json({
      message: i18n.t("unauthorized" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: i18n.t("unauthorized" as TranslationKey["auth"], {
          lng: req.headers["accept-language"],
          ns: "auth" as TranslationNamespaces,
        }),
      });
    } else {
      if (!decoded) {
        return res.status(401).json({
          message: i18n.t("unauthorized" as TranslationKey["auth"], {
            lng: req.headers["accept-language"],
            ns: "auth" as TranslationNamespaces,
          }),
        });
      }

      try {
        const result = await UserModel.findOne({ _id: decoded._id }).exec();

        if (!result) {
          return res.status(404).json({
            message: i18n.t("userProfileNotFound" as TranslationKey["user"], {
              lng: req.headers["accept-language"],
              ns: "user" as TranslationNamespaces,
            }),
          });
        }

        return res.status(200).json(result.data);
      } catch (error) {
        return res.status(500).json({
          message: i18n.t("userProfileNotFound" as TranslationKey["user"], {
            lng: req.headers["accept-language"],
            ns: "user" as TranslationNamespaces,
          }),
          error,
        });
      }
    }
  });
};

const updateUserData = (req: Request, res: Response) => {
  const { name, surname, email } = req.body;
  const accessToken = getAccessTokenFromHeaders(req.headers);

  if (!email.includes("@") || !email.includes(".")) {
    return res.status(422).json({
      message: i18n.t("emailIncorrectFormat" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  if (!accessToken) {
    return res.status(401).json({
      message: i18n.t("unauthorized" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  if (!name || !surname || !email) {
    return res.status(422).json({
      message: i18n.t(
        "requiredFieldsWereNotProvided" as TranslationKey["common"],
        {
          lng: req.headers["accept-language"],
          ns: "common" as TranslationNamespaces,
        }
      ),
    });
  }

  if (
    typeof name !== "string" ||
    typeof surname !== "string" ||
    typeof email !== "string"
  ) {
    return res.status(422).json({
      message: i18n.t(
        "basicFieldsShouldBeOfTypeString" as TranslationKey["common"],
        {
          lng: req.headers["accept-language"],
          ns: "common" as TranslationNamespaces,
        }
      ),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: i18n.t("unauthorized" as TranslationKey["auth"], {
          lng: req.headers["accept-language"],
          ns: "auth" as TranslationNamespaces,
        }),
      });
    } else {
      if (!decoded) {
        return res.status(401).json({
          message: i18n.t("unauthorized" as TranslationKey["auth"], {
            lng: req.headers["accept-language"],
            ns: "auth" as TranslationNamespaces,
          }),
        });
      }

      try {
        const result = await UserModel.findOne({ _id: decoded._id }).exec();

        if (!result) {
          return res.status(404).json({
            message: i18n.t("userProfileNotFound" as TranslationKey["user"], {
              lng: req.headers["accept-language"],
              ns: "user" as TranslationNamespaces,
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
              message: i18n.t("updated" as TranslationKey["user"], {
                lng: req.headers["accept-language"],
                ns: "user" as TranslationNamespaces,
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
      } catch (error) {
        return res.status(500).json({
          message: i18n.t("anErrorOccured" as TranslationKey["common"], {
            lng: req.headers["accept-language"],
            ns: "common" as TranslationNamespaces,
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
      message: i18n.t("emailNotProvided" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
      }),
    });
  }
  if (typeof email !== "string") {
    return res.status(422).json({
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "email",
        type: "string",
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
          message: i18n.t(
            "accountWithThisEmailNotExist" as TranslationKey["common"],
            {
              lng: req.headers["accept-language"],
              ns: "common" as TranslationNamespaces,
            }
          ),
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
            message: i18n.t(
              "linkChangingPasswordSent" as TranslationKey["user"],
              {
                lng: req.headers["accept-language"],
                ns: "user" as TranslationNamespaces,
              }
            ),
          });
        }
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

const renewPassword = (req: Request, res: Response) => {
  const { password, repeatedPassword } = req.body;

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

  if (typeof password !== "string" || typeof repeatedPassword !== "string") {
    return res.status(422).json({
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "password, repeatedPassword",
        type: "string",
      }),
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

  if (!cache.has(createNewPasswdLinkName(req.params.id))) {
    return res.status(401).json({
      message: i18n.t("linkChangingPasswordExpired" as TranslationKey["user"], {
        lng: req.headers["accept-language"],
        ns: "user" as TranslationNamespaces,
      }),
    });
  }

  UserModel.findOne({ _id: req.params.id })
    .exec()
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          message: i18n.t("userProfileNotFound" as TranslationKey["user"], {
            lng: req.headers["accept-language"],
            ns: "user" as TranslationNamespaces,
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
              message: i18n.t("updated" as TranslationKey["user"], {
                lng: req.headers["accept-language"],
                ns: "user" as TranslationNamespaces,
              }),
            });
          })
          .catch((error) => {
            return res.status(500).json({
              message: i18n.t("updated" as TranslationKey["user"], {
                lng: req.headers["accept-language"],
                ns: "user" as TranslationNamespaces,
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

const updatePassword = (req: Request, res: Response) => {
  const { password, repeatedPassword } = req.body;
  const accessToken = getAccessTokenFromHeaders(req.headers);

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

  if (typeof password !== "string" || typeof repeatedPassword !== "string") {
    return res.status(422).json({
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "password",
        type: "string",
      }),
    });
  }

  if (!accessToken) {
    return res.status(401).json({
      message: i18n.t("unauthorized" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error) {
      return res.status(401).json({
        message: i18n.t("unauthorized" as TranslationKey["auth"], {
          lng: req.headers["accept-language"],
          ns: "auth" as TranslationNamespaces,
        }),
      });
    } else {
      if (!decoded) {
        return res.status(401).json({
          message: i18n.t("unauthorized" as TranslationKey["auth"], {
            lng: req.headers["accept-language"],
            ns: "auth" as TranslationNamespaces,
          }),
        });
      }

      try {
        const result = await UserModel.findOne({ _id: decoded._id }).exec();

        if (!result) {
          return res.status(404).json({
            message: i18n.t("userProfileNotFound" as TranslationKey["user"], {
              lng: req.headers["accept-language"],
              ns: "user" as TranslationNamespaces,
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
                message: i18n.t("updated" as TranslationKey["user"], {
                  lng: req.headers["accept-language"],
                  ns: "user" as TranslationNamespaces,
                }),
              });
            })
            .catch((error) => {
              return res.status(500).json({
                message: i18n.t(
                  "couldNotUpdateUserProfile" as TranslationKey["user"],
                  {
                    lng: req.headers["accept-language"],
                    ns: "user" as TranslationNamespaces,
                  }
                ),
                error,
              });
            });
        });
      } catch (error) {
        return res.status(500).json({
          message: i18n.t("anErrorOccured" as TranslationKey["common"], {
            lng: req.headers["accept-language"],
            ns: "common" as TranslationNamespaces,
          }),
          error,
        });
      }
    }
  });
};

const putAvatar = (req: Request & MulterRequest, res: Response) => {
  const accessToken = getAccessTokenFromHeaders(req.headers);

  if (!accessToken) {
    return res.status(401).json({
      message: i18n.t("unauthorized" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error || !decoded) {
      return res.status(401).json({
        message: i18n.t("unauthorized" as TranslationKey["auth"], {
          lng: req.headers["accept-language"],
          ns: "auth" as TranslationNamespaces,
        }),
      });
    }

    try {
      if (req.file === undefined)
        return res.send(
          i18n.t("mustSelectAFile" as TranslationKey["files"], {
            lng: req.headers["accept-language"],
            ns: "files" as TranslationNamespaces,
          })
        );

      const user = await UserModel.findOne({ _id: decoded._id }).exec();

      if (!user) {
        return res.status(404).json({
          message: i18n.t("userProfileNotFound" as TranslationKey["user"], {
            lng: req.headers["accept-language"],
            ns: "user" as TranslationNamespaces,
          }),
        });
      }

      if (req.file === undefined)
        return res.send(
          i18n.t("mustSelectAFile" as TranslationKey["files"], {
            lng: req.headers["accept-language"],
            ns: "files" as TranslationNamespaces,
          })
        );

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
        message: i18n.t("anErrorOccured" as TranslationKey["common"], {
          lng: req.headers["accept-language"],
          ns: "common" as TranslationNamespaces,
        }),
        error,
      });
    }
  });
};

const deleteAvatar = (req: Request & MulterRequest, res: Response) => {
  const accessToken = getAccessTokenFromHeaders(req.headers);

  if (!accessToken) {
    return res.status(401).json({
      message: i18n.t("unauthorized" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error || !decoded) {
      return res.status(401).json({
        message: i18n.t("unauthorized" as TranslationKey["auth"], {
          lng: req.headers["accept-language"],
          ns: "auth" as TranslationNamespaces,
        }),
      });
    }

    try {
      const user = await UserModel.findOne({ _id: decoded._id }).exec();

      if (!user) {
        return res.status(404).json({
          message: i18n.t("userProfileNotFound" as TranslationKey["user"], {
            lng: req.headers["accept-language"],
            ns: "user" as TranslationNamespaces,
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
        message: i18n.t("avatarWasDeleted" as TranslationKey["user"], {
          lng: req.headers["accept-language"],
          ns: "user" as TranslationNamespaces,
        }),
      });
    } catch (error) {
      return res.status(500).json({
        message: i18n.t("anErrorOccured" as TranslationKey["common"], {
          lng: req.headers["accept-language"],
          ns: "common" as TranslationNamespaces,
        }),
        error,
      });
    }
  });
};

const deleteAccount = (req: RequestWithJWT, res: Response) => {
  const accessToken = getAccessTokenFromHeaders(req.headers);

  if (!accessToken) {
    return res.status(401).json({
      message: i18n.t("unauthorized" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error || !decoded) {
      return res.status(401).json({
        message: i18n.t("unauthorized" as TranslationKey["auth"], {
          lng: req.headers["accept-language"],
          ns: "auth" as TranslationNamespaces,
        }),
      });
    }

    try {
      const userToDelete = await UserModel.findOne({ _id: decoded._id }).exec();

      if (!userToDelete) {
        return res.status(404).json({
          message: i18n.t("userProfileNotFound" as TranslationKey["user"], {
            lng: req.headers["accept-language"],
            ns: "user" as TranslationNamespaces,
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
            message: i18n.t("accountWasDeleted" as TranslationKey["user"], {
              lng: req.headers["accept-language"],
              ns: "user" as TranslationNamespaces,
            }),
          });
        } else {
          await userToDelete.delete();
          return res.status(200).json({
            message: i18n.t("accountWasDeleted" as TranslationKey["user"], {
              lng: req.headers["accept-language"],
              ns: "user" as TranslationNamespaces,
            }),
          });
        }
      } else {
        await userToDelete.delete();
        return res.status(200).json({
          message: i18n.t("accountWasDeleted" as TranslationKey["user"], {
            lng: req.headers["accept-language"],
            ns: "user" as TranslationNamespaces,
          }),
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: i18n.t("anErrorOccured" as TranslationKey["common"], {
          lng: req.headers["accept-language"],
          ns: "common" as TranslationNamespaces,
        }),
        error,
      });
    }
  });
};

const addGameSave = (req: RequestWithJWT, res: Response) => {
  const accessToken = getAccessTokenFromHeaders(req.headers);
  const newGameSave = req.body as GameSave;

  if (!accessToken) {
    return res.status(401).json({
      message: i18n.t("unauthorized" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error || !decoded) {
      return res.status(401).json({
        message: i18n.t("unauthorized" as TranslationKey["auth"], {
          lng: req.headers["accept-language"],
          ns: "auth" as TranslationNamespaces,
        }),
      });
    }

    try {
      const user = await UserModel.findOne({ _id: decoded._id }).exec();
      if (!user) {
        return res.status(404).json({
          message: i18n.t("userProfileNotFound" as TranslationKey["user"], {
            lng: req.headers["accept-language"],
            ns: "user" as TranslationNamespaces,
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
            message: i18n.t("updated" as TranslationKey["user"], {
              lng: req.headers["accept-language"],
              ns: "user" as TranslationNamespaces,
            }),
          });
        })
        .catch((error) => {
          return res.status(500).json({
            message: i18n.t(
              "couldNotUpdateUserProfile" as TranslationKey["user"],
              {
                lng: req.headers["accept-language"],
                ns: "user" as TranslationNamespaces,
              }
            ),
            error,
          });
        });
    } catch (error) {
      return res.status(500).json({
        message: i18n.t("anErrorOccured" as TranslationKey["common"], {
          lng: req.headers["accept-language"],
          ns: "common" as TranslationNamespaces,
        }),
        error,
      });
    }
  });
};

const deleteGameSave = (req: RequestWithJWT, res: Response) => {
  const accessToken = getAccessTokenFromHeaders(req.headers);
  const { saveId } = req.params as { saveId: string };

  if (!accessToken) {
    return res.status(401).json({
      message: i18n.t("unauthorized" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error || !decoded) {
      return res.status(401).json({
        message: i18n.t("unauthorized" as TranslationKey["auth"], {
          lng: req.headers["accept-language"],
          ns: "auth" as TranslationNamespaces,
        }),
      });
    }

    try {
      const user = await UserModel.findOne({ _id: decoded._id }).exec();
      if (!user) {
        return res.status(404).json({
          message: i18n.t("userProfileNotFound" as TranslationKey["user"], {
            lng: req.headers["accept-language"],
            ns: "user" as TranslationNamespaces,
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
            message: i18n.t("removedSuccessfuly" as TranslationKey["common"], {
              lng: req.headers["accept-language"],
              ns: "common" as TranslationNamespaces,
            }),
          });
        })
        .catch((error) => {
          return res.status(500).json({
            message: i18n.t("couldNotRemoveSave" as TranslationKey["user"], {
              lng: req.headers["accept-language"],
              ns: "user" as TranslationNamespaces,
            }),
            error,
          });
        });
    } catch (error) {
      return res.status(500).json({
        message: i18n.t("anErrorOccured" as TranslationKey["common"], {
          lng: req.headers["accept-language"],
          ns: "common" as TranslationNamespaces,
        }),
        error,
      });
    }
  });
};

const getAllGameSaves = (req: RequestWithJWT, res: Response) => {
  const accessToken = getAccessTokenFromHeaders(req.headers);

  if (!accessToken) {
    return res.status(401).json({
      message: i18n.t("unauthorized" as TranslationKey["auth"], {
        lng: req.headers["accept-language"],
        ns: "auth" as TranslationNamespaces,
      }),
    });
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    if (error || !decoded) {
      return res.status(401).json({
        message: i18n.t("unauthorized" as TranslationKey["auth"], {
          lng: req.headers["accept-language"],
          ns: "auth" as TranslationNamespaces,
        }),
      });
    }

    try {
      const user = await UserModel.findOne({ _id: decoded._id }).exec();
      if (!user) {
        return res.status(404).json({
          message: i18n.t("userProfileNotFound" as TranslationKey["user"], {
            lng: req.headers["accept-language"],
            ns: "user" as TranslationNamespaces,
          }),
        });
      }

      return res.status(200).json({
        data: user.gameSaves?.sort(() => -1),
      });
    } catch (error) {
      return res.status(500).json({
        message: i18n.t("anErrorOccured" as TranslationKey["common"], {
          lng: req.headers["accept-language"],
          ns: "common" as TranslationNamespaces,
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
