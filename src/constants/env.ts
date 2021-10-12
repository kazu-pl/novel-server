import dotenv from "dotenv";
dotenv.config();

export const MONGO_USERNAME = process.env.MONGO_USERNAME;
export const MONGO_USERNAME_PASSWORD = process.env.MONGO_USERNAME_PASSWORD;
export const MONGO_HOST = process.env.MONGO_HOST;
export const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
export const MONGO_DB_URI = `mongodb+srv://${MONGO_USERNAME}:${MONGO_USERNAME_PASSWORD}@${MONGO_HOST}/${MONGO_DB_NAME}`;

export const HOSTNAME = process.env.HOSTNAME || "localhost";
export const PORT = process.env.PORT || 4000;

export const ACCESS_TOKEN_EXPIRETIME_IN_SECONDS =
  Number(process.env.ACCESS_TOKEN_EXPIRETIME_IN_SECONDS) || 25;
export const REFRESH_TOKEN_EXPIRETIME_IN_SECONDS =
  Number(process.env.REFRESH_TOKEN_EXPIRETIME_IN_SECONDS) || 2592000;

export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;
