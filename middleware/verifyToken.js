const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const AppError = require("../utils/appError");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const { refreshToken } = req.cookies;

  if (authHeader && authHeader.startsWith("Bearer")) {
    const accessToken = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
      console.log(req.user);
      return next();
    } catch (error) {
      if (error.name === "TokenExpiredError" && refreshToken) {
        try {
          const refreshDecoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET,
          );
          const newAccessToken = jwt.sign(
            { userId: refreshDecoded.userId },
            process.env.JWT_ACCESS_SECRET,
            { expiresIn: "15m" },
          );

          res.setHeader("Authorization", `Bearer ${newAccessToken}`);
          req.user = await User.findById(refreshDecoded.userId).select(
            "-password",
          );
          return next();
        } catch (refreshError) {
          return res.status(401).json("Refresh token expired or invalid");
        }
      } else {
        return res.status(401).json("Invalid access token");
      }
    }
  } else {
    return res.status(401).json("Not authorized");
  }
};

const verifyTokenAndAdmin = (req, res, next) => {
  protect(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      return next(new AppError("You are not authorized", 404));
    }
  });
};

module.exports = { protect, verifyTokenAndAdmin };
