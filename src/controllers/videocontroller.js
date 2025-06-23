import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
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

const getVideosById = async (req, res) => {
  const videoId = req.params._id;
  const video = await videoservice.getVideoById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res.ApiResponse(200, "video fetched successfully", {
    video: video,
  });
};

const deleteVideoById = asyncHandler(async (req, res) => {
  const videoId = req.video._id;
  await videoservice.deleteVideo(videoId);

  return res.ApiResponse(200, "video deleted successfully");
});

export { uploadVideo, deleteVideoById, getVideosById };
