import NodeCache from "node-cache";

export const createAccessTokenName = (accessToken: string) =>
  `accessToken-${accessToken}`;

export const createRefreshTokenName = (refreshToken: string) =>
  `refreshToken-${refreshToken}`;

export const createNewPasswdLinkName = (userId: string) =>
  `linkToChangePassForUser-${userId}`;

export default new NodeCache();
