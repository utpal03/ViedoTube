import { Router } from "express";
import {
  registeruser,
  loginuser,
  logoutuser,
} from "../controllers/usercontroller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();
router.route("/register").post(
  upload.fields([
    { name: "Avatar", name: "avatar", maxCount: 1 },
    { name: "coverImage", name: "coverImage", maxCount: 1 },
  ]),
  registeruser
);

router.route("/login").post(loginuser);
router.route("/logout").post(logoutuser);

export default router;
