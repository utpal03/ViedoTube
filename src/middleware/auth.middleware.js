import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/users.model";

const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error("You are not authorized to access this resource");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    await User.findById(decodedToken._id).select("-password -refreshToken");

    if (!user) {
      throw new Error("invalid token");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    res.status(401).json({
      success: false,
      message: "You are not authorized to access this resource",
    });
  }
});
