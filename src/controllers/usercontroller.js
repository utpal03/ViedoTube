import { asyncHandler } from "../utils/asyncHandler.js";
import { userService } from "../Service/users.service.js";
import { authService } from "../Service/auth.service.js";

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

export { registerUser, loginUser, logoutUser, forgetPassword, resetPassword, refreshAccessToken };
