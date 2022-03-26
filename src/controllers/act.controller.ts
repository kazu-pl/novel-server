import { Response } from "express";
import { RequestWithJWT } from "types/jwt.types";
import ActModel, { Act, ActType } from "models/Act.model";
import getTranslatedMessage from "utils/getTranslatedMessage";

const addAct = async (req: RequestWithJWT, res: Response) => {
  const { title, description, type, scenes, nextAct } = req.body as Act;

  if (!title || !description || !type || !scenes) {
    return res.status(400).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "nie podano tytułu, opisu, statusu lub scen",
        en: "title, description, status or scenes were not provided",
        de: "Titel, Beschreibung, Status oder Szenen wurden nicht angegeben",
      }),
    });
  }

  if (nextAct && typeof nextAct !== "string") {
    return res.status(400).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "nextAct powinien być typu string",
        en: "nextAct should be of type string",
        de: "nextAct sollte vom Typ string sein",
      }),
    });
  }

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof type !== "string"
  ) {
    return res.status(400).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "tytuł, opis, typ powinien być typu string",
        en: "title, description, type should be of type string",
        de: "Titel, Beschreibung, Typ sollten vom Typ Zeichenfolge sein",
      }),
    });
  }

  if (!(["start", "normal", "end"] as ActType[]).includes(type)) {
    return res.status(400).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: `Pole 'status' ma nieprawidłową wartość. Dozwolone wartości: ${
          "start" as ActType
        } lub  ${"normal" as ActType} lub ${"end" as ActType} `,
        en: `Status key has invalid value. Allowed values: ${
          "start" as ActType
        } or ${"normal" as ActType} or ${"end" as ActType}`,
        de: `Der Statusschlüssel hat einen ungültigen Wert. Zulässige Werte: ${
          "start" as ActType
        } oder ${"normal" as ActType} oder ${"end" as ActType}`,
      }),
    });
  }

  if (!Array.isArray(scenes)) {
    return res.status(400).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "sceny powinny być tablicą",
        en: "scenes should be an array",
        de: "Szenen sollten ein Array sein",
      }),
    });
  }

  // walidation of scenes objects here cdn...

  if (type === "start" || type === "end") {
    try {
      const act = await ActModel.findOne({ type }).exec();
      if (act) {
        return res.status(422).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: `Może istniec tylko 1 rozdział typu: ${type}`,
            en: `There may be only 1 Act with type: ${type}`,
            de: `Es darf nur 1 Akt mit Typ geben: ${type}`,
          }),
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Wystąpił błąd",
          en: "There was an error",
          de: "Es gab einen Fehler",
        }),
      });
    }
  }

  try {
    const act = await ActModel.findOne({ title }).exec();
    if (act) {
      return res.status(422).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Rozdział o tym tytule już istnieje",
          en: "Act with that title already exists",
          de: "Akt mit diesem Titel existiert bereits",
        }),
      });
    }

    await new ActModel({
      title,
      description,
      type,
      ...(nextAct && { nextAct }),
      scenes,
    }).save();
    return res.status(201).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Akt utworzony pomyślnie",
        en: "Act created successfuly",
        de: "Akt erfolgreich erstellt",
      }),
    });
  } catch (error) {
    return res.status(500).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Wystąpił błąd na serwerze podczas próby przetworzenia twojego żądania",
        en: "There was an error on the server while trying to process your request",
        de: "Beim Versuch, Ihre Anfrage zu verarbeiten, ist auf dem Server ein Fehler aufgetreten",
      }),
      error,
    });
  }
};

const updateAct = async (req: RequestWithJWT, res: Response) => {
  const { _id, title, description, type, scenes, nextAct } = req.body as Act & {
    _id: string;
  };

  if (!title || !description || !type || !scenes || !_id) {
    return res.status(400).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "nie podano tytułu, opisu, rodzaju lub scen",
        en: "title, description, type or scenes were not provided",
        de: "Titel, Beschreibung, Typ oder Szenen wurden nicht angegeben",
      }),
    });
  }

  if (nextAct && typeof nextAct !== "string") {
    return res.status(400).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "nextAct powinien być typu string",
        en: "nextAct should be of type string",
        de: "nextAct sollte vom Typ string sein",
      }),
    });
  }

  if (
    typeof _id !== "string" ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof type !== "string"
  ) {
    return res.status(400).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "_id, tytuł, opis, typ powinien być typu string",
        en: "_id, title, description, type should be of type string",
        de: "_id, Titel, Beschreibung, Typ sollte vom Typ Zeichenfolge sein",
      }),
    });
  }

  if (!(["start", "normal", "end"] as ActType[]).includes(type)) {
    return res.status(400).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: `'status' ma nieprawidlową wartość. Dozwolone wartości: ${
          "start" as ActType
        } lub ${"normal" as ActType} lub ${"end" as ActType}`,
        en: `Status key has invalid value. Allowed values: ${
          "start" as ActType
        } or ${"normal" as ActType} or ${"end" as ActType}`,
        de: `Der Statusschlüssel hat einen ungültigen Wert. Zulässige Werte: ${
          "start" as ActType
        } oder ${"normal" as ActType} oder ${"end" as ActType}`,
      }),
    });
  }

  if (!Array.isArray(scenes)) {
    return res.status(400).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "sceny powinny być tablicą",
        en: "scenes should be an array",
        de: "Szenen sollten ein Array sein",
      }),
    });
  }

  if (type === "end" && nextAct) {
    return res.status(400).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Akt typu 'end' nie może mieć pola 'nextAct'",
        en: "Act with type 'end' can't have 'nextAct' field",
        de: "Akt mit Typ 'end' darf kein 'nextAct'-Feld haben",
      }),
    });
  }

  // walidation of scenes objects here cdn...
  try {
    if (type === "start" || type === "end") {
      const act = await ActModel.findOne({ type }).exec();

      if (act && act.id !== _id) {
        return res.status(422).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: `Rozdział z typem "${type}" już istnieje`,
            en: `Act with type "${type}" already exists`,
            de: `Akt mit Typ "${type}" existiert bereits`,
          }),
        });
      }
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

  try {
    const act = await ActModel.findOne({ _id }).exec();

    if (!act) {
      return res.status(422).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Nie udało się znaleźć żadnego aktu o tym identyfikatorze",
          en: "Could not find any Act with that id",
          de: "Konnte keinen Akt mit dieser ID finden",
        }),
      });
    }

    await act
      .updateOne({
        title,
        description,
        type,
        scenes,
        nextAct: nextAct || "",
      })
      .exec();

    return res.status(200).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Rozdział zaktualizowany pomyślnie",
        en: "Act updated successfuly",
        de: "Akt erfolgreich aktualisiert",
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
};

