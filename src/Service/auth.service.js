import { userDAO } from "../dao/user.dao.js";

const logout = async (userId, res) => {
  await userDAO.clearRefreshToken(userId);
};
export const authService = { logout };
