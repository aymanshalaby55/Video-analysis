const CatchAsync = require('express-async-handler');

const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/appError');

const register = async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;

  const userExists = await User.findOne({ email: email });

  if (userExists) {
    return next(new AppError('user already exist', 409));
  }

  if (!username || !password || !email || !confirmPassword) {
    return next(new AppError('some data is missing', 404));
  }

  const newUser = await User.create({
    username,
    email,
    password,
    confirmPassword,
  });

  const token = await generateToken(res, newUser._id);

  res.status(200).json({
    status: 'success',
    newUser,
    token,
  });
};

const login = CatchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email or Password is missing', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('invalid Email or Password', 409));
  }

  user.password = undefined;

  const { accessToken } = await generateToken(res, user._id);

  return res.status(200).json({ user, accessToken });
});

const logout = (req, res) => {
  res.clearCookie('jwt');

  res.status(200).json({ status: 'success' });
};

// fix this
// const getAllUsers = async (req, res, next) => {
//   try {
//     let query = {};

//     if (req.query.search) {
//       const searchRegex = new RegExp(req.query.search, 'i');
//       query = {
//         $or: [{ firstname: searchRegex }, { phoneNumber: searchRegex }],
//       };
//     }

//     let users;

//     users = await User.find(query);

//     if (!req.query.search) {
//       users = [];
//     }
//     const usersCount = await User.countDocuments();

//     return res.status(201).json({ users, usersCount });
//   } catch (error) {
//     return res.status(500).json(error.message);
//   }
// };

module.exports = { register, login, logout };