const deleteAct = async (req: RequestWithJWT, res: Response) => {
  const id = req.params.id;

  try {
    await ActModel.deleteOne({ _id: id }).exec();

    return res.status(200).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Akt usunięty pomyślnie",
        en: "Act deleted successfuly",
        de: "Akt erfolgreich gelöscht",
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
};

const getSingleAct = async (req: RequestWithJWT, res: Response) => {
  const id = req.params.id;

  if (id === "start") {
    try {
      const startAct = await ActModel.findOne({ type: "start" }).exec();
      return res.status(200).json({
        data: startAct,
      });
    } catch (error) {
      return res.status(500).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Wystąpił błąd podczas próby przetworzenia Twojego żądania",
          en: "There was an error while trying to process your request",
          de: "Beim Versuch, Ihre Anfrage zu verarbeiten, ist ein Fehler aufgetreten",
        }),
        error,
      });
    }
  }

  try {
    const act = await ActModel.findOne({ _id: id }).exec();
    return res.status(200).json({
      data: act,
    });
  } catch (error) {
    return res.status(500).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Wystąpił błąd podczas próby przetworzenia Twojego żądania",
        en: "There was an error while trying to process your request",
        de: "Beim Versuch, Ihre Anfrage zu verarbeiten, ist ein Fehler aufgetreten",
      }),
      error,
    });
  }
};

const getAllActs = async (req: RequestWithJWT, res: Response) => {
  const { sortBy, sortDirection, pageSize, currentPage, search } = req.query;

  if (
    typeof sortBy !== "string" ||
    typeof sortDirection !== "string" ||
    typeof pageSize !== "string" ||
    typeof currentPage !== "string"
  ) {
    return res.status(400).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "sortBy, sortDirection, pageSize i currentPage powinny być typu string",
        en: "sortBy, sortDirection, pageSize and currentPage should be of type string",
        de: "sortBy, sortDirection, pageSize und currentPage sollten vom Typ string sein",
      }),
    });
  }

  const size = +pageSize;
  const page = +currentPage;

  if (typeof size !== "number" || typeof page !== "number") {
    return res.status(400).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "pageSize i currentPage powinny być typu string, ale wartość powinna nadal przypominać liczbę. Przykład: '1' lub '5'",
        en: "pageSize and currentPage should be of type string but the value should be still a number-like. Example: '1' or '5'",
        de: "pageSize und currentPage sollten vom Typ String sein, aber der Wert sollte immer noch eine Zahl sein. Beispiel: '1' oder '5'",
      }),
    });
  }

  if (sortDirection && !["asc", "desc"].includes(sortDirection)) {
    return res.status(400).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Nieprawidłowe zapytanie sortDirection. Dozwolone kierunki: 'asc' lub 'desc'",
        en: "Invalid sortDirection query. Allowed directions: 'asc' or 'desc'",
        de: "Ungültige sortDirection-Abfrage. Zulässige Richtungen: 'asc' oder 'desc'",
      }),
    });
  }

  const sortKey = sortBy || "createdAt";
  const direction = sortDirection === "asc" ? -1 : 1;

  try {
    const data = await ActModel.find({
      ...(search && {
        // found here: https://kb.objectrocket.com/mongo-db/mongoose-partial-text-search-606
        title: {
          $regex: search as string,
          $options: "i", // allow to search string/part of a string in the whole `title` value, not just if it starts with `search` value
        },
      }),
    })
      .limit(size)
      .sort({ [sortKey]: direction })
      .skip(size * (page - 1))
      // .skip(size * page) // use this if you want to start pagination at page=0 instead of page=1
      .exec();
    const totalItems = await ActModel.find({
      ...(search && {
        title: {
          $regex: search as string,
          $options: "i", // allow to search string/part of a string in the whole `title` value, not just if it starts with `search` value
        },
      }),
    }).countDocuments();

    return res.status(200).json({
      data,
      totalItems,
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
};

const getActsDictionary = async (req: RequestWithJWT, res: Response) => {
  try {
    const data = await ActModel.find().exec();

    return res.status(200).json({
      data: data
        .filter((act) => act.type !== ("start" as ActType))
        .map((item) => ({ id: item.id, title: item.title })),
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
};

export default {
  addAct,
  updateAct,
  deleteAct,
  getSingleAct,
  getAllActs,
  getActsDictionary,
};
