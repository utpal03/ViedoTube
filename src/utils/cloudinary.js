import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryupload = async (filePath) => {
  try {
    if (!filePath) {
      throw new Error("File path is required for upload.");
    }
    // console.log("api_key", process.env.CLOUDINARY_API_KEY);
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    console.log("fileuploaded to cloudinary", (await result).url);
    return result;
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};

export { cloudinaryupload };
