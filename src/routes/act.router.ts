import express from "express";
import authenticate from "middleware/authenticate";
import authorize from "middleware/authorize";
import { PATHS_ACT } from "constants/paths";
import actController from "controllers/act.controller";

const actRouter = express.Router();

/**
 * @swagger
 * /acts/add:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to add new act
 *    tags: [Acts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Act'
 *    responses:
 *      200:
 *        description: list of characters
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/SuccessfulReqMsg'
 *      401:
 *        description: unauthorized
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured
 */
actRouter.post(
  PATHS_ACT.ADD,
  authenticate,
  authorize("admin"),
  actController.addAct
);

/**
 * @swagger
 * /acts/{id}/delete:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to delete act
 *    tags: [Acts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RequestDeleteAct'
 *    responses:
 *      200:
 *        description: list of characters
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/SuccessfulReqMsg'
 *      401:
 *        description: unauthorized
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured
 */
actRouter.delete(
  PATHS_ACT.DELETE,
  authenticate,
  authorize("admin"),
  actController.deleteAct
);

/**
 * @swagger
 * /acts/{id}/edit:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to update act
 *    tags: [Acts]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RequestUpdateAct'
 *    responses:
 *      200:
 *        description: list of characters
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/SuccessfulReqMsg'
 *      401:
 *        description: unauthorized
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured
 */
actRouter.post(
  PATHS_ACT.EDIT,
  authenticate,
  authorize("admin"),
  actController.updateAct
);

/**
 * @swagger
 * /acts/{id}:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to get single act
 *    tags: [Acts]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: id of next act or string 'start' for the first act
 *    responses:
 *      200:
 *        description: list of characters
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/ActExtended'
 *      401:
 *        description: unauthorized
 *      400:
 *        description: incorrect id parameter type
 *      500:
 *        description: An error occured
 */
actRouter.get(PATHS_ACT.GET, authenticate, actController.getSingleAct);

/**
 * @swagger
 * /acts:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to get list of all acts
 *    tags: [Acts]
 *    responses:
 *      200:
 *        description: list of characters
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/ActsResponse'
 *      401:
 *        description: unauthorized
 *      400:
 *        description: incorrect id parameter type
 *      500:
 *        description: An error occured
 */
actRouter.get(
  PATHS_ACT.GET_ALL,
  authenticate,
  authorize("admin"),
  actController.getAllActs
);

/**
 * @swagger
 * /acts/dictionary:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to get dictionary of all acts (array of title and id)
 *    tags: [Acts]
 *    responses:
 *      200:
 *        description: list of characters
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/ActDictionary'
 *      401:
 *        description: unauthorized
 *      500:
 *        description: An error occured
 */
actRouter.get(
  PATHS_ACT.DICTIONARY,
  authenticate,
  authorize("admin"),
  actController.getActsDictionary
);

export default actRouter;
