const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const AppError = require('../utils/appError');

const protect = async (req, res, next) => {
  let accessToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    accessToken = req.headers.authorization.split(' ')[1];
  }
  const { refreshToken } = req.cookies;

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Access token expired; attempt to refresh using refreshToken
        try {
          const refreshDecoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET,
          );
          const newAccessToken = jwt.sign(
            { userId: refreshDecoded.userId },
            process.env.JWT_ACCESS_SECRET,
            {
              expiresIn: '15m',
            },
          );

          res.setHeader('Authorization', `Bearer ${newAccessToken}`);

          // Proceed with the request after setting the new access token
          req.user = await User.findById(refreshDecoded.userId).select(
            '-password',
          );
          next();
        } catch (refreshError) {
          // console.log(refreshError);
          res.status(401).json('Refresh token expired or invalid');
        }
      } else {
        res.status(401).json('No access token provided');
      }
    }
  } else {
    res.status(401).json('Not authorized');
  }
};

const verifyTokenAndAdmin = (req, res, next) => {
  protect(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return next(new AppError('You are not authorized', 404));
    }
  });
};

module.exports = { protect, verifyTokenAndAdmin };
