import { Response } from "express";
import { RequestWithJWT } from "types/jwt.types";
import CharacterModel, { CharacterImage } from "models/Character.model";
import PhotoChunkModel from "models/PhotoChunk.model";
import PhotoFileModel from "models/PhotoFile.model";

const getCharacters = async (req: RequestWithJWT, res: Response) => {
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
    const data = await CharacterModel.find()
      .limit(size)
      .sort({ [sortKey]: direction })
      .skip(size * (page - 1))
      // .skip(size * page) // use this if you want to start pagination at page=0 instead of page=1
      .exec();
    const totalItems = await CharacterModel.countDocuments();

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

const addCharacter = async (req: RequestWithJWT, res: Response) => {
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
    const character = await CharacterModel.findOne({ title }).exec();
    if (character) {
      return res.status(422).json({
        message: "character with that name already exists",
      });
    }

    new CharacterModel({
      title,
      description,
      imagesList: [],
    })
      .save()
      .then(() => {
        return res
          .status(201)
          .json({ message: "character created successfuly" });
      })
      .catch((error) => {
        return res.status(500).json({
          message:
            "There was an error on the server while trying to process your request",
          error,
        });
      });
  } catch (error) {
    return res.status(500).json({
      message:
        "There was an error on the server while trying to process your request",
      error,
    });
  }
};

const getSingleCharacter = async (req: RequestWithJWT, res: Response) => {
  try {
    const data = await CharacterModel.findOne({ _id: req.params.id }).exec();

    if (!data) {
      return res.status(404).json({
        message: "character was not found",
      });
    }

    return res.status(200).json({
      data,
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occured",
      error,
    });
  }
};

const deleteCharacter = async (req: RequestWithJWT, res: Response) => {
  const id = req.params.id;

  try {
    await CharacterModel.deleteOne({ _id: id }).exec();
    return res.status(200).json({
      message: "character removed",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occured",
      error,
    });
  }
};

const addCharacterImages = async (req: RequestWithJWT, res: Response) => {
  const id = req.params.id;

  if (!req.files) {
    return res.status(422).json({
      message: "files were not provided or were provided not as 'files'",
    });
  }

  try {
    const character = await CharacterModel.findOne({ _id: id }).exec();

    if (!character) {
      return res.status(404).json({
        message: "character with that id does no exist",
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
      } as CharacterImage;
    });

    await character
      .updateOne({
        imagesList: [...character.imagesList, ...newImages],
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

const deleteCharacterImage = async (req: RequestWithJWT, res: Response) => {
  const { character_id, img_filename } = req.params;

  try {
    const character = await CharacterModel.findOne({
      _id: character_id,
    }).exec();

    if (!character) {
      return res.status(404).json({
        message: "Character was not found",
      });
    }

    const imageToBeDeleted = await PhotoFileModel.findOne({
      filename: img_filename,
    });
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
      message: "Image deleted sucessfuly",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occured",
      error,
    });
  }
};

const updateBasicCharacterData = async (req: RequestWithJWT, res: Response) => {
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
    const potentialCharacterWithTheSameName = await CharacterModel.findOne({
      title,
    }).exec();

    const character = await CharacterModel.findOne({ _id: id }).exec();
    if (!character) {
      return res.status(404).json({
        message: "Character was not found",
      });
    }

    if (
      potentialCharacterWithTheSameName &&
      potentialCharacterWithTheSameName?.id !== character.id
    ) {
      return res.status(422).json({
        message: "character with that name already exists",
      });
    }

    await character.updateOne({ title, description }).exec();
    return res.status(200).json({
      message: "Character was updated successfuly",
    });
  } catch (error) {
    return res.status(500).json({
      message: "There was an error  while trying to process your request",
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
      message: "There was an error while trying to process your request",
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
};
