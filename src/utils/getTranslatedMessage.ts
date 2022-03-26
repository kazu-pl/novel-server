import { Request } from "express";

type AllowedLangs = "pl" | "en" | "de";

type Messages = Record<AllowedLangs, string>;

const getTranslatedMessage = (
  acceptLanguageHeader: Request["headers"]["accept-language"],
  messages: Messages
) => {
  if (acceptLanguageHeader === "pl") {
    return messages.pl;
  } else if (acceptLanguageHeader === "en") {
    return messages.en;
  } else if (acceptLanguageHeader === "de") {
    return messages.de;
  } else {
    return messages.pl;
  }
};

export default getTranslatedMessage;
