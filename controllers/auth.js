const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    country,
    address,
    birthDate,
    gender,
    password,
  } = req.body;

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    country,
    address,
    birthDate,
    gender,
    password,
  });

  // Ceate token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check user
  const user = await User.findOne({ email }).select('+password');

  // User not found
  if (!user) {
    return next(new ErrorResponse('Invalid credintials', 401));
  }

  // Check if password match
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credintials', 401));
  }

  // Ceate token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
  });
});
