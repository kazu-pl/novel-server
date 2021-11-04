import express from "express";
import { PATHS_SWAGGER } from "constants/paths";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "swagger/swaggerSpec";
import swaggerJsonSchema from "../swagger.json";

import AuthRouter from "routes/AuthRouter";
import UserRouter from "routes/UserRouter";
import SceneryRouter from "routes/SceneryRouter";

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

Router.use(AuthRouter);
Router.use(UserRouter);
Router.use(SceneryRouter);

Router.use((req, res, next) =>
  res.status(404).json({
    message: `Not found any resource under this url and/or with this HTTP method`,
  })
);

export default Router;
