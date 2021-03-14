const crypto = require('crypto');
const { asyncHandler } = require('../middleware/async');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const fieldsToAdd = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };

  // Create user
  const user = await User.create(fieldsToAdd);
  if ((error = sendConfirmationEmail(user, req))) {
    next(error);
  }
  res.status(201).json({
    success: true,
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

  sendTokenResponse(user, 200, res);
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  // message
  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. please make a put request to:\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset',
      message,
    });
    res.status(200).json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Reset password email can not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
  });
});

// @desc    Confirm user email.
// @route   POST /api/v1/auth/confirmemail
// @access  Public
exports.sendConfrimEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  if (user.status !== 'PENDING') {
    return next(new ErrorResponse('This email already confirmed', 404));
  }

  if ((error = sendConfirmationEmail(user, req))) {
    next(error);
  }

  res.status(200).json({
    success: true,
  });
});

// @desc    confirm email
// @route   GET /api/v1/auth/confirmemail/:confirmtoken
// @access  Public
exports.confirmEmail = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const confirmEmailToken = crypto
    .createHash('sha256')
    .update(req.params.confirmtoken)
    .digest('hex');

  const user = await User.findOne({
    confirmEmailToken,
    confirmEmailExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set user status
  user.status = 'INCOMPLETE';
  user.confirmEmailToken = undefined;
  user.confirmEmailExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
  });
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    gender: req.body.gender,
    country: req.body.country,
    address: req.body.address,
    birthDate: req.body.birthDate,
  };

  // Remove empty fields to allow partial updates.
  Object.keys(fieldsToUpdate).forEach(
    (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  // Check for required field to change user status incase of incomplete status.
  if (
    user.status === 'INCOMPLETE' &&
    user.name &&
    user.phone &&
    user.gender &&
    user.country &&
    user.birthDate
  ) {
    user.status = 'ACTIVE';
    await user.save();
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Log user out / clear cookie
// @route   GET /api/v1/auth/logout
// @access  public
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
});

exports.generateSocialLoginToken = (req, res, next) => {
  sendTokenResponse(req.user, 200, res);
};

// Send confirmation email.
const sendConfirmationEmail = async (user, req) => {
  // Get confirm token
  const confirmToken = user.getConfirmEmailToken();

  await user.save({ validateBeforeSave: false });

  // Create confirm email url
  const confirmUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/confirmemail/${confirmToken}`;

  // message
  const message = `Congratultaion on your registeration. To confirm your email please make a get request to:\n ${confirmUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Email confirmation',
      message,
    });
  } catch (err) {
    console.log(err);
    user.confirmEmailToken = undefined;
    user.confirmEmailExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return new ErrorResponse('Confirm email can not be sent', 500);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Ceate token
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    data: user,
    token,
  });
};
