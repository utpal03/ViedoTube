import { userDAO } from "../dao/user.dao.js";
import { cloudinaryupload } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { tokenService } from "./token.service.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

const register = async ({ fullname, email, password, username }, files) => {
  if ([fullname, email, password].some((f) => !f?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const existing = await userDAO.findByEmailOrUsername(email, username);
  if (existing?.email === email)
    throw new ApiError(400, "Email already exists");
  if (existing?.username === username)
    throw new ApiError(400, "Username already exists");

  const avatarPath = files?.avatar?.[0]?.path;
  if (!avatarPath) throw new ApiError(400, "Avatar is required");

  const avatar = await cloudinaryupload(avatarPath);
  const coverImage = await cloudinaryupload(files?.coverImage?.[0]?.path);

  const newUser = await userDAO.create({
    fullname,
    email,
    password,
    username: username.trim().toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  return await userDAO.getPublicUserById(newUser._id);
};

const login = async ({ email, password }) => {
  if ([email, password].some((f) => !f?.trim())) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await userDAO.findByEmail(email);
  if (!user) throw new ApiError(404, "User not found");

  const isPasswordValid = await userDAO.isPasswordMatching(user, password);
  if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

  const accessToken = tokenService.generateAccessToken(user);
  const refreshToken = tokenService.generateRefreshToken(user);

  await tokenService.storeToken(user._id, refreshToken);

  const publicUser = await userDAO.getPublicUserById(user._id);

  return {
    user: publicUser,
    accessToken,
    refreshToken,
  };
};

const forgetPassword = async ({ email }) => {
  if (!email) {
    throw new ApiError("please provide email");
  }
  const user = await userDAO.findByEmail(email);
  if (!user) {
    throw new ApiError(404, "user not found please register");
  }
  const token = jwt.sign({ email }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "5m",
  });
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  await transport.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Link",
    text: `Click the link below to reset your password:\n\nhttp://localhost:8000/api/v1/users/reset-password/${token}\n\nThis link is valid for 5 minutes.`,
  });
};

const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new ApiError(400, "Token and new password are required");
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(400, "Invalid or expired token");
  }

  const user = await userDAO.findByEmail(payload.email);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await userDAO.updatePassword(user._id, hashedPassword);

  return { message: "Password reset successful" };
};

export const userService = { register, login, forgetPassword,resetPassword};
