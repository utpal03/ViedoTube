import { Router } from "express";
import { getAllVideos } from "../controllers/homecontroller.js";

const router = Router();

router.route("/").get(getAllVideos);

export default router;
