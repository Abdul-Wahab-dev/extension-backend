const AppError = require("./../utils/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

const sendErrorDev = (err, res) => {
  const errorObj = {};
  if (err.status) errorObj.status = err.status;
  if (err.message) errorObj.message = err.message;
  if (err.validation !== undefined || err.validation)
    errorObj.validation = err.validation;
  errorObj.stack = err.stack;

  res.status(err.statusCode).json(errorObj);
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client

  if (err.isOperational) {
    res.status(err.statusCode).json(err);

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error("ERROR 💥", err);

    // 2) Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack);
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let errorObj = { ...err };

    if (err.isOperational) errorObj.isOperational = err.isOperational;
    if (err.status) errorObj.status = err.status;
    if (err.message) errorObj.message = err.message;
    if (err.validation !== undefined || err.validation)
      errorObj.validation = err.validation;

    if (errorObj.name === "CastError") errorObj = handleCastErrorDB(errorObj);
    if (errorObj.code === 11000) errorObj = handleDuplicateFieldsDB(errorObj);
    if (errorObj.name === "ValidationError")
      errorObj = handleValidationErrorDB(error);
    if (errorObj.name === "JsonWebTokenError") errorObj = handleJWTError();
    if (errorObj.name === "TokenExpiredError")
      errorObj = handleJWTExpiredError();

    sendErrorProd(errorObj, res);
  }
};
