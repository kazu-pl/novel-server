import { Response, NextFunction } from "express";
import { DecodedUser, RequestWithJWT } from "types/jwt.types";
import getTranslatedMessage from "utils/getTranslatedMessage";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, OBSERVER_USER_ID } from "constants/env";
import getAccessTokenFromHeaders from "utils/getAccessTokenFromHeaders";

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
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "To konto nie ma wystarczających uprawnień do wykonania tej akcji",
          en: "your account does not have sufficient privileges to perform this action",
          de: "Ihr Konto verfügt nicht über ausreichende Berechtigungen, um diese Aktion auszuführen",
        }),
      });
    } else {
      next();
    }
  });
};
export default throwObserverUser;
