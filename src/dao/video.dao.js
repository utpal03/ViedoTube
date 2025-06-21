import { Video } from "../models/video.model.js";

const create = async (video) => await Video.create(video);
export const videodao = {
  create,
};
