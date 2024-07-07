const CatchAsync = require('express-async-handler');

const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/appError');

exports.register = async (req, res, next) => {
  const { username, email, password, confirmPassword, isPremium, dateOfBirth } = req.body;

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
    isPremium,
    dateOfBirth,
  });

  const token = await generateToken(res, newUser._id);

  newUser.password = undefined;

  res.status(200).json({
    status: 'success',
    newUser,
    token,
  });
};

exports.login = CatchAsync(async (req, res, next) => {
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

exports.logout = async (req, res) => {
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(201).json('User Logged Out');
};


exports.getAllUsers = async (req, res) => {
  try {
    
    const users = await User.find();

    if(!users) {
      return res.status(404).json({
        message: "there is no users at that moment"
      })
    }

    res.status(200).json({ users });
  } catch (error) {
    
    res.status(500).json({ message: error.message });
  }
}
