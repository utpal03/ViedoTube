import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const { Schema } = mongoose;

const refreshTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceInfo: {
      type: String,
      trim: true,
      default: "Unknown Device",
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "30d",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    lastUsedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

refreshTokenSchema.statics.generateAccessToken = function (user) {
  return jwt.sign(
    {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d",
    }
  );
};

refreshTokenSchema.statics.generateRefreshToken = function (user) {
  return jwt.sign(
    {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "30d",
    }
  );
};

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

export default RefreshToken;