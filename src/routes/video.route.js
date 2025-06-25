import { Router } from "express";
import {
  uploadVideo,
  getVideosById,
  getLoggedInUserVideos,
} from "../controllers/videocontroller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/uploadVideo").post(
  verifyJwt, // Authenticate user first
  upload.fields([
    { name: "videofile", maxCount: 5 }, // Allows up to 5 video files
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo // Your controller to handle the uploaded video and thumbnail
);
router.route("/:_id").get(getVideosById);
router.route("/my-videos").get(verifyJwt, getLoggedInUserVideos);

export default router;
