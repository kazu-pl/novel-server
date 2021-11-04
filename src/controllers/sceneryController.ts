import { Response } from "express";
import { RequestWithJWT } from "types/jwt.types";
import SceneryModel, { SceneryImage } from "models/SceneryModel";
import PhotoChunkModel from "models/PhotoChunkModel";
import PhotoFileModel from "models/PhotoFileModel";

const getSceneries = async (req: RequestWithJWT, res: Response) => {
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
    const data = await SceneryModel.find()
      .limit(size)
      .sort({ [sortKey]: direction })
      .skip(size * (page - 1))
      // .skip(size * page) // use this if you want to start pagination at page=0 instead of page=1
      .exec();
    const totalItems = await SceneryModel.countDocuments();

    return res.status(200).json({
      data,
      totalItems,
    });
  } catch (error) {
    return res.status(500).json({
      message: "User profile not found",
      error,
    });
  }
};

const addScenery = async (req: RequestWithJWT, res: Response) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(422).json({
      message: "title and/or description was not provided",
    });
  }

  if (typeof title !== "string" || typeof description !== "string") {
    return res.status(422).json({
      message: "title and description should be of type string",
    });
  }

  // if (!req.files || !Array.isArray(req.files)) {
  //   return res.status(422).json({
  //     message: "files were not provided or were not an array",
  //   });
  // }
  try {
    const scenery = await SceneryModel.findOne({ title }).exec();
    if (scenery) {
      return res.status(422).json({
        message: "scenery with that name already exists",
      });
    }

    new SceneryModel({
      title,
      description,
      imagesList: [],
    })
      .save()
      .then(() => {
        return res.status(201).json({ message: "scenery created successfuly" });
      })
      .catch((error) => {
        return res.status(500).json({
          message:
            "There was an error on the serer while trying to process your request",
          error,
        });
      });
  } catch (error) {
    return res.status(500).json({
      message:
        "There was an error on the serer while trying to process your request",
      error,
    });
  }
};

const getSingleScenery = async (req: RequestWithJWT, res: Response) => {
  try {
    const data = await SceneryModel.findOne({ _id: req.params.id }).exec();

    if (!data) {
      return res.status(404).json({
        message: "Scenery was not found",
      });
    }

    return res.status(200).json({
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error Occured",
      error,
    });
  }
};

const deleteScenery = async (req: RequestWithJWT, res: Response) => {
  const id = req.params.id;

  try {
    await SceneryModel.deleteOne({ _id: id }).exec();
    return res.status(200).json({
      message: "Scenery removed",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error Occured",
      error,
    });
  }
};

const addSceneryImages = async (req: RequestWithJWT, res: Response) => {
  const sceneryId = req.params.id;

  if (!req.files) {
    return res.status(422).json({
      message: "files were not provided or were provided not as 'files'",
    });
  }

  try {
    const scenery = await SceneryModel.findOne({ _id: sceneryId }).exec();

    if (!scenery) {
      return res.status(404).json({
        message: "scenery with that id does no exist",
      });
    }

    if (!Array.isArray(req.files)) {
      return res.status(422).json({
        message: "Files were not an array",
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
      message: "images added successfuly",
    });
  } catch (error) {
    return res.status(500).json({
      message: "there was an error when trying to add images",
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
        message: "Scenery was not found",
      });
    }

    const imageToBeDeleted = await PhotoFileModel.findOne({
      filename: img_filename,
    });
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
      message: "iamge deleted sucessfuly",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error Occured",
      error,
    });
  }
};

const updateBasicSceneryData = async (req: RequestWithJWT, res: Response) => {
  const id = req.params.id;
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(422).json({
      message: "title and/or description was not provided",
    });
  }

  if (typeof title !== "string" || typeof description !== "string") {
    return res.status(422).json({
      message: "title and description should be of type string",
    });
  }
  try {
    const scenery = await SceneryModel.findOne({ _id: id }).exec();
    if (!scenery) {
      return res.status(404).json({
        message: "scenery was not found",
      });
    }

    await scenery.updateOne({ title, description }).exec();
    return res.status(200).json({
      message: "Scenery was updated successfuly",
    });
  } catch (error) {
    return res.status(500).json({
      message: "There was an error  while trying to process your request",
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
};
