import { userDAO } from "../dao/user.dao.js";
import { refreshtokendao } from "../dao/refreshtoken.dao.js";

const logout = async (userId, res) => {
  await refreshtokendao.clearRefreshToken(userId);
};
export const authService = { logout };
