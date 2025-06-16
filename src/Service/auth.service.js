import { userDAO } from "../dao/user.dao.js";
import cookieParser from "cookie-parser";

const logout = async (userId, res) => {
  await userDAO.clearRefreshToken(userId);
};
export const authService = { logout };
