import { refreshtokendao } from "../dao/refreshtoken.dao.js";

const logout = async (userId) => {
  await refreshtokendao.clearRefreshToken(userId);
};
export const authService = { logout };
