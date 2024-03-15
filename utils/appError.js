class AppErorr extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // operation error

    Error.captureStackTrace(this, this.constructor); //  what this do.
  }
}

module.exports = AppErorr;
