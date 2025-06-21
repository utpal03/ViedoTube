import { cloudinaryupload } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { videodao } from "../dao/video.dao.js";

const uploadVideo = async ({ duration, description, title, owner }, files) => {
  if ([duration, description, title].some((f) => !f?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const videofilepath = files?.videofile?.[0]?.path;
  if (!videofilepath) {
    throw new ApiError(400, "videofile is required");
  }

  const thumbnailpath = files?.thumbnail?.[0]?.path;
  if (!thumbnailpath) {
    throw new ApiError(400, "thumbnail is required");
  }
  const [videofileResult, thumbnailResult] = await Promise.all([
    cloudinaryupload(videofilepath),
    cloudinaryupload(thumbnailpath),
  ]);

  if (!videofileResult?.url) {
    throw new ApiError(500, "Failed to upload video file to Cloudinary");
  }
  if (!thumbnailResult?.url) {
    throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");
  }

  const newVideo = await videodao.create({
    videofile: videofileResult.url,
    thumbnail: thumbnailResult.url,
    description,
    duration,
    title,
    time: new Date().toISOString(),
    isPublished: true,
    owner,
  });
  return newVideo;
};

export const videoservice = { uploadVideo };
