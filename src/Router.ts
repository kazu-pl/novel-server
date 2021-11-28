import express from "express";
import { PATHS_SWAGGER } from "constants/paths";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "swagger/swaggerSpec";
import swaggerJsonSchema from "../swagger.json";

import authRouter from "routes/auth.router";
import userRouter from "routes/user.router";
import sceneryRouter from "routes/scenery.router";
import characterRouter from "routes/character.router";
import actRouter from "routes/act.router";

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

Router.use(authRouter);
Router.use(userRouter);
Router.use(sceneryRouter);
Router.use(characterRouter);
Router.use(actRouter);

Router.use((req, res, next) =>
  res.status(404).json({
    message: `Not found any resource under this url and/or with this HTTP method`,
  })
);

export default Router;
