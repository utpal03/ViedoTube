import { Video } from "../models/video.model.js";

const create = async (video) => await Video.create(video);
const deleteVideoById = async (videoId) => await Video.deleteOne(videoId);
const getVideoById = async (videoId) => await Video.findById(videoId);
export const videodao = {
  create,
  deleteVideoById,
  getVideoById,
};
