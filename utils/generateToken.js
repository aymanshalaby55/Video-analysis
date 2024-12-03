const jwt = require("jsonwebtoken");
const CatchAsync = require("express-async-handler");

const generateToken = CatchAsync(async (res, userId) => {
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
  const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  // set authorization headers
  res.setHeader("Authorization", `Bearer ${accessToken}`);

  return { accessToken };
});

module.exports = generateToken;
