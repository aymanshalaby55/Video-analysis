const AppErorr = require("../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppErorr(message, 400);
};
const handleDublicateErrorDB = (err) => {
  const value = err.errmsg.match(/"(.*?)"/g);
  const message = `Dublicate field values: ${value} , please use another value`;
  return new AppErorr(message, 400);
};
const handleValidationErrDB = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const message = `invalid input data ${errors.join(". ")}`;
  return new AppErorr(message, 400);
};
const handJWTError = () =>
  new AppErorr("Invalid token, please Log in again!", 401);

const handJWTExpireDate = () =>
  new AppErorr("Token Expired, please log in again", 401);

const SendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: "fail",
      err: err,
      message: err.message,
      Stack: err.Stack,
    });
  } else {
    // Render error pages
    res.json({
      title: "Something went wrong",
      msg: err.message,
    });
  }
};

const SendErrorPro = (err, req, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: "fail",
      err: err,
      message: err.message,
      Stack: err.Stack,
    });
  } else {
    console.error(err); // special log for errors
    res.status(500).json({
      status: "error",
      message: "something went wrong",
    });
  }
};

// middleware error function
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    SendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    //  cast error
    let error = { err };

    if (error.name === "CastError") {
      error = handleCastErrorDB(error);
    }
    if (err.code === 11000) {
      error = handleDublicateErrorDB(error);
    }
    if (err.name === "validatonError") {
      error = handleValidationErrDB(error);
    }
    if (err.name === "JsonWebTokenError") {
      error = handJWTError(error);
    }
    if (err.name === "TokenExpiredError") {
      error = handJWTExpireDate(error);
    }

    SendErrorPro(error, req, res);
  }
};
