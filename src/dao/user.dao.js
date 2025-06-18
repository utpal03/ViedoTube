import { User } from "../models/users.model.js";
import bcrypt from "bcrypt";

const findByEmailOrUsername = async (email, username) =>
  await User.findOne({ $or: [{ email }, { username }] });

const create = async (userData) => await User.create(userData);

const getPublicUserById = async (id) =>
  await User.findById(id).select("-password -refreshToken");

const findByEmail = async (email) => {
  return await User.findOne({ email: email.trim().toLowerCase() });
};

const isPasswordMatching = async function (user, password) {
  return await bcrypt.compare(password, user.password);
};

const updatePassword = async (userId, hashedPassword) => {
  return await User.findByIdAndUpdate(
    userId,
    { password: hashedPassword },
    { new: true }
  );
};

export const userDAO = {
  findByEmail,
  findByEmailOrUsername,
  create,
  getPublicUserById,
  isPasswordMatching,
  updatePassword,
};
