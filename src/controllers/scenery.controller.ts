import { Response } from "express";
import { RequestWithJWT } from "types/jwt.types";
import SceneryModel, { SceneryImage } from "models/Scenery.model";
import PhotoChunkModel from "models/PhotoChunk.model";
import PhotoFileModel from "models/PhotoFile.model";
import getTranslatedMessage from "utils/getTranslatedMessage";
import i18n from "i18n";
import { TranslationKey, TranslationNamespaces } from "locales/locales.types";

const getSceneries = async (req: RequestWithJWT, res: Response) => {
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
      message: i18n.t("anErrorOccured" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
      }),
      error,
    });
  }
};

const addScenery = async (req: RequestWithJWT, res: Response) => {
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
    const scenery = await SceneryModel.findOne({ title }).exec();
    if (scenery) {
      return res.status(422).json({
        message: i18n.t(
          "sceneryWithThatNameAlreadyExist" as TranslationKey["scenery"],
          {
            lng: req.headers["accept-language"],
            ns: "scenery" as TranslationNamespaces,
          }
        ),
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
          message: i18n.t("sceneryCreated" as TranslationKey["scenery"], {
            lng: req.headers["accept-language"],
            ns: "scenery" as TranslationNamespaces,
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

const getSingleScenery = async (req: RequestWithJWT, res: Response) => {
  try {
    const data = await SceneryModel.findOne({ _id: req.params.id }).exec();

    if (!data) {
      return res.status(404).json({
        message: i18n.t("sceneryNotFound" as TranslationKey["scenery"], {
          lng: req.headers["accept-language"],
          ns: "scenery" as TranslationNamespaces,
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

const deleteScenery = async (req: RequestWithJWT, res: Response) => {
  const id = req.params.id;

  try {
    await SceneryModel.deleteOne({ _id: id }).exec();
    return res.status(200).json({
      message: i18n.t("sceneryDeleted" as TranslationKey["scenery"], {
        lng: req.headers["accept-language"],
        ns: "scenery" as TranslationNamespaces,
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

const addSceneryImages = async (req: RequestWithJWT, res: Response) => {
  const sceneryId = req.params.id;

  if (!req.files) {
    return res.status(422).json({
      message: i18n.t("imagesNotProvided" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
      }),
    });
  }

  try {
    const scenery = await SceneryModel.findOne({ _id: sceneryId }).exec();

    if (!scenery) {
      return res.status(404).json({
        message: i18n.t(
          "sceneryWithThisIdNotExist" as TranslationKey["scenery"],
          {
            lng: req.headers["accept-language"],
            ns: "scenery" as TranslationNamespaces,
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
      } as SceneryImage;
    });

    await scenery
      .updateOne({
        imagesList: [...scenery.imagesList, ...newImages],
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

const deleteSceneryImage = async (req: RequestWithJWT, res: Response) => {
  const { scenery_id, img_filename } = req.params;

  try {
    const scenery = await SceneryModel.findOne({ _id: scenery_id }).exec();

    if (!scenery) {
      return res.status(404).json({
        message: i18n.t("sceneryNotFound" as TranslationKey["scenery"], {
          lng: req.headers["accept-language"],
          ns: "scenery" as TranslationNamespaces,
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

    await scenery
      .updateOne({
        imagesList: scenery.imagesList.filter(
          (item) => item.filename !== img_filename
        ),
      })
      .exec();

    return res.status(200).json({
      message: i18n.t("sceneryDeleted" as TranslationKey["scenery"], {
        lng: req.headers["accept-language"],
        ns: "scenery" as TranslationNamespaces,
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

const updateBasicSceneryData = async (req: RequestWithJWT, res: Response) => {
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
    const potentialSceneryWithTheSameName = await SceneryModel.findOne({
      title,
    }).exec();

    const scenery = await SceneryModel.findOne({ _id: id }).exec();

    if (!scenery) {
      return res.status(404).json({
        message: i18n.t("sceneryNotFound" as TranslationKey["scenery"], {
          lng: req.headers["accept-language"],
          ns: "scenery" as TranslationNamespaces,
        }),
      });
    }

    if (
      potentialSceneryWithTheSameName &&
      potentialSceneryWithTheSameName?.id !== scenery.id
    ) {
      return res.status(422).json({
        message: i18n.t(
          "sceneryWithThatNameAlreadyExist" as TranslationKey["scenery"],
          {
            lng: req.headers["accept-language"],
            ns: "scenery" as TranslationNamespaces,
          }
        ),
      });
    }

    await scenery.updateOne({ title, description }).exec();
    return res.status(200).json({
      message: i18n.t("sceneryUpdated" as TranslationKey["scenery"], {
        lng: req.headers["accept-language"],
        ns: "scenery" as TranslationNamespaces,
      }),
    });
  } catch (error) {
    return res.status(500).json({
      message: i18n.t("anErrorOccured" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "anErrorOccured" as TranslationNamespaces,
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
      message: i18n.t("anErrorOccured" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "anErrorOccured" as TranslationNamespaces,
      }),
      error,
    });
  }
};

const getSceneryImagesCount = async (req: RequestWithJWT, res: Response) => {
  try {
    const sceneries = await SceneryModel.find().exec();

    return res.status(200).json({
      data: sceneries.map((item) => ({
        id: item._id,
        name: item.title,
        imagesCount: item.imagesList.length,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      message: i18n.t("anErrorOccured" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "anErrorOccured" as TranslationNamespaces,
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
  getSceneryImagesCount,
};
