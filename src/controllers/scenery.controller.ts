import { Response } from "express";
import { RequestWithJWT } from "types/jwt.types";
import SceneryModel, { SceneryImage } from "models/Scenery.model";
import PhotoChunkModel from "models/PhotoChunk.model";
import PhotoFileModel from "models/PhotoFile.model";
import getTranslatedMessage from "utils/getTranslatedMessage";

const getSceneries = async (req: RequestWithJWT, res: Response) => {
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
    const data = await SceneryModel.find({
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
    const totalItems = await SceneryModel.find({
      ...(search && {
        // found here: https://kb.objectrocket.com/mongo-db/mongoose-partial-text-search-606
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

const addScenery = async (req: RequestWithJWT, res: Response) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "nie podano tytułu i/lub opisu",
        en: "title and/or description was not provided",
        de: "Titel und/oder Beschreibung wurde nicht angegeben",
      }),
    });
  }

  if (typeof title !== "string" || typeof description !== "string") {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "tytuł i opis powinny być typu string",
        en: "title and description should be of type string",
        de: "Titel und Beschreibung sollten vom Typ String sein",
      }),
    });
  }

  try {
    const scenery = await SceneryModel.findOne({ title }).exec();
    if (scenery) {
      return res.status(422).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "sceneria o tej nazwie już istnieje",
          en: "scenery with that name already exists",
          de: "Szenerie mit diesem Namen existiert bereits",
        }),
      });
    }

    new SceneryModel({
      title,
      description,
      imagesList: [],
    })
      .save()
      .then(() => {
        return res.status(201).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "sceneria stworzona pomyślnie",
            en: "scenery with that name already exists",
            de: "Landschaft erfolgreich erstellt",
          }),
        });
      })
      .catch((error) => {
        return res.status(500).json({
          message: getTranslatedMessage(req.headers["accept-language"], {
            pl: "Wystąpił błąd na serwerze podczas próby przetworzenia twojego żądania",
            en: "There was an error on the server while trying to process your request",
            de: "Beim Versuch, Ihre Anfrage zu verarbeiten, ist auf dem Server ein Fehler aufgetreten",
          }),
          error,
        });
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

const getSingleScenery = async (req: RequestWithJWT, res: Response) => {
  try {
    const data = await SceneryModel.findOne({ _id: req.params.id }).exec();

    if (!data) {
      return res.status(404).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Nie znaleziono scenerii",
          en: "Scenery was not found",
          de: "Landschaft wurde nicht gefunden",
        }),
      });
    }

    return res.status(200).json({
      data,
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

const deleteScenery = async (req: RequestWithJWT, res: Response) => {
  const id = req.params.id;

  try {
    await SceneryModel.deleteOne({ _id: id }).exec();
    return res.status(200).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Sceniera została usunięta",
        en: "Scenery removed",
        de: "Landschaft entfernt",
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

const addSceneryImages = async (req: RequestWithJWT, res: Response) => {
  const sceneryId = req.params.id;

  if (!req.files) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "pliki nie zostały dostarczone lub nie zostały dostarczone jako 'pliki'",
        en: "files were not provided or were provided not as 'files'",
        de: "Dateien wurden nicht oder nicht als 'Dateien' bereitgestellt",
      }),
    });
  }

  try {
    const scenery = await SceneryModel.findOne({ _id: sceneryId }).exec();

    if (!scenery) {
      return res.status(404).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "sceneria z tym identyfikatorem nie istnieje",
          en: "scenery with that id does no exist",
          de: "Szenerie mit dieser ID existiert nicht",
        }),
      });
    }

    if (!Array.isArray(req.files)) {
      return res.status(422).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Pliki nie były tablicą",
          en: "Files were not an array",
          de: "Dateien waren kein Array",
        }),
      });
    }

    const newImages = req.files.map((item) => {
      return {
        filename: item.filename,
        url: `/files/${item.filename}`,
        originalName: item.originalname,
      } as SceneryImage;
    });

    await scenery
      .updateOne({
        imagesList: [...scenery.imagesList, ...newImages],
      })
      .exec();

    return res.status(201).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "obrazy dodane pomyślnie",
        en: "images added successfuly",
        de: "Bilder erfolgreich hinzugefügt",
      }),
    });
  } catch (error) {
    return res.status(500).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "wystąpił błąd podczas próby dodania zdjęć",
        en: "there was an error when trying to add images",
        de: "Beim Hinzufügen von Bildern ist ein Fehler aufgetreten",
      }),
      error,
    });
  }
};

