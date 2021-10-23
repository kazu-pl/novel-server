import express from "express";
import { PATHS_USER_DATA } from "constants/paths";
import userController from "controllers/userController";
import authenticate from "middleware/authenticate";

const UserRouter = express.Router();

/**
 * @swagger
 * /users/me:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to get user data
 *    tags: [User]
 *    responses:
 *      200:
 *        description: A successful resposne
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/UserProfile'
 *      401:
 *        description: unauthorized
 *      404:
 *        description: user profile not found
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured while trying to register new user
 */
UserRouter.get(PATHS_USER_DATA.ME, authenticate, userController.getUserData);

/**
 * @swagger
 * /users/me:
 *  put:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to update user data
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RequestUpdateUser'
 *    responses:
 *      200:
 *        description: A successful resposne
 *      401:
 *        description: unauthorized
 *      404:
 *        description: user profile not found
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured while trying to register new user
 */
UserRouter.put(PATHS_USER_DATA.ME, authenticate, userController.updateUserData);

/**
 * @swagger
 * /users/remind-password:
 *  post:
 *    summary: Used to send a link to change password
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RequestRemindPasswordCredentials'
 *    responses:
 *      200:
 *        description: A successful resposne
 *      404:
 *        description: user profile not found
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured
 */
UserRouter.post(PATHS_USER_DATA.REMIND_PASSWORD, userController.remindPassword);

/**
 * @swagger
 * path:
 * /users/renew-password/{id}:
 *  post:
 *    summary: Used to renew forgotten password
 *    tags: [User]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: user id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RequestRenewPassword'
 *    responses:
 *      200:
 *        description: A successful resposne
 *      404:
 *        description: user profile not found
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured while trying to renew password
 */
UserRouter.post(PATHS_USER_DATA.RENEW_PASSWORD, userController.renewPassword);

export default UserRouter;
