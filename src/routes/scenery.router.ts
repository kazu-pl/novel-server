import express from "express";
import authenticate from "middleware/authenticate";
import authorize from "middleware/authorize";
import { PATHS_SCENERIES } from "constants/paths";
import sceneryController from "controllers/scenery.controller";
import fileUpload from "middleware/fileUpload";

const sceneryRouter = express.Router();

/**
 * @swagger
 * /scenery:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to get list of sceneries
 *    tags: [Scenery]
 *    parameters:
 *    - in: query
 *      name: sortBy
 *      schema:
 *        type: string
 *      required: true
 *      description: sory by. Default sort is asc by createdAt
 *    - in: query
 *      name: sortDirection
 *      description: data sorting direction
 *      schema:
 *        type: string
 *        enum: [asc, desc]
 *      required: true
 *    - in: query
 *      name: pageSize
 *      schema:
 *        type: string
 *      required: true
 *      description: number of sceneries you fetch at a single request
 *    - in: query
 *      name: currentPage
 *      schema:
 *        type: string
 *      required: true
 *      description: number of current page in paginated list e.g.'5' page
 *    - in: query
 *      name: search
 *      schema:
 *        type: string
 *      required: false
 *      description: scenery name if you want to search sceneries by theirs name
 *    responses:
 *      200:
 *        description: list of sceneries
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/SceneriesResponse'
 *      401:
 *        description: unauthorized
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured
 */
sceneryRouter.get(
  PATHS_SCENERIES.ALL,
  authenticate,
  authorize("admin"),
  sceneryController.getSceneries
);

/**
 * @swagger
 * /scenery/dictionary:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to get list of sceneries
 *    tags: [Scenery]
 *    responses:
 *      200:
 *        description: list of sceneries
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/SceneriesDictionary'
 *      401:
 *        description: unauthorized
 *      500:
 *        description: An error occured
 */
sceneryRouter.get(
  PATHS_SCENERIES.DICTIONARY,
  authenticate,
  authorize("admin"),
  sceneryController.getSceneryDictionary
);

/**
 * @swagger
 * path:
 * /scenery/{id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to add new scenery
 *    tags: [Scenery]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: get single scenery by its id
 *    responses:
 *      200:
 *        description: list of sceneries
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/SingleSceneryResponse'
 *      401:
 *        description: unauthorized
 *      404:
 *        description: Scenery was not found
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured
 */
sceneryRouter.get(
  PATHS_SCENERIES.SCENERY_GET,
  authenticate,
  authorize("admin"),
  sceneryController.getSingleScenery
);

/**
 * @swagger
 * path:
 * /scenery/add:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to add new scenery
 *    tags: [Scenery]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RequestScenery'
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
sceneryRouter.post(
  PATHS_SCENERIES.ADD,
  authenticate,
  authorize("admin"),
  sceneryController.addScenery
);

/**
 * @swagger
 * path:
 * /scenery/{id}/edit:
 *  patch:
 *    security:
 *      - bearerAuth: []
 *    summary: update single scenery
 *    tags: [Scenery]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: get single scenery by its id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RequestScenery'
 *    responses:
 *      200:
 *        description: A successful resposne
 *      401:
 *        description: unauthorized
 *      404:
 *        description: scenery not found
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured
 */
sceneryRouter.patch(
  PATHS_SCENERIES.SCENERY_BASIC_EDIT,
  authenticate,
  authorize("admin"),
  sceneryController.updateBasicSceneryData
);

/**
 * @swagger
 * path:
 * /scenery/:id/delete:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: delete single scenery
 *    tags: [Scenery]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: scenery id
 *    responses:
 *      200:
 *        description: A successful resposne
 *      401:
 *        description: unauthorized
 *      404:
 *        description: scenery not found
 *      500:
 *        description: An error occured
 */
sceneryRouter.delete(
  PATHS_SCENERIES.SCENERY_DELETE,
  authenticate,
  authorize("admin"),
  sceneryController.deleteScenery
);

/**
 * @swagger
 * path:
 * /scenery/{id}/images:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: add images scenery
 *    tags: [Scenery]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: scenery id
 *    responses:
 *      200:
 *        description: A successful resposne
 *      401:
 *        description: unauthorized
 *      404:
 *        description: scebery not found
 *      500:
 *        description: An error occured
 */
sceneryRouter.post(
  PATHS_SCENERIES.SCENERY_ADD_IMAGES,
  authenticate,
  authorize("admin"),
  fileUpload.array("files"),
  sceneryController.addSceneryImages
);

/**
 * @swagger
 * path:
 * /scenery/{scenery_id}/image/{img_filename}/delete:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: delete single image of particular scenery
 *    tags: [Scenery]
 *    parameters:
 *      - in: path
 *        name: scenery_id
 *        schema:
 *          type: string
 *        required: true
 *        description: scenery scenery_id
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
 *        description: scenery not found
 *      500:
 *        description: An error occured
 */
sceneryRouter.delete(
  PATHS_SCENERIES.SCENERY_IMAGE_DELETE,
  authenticate,
  authorize("admin"),
  sceneryController.deleteSceneryImage
);

export default sceneryRouter;
