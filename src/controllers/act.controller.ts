import { Response } from "express";
import { RequestWithJWT } from "types/jwt.types";
import ActModel, { Act, ActType } from "models/Act.model";
import i18n from "i18n";
import { TranslationKey, TranslationNamespaces } from "locales/locales.types";

const addAct = async (req: RequestWithJWT, res: Response) => {
  const { title, description, type, scenes, nextAct } = req.body as Act;

  if (!title || !description || !type || !scenes) {
    return res.status(400).json({
      message: i18n.t(
        "titleDescriptionStatusScenesWereNotProvided" as TranslationKey["act"],
        {
          lng: req.headers["accept-language"],
          ns: "act" as TranslationNamespaces,
        }
      ),
    });
  }

  if (nextAct && typeof nextAct !== "string") {
    return res.status(400).json({
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "nextAct",
        type: "string",
      }),
    });
  }

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof type !== "string"
  ) {
    return res.status(400).json({
      message: i18n.t(
        "titleDescriptionShouldBeString" as TranslationKey["act"],
        {
          lng: req.headers["accept-language"],
          ns: "act" as TranslationNamespaces,
        }
      ),
    });
  }

  if (!(["start", "normal", "end"] as ActType[]).includes(type)) {
    return res.status(400).json({
      message: i18n.t("keyHasInvalidValue" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "status",
        allowedValues: `${"start" as ActType}, ${"normal" as ActType}, ${
          "end" as ActType
        }`,
      }),
    });
  }

  if (!Array.isArray(scenes)) {
    return res.status(400).json({
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "scenes",
        type: "array",
      }),
    });
  }

  // walidation of scenes objects here cdn...

  if (type === "start" || type === "end") {
    try {
      const act = await ActModel.findOne({ type }).exec();
      if (act) {
        return res.status(422).json({
          message: i18n.t("onlyOneActWithType" as TranslationKey["act"], {
            lng: req.headers["accept-language"],
            ns: "act" as TranslationNamespaces,
            type,
          }),
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: i18n.t("anErrorOccured" as TranslationKey["common"], {
          lng: req.headers["accept-language"],
          ns: "common" as TranslationNamespaces,
        }),
      });
    }
  }

  try {
    const act = await ActModel.findOne({ title }).exec();
    if (act) {
      return res.status(422).json({
        message: i18n.t(
          "actWithThisTitleAlreadyExists" as TranslationKey["act"],
          {
            lng: req.headers["accept-language"],
            ns: "act" as TranslationNamespaces,
          }
        ),
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
      message: i18n.t("actCreatedSuccessfuly" as TranslationKey["act"], {
        lng: req.headers["accept-language"],
        ns: "act" as TranslationNamespaces,
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

const updateAct = async (req: RequestWithJWT, res: Response) => {
  const { _id, title, description, type, scenes, nextAct } = req.body as Act & {
    _id: string;
  };

  if (!title || !description || !type || !scenes || !_id) {
    return res.status(400).json({
      message: i18n.t(
        "requiredFieldsWereNotProvided" as TranslationKey["common"],
        {
          lng: req.headers["accept-language"],
          ns: "common" as TranslationNamespaces,
        }
      ),
    });
  }

  if (nextAct && typeof nextAct !== "string") {
    return res.status(400).json({
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "nextAct",
        type: "string",
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
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "_id, title, description, type",
        type: "string",
      }),
    });
  }

  if (!(["start", "normal", "end"] as ActType[]).includes(type)) {
    return res.status(400).json({
      message: i18n.t("keyHasInvalidValue" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "status",
        allowedValues: `${"start" as ActType}, ${"normal" as ActType}, ${
          "end" as ActType
        }`,
      }),
    });
  }

  if (!Array.isArray(scenes)) {
    return res.status(400).json({
      message: i18n.t("shouldBeOfType" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
        key: "scenes",
        type: "array",
      }),
    });
  }

  if (type === "end" && nextAct) {
    return res.status(400).json({
      message: i18n.t("endActCantHaveNextActField" as TranslationKey["act"], {
        lng: req.headers["accept-language"],
        ns: "act" as TranslationNamespaces,
      }),
    });
  }

  // walidation of scenes objects here cdn...
  try {
    if (type === "start" || type === "end") {
      const act = await ActModel.findOne({ type }).exec();

      if (act && act.id !== _id) {
        return res.status(422).json({
          message: i18n.t(
            "actWithThisTypeAlreadyExists" as TranslationKey["act"],
            {
              lng: req.headers["accept-language"],
              ns: "act" as TranslationNamespaces,
              type,
            }
          ),
        });
      }
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

  try {
    const act = await ActModel.findOne({ _id }).exec();

    if (!act) {
      return res.status(422).json({
        message: i18n.t("couldNotFindActWithThisId" as TranslationKey["act"], {
          lng: req.headers["accept-language"],
          ns: "act" as TranslationNamespaces,
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
      message: i18n.t("actUpdatedSuccessfuly" as TranslationKey["act"], {
        lng: req.headers["accept-language"],
        ns: "act" as TranslationNamespaces,
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

const deleteAct = async (req: RequestWithJWT, res: Response) => {
  const id = req.params.id;

  try {
    await ActModel.deleteOne({ _id: id }).exec();

    return res.status(200).json({
      message: i18n.t("actDeletedSuccessfuly" as TranslationKey["act"], {
        lng: req.headers["accept-language"],
        ns: "act" as TranslationNamespaces,
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
        message: i18n.t("anErrorOccured" as TranslationKey["common"], {
          lng: req.headers["accept-language"],
          ns: "common" as TranslationNamespaces,
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
      message: i18n.t("anErrorOccured" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
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
      message: i18n.t("anErrorOccured" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
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
      message: i18n.t("anErrorOccured" as TranslationKey["common"], {
        lng: req.headers["accept-language"],
        ns: "common" as TranslationNamespaces,
      }),
      error,
    });
  }
};

const getActsScenesCount = async (req: RequestWithJWT, res: Response) => {
  try {
    const acts = await ActModel.find().exec();

    return res.status(200).json({
      data: acts.map((item) => ({
        id: item._id,
        name: item.title,
        count: item.scenes.length,
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

const getActsDialogsCount = async (req: RequestWithJWT, res: Response) => {
  try {
    const acts = await ActModel.find().exec();

    return res.status(200).json({
      data: acts.map((item) => ({
        id: item._id,
        name: item.title,
        count: item.scenes.reduce((acc, curr) => {
          return acc + curr.dialogs.length;
        }, 0),
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
  addAct,
  updateAct,
  deleteAct,
  getSingleAct,
  getAllActs,
  getActsDictionary,
  getActsScenesCount,
  getActsDialogsCount,
};
