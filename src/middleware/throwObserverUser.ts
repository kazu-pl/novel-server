import { Response, NextFunction } from "express";
import { DecodedUser, RequestWithJWT } from "types/jwt.types";
import getTranslatedMessage from "utils/getTranslatedMessage";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, OBSERVER_USER_ID } from "constants/env";
import getAccessTokenFromHeaders from "utils/getAccessTokenFromHeaders";
import i18n from "i18n";

const throwObserverUser = (
  req: RequestWithJWT,
  res: Response,
  next: NextFunction
) => {
  const accessToken = getAccessTokenFromHeaders(req.headers)!;

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (error, decoded) => {
    const decodedData = decoded as DecodedUser;

    if (error || !decodedData) {
      return res.status(401).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Nieautoryzowany",
          en: "Unauthorized",
          de: "Unbefugt",
        }),
      });
    } else if (decodedData._id === OBSERVER_USER_ID) {
      return res.status(403).json({
        message: i18n.t("notSufficientPrivilege", {
          lng: req.headers["accept-language"],
          ns: "auth",
        }),
      });
    } else {
      next();
    }
  });
};
export default throwObserverUser;
