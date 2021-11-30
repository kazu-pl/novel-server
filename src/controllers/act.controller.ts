import { Response } from "express";
import { RequestWithJWT } from "types/jwt.types";
import ActModel, { Act, ActType } from "models/Act.model";

const addAct = async (req: RequestWithJWT, res: Response) => {
  const { title, description, type, scenes, nextActId } = req.body as Act;

  if (!title || !description || !type || !scenes) {
    return res.status(400).json({
      message: "title, description, status or scenes were not provided",
    });
  }

  if (nextActId && typeof nextActId !== "string") {
    return res.status(400).json({
      message: "nextActId should be of type string",
    });
  }

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof type !== "string"
  ) {
    return res.status(400).json({
      message: "title, description, type should be of type string",
    });
  }

  if (!(["start", "normal", "end"] as ActType[]).includes(type)) {
    return res.status(400).json({
      message: `Status key has invalid value. Allowed values: ${
        "start" as ActType
      } or ${"normal" as ActType} or ${"end" as ActType}`,
    });
  }

  if (!Array.isArray(scenes)) {
    return res.status(400).json({
      message: "scenes should be an array",
    });
  }

  // walidation of scenes objects here cdn...

  if (type === "start" || type === "end") {
    try {
      const act = await ActModel.findOne({ type }).exec();
      if (act) {
        return res.status(422).json({
          message: `There may be only 1 Act with type : ${type}`,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "There was an error",
      });
    }
  }

  try {
    const act = await ActModel.findOne({ title }).exec();
    if (act) {
      return res.status(422).json({
        message: "Act with that title already exists",
      });
    }

    await new ActModel({
      title,
      description,
      type,
      ...(nextActId && { nextActId }),
      scenes,
    }).save();
    return res.status(201).json({ message: "Act created successfuly" });
  } catch (error) {
    return res.status(500).json({
      message:
        "There was an error on the server while trying to process your request",
      error,
    });
  }
};

const updateAct = async (req: RequestWithJWT, res: Response) => {
  const { _id, title, description, type, scenes, nextActId } =
    req.body as Act & {
      _id: string;
    };

  if (!title || !description || !type || !scenes || !_id) {
    return res.status(400).json({
      message: "title, description, type or scenes were not provided",
    });
  }

  if (nextActId && typeof nextActId !== "string") {
    return res.status(400).json({
      message: "nextActId should be of type string",
    });
  }

  if (
    typeof _id !== "string" ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof type !== "string"
  ) {
    return res.status(400).json({
      message: "_id, title, description, type should be of type string",
    });
  }

  if (!(["start", "normal", "end"] as ActType[]).includes(type)) {
    return res.status(400).json({
      message: `Status key has invalid value. Allowed values: ${
        "start" as ActType
      } or ${"normal" as ActType} or ${"end" as ActType}`,
    });
  }

  if (!Array.isArray(scenes)) {
    return res.status(400).json({
      message: "scenes should be an array",
    });
  }

  // walidation of scenes objects here cdn...

  try {
    const act = await ActModel.findOne({ _id }).exec();

    if (!act) {
      return res.status(422).json({
        message: "Could not find any Act with that id",
      });
    }

    await act
      .updateOne({
        ...act,
        // _id,
        title,
        description,
        type,
        scenes,
      })
      .exec();

    return res.status(200).json({
      message: "Act updated successfuly",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occured",
      error,
    });
  }
};

const deleteAct = async (req: RequestWithJWT, res: Response) => {
  const id = req.params.id;

  try {
    await ActModel.deleteOne({ _id: id }).exec();

    return res.status(200).json({
      message: "Act deleted successfuly",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occured",
      error,
    });
  }
};

const getSingleAct = async (req: RequestWithJWT, res: Response) => {
  const { nextActId } = req.body as Required<Pick<Act, "nextActId">>;

  if (typeof nextActId !== "string") {
    return res.status(400).json({
      message: "nextActId should be of type string",
    });
  }

  if (nextActId === "start") {
    try {
      const startAct = await ActModel.findOne({ type: nextActId }).exec();
      return res.status(200).json({
        data: startAct,
      });
    } catch (error) {
      return res.status(500).json({
        message: "There was an error while trying to process your request",
        error,
      });
    }
  }

  try {
    const act = await ActModel.findOne({ id: nextActId }).exec();
    return res.status(200).json({
      data: act,
    });
  } catch (error) {
    return res.status(500).json({
      message: "There was an error while trying to process your request",
      error,
    });
  }
};

const getAllActs = async (req: RequestWithJWT, res: Response) => {
  const { sortBy, sortDirection, pageSize, currentPage } = req.query;

  if (
    typeof sortBy !== "string" ||
    typeof sortDirection !== "string" ||
    typeof pageSize !== "string" ||
    typeof currentPage !== "string"
  ) {
    return res.status(400).json({
      message:
        "sortBy, sortDirection, pageSize and currentPage should be of type string",
    });
  }

  const size = +pageSize;
  const page = +currentPage;

  if (typeof size !== "number" || typeof page !== "number") {
    return res.status(400).json({
      message:
        "pageSize and currentPage should be of type string but the value should be still a number-like. Example: '1' or '5'",
    });
  }

  if (sortDirection && !["asc", "desc"].includes(sortDirection)) {
    return res.status(400).json({
      message:
        "Invalid sortDirection query. Allowed directions: 'asc' or 'desc'",
    });
  }

  const sortKey = sortBy || "createdAt";
  const direction = sortDirection === "asc" ? -1 : 1;

  try {
    const data = await ActModel.find()
      .limit(size)
      .sort({ [sortKey]: direction })
      .skip(size * (page - 1))
      // .skip(size * page) // use this if you want to start pagination at page=0 instead of page=1
      .exec();
    const totalItems = await ActModel.countDocuments();

    return res.status(200).json({
      data,
      totalItems,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occured",
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
      message: "An error occured",
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
