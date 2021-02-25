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
  res.status(200).json({
    success: true,
  });
});
