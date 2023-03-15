import { Response } from "express";
import { RequestWithJWT } from "types/jwt.types";
import CharacterModel, { CharacterImage } from "models/Character.model";
import PhotoChunkModel from "models/PhotoChunk.model";
import PhotoFileModel from "models/PhotoFile.model";
import i18n from "i18n";
import { TranslationKey, TranslationNamespaces } from "locales/locales.types";

const getCharacters = async (req: RequestWithJWT, res: Response) => {
  const { sortBy, sortDirection, pageSize, currentPage, search } = req.query;

  if (
    typeof sortBy !== "string" ||
    typeof sortDirection !== "string" ||
    typeof pageSize !== "string" ||
    typeof currentPage !== "string"
  ) {
    return res.status(400).json({
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "sortBy, sortDirection, pageSize, currentPage",
        type: "string",
      }),
    });
  }

  const size = +pageSize;
  const page = +currentPage;

  if (typeof size !== "number" || typeof page !== "number") {
    return res.status(400).json({
      message: i18n.t(
        "pageSizeAndCurrentPageShouldBeStringNumberlike" as TranslationKey["common"],
        {
          lng: req.headers["accept-language"],
          ns: "common" as TranslationNamespaces,
        }
      ),
    });
  }

  if (sortDirection && !["asc", "desc"].includes(sortDirection)) {
    return res.status(400).json({
      message: i18n.t("invalidSortDirection" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
      }),
    });
  }

  const sortKey = sortBy || "createdAt";
  const direction = sortDirection === "asc" ? -1 : 1;

  try {
    const allData = await CharacterModel.find({
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

    const totalItems = await CharacterModel.find({
      ...(search && {
        title: {
          $regex: search as string,
          $options: "i",
        },
      }),
    }).countDocuments();

    return res.status(200).json({
      data: allData,
      totalItems,
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
};

const addCharacter = async (req: RequestWithJWT, res: Response) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(422).json({
      message: i18n.t("titleNotProvied" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
      }),
    });
  }

  if (!description) {
    return res.status(422).json({
      message: i18n.t("descriptionNotProvied" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
      }),
    });
  }

  if (typeof title !== "string" || typeof description !== "string") {
    return res.status(422).json({
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "title, description",
        type: "string",
      }),
    });
  }

  try {
    const character = await CharacterModel.findOne({ title }).exec();
    if (character) {
      return res.status(422).json({
        message: i18n.t(
          "characterWithThisNameAlreadyExist" as TranslationKey["character"],
          {
            lng: req.headers["accept-language"],
            ns: "character" as TranslationNamespaces,
          }
        ),
      });
    }

    new CharacterModel({
      title,
      description,
      imagesList: [],
    })
      .save()
      .then(() => {
        return res.status(201).json({
          message: i18n.t("characterCreated" as TranslationKey["character"], {
            lng: req.headers["accept-language"],
            ns: "character" as TranslationNamespaces,
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
};

const getSingleCharacter = async (req: RequestWithJWT, res: Response) => {
  try {
    const data = await CharacterModel.findOne({ _id: req.params.id }).exec();

    if (!data) {
      return res.status(404).json({
        message: i18n.t("characterNotFound" as TranslationKey["character"], {
          lng: req.headers["accept-language"],
          ns: "character" as TranslationNamespaces,
        }),
      });
    }

    return res.status(200).json({
      data,
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
};

const deleteCharacter = async (req: RequestWithJWT, res: Response) => {
  const id = req.params.id;

  try {
    await CharacterModel.deleteOne({ _id: id }).exec();
    return res.status(200).json({
      message: i18n.t("characterDeleted" as TranslationKey["character"], {
        lng: req.headers["accept-language"],
        ns: "character" as TranslationNamespaces,
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
};

const addCharacterImages = async (req: RequestWithJWT, res: Response) => {
  const id = req.params.id;

  if (!req.files) {
    return res.status(422).json({
      message: i18n.t("imagesNotProvided" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
      }),
    });
  }

  try {
    const character = await CharacterModel.findOne({ _id: id }).exec();

    if (!character) {
      return res.status(404).json({
        message: i18n.t(
          "characterWithThisIdNotExist" as TranslationKey["character"],
          {
            lng: req.headers["accept-language"],
            ns: "character" as TranslationNamespaces,
          }
        ),
      });
    }

    if (!Array.isArray(req.files)) {
      return res.status(422).json({
        message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
          lng: req.headers["accept-language"],
          ns: "common" as TranslationNamespaces,
          key: "scenes",
          type: "array",
        }),
      });
    }

    const newImages = req.files.map((item) => {
      return {
        filename: item.filename,
        url: `/files/${item.filename}`,
        originalName: item.originalname,
      } as CharacterImage;
    });

    await character
      .updateOne({
        imagesList: [...character.imagesList, ...newImages],
      })
      .exec();

    return res.status(201).json({
      message: i18n.t("imagesAdded" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
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
};

const deleteCharacterImage = async (req: RequestWithJWT, res: Response) => {
  const { character_id, img_filename } = req.params;

  try {
    const character = await CharacterModel.findOne({
      _id: character_id,
    }).exec();

    if (!character) {
      return res.status(404).json({
        message: i18n.t("characterNotFound" as TranslationKey["character"], {
          lng: req.headers["accept-language"],
          ns: "character" as TranslationNamespaces,
        }),
      });
    }

    const imageToBeDeleted = await PhotoFileModel.findOne({
      filename: img_filename,
    });

    if (!imageToBeDeleted) {
      return res.status(404).json({
        message: i18n.t("imageNotFound" as TranslationKey["common"], {
          lng: req.headers["accept-language"],
          ns: "common" as TranslationNamespaces,
        }),
      });
    }

    await PhotoChunkModel.deleteMany({ files_id: imageToBeDeleted?._id });
    await imageToBeDeleted?.delete();

    await character
      .updateOne({
        imagesList: character.imagesList.filter(
          (item) => item.filename !== img_filename
        ),
      })
      .exec();

    return res.status(200).json({
      message: i18n.t("imageDeleted" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
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
};

const updateBasicCharacterData = async (req: RequestWithJWT, res: Response) => {
  const id = req.params.id;
  const { title, description } = req.body;

  if (!title) {
    return res.status(422).json({
      message: i18n.t("titleNotProvied" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
      }),
    });
  }
  if (!description) {
    return res.status(422).json({
      message: i18n.t("descriptionNotProvied" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
      }),
    });
  }

  if (typeof title !== "string" || typeof description !== "string") {
    return res.status(422).json({
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "title, description",
        type: "string",
      }),
    });
  }
  try {
    const potentialCharacterWithTheSameName = await CharacterModel.findOne({
      title,
    }).exec();

    const character = await CharacterModel.findOne({ _id: id }).exec();
    if (!character) {
      return res.status(404).json({
        message: i18n.t("characterNotFound" as TranslationKey["character"], {
          lng: req.headers["accept-language"],
          ns: "character" as TranslationNamespaces,
        }),
      });
    }

    if (
      potentialCharacterWithTheSameName &&
      potentialCharacterWithTheSameName?.id !== character.id
    ) {
      return res.status(422).json({
        message: i18n.t(
          "characterWithThisNameAlreadyExist" as TranslationKey["character"],
          {
            lng: req.headers["accept-language"],
            ns: "character" as TranslationNamespaces,
          }
        ),
      });
    }

    await character.updateOne({ title, description }).exec();
    return res.status(200).json({
      message: i18n.t("characterUpdated" as TranslationKey["character"], {
        lng: req.headers["accept-language"],
        ns: "character" as TranslationNamespaces,
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
};

const getCharactersDictionary = async (req: RequestWithJWT, res: Response) => {
  try {
    const characters = await CharacterModel.find().exec();

    return res.status(200).json({
      data: characters.map((item) => ({ id: item._id, title: item.title })),
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
};

const getCharacterImagesCount = async (req: RequestWithJWT, res: Response) => {
  try {
    const characters = await CharacterModel.find().exec();

    return res.status(200).json({
      data: characters.map((item) => ({
        id: item._id,
        name: item.title,
        imagesCount: item.imagesList.length,
      })),
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
};

export default {
  getCharacters,
  getSingleCharacter,
  addCharacter,
  addCharacterImages,
  updateBasicCharacterData,
  deleteCharacter,
  deleteCharacterImage,
  getCharactersDictionary,
  getCharacterImagesCount,
};
