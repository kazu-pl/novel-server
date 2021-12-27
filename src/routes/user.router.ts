import express from "express";
import { PATHS_USER_DATA } from "constants/paths";
import userController from "controllers/user.controller";
import authenticate from "middleware/authenticate";
import fileUpload from "middleware/fileUpload";
import authorize from "middleware/authorize";

const userRouter = express.Router();

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
userRouter.get(PATHS_USER_DATA.ME, authenticate, userController.getUserData);

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
userRouter.put(PATHS_USER_DATA.ME, authenticate, userController.updateUserData);

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
userRouter.post(PATHS_USER_DATA.REMIND_PASSWORD, userController.remindPassword);

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
 *      401:
 *        description: Link expired or user didn't request to change password
 *      404:
 *        description: user profile not found
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured while trying to renew password
 */
userRouter.post(PATHS_USER_DATA.RENEW_PASSWORD, userController.renewPassword);

/**
 * @swagger
 * path:
 * /users/me/update-password:
 *  put:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to update password
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RequestRenewPassword'
 *    responses:
 *      200:
 *        description: A successful resposne
 *      401:
 *        description: Link expired or user didn't request to change password
 *      404:
 *        description: user profile not found
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured while trying to renew password
 */
userRouter.put(PATHS_USER_DATA.UPDATE_PASSWORD, userController.updatePassword);

/**
 * @swagger
 * path:
 * /users/me/avatar:
 *  put:
 *    security:
 *      - bearerAuth: []
 *    summary: SEND form-data WITH "file" FIELD. Used to update user avatar (if no avatar, it will creaate one, if there is one, it will be replaced).
 *    tags: [User]
 *    requestBody:
 *      required: true
 *    responses:
 *      200:
 *        description: relative link to new avatar
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/Avatar'
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: User profile not found
 *      500:
 *        description: An error occured while trying to update avatar
 */
userRouter.put(
  PATHS_USER_DATA.AVATAR,
  authenticate,
  fileUpload.single("file"),
  userController.putAvatar
);

/**
 * @swagger
 * path:
 * /users/me/avatar:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to delete user avatar
 *    tags: [User]
 *    responses:
 *      200:
 *        description: A successful resposne
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: User profile not found
 *      500:
 *        description: An error occured while trying to update avatar
 */
userRouter.delete(
  PATHS_USER_DATA.AVATAR,
  authenticate,
  userController.deleteAvatar
);

/**
 * @swagger
 * path:
 * /users/me/delete:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to delete user account
 *    tags: [User]
 *    responses:
 *      200:
 *        description: A successful resposne
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: An error occured while trying to update avatar
 */
userRouter.delete(
  PATHS_USER_DATA.DELETE_ACCOUNT,
  authenticate,
  userController.deleteAccount
);

/**
 * @swagger
 * path:
 * /users/me/game-saves:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to get all game saves
 *    tags: [User]
 *    responses:
 *      200:
 *        description: get list of all game saves for your account
 *        content:
 *          application/json:
 *            schema:
 *                $ref: '#/components/schemas/ExtendedGameSaveResponse'
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: An error occured
 */
userRouter.get(
  PATHS_USER_DATA.GET_ALL_GAME_SAVES,
  authenticate,
  authorize("user"),
  userController.getAllGameSaves
);

/**
 * @swagger
 * path:
 * /users/me/game-saves:
 *  post:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to add new game save
 *    tags: [User]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RequestGameSave'
 *    responses:
 *      200:
 *        description: A successful resposne
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: An error occured
 */
userRouter.post(
  PATHS_USER_DATA.ADD_NEW_GAME_SAVE,
  authenticate,
  authorize("user"),
  userController.addGameSave
);

/**
 * @swagger
 * path:
 * /users/me/game-saves/{saveId}/delete:
 *  delete:
 *    security:
 *      - bearerAuth: []
 *    summary: Used to delete game save
 *    tags: [User]
 *    parameters:
 *      - in: path
 *        name: saveId
 *        schema:
 *          type: string
 *        required: true
 *        description: save to delete id
 *    responses:
 *      200:
 *        description: A successful resposne
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: An error occured
 */
userRouter.delete(
  PATHS_USER_DATA.DELETE_GAME_SAVE,
  authenticate,
  authorize("user"),
  userController.deleteGameSave
);

export default userRouter;
