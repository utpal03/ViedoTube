import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { cloudinaryupload } from "../utils/cloudinary.js";
import { User } from "../models/users.model.js";

const registeruser = asyncHandler(async (req, res) => {
  const { fullname, email, password, username } = req.body;
  console.log("User registration data:", {
    fullname,
    email,
    password,
    username,
  });

  if ([fullname, email, password].some((field) => !field?.trim())) {
    console.log("Error: All fields are required");
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser?.username === username) {
    console.log("Error: User already exists");
    throw new ApiError(400, "User already exists");
  }

  if (existedUser?.email === email) {
    console.log("Error: email already exists");
    throw new ApiError(400, "email already exists");
  }

  const avatarlocalpath = req.files?.avatar[0]?.path;
  const coverImagelocalpath = req.files?.coverImage[0]?.path;

  if (!avatarlocalpath) {
    console.log("Error: Avatar is required");
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await cloudinaryupload(avatarlocalpath);
  const coverImage = await cloudinaryupload(coverImagelocalpath);

  if (!avatar) {
    console.log("Error: Avatar upload failed");
    throw new ApiError(500, "Avatar upload failed");
  }

  const user = await User.create({
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

const loginuser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("User login data:", { email, password });
  if ([email, password].some((field) => !field?.trim())) {
    console.log("Error: All fields are required");
    throw new ApiError(400, "All fields are required");
  }
  const existedUseruser = await User.findOne({
    email: email.trim().toLowerCase(),
  });
  if (!existedUseruser) {
    console.log("Error: User not found");
    throw new ApiError(404, "User not found");
  }
  const isPasswordValid = await existedUseruser.isPasswordMatch(password);
  if (!isPasswordValid) {
    console.log("Error: Invalid credentials");
    throw new ApiError(401, "Invalid credentials");
  }

  const accesstoken = await existedUseruser.generateAccessToken();
  const refreshToken = await existedUseruser.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save((validateBeforeSave = false));

  const loogedUser = await User.findById(existedUseruser._id).select(
    "-password -refreshToken"
  );

  const optons = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, optons)
    .cookie("accesstoken", accesstoken, optons)
    .json({
      status: "success",
      data: {
        user: {
          loogedUser,
          accesstoken,
          refreshToken,
        },
      },
      message: "User logged in successfully",
    });
});

const logoutuser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  Options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookieClear("refreshToken", Options)
    .cookieClear("accesstoken", Options)
    .json({
      status: "success",
      message: "User logged out successfully",
    });
});
export { registeruser, loginuser, logoutuser };
