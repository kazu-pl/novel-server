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
        const result = await UserModel.findOne({ _id: decoded._id })
        .exec();

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

//  ##################### TODO #####################
// trzeba zakodować w tokenue id i szukać po id bo jeśli zmieni się email to nie mozna drugi raz dostać danych samego siebie

// 1 - teraz jest błąd taki że jak np zmienisz email i potem znowu uderzysz pod /get/users/me to dostaniesz not found bo aktualnie ten url przeszukuje bazę po email. jak zmienisz to na _id to będzie działać

// 2 - authorize czy tam authenticate dodaje do req.jwt object więc dobrze byloby dodać jakiś np typ AuthoruzedRequest który miałby ten object żebym nie musiał w każddym endpoincie wyciągać acessTokenu bezpośrednio z headrs tylko z tylko nowego objectu

// 3 - dodać niezabezpieczony endpoint pod który wysyłasz email i node na ten email wysyła link do resetu hasła podając id w url

// TODO:
// udało mi się przerobić auth i logowanie na email a nie login
// 1 - dodać możliwość zmiany imienia, nazwiska, hasła i emailu
// 2 - dodać przypominanie hasła

// FRONT:
// 3 - na froncie obslużyc nowe opcje logowania
// 4 - dodać widok "/account" gdzie będzie można zmienić imie, nazwisko itd
// 5 - dodać widok to resetu hasła/przypiominania
