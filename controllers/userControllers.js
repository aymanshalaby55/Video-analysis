/* eslint-disable radix */
/* eslint-disable prettier/prettier */
const CatchAsync = require("express-async-handler");
const APIFeatures = require("../utils/apiFeatures");

const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const AppError = require("../utils/appError");

exports.register = async (req, res, next) => {
  const { username, email, password, confirmPassword, isPremium, dateOfBirth } =
    req.body;

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return next(new AppError("user already exist", 409));
  }

  if (!username || !password || !email || !confirmPassword) {
    return next(new AppError("some data is missing", 404));
  }

  const newUser = await User.create({
    username,
    email,
    password,
    confirmPassword,
    isPremium,
    dateOfBirth,
  });

  const token = await generateToken(res, newUser._id);

  newUser.password = undefined;

  res.status(200).json({
    status: "success",
    newUser,
    token,
  });
};

exports.login = CatchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Email or Password is missing", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  // if (!user || !(await user.correctPassword(password, user.password))) {
  //   return next(new AppError("invalid Email or Password", 409));
  // }

  user.password = undefined;

  const { accessToken } = await generateToken(res, user._id);

  return res.status(200).json({ user, accessToken });
});

exports.logout = async (req, res) => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(201).json("User Logged Out");
};

exports.getAllUsers = async (req, res) => {
  try {
    // Initialize APIFeatures with the query and query string
    const features = new APIFeatures(User.find(), req.query)
      .search()
      .filter()
      .sort()
      .limit()
      .paginate();

    // Execute the query with the applied features
    const users = await features.query;

    // Get the total count of users for pagination purposes
    const totalUsers = await User.countDocuments(features.query);

    const perPage = parseInt(req.query.limit) || 2;
    const page = parseInt(req.query.page) || 1;
    const totalPages = Math.ceil(totalUsers / perPage);

    res.status(200).json({
      totalUsers: totalUsers,
      totalPages: totalPages,
      currentPage: page,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatedUser = async (req, res) => {
  try {
    const { username, email, dateOfBirth, isPremium } = req.body;
    const { userId } = req.params;

    // check if the id in the params is the same for the logged in user
    if (userId !== req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        username,
        dateOfBirth,
        email,
        isPremium
      },
      { new: true },
    );

    return res
      .status(201)
      .json({ message: "User Updated Successfully", user: updatedUser });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id }).populate("videos");

    if (!user) {
      return res.status(404).json("There Is No User With this id");
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
