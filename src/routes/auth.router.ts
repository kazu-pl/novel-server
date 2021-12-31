import express from "express";
import { PATHS_USERS_AUTH, PATHS_ADMIN_AUTH } from "constants/paths";
import userController from "controllers/auth.controller";
import authenticate from "middleware/authenticate";
import authorize from "middleware/authorize";

const authRouter = express.Router();

/**
 * @swagger
 * /register:
 *  post:
 *    summary: Used to register new user
 *    tags: [Auth regular user]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RequestRegisterCredentials'
 *    responses:
 *      201:
 *        description: A successful resposne
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured while trying to register new user
 */
authRouter.post(PATHS_USERS_AUTH.REGISTER, (req, res, next) =>
  userController.register(req, res, "users")
);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Used to log in regular user
 *     tags: [Auth regular user]
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RequestLoginCredentials'
 *
 *     responses:
 *      200:
 *         description: access token and refresh token
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Tokens'
 *      401:
 *        description: Account with that login and password does not exist
 *      422:
 *        description: Missing required data or incorrect type
 */
authRouter.post(PATHS_USERS_AUTH.LOGIN, (req, res, next) =>
  userController.login(req, res, "users")
);

/**
 * @swagger
 *  /protected:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      summary: example of endpoint with params in path and url (underneath endpoint does not allow any of this. Its only to show how to code params in swagger-jsdoc commoents)
 *      tags: [Auth regular user]
 *      parameters:
 *        - in: path
 *          name: id
 *          schema:
 *            type: string
 *          required: true
 *          description: The book id (to make use of it you need to have url like `/books/:id`)
 *        - in: query
 *          name: color
 *          schema:
 *            type: string
 *          required: false
 *          description: book color
 *      responses:
 *        200:
 *          description: The book description by id
 *        401:
 *          description: you are not logged in or your tokens expired
 *        403:
 *          description: you are logged in but you don't have permission for the resource
 */
authRouter.get(
  PATHS_USERS_AUTH.PROTECTED,
  authenticate,
  authorize("user"),
  (req, res, next) =>
    res.status(200).json({ message: "you're alloved to be here" })
);

/**
 * @swagger
 *  /refresh-token:
 *    post:
 *      summary: regerenates accessToken based on refreshToken
 *      tags: [Auth regular user]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/RequestRefreshTokenCredentials'
 *      responses:
 *        200:
 *          description: The book was successfully created
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/AccessToken'
 *        401:
 *          description: Unauthorized because of expired refreshToken (you have to logout and login again)
 *        403:
 *          description: Forbidden - refreshToken does not exist in DB (if you first got 401 and tried to refresh again you will get this  403 because refreshTokens are removed from DB when trying to refresh accessToken with expried refreshToken to save DB space)
 *        422:
 *          description: Missing or incorect refreshToken
 */
authRouter.post(PATHS_USERS_AUTH.REFRESH_TOKEN, (req, res, next) =>
  userController.refreshAccessToken(req, res, "users")
);

/**
 * @swagger
 *  /logout:
 *    post:
 *      summary: logout logged in user
 *      tags: [Auth regular user]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Tokens'
 *      responses:
 *        200:
 *          description: logout successed
 *        422:
 *          description: incorrect or missing refreshToken and/or accessToken
 *        500:
 *          description: Some error happened
 */
authRouter.post(PATHS_USERS_AUTH.LOGOUT, (req, res, next) =>
  userController.logout(req, res)
);

/**
 * @swagger
 * /cms/register:
 *  post:
 *    summary: Used to register new admin in CMS
 *    tags: [Auth CMS admins]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RequestRegisterCredentials'
 *    responses:
 *      201:
 *        description: A successful resposne
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured while trying to register new user
 */
authRouter.post(PATHS_ADMIN_AUTH.REGISTER, (req, res, next) =>
  userController.register(req, res, "cms")
);

/**
 * @swagger
 * /cms/login:
 *   post:
 *     summary: Used to log in admin in CMS
 *     tags: [Auth CMS admins]
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/RequestLoginCredentials'
 *     responses:
 *      200:
 *         description: access token and refresh token
 *         content:
 *           application/json:
 *             schema:
 *                 $ref: '#/components/schemas/Tokens'
 *      401:
 *        description: Account with that login and password does not exist
 *      422:
 *        description: Missing required data or incorrect type
 */
authRouter.post(PATHS_ADMIN_AUTH.LOGIN, (req, res, next) =>
  userController.login(req, res, "cms")
);

/**
 * @swagger
 *  /cms/protected:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: sample protected route wtih optional parameters in body
 *    tags: [Auth CMS admins]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - requiredField
 *            properties:
 *              requiredField:
 *                type: string
 *                description: required field
 *              optionalField:
 *                type: string
 *                description: this is optional field
 *            example:
 *              requiredField: click 'Schema' above to see how it looks
 *              optionalField: some optional info
 *    responses:
 *      200:
 *        description: The book description by id
 *      401:
 *        description: you are not logged in or your tokens expired
 *      403:
 *       description: you are logged in but you don't have permission for the resource
 */
authRouter.get(
  PATHS_ADMIN_AUTH.PROTECTED,
  authenticate,
  authorize("admin"),
  (req, res) =>
    res.status(200).json({ message: "you're alloved to be here - admin" })
);

/**
 * @swagger
 *  /cms/refresh-token:
 *    post:
 *      summary: regerenates accessToken based on refreshToken
 *      tags: [Auth CMS admins]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/RequestRefreshTokenCredentials'
 *      responses:
 *        200:
 *          description: The book was successfully created
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/AccessToken'
 *        401:
 *          description: Unauthorized because of expired refreshToken (you have to logout and login again)
 *        403:
 *          description: Forbidden - refreshToken does not exist in DB (if you first got 401 and tried to refresh again you will get this  403 because refreshTokens are removed from DB when trying to refresh accessToken with expried refreshToken to save DB space)
 *        422:
 *          description: Missing or incorect refreshToken
 */
authRouter.post(PATHS_ADMIN_AUTH.REFRESH_TOKEN, (req, res, next) =>
  userController.refreshAccessToken(req, res, "cms")
);

/**
 * @swagger
 *  /cms/logout:
 *    post:
 *      summary: logout logged in user
 *      tags: [Auth CMS admins]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Tokens'
 *      responses:
 *        200:
 *          description: logout successed
 *        422:
 *          description: incorrect or missing refreshToken and/or accessToken
 *        500:
 *          description: Some error happened
 */
authRouter.post(PATHS_ADMIN_AUTH.LOGOUT, (req, res, next) =>
  userController.logout(req, res)
);

export default authRouter;
