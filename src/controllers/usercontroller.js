import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { cloudinaryupload } from "../utils/cloudinary.js";
import { User } from "../models/users.model.js";

const registeruser = asyncHandler(async (req, res) => {
  const { fullname, email, password, username } = req.body;
  console.log("User registration data:", { fullname, email, password });

  if ([!fullname, !email, !password].some((field) => field?.trim() === "")) {
    console.log("Error: All fields are required");
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser.username === username) {
    console.log("Error: User already exists");
    throw new ApiError(400, "User already exists");
  }

  if (existedUser.email === email) {
    console.log("Error: email already exists");
    throw new ApiError(400, "email already exists");
  }

  const avatarlocalpath = req.files?.avatar[0]?.path;
  const coverImagelocalpath = req.files?.coverImage[0]?.path;

  if (!avatarlocalpath) {
    console.log("Error: Avatar is required");
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await cloudinaryupload.upload(avatarlocalpath);
  const coverImage = cloudinaryupload.upload(coverImagelocalpath);

  if (!avatar) {
    console.log("Error: Avatar upload failed");
    throw new ApiError(500, "Avatar upload failed");
  }

  User.create({
    fullname,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    username: username.trim().toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    console.log("Error: User creation failed");
    throw new ApiError(500, "User creation failed");
  }

  return res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: {
      user: createdUser,
    },
  });
});

export { registeruser };
