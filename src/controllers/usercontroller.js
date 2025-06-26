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
  const { accessToken, refreshToken, user } = await userService.login(req.body);
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
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
  const token = req.body.refreshToken || req.cookie.refreshToken;
  const accessToken = await userService.refreshAccessToken(token);
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200).cookie("accessToken", accessToken, options).json({
    status: "success",
    message: "newAccessToken received",
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
  // console.log(channel);
  return res
    .status(200)
    .json(
      new ApiResponse(200, channel, "User channel fetched successfully")
    );
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
  getChannelInfo,
  getMySubscriptions,
  getWatchHistory,
};