const deleteSceneryImage = async (req: RequestWithJWT, res: Response) => {
  const { scenery_id, img_filename } = req.params;

  try {
    const scenery = await SceneryModel.findOne({ _id: scenery_id }).exec();

    if (!scenery) {
      return res.status(404).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Nie znaleziono scenerii",
          en: "Scenery was not found",
          de: "Landschaft wurde nicht gefunden",
        }),
      });
    }

    const imageToBeDeleted = await PhotoFileModel.findOne({
      filename: img_filename,
    });

    if (!imageToBeDeleted) {
      return res.status(404).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Nie znaleziono zdjęcia",
          en: "IMG was not found",
          de: "IMG wurde nicht gefunden",
        }),
      });
    }

    await PhotoChunkModel.deleteMany({ files_id: imageToBeDeleted?._id });
    await imageToBeDeleted?.delete();

    await scenery
      .updateOne({
        imagesList: scenery.imagesList.filter(
          (item) => item.filename !== img_filename
        ),
      })
      .exec();

    return res.status(200).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "obraz usunięty pomyślnie",
        en: "image deleted sucessfuly",
        de: "Bild erfolgreich gelöscht",
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

const updateBasicSceneryData = async (req: RequestWithJWT, res: Response) => {
  const id = req.params.id;
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "nie podano tytułu i/lub opisu",
        en: "title and/or description was not provided",
        de: "Titel und/oder Beschreibung wurde nicht angegeben",
      }),
    });
  }

  if (typeof title !== "string" || typeof description !== "string") {
    return res.status(422).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "tytuł i opis powinny być typu string",
        en: "title and description should be of type string",
        de: "Titel und Beschreibung sollten vom Typ String sein",
      }),
    });
  }
  try {
    const potentialSceneryWithTheSameName = await SceneryModel.findOne({
      title,
    }).exec();

    const scenery = await SceneryModel.findOne({ _id: id }).exec();

    if (!scenery) {
      return res.status(404).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "nie znaleziono scenerii",
          en: "scenery was not found",
          de: "Szenerie wurde nicht gefunden",
        }),
      });
    }

    if (
      potentialSceneryWithTheSameName &&
      potentialSceneryWithTheSameName?.id !== scenery.id
    ) {
      return res.status(422).json({
        message: getTranslatedMessage(req.headers["accept-language"], {
          pl: "Sceneria o tej nazwie już istnieje",
          en: "Scenery with that name already exists",
          de: "Szenerie mit diesem Namen existiert bereits",
        }),
      });
    }

    await scenery.updateOne({ title, description }).exec();
    return res.status(200).json({
      message: getTranslatedMessage(req.headers["accept-language"], {
        pl: "Sceneria została zaktualizowana pomyślnie",
        en: "Scenery was updated successfuly",
        de: "Szenerie wurde erfolgreich aktualisiert",
      }),
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

const getSceneryDictionary = async (req: RequestWithJWT, res: Response) => {
  try {
    const sceneries = await SceneryModel.find().exec();

    return res.status(200).json({
      data: sceneries.map((item) => ({ id: item._id, title: item.title })),
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

export default {
  getSceneries,
  getSingleScenery,
  addScenery,
  addSceneryImages,
  updateBasicSceneryData,
  deleteScenery,
  deleteSceneryImage,
  getSceneryDictionary,
};
