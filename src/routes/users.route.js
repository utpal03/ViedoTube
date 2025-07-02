import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  refreshAccessToken,
  getChannelInfo,
  getCurrentUser,
  subscribeToChannel,
  unsubscribleToChannel,
  getMySubscriptions,
  getWatchHistory,
} from "../controllers/usercontroller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";
import { optionalAuth } from "../middleware/optionalAuth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/forget-password").post(forgetPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/getChannelInfo/:username").get(optionalAuth,getChannelInfo);
router.route("/subscriptions/").get(verifyJwt, getMySubscriptions);
router.route("/watch-history").get(verifyJwt, getWatchHistory);
router.route("/current-user").get(verifyJwt, getCurrentUser);
router.route("/subscribe/:channelId").post(verifyJwt, subscribeToChannel);
router.route("/unsubscribe/:channelId").delete(verifyJwt,unsubscribleToChannel);
export default router;
