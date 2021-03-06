const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');
const crypto = require('crypto');
const { passportAsyncHandler } = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

exports.configureGoogle = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5000/api/v1/auth/googlecallback',
        profileFields: ['id', 'displayName', 'email'],
      },
      passportAsyncHandler(async (accessToken, refreshToken, profile, done) => {
        let user = await User.findOne({ googleId: profile.id });
        // User with same google id exist just need to login
        if (user) {
          return done(null, user);
        }
        profile.email = profile._json.email_verified
          ? profile._json.email
          : undefined;
        // Google user with no email aren't allowed to register
        if (!profile.email) {
          return done(new ErrorResponse('This accont has no email', 400));
        }

        // check if user with this email exist
        user = await User.findOne({ email: profile.email });

        if (user) {
          // User with the same email exist. If email not confirmed mark the user as INCOMPLETE.
          // if this is an ACTIVE user just attatch googleId to it.
          user.googleId = profile.id;
          if (user.status == 'PENDING') {
            user.status = 'INCOMPLETE';
          }
          await user.save({ validateBeforeSave: false });
        } else {
          // create user
          user = await User.create({
            name: profile.displayName,
            email: profile.email,
            googleId: profile.id,
            password: crypto.randomBytes(15).toString('hex'),
            status: 'INCOMPLETE',
          });
        }

        return done(null, user);
      })
    )
  );
};

exports.configureFacebook = (passport) => {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: 'http://localhost:5000/api/v1/auth/callback',
        profileFields: ['id', 'displayName', 'email'],
      },
      passportAsyncHandler(async (accessToken, refreshToken, profile, done) => {
        let user = await User.findOne({ facebookId: profile.id });
        // User with same facebook id exist just need to login
        if (user) {
          return done(null, user);
        }

        // Facebook user with no email aren't allowed to register
        if (!profile.email) {
          return done(new ErrorResponse('This accont has no email', 400));
        }

        // check if user with this email exist
        user = await User.findOne({ email: profile.email });

        if (user) {
          // User with the same email exist. If email not confirmed mark the user as INCOMPLETE.
          // if this is an ACTIVE user just attatch facebookId to it.
          user.facebookId = profile.id;
          if (user.status == 'PENDING') {
            user.status = 'INCOMPLETE';
          }
          await user.save({ validateBeforeSave: false });
        } else {
          // create user
          user = await User.create({
            name: profile.displayName,
            email: profile.email,
            facebookId: profile.id,
            password: crypto.randomBytes(15).toString('hex'),
            status: 'INCOMPLETE',
          });
        }

        return done(null, user);
      })
    )
  );
};
