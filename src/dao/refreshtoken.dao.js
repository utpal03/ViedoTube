import RefreshToken from "../models/refreshtokens.model.js";

const storeToken = async (userId, refreshToken) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ user: userId, token: refreshToken, expiresAt });
};

const updateRefreshToken = async (userId, refreshToken) => {
  return await RefreshToken.findOneAndUpdate(
    { user: userId },
    { $set: { token: refreshToken } },
    { new: true }
  );
};

const clearRefreshToken = async (userId) => {
  return await RefreshToken.findOneAndDelete({ user: userId });
};

const findRefreshTokenByUserId = async (userId) => {
  return await RefreshToken.findOne({ user: userId });
};
export const refreshtokendao = {
  storeToken,
  clearRefreshToken,
  updateRefreshToken,
  findRefreshTokenByUserId,
};
