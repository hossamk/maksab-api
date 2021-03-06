const jwt = require('jsonwebtoken');
const { asyncHandler } = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const fs = require('fs');

const pathToKey = `${__dirname}/../id_rsa_pub.pem`;
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token is exist
  if (!token) {
    return next(new ErrorResponse('Not authorized access to this route', 401));
  }

  try {
    // Verify token
    const decode = jwt.verify(token, PUB_KEY, {
      expiresIn: process.env.JWT_EXPIRE,
      algorithm: 'RS256',
    });

    req.user = await User.findById(decode.id);
    if (!req.user) {
      return next(new ErrorResponse('Invalid authentication token', 401));
    }
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized access to this route', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized access to this route`,
          403
        )
      );
    }
    next();
  };
};

// Grant access user in specific status
exports.authorizeStatus = (...statuses) => {
  return (req, res, next) => {
    if (!statuses.includes(req.user.status)) {
      return next(
        new ErrorResponse(
          `User status ${req.user.status} is not authorized access to this route`,
          403
        )
      );
    }
    next();
  };
};
