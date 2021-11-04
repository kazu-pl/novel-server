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
};

export const PATHS_FILES = {
  SINGLE_FILE: "/files/:filename",
};

export const PATHS_SCENERIES = {
  ALL: "/scenery",
  ADD: "/scenery/add",
  SCENERY_GET: "/scenery/:id",
  SCENERY_BASIC_EDIT: "/scenery/:id/edit",
  SCENERY_DELETE: "/scenery/:id/delete",
  SCENERY_IMAGE_DELETE: "/scenery/:scenery_id/image/:img_filename/delete",
  SCENERY_ADD_IMAGES: "/scenery/:id/images",
};
