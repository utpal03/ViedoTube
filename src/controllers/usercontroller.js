import { asyncHandler } from "../utils/asyncHandler.js";
import { userService } from "../Service/users.service.js";
import { authService } from "../Service/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const user = await userService.register(req.body, req.files);

  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: { user },
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await userService.login(req.body);
  const accessTokenOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 1000,
    sameSite: "Lax",
  };
  const refreshTokenOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "Lax",
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .json({
      status: "success",
      message: "User logged in successfully",
      data: { user },
    });
});

const forgetPassword = asyncHandler(async (req, res) => {
  await userService.forgetPassword(req.body);
  return res.status(200).json({
    status: "sucess",
    message: "password link send to your email",
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const token = req.params.token;
  const { newPassword } = req.body;

  await userService.resetPassword(token, newPassword);
  return res.status(200).json({
    status: "sucess",
    message: "password changed successfully",
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  await authService.logout(req.user._id, res);

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
  };

  return res
    .status(200)
    .clearCookie("refreshToken", cookieOptions)
    .clearCookie("accessToken", cookieOptions)
    .json({
      status: "success",
      message: "User logged out successfully",
    });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies.refreshToken;
  const accessToken = await userService.refreshAccessToken(token);

  const options = {
    httpOnly: true,
    secure: true, // Recommended: Should be true in production with HTTPS
    maxAge: 60 * 60 * 1000,
    sameSite: "Lax", // Added: Should match the SameSite used during login
  };

  return res.status(200).cookie("accessToken", accessToken, options).json({
    status: "success",
    message: "newAccessToken received",
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      status: "fail",
      message: "Not authenticated",
    });
  }
  return res.status(200).json({
    status: "success",
    message: "Current user fetched successfully",
    data: { user: req.user },
  });
});

const getChannelInfo = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const channel = await userService.getChannelInfo(username);
  if (!channel || channel.length === 0) {
    return res.status(404).json({
      status: "fail",
      message: "Channel not found",
    });
  }
  return res
    .status(200)
    .json(new ApiResponse(200, channel, "User channel fetched successfully"));
});

const subscribeToChannel = asyncHandler(async (req, res) => {
  const subscriberId = req.user._id;
  const channelId = req.params.channelId;
  const subscription = await userService.subscribeToChannel(
    subscriberId,
    channelId
  );
  return res.status(200).json({
    status: "success",
    message: "Subscribed to channel successfully",
    data: { subscription },
  });
});

const getMySubscriptions = asyncHandler(async (req, res) => {
  const subscriberId = req.user._id;
  const channels = await userService.getSubscribedChannels(subscriberId);
  return res.status(200).json({
    status: "success",
    message: "User subscriptions fetched successfully",
    data: { channels },
  });
});

const updateAvatar = asyncHandler(async (req, res) => {
  //todo
});

const updateCoverImage = asyncHandler(async (req, res) => {
  //todo
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const watchHistory = await userService.getWatchHistory(userId);
  return res.status(200).json({
    status: "success",
    message: "user watched history fetched successfully",
    data: { watchHistory },
  });
});

export {
  registerUser,
  loginUser,
  logoutUser,
  forgetPassword,
  resetPassword,
  refreshAccessToken,
  getCurrentUser,
  getChannelInfo,
  subscribeToChannel,
  getMySubscriptions,
  getWatchHistory,
};
