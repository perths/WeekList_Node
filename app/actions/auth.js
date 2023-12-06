const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');

const createToken = _id => {
  return jwt.sign({ _id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRATION });
};

const authenticate = async (req, _res, next) => {
  if (!req.headers.authorization)
    return next(new AppError('Unauthorized access.', 401));

  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY)

  const currentUser = await User.findById(decodedToken._id);

  if (!currentUser) {
    return next(new AppError('Unauthorised Access! User doesn\'t exist', 400));
  } else {
    req.user = currentUser;
    next();
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and Password required', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(new AppError('Email or password is incorrect', 400));
  }

  const token = createToken(user.id);

  res.status(200).send({
    success: true,
    token
  });
};

const signup = async (req, res, next) => {
  const user = await User.create({
    fullname: req.body.fullname,
    email: req.body.email,
    password: req.body.password,
    age: req.body.age,
    mobile: req.body.mobile,
    gender: req.body.gender
  }).lean();
  const token = getToken(user._id);

  delete user._id;
  delete user._v;
  
  res.status(200).send({
    success: true,
    token,
    data: { user }
  });
};

module.exports = { authenticate, login, signup };
