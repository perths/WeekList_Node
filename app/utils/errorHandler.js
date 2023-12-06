const AppError = require('./appError');

module.exports = (error, _req, res) => {
  error.statusCode = error.statusCode || 500;
  error.status = (error.statusCode.toString()).includes('4') ? 'fail' : 'error';
  let responseObj = {};
  let errorObj = Object.create(Object.getPrototypeOf(error), Object.getOwnPropertyDescriptors(error));

  if (errorObj.code === 11000) {
    errorObj = new AppError('Email is already in use', 401);
  }
  if (errorObj.name === 'ValidationError') {
    errorObj = new AppError(errorObj.message, 402);
  }

  if (process.env.NODE_ENV === 'production')
    responseObj = {
      success: false,
      status: errorObj.status,
      message: errorObj.message
    };
  else
    responseObj = {
      success: false,
      status: errorObj.status,
      message: errorObj.message,
      errorObj
    };
  console.log('as', responseObj);
  res.status(errorObj.statusCode).send(responseObj);
};
