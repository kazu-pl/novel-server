import NodeCache from "node-cache";

export const createTokenName = (accessToken: string) =>
  `accessToken-${accessToken}`;

export const createNewPasswdLinkName = (userId: string) =>
  `linkToChangePassForUser-${userId}`;

export default new NodeCache();
