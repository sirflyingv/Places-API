const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  console.log(err);
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const duplicated = [...Object.getOwnPropertyNames(err.keyValue)];
  const message = `Duplicated field value '${duplicated.join(
    ', '
  )}'. Please use another value`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  // const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${err.message}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token, please login again', 401);

const handleJWTExpired = () =>
  new AppError('Token expired, please login again', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR ❌❌❌❌❌', err);
    // Programming or unknown error, we don't want to leak it
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // detailed

    sendErrorDev(err, res);
  } else {
    // simple
    let error = JSON.stringify(err);
    error = JSON.parse(error);

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpired();

    sendErrorProd(error, res);
  }
};
