import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/users.model.js";
import { userDAO } from "../dao/user.dao.js";
import jwt from "jsonwebtoken";


const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new Error("You are not authorized to access this resource");
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new Error("Invalid token");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
});

export { verifyJwt };