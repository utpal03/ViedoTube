import { userDAO } from "../dao/user.dao.js";
import { cloudinaryupload } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { tokenService } from "./token.service.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { User } from "../models/users.model.js";
import { refreshtokendao } from "../dao/refreshtoken.dao.js";

const register = async ({ fullname, email, password, username }, files) => {
  try {
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
    const coverImagePath = files?.coverImage?.[0]?.path;
    let coverImage;
    if (coverImagePath) {
      await cloudinaryupload(coverImagePath);
    }

    const newUser = await userDAO.create({
      fullname,
      email,
      password,
      username: username.trim().toLowerCase(),
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
    });
    return await userDAO.getPublicUserById(newUser._id);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error("Unexpected error in register:", error);
    throw new ApiError(500, "Something went wrong during registration");
  }
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

  await refreshtokendao.storeToken(user._id, refreshToken);

  const publicUser = await userDAO.getPublicUserById(user._id);

  return {
    user: publicUser,
    accessToken,
    refreshToken,
  };
};

const getSubscribedChannels = async (subscriberId) => {
  if (!subscriberId) {
    throw new ApiError(400, "Subscriber ID is required");
  }

  const subscriptions = await Subscription.find({ subscriber: subscriberId })
    .populate("channel", "fullname username avatar subscribersCount")
    .lean();
  const channels = subscriptions.map((sub) => sub.channel);
  return channels;
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
};

const refreshAccessToken = async (token) => {
  if (!token) {
    throw ApiError(401, "unauthorized request");
  }

  const decodedtoken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decodedtoken?._id);

  if (!user) {
    throw new ApiError(401, "Invalid refresh-token");
  }
  const savedToken = await refreshtokendao.findRefreshTokenByUserId(user._id);
  if (!savedToken || savedToken.token !== token) {
    throw new ApiError(401, "Refresh token is invalid or has been revoked");
  }
  const newAccessToken = tokenService.generateAccessToken(user);
  return newAccessToken;
};

const getChannelInfo = async (username) => {
  console.log(username);
  if (!username?.trim()) {
    throw new ApiError(400, "Username is missing");
  }
  const users = await User.aggregate([
    {
      $match: { username: username.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelsSubscribedToCount: { $size: "$subscribedTo" },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        _id: 1,
      },
    },
  ]);

  if (!users?.length) {
    throw new ApiError(404, "Channel does not exist");
  }

  const channel = users[0];
  if (!channel._id.equals(loggedInUserId)) {
    const isSubscribed = await mongoose
      .model("Subscription")
      .exists({ channel: channel._id, subscriber: loggedInUserId });

    channel.isSubscribed = Boolean(isSubscribed);
  }
  delete channel._id; //id not needed in  response
  return channel;
};

export const userService = {
  register,
  login,
  forgetPassword,
  resetPassword,
  refreshAccessToken,
  getChannelInfo,
};
