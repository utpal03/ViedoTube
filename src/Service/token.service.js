import RefreshToken from "../models/tokens.model.js";

const generateAccessToken = (user) => RefreshToken.generateAccessToken(user);

const generateRefreshToken = (user) => RefreshToken.generateRefreshToken(user);

const storeToken = async (userId, refreshToken) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ user: userId, token: refreshToken, expiresAt });
};

export const tokenService = {
  generateAccessToken,
  generateRefreshToken,
  storeToken,
};
