export const PATHS_USERS_AUTH = {
  REGISTER: "/register",
  LOGIN: "/login",
  PROTECTED: "/protected",
  REFRESH_TOKEN: "/refresh-token",
  LOGOUT: "/logout",
};

export const PATHS_ADMIN_AUTH = {
  REGISTER: "/cms/register",
  LOGIN: "/cms/login",
  PROTECTED: "/cms/protected",
  REFRESH_TOKEN: "/cms/refresh-token",
  LOGOUT: "/cms/logout",
};

export const PATHS_SWAGGER = {
  SWAGGER: "/swagger",
  SWAGGER_SCHEMA_JSON: "/swagger-schema.json",
};

export const PATHS_USER_DATA = {
  ME: "/users/me",
  REMIND_PASSWORD: "/users/remind-password",
  RENEW_PASSWORD: "/users/renew-password/:id",
  UPDATE_PASSWORD: "/users/me/update-password",
  AVATAR: "/users/me/avatar",
  DELETE_ACCOUNT: "/users/me/delete",
  GET_ALL_GAME_SAVES: "/users/me/game-saves",
  ADD_NEW_GAME_SAVE: "/users/me/game-saves",
  DELETE_GAME_SAVE: "/users/me/game-saves/:saveId/delete",
};

export const PATHS_FILES = {
  SINGLE_FILE: "/files/:filename",
};

export const PATHS_SCENERIES = {
  ALL: "/scenery",
  DICTIONARY: "/scenery/dictionary",
  ADD: "/scenery/add",
  SCENERY_GET: "/scenery/:id",
  SCENERY_BASIC_EDIT: "/scenery/:id/edit",
  SCENERY_DELETE: "/scenery/:id/delete",
  SCENERY_IMAGE_DELETE: "/scenery/:scenery_id/image/:img_filename/delete",
  SCENERY_ADD_IMAGES: "/scenery/:id/images",
  SCENERY_IMAGES_COUNT: "/scenery/images-count",
};

export const PATHS_CHARACTERS = {
  ALL: "/characters",
  ADD: "/characters/add",
  DICTIONARY: "/characters/dictionary",
  CHARACTER_GET: "/characters/:id",
  CHARACTER_BASIC_EDIT: "/characters/:id/edit",
  CHARACTER_DELETE: "/characters/:id/delete",
  CHARACTER_IMAGE_DELETE:
    "/characters/:character_id/image/:img_filename/delete",
  CHARACTER_ADD_IMAGES: "/characters/:id/images",
  CHARACTERS_IMAGES_COUNT: "/characters/images-count",
};

export const PATHS_ACT = {
  ADD: "/acts/add",
  DELETE: "/acts/:id/delete",
  EDIT: "/acts/:id/edit",
  GET: "/acts/:id",
  GET_ALL: "/acts",
  DICTIONARY: "/acts/dictionary",
  SCENES_COUNT: "/acts/scenes-list",
  DIALOGS_COUNT: "/acts/dialogs-list",
};
