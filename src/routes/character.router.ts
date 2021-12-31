import express from "express";
import authenticate from "middleware/authenticate";
import authorize from "middleware/authorize";
import { PATHS_CHARACTERS } from "constants/paths";
import characterController from "controllers/character.controller";
import fileUpload from "middleware/fileUpload";

const characterRouter = express.Router();

/**
 * @swagger
 * /characters:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to get list of characters
 *    tags: [Characters]
 *    parameters:
 *    - in: query
 *      name: sortBy
 *      schema:
 *        type: string
 *      required: false
 *      description: sory by. Default sort is asc by createdAt
 *    - in: query
 *      name: sortDirection
 *      description: data sorting direction
 *      schema:
 *        type: string
 *        enum: [asc, desc]
 *      required: false
 *    responses:
 *      200:
 *        description: list of characters
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/CharactersResponse'
 *      401:
 *        description: unauthorized
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured
 */
characterRouter.get(
  PATHS_CHARACTERS.ALL,
  authenticate,
  authorize("admin"),
  characterController.getCharacters
);

/**
 * @swagger
 * path:
 * /characters/dictionary":
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to add new character
 *    tags: [Characters]
 *    responses:
 *      200:
 *        description: list of characters
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/SingleCharacterResponse'
 *      401:
 *        description: unauhhorized
 *      500:
 *        description: An error occured
 */
characterRouter.get(
  PATHS_CHARACTERS.DICTIONARY,
  authenticate,
  authorize("admin"),
  characterController.getCharactersDictionary
);

/**
 * @swagger
 * path:
 * /characters/{id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to add new character
 *    tags: [Characters]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: get single character by its id
 *    responses:
 *      200:
 *        description: list of characters
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/SingleCharacterResponse'
 *      401:
 *        description: unauhhorized
 *      404:
 *        description: character was not found
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured
 */
characterRouter.get(
  PATHS_CHARACTERS.CHARACTER_GET,
  authenticate,
  authorize("admin"),
  characterController.getSingleCharacter
);

/**
 * @swagger
 * path:
 * /characters/add:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to add new character
 *    tags: [Characters]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RequestCharacter'
 *    responses:
 *      200:
 *        description: A successful resposne
 *      401:
 *        description: unauthorized
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured
 */
characterRouter.post(
  PATHS_CHARACTERS.ADD,
  authenticate,
  authorize("admin"),
  characterController.addCharacter
);

/**
 * @swagger
 * path:
 * /characters/{id}/edit:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: update single character
 *    tags: [Characters]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: get single character by its id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RequestCharacter'
 *    responses:
 *      200:
 *        description: A successful resposne
 *      401:
 *        description: unauthorized
 *      404:
 *        description: character not found
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured
 */
characterRouter.patch(
  PATHS_CHARACTERS.CHARACTER_BASIC_EDIT,
  authenticate,
  authorize("admin"),
  characterController.updateBasicCharacterData
);

/**
 * @swagger
 * path:
 * /characters/:id/delete:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: delete single character
 *    tags: [Characters]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: character id
 *    responses:
 *      200:
 *        description: A successful resposne
 *      401:
 *        description: unauthorized
 *      404:
 *        description: character not found
 *      500:
 *        description: An error occured
 */
characterRouter.delete(
  PATHS_CHARACTERS.CHARACTER_DELETE,
  authenticate,
  authorize("admin"),
  characterController.deleteCharacter
);

/**
 * @swagger
 * path:
 * /characters/{id}/images:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: add character images
 *    tags: [Characters]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: character id
 *    responses:
 *      200:
 *        description: A successful resposne
 *      401:
 *        description: unauthorized
 *      404:
 *        description: character not found
 *      500:
 *        description: An error occured
 */
characterRouter.post(
  PATHS_CHARACTERS.CHARACTER_ADD_IMAGES,
  authenticate,
  authorize("admin"),
  fileUpload.array("files"),
  characterController.addCharacterImages
);

/**
 * @swagger
 * path:
 * /characters/{character_id}/image/{img_filename}/delete:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: delete single image of particular character
 *    tags: [Characters]
 *    parameters:
 *      - in: path
 *        name: character_id
 *        schema:
 *          type: string
 *        required: true
 *        description: character character_id
 *      - in: path
 *        name: img_filename
 *        schema:
 *          type: string
 *        required: true
 *        description: scenery image id
 *    responses:
 *      200:
 *        description: A successful resposne
 *      401:
 *        description: unauthorized
 *      404:
 *        description: character not found
 *      500:
 *        description: An error occured
 */
characterRouter.delete(
  PATHS_CHARACTERS.CHARACTER_IMAGE_DELETE,
  authenticate,
  authorize("admin"),
  characterController.deleteCharacterImage
);

export default characterRouter;
