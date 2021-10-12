import express from "express";
import { PATHS_USERS_AUTH, PATHS_ADMIN_AUTH } from "constants/paths";
import userController from "controllers/authController";

const Router = express.Router();

Router.get("/", (req, res) =>
  res.status(200).json({ message: "Welcome to Novel Server" })
);

Router.post(PATHS_USERS_AUTH.REGISTER, (req, res, next) =>
  userController.register(req, res, next, "users")
);

Router.post(PATHS_USERS_AUTH.LOGIN, (req, res, next) =>
  userController.login(req, res, next, "users")
);

Router.post(PATHS_ADMIN_AUTH.REGISTER, (req, res, next) =>
  userController.register(req, res, next, "cms")
);

Router.post(PATHS_ADMIN_AUTH.LOGIN, (req, res, next) =>
  userController.login(req, res, next, "cms")
);

Router.use((req, res, next) => {
  const error = new Error("Not found any resource under this url");

  res.status(404).json({
    message: error.message,
  });
});

export default Router;
