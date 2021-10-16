import express from "express";
import {
  PATHS_USERS_AUTH,
  PATHS_ADMIN_AUTH,
  PATHS_SWAGGER,
} from "constants/paths";
import userController from "controllers/authController";
import authenticate from "middleware/authenticate";
import authorize from "middleware/authorize";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "swagger/swaggerSpec";
import swaggerJsonSchema from "../swagger.json";

const Router = express.Router();

Router.get("/", (req, res) =>
  res.status(200).json({
    message: `Welcome to Novel Server. Head to ${PATHS_SWAGGER.SWAGGER} for avaliable endpoints.`,
  })
);

Router.use(
  PATHS_SWAGGER.SWAGGER,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

Router.use(PATHS_SWAGGER.SWAGGER_SCHEMA_JSON, (req, res) =>
  res.send(swaggerJsonSchema)
);

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
 *            type: object
 *            required:
 *              - login
 *              - password
 *              - repeatedPassword
 *            properties:
 *              login:
 *                type: string
 *                description: unique login that will be used to log in
 *              password:
 *                type: string
 *                description: password
 *              repeatedPassword:
 *                type: string
 *                description: the same password repated twice
 *            example:
 *              login: myLogin
 *              password: Pa$sWorD
 *              repeatedPassword: Pa$sWorD
 *    responses:
 *      201:
 *        description: A successful resposne
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured while trying to register new user
 */
Router.post(PATHS_USERS_AUTH.REGISTER, (req, res, next) =>
  userController.register(req, res, next, "users")
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
 *            type: object
 *            required:
 *              - login
 *              - poassword
 *            properties:
 *              login:
 *                type: string
 *                description: the same login that was used to register
 *              password:
 *                type: string
 *                description: the smae password that was used to register
 *            example:
 *              login: myLogin
 *              password: Pa$sWorD
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
Router.post(PATHS_USERS_AUTH.LOGIN, (req, res, next) =>
  userController.login(req, res, next, "users")
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
Router.get(
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
 *              type: object
 *              required:
 *                - refreshToken
 *              properties:
 *                refreshToken:
 *                  type: string
 *                  description: refreshToken obtained when logging in
 *              example:
 *                refreshToken: 5bhk88956redhjjgfhI1NiIsInR5cCI6IkpXVCJ9.B6rfTYJr4GHhdbig56y7h7hg4g4ghy6Hh6MTYzNDM3MjQ3fggfghreeghute3NjM0T.KVLILQs_Brp_WRtOmPGi86l40hOnoxnd32XK5rI33EQ
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
Router.post(PATHS_USERS_AUTH.REFRESH_TOKEN, (req, res, next) =>
  userController.refreshAccessToken(req, res, next, "users")
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
Router.post(PATHS_USERS_AUTH.LOGOUT, (req, res, next) =>
  userController.logout(req, res, next)
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
 *            type: object
 *            required:
 *              - login
 *              - password
 *              - repeatedPassword
 *            properties:
 *              login:
 *                type: string
 *                description: unique login that will be used to log in
 *              password:
 *                type: string
 *                description: password
 *              repeatedPassword:
 *                type: string
 *                description: the same password repated twice
 *            example:
 *              login: myLogin
 *              password: Pa$sWorD
 *              repeatedPassword: Pa$sWorD
 *    responses:
 *      201:
 *        description: A successful resposne
 *      422:
 *        description: Missing required data or incorrect type
 *      500:
 *        description: An error occured while trying to register new user
 */
Router.post(PATHS_ADMIN_AUTH.REGISTER, (req, res, next) =>
  userController.register(req, res, next, "cms")
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
 *            type: object
 *            required:
 *              - login
 *              - poassword
 *            properties:
 *              login:
 *                type: string
 *                description: the same login that was used to register
 *              password:
 *                type: string
 *                description: the smae password that was used to register
 *            example:
 *              login: testLogin
 *              password: qwerty123
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
Router.post(PATHS_ADMIN_AUTH.LOGIN, (req, res, next) =>
  userController.login(req, res, next, "cms")
);

/**
 * @swagger
 *  /cms/protected:
 *  get:
 *    security:
 *      - bearerAuth: []
 *    summary: sample protected route
 *    tags: [Auth CMS admins]
 *    responses:
 *      200:
 *        description: The book description by id
 *      401:
 *        description: you are not logged in or your tokens expired
 *      403:
 *       description: you are logged in but you don't have permission for the resource
 */
Router.get(
  PATHS_ADMIN_AUTH.PROTECTED,
  authenticate,
  authorize("admin"),
  (req, res, next) =>
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
 *              type: object
 *              required:
 *                - refreshToken
 *              properties:
 *                refreshToken:
 *                  type: string
 *                  description: refreshToken obtained when logging in
 *              example:
 *                refreshToken: 5bhk88956redhjjgfhI1NiIsInR5cCI6IkpXVCJ9.B6rfTYJr4GHhdbig56y7h7hg4g4ghy6Hh6MTYzNDM3MjQ3fggfghreeghute3NjM0T.KVLILQs_Brp_WRtOmPGi86l40hOnoxnd32XK5rI33EQ
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
Router.post(PATHS_ADMIN_AUTH.REFRESH_TOKEN, (req, res, next) =>
  userController.refreshAccessToken(req, res, next, "cms")
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
Router.post(PATHS_ADMIN_AUTH.LOGOUT, (req, res, next) =>
  userController.logout(req, res, next)
);

Router.use((req, res, next) =>
  res.status(404).json({
    message: `Not found any resource under this url and/or with this HTTP method`,
  })
);

export default Router;
