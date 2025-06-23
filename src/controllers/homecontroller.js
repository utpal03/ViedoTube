import { Video } from "../models/video.model.js";

const getAllVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find().skip(skip).limit(limit);
    const totalVideos = await Video.countDocuments();

    res.status(200).json({
      page,
      limit,
      totalVideos,
      totalPages: Math.ceil(totalVideos / limit),
      videos,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching videos", error });
  }
};

export { getAllVideos };
