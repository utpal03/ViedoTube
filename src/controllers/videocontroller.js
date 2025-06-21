import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { videoservice } from "../Service/video.service.js";

const uploadVideo = asyncHandler(async (req, res) => {
  req.body.owner = req.user._id;
  const video = await videoservice.uploadVideo(req.body, req.files);

  return res.status(200).json({
    status: "sucess",
    message: "viedo Uploaded successfully",
    data: { video },
  });
});

export { uploadVideo };
