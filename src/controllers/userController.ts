import { Request, Response } from "express";
import UserModel from "models/userModel";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET,
  FRONT_APP_URL,
  RENEW_PASSWORD_EXPIRATION_TIME_IN_SECONDS,
} from "constants/env";
import { transporter, SendMailOptions } from "config/nodemailer";
import bcryptjs from "bcryptjs";
import cache, { createNewPasswdLinkName } from "config/cache";

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
        const result = await UserModel.findOne({ _id: decoded._id }).exec();

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

const remindPassword = (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(422).json({
      message: "email was not provided",
    });
  }
  if (typeof email !== "string") {
    return res.status(422).json({
      message: "email has to be of type string",
    });
  }

  UserModel.findOne()
    .where("data.email")
    .in([email])
    .exec()
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          message: "Account with that email does not exist",
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
            message:
              "We've just sent you a link that will allow you to change your password. Check your email.",
          });
        }
      });
    })
    .catch((error) => {
      return res.status(500).json({
        message: "An error occured when searching for email",
        error,
      });
    });
};

const renewPassword = (req: Request, res: Response) => {
  const { password, repeatedPassword } = req.body;

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

  if (typeof password !== "string" || typeof repeatedPassword !== "string") {
    return res.status(422).json({
      message: "password, repeatedPassword should be of type string",
    });
  }

  if (typeof password === "string" && password.length < 8) {
    return res.status(422).json({
      message: "Password must be at least 8 characters",
    });
  }

  if (!cache.has(createNewPasswdLinkName(req.params.id))) {
    return res.status(401).json({
      message:
        "Changing password link expired or user didn't request to change password",
    });
  }

  UserModel.findOne({ _id: req.params.id })
    .exec()
    .then((result) => {
      if (!result) {
        return res.status(404).json({
          message: "User profile not found",
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
              message: "Updated successfuly",
            });
          })
          .catch((error) => {
            return res.status(500).json({
              message: "Could not update user profile",
              error,
            });
          });
      });
    })
    .catch((error) => {
      return res.status(500).json({
        error,
      });
    });
};

const updatePassword = (req: Request, res: Response) => {
  const { password, repeatedPassword } = req.body;
  const accessToken = req.headers.authorization?.split(" ")[1];

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

  if (typeof password !== "string" || typeof repeatedPassword !== "string") {
    return res.status(422).json({
      message: "password, repeatedPassword should be of type string",
    });
  }

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
                message: "Updated successfuly",
              });
            })
            .catch((error) => {
              return res.status(500).json({
                message: "Could not update user profile",
                error,
              });
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

export default {
  getUserData,
  updateUserData,
  remindPassword,
  renewPassword,
  updatePassword,
};
