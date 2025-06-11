import { asyncHandler } from "../utils/asyncHandler.js";

const registeruser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User registered successfully",
  });
});

export { registeruser };
