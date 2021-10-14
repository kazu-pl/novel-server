import express from "express";
import { PATHS_USERS_AUTH, PATHS_ADMIN_AUTH } from "constants/paths";
import userController from "controllers/authController";
import authenticate from "middleware/authenticate";
import authorize from "middleware/authorize";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "config/swagger";
import swaggerJsonSchema from "../swagger.json";

const Router = express.Router();

Router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

Router.use("/swagger/schema.json", (req, res) => res.send(swaggerJsonSchema));

Router.get("/", (req, res) =>
  res.status(200).json({ message: "Welcome to Novel Server" })
);

/**
 * @swagger
 * /register:
 *  post:
 *      description: Use to reqwuest all custoemrs
 *      responses:
 *      '200':
 *        description: A successfull resposne
 */
Router.post(PATHS_USERS_AUTH.REGISTER, (req, res, next) =>
  userController.register(req, res, next, "users")
);

/**
 * @swagger
 * components:
 *  schemas:
 *    Book:
 *      type: object
 *      required:
 *          - title
 *          - author
 *      properties:
 *          id:
 *              type: string
 *              description: The auto-generated id of the book
 *          title:
 *              type: string
 *              description: the book title
 *          author:
 *              type: string
 *              description: the book author
 *      example:
 *          id: 0000-0000-0000-0000
 *          title: The New Turning Omibus
 *          author: John Doe
 */

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: The books managing API
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Returns the list of all the books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: The list of the books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
Router.post(PATHS_USERS_AUTH.LOGIN, (req, res, next) =>
  userController.login(req, res, next, "users")
);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get the book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *     responses:
 *       200:
 *         description: The book description by id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: The book was not found
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
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: The book was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       500:
 *         description: Some server error
 */

Router.post(PATHS_USERS_AUTH.REFRESH_TOKEN, (req, res, next) =>
  userController.refreshAccessToken(req, res, next, "users")
);
/**
 * @swagger
 * /books/{id}:
 *  put:
 *    summary: Update the book by the id
 *    tags: [Books]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The book id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Book'
 *    responses:
 *      200:
 *        description: The book was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Book'
 *      404:
 *        description: The book was not found
 *      500:
 *        description: Some error happened
 */
Router.post(PATHS_USERS_AUTH.LOGOUT, (req, res, next) =>
  userController.logout(req, res, next)
);
/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Remove the book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The book id
 *
 *     responses:
 *       200:
 *         description: The book was deleted
 *       404:
 *         description: The book was not found
 */
Router.post(PATHS_ADMIN_AUTH.REGISTER, (req, res, next) =>
  userController.register(req, res, next, "cms")
);

Router.post(PATHS_ADMIN_AUTH.LOGIN, (req, res, next) =>
  userController.login(req, res, next, "cms")
);

Router.get(
  PATHS_ADMIN_AUTH.PROTECTED,
  authenticate,
  authorize("admin"),
  (req, res, next) =>
    res.status(200).json({ message: "you're alloved to be here - admin" })
);

Router.post(PATHS_ADMIN_AUTH.REFRESH_TOKEN, (req, res, next) =>
  userController.refreshAccessToken(req, res, next, "cms")
);

Router.post(PATHS_ADMIN_AUTH.LOGOUT, (req, res, next) =>
  userController.logout(req, res, next)
);

Router.use((req, res, next) => {
  const error = new Error("Not found any resource under this url");

  res.status(404).json({
    message: error.message,
  });
});

export default Router;
