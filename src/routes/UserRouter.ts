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

export default UserRouter;
