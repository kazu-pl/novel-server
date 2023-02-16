import { Request } from "express";

const getAccessTokenFromHeaders = (headers: Request["headers"]) =>
  headers.authorization?.split(" ")[1];

export default getAccessTokenFromHeaders;
