import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { videoservice } from "../Service/video.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { userDAO } from "../dao/user.dao.js";

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
  const video = await videoservice.getVideoById({ VideoId: videoId });
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res.status(200).json({
    video: video,
  });
};

const getVideosByOwnerId = asyncHandler(async (req, res) => {
  const id = await userDAO.findIdByUsername(req.params.ownerId);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  const videos = await videoservice.getVideosByOwnerId(id, page, limit);

  return res.status(200).json({
    status: "success",
    message: "Videos fetched successfully",
    videos: videos.docs,
  });
});

const getLoggedInUserVideos = asyncHandler(async (req, res) => {
  const ownerId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  const videos = await videoservice.getVideosByOwner(ownerId, page, limit);

  return res.status(200).json({
    status: "success",
    message: "User videos fetched successfully",
    data: videos,
  });
});
const deleteVideoById = asyncHandler(async (req, res) => {
  const videoId = req.video._id;
  await videoservice.deleteVideo(videoId);

  return res.ApiResponse(200, "video deleted successfully");
});

export {
  uploadVideo,
  deleteVideoById,
  getVideosById,
  getVideosByOwnerId,
  getLoggedInUserVideos,
};
