const GoogleTokenStrategy = require('passport-google-token').Strategy;
const FacebookTokenStrategy = require('passport-facebook-token');
const User = require('../models/User');
const crypto = require('crypto');
const { passportAsyncHandler } = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

exports.configureGoogle = (passport) => {
  passport.use(
    new GoogleTokenStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        profileFields: ['id', 'displayName', 'email'],
      },
      passportAsyncHandler(async (accessToken, refreshToken, profile, done) => {
        let user = await User.findOne({ googleId: profile._json.id });
        // User with same google id exist just need to login
        if (user) {
          return done(null, user);
        }

        // Google user with no email just create an account
        if (!profile._json.verified_email || !profile._json.email) {
          // create user
          user = await User.create({
            name: profile._json.name,
            googleId: profile._json.id,
            password: crypto.randomBytes(15).toString('hex'),
            status: 'INCOMPLETE',
          });
          user.password = undefined;
          return done(null, user);
        }

        // check if user with this email exist
        user = await User.findOne({ email: profile._json.email });

        if (user) {
          // User with the same email exist. If email not confirmed mark the user as INCOMPLETE.
          // if this is an ACTIVE user just attatch googleId to it.
          user.googleId = profile._json.id;
          if (user.status == 'PENDING') {
            user.status = 'INCOMPLETE';
          }
          await user.save({ validateBeforeSave: false });
        } else {
          // create user
          user = await User.create({
            name: profile._json.name,
            email: profile._json.email,
            googleId: profile._json.id,
            password: crypto.randomBytes(15).toString('hex'),
            status: 'INCOMPLETE',
          });
          user.password = undefined;
        }

        return done(null, user);
      })
    )
  );
};

exports.configureFacebook = (passport) => {
  passport.use(
    new FacebookTokenStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        profileFields: ['id', 'displayName', 'email'],
      },
      passportAsyncHandler(async (accessToken, refreshToken, profile, done) => {
        let user = await User.findOne({ facebookId: profile._json.id });
        // User with same facebook id exist just need to login
        if (user) {
          return done(null, user);
        }
        // Facebook user with no email, just create account
        if (!profile._json.email) {
          // create user
          user = await User.create({
            name: profile._json.name,
            facebookId: profile._json.id,
            password: crypto.randomBytes(15).toString('hex'),
            status: 'INCOMPLETE',
          });
          user.password = undefined;
          return done(null, user);
        }

        // check if user with this email exist
        user = await User.findOne({ email: profile._json.email });

        if (user) {
          // User with the same email exist. If email not confirmed mark the user as INCOMPLETE.
          // if this is an ACTIVE user just attatch facebookId to it.
          user.facebookId = profile._json.id;
          if (user.status == 'PENDING') {
            user.status = 'INCOMPLETE';
          }
          await user.save({ validateBeforeSave: false });
        } else {
          // create user
          user = await User.create({
            name: profile._json.name,
            email: profile._json.email,
            facebookId: profile._json.id,
            password: crypto.randomBytes(15).toString('hex'),
            status: 'INCOMPLETE',
          });
          user.password = undefined;
        }

        return done(null, user);
      })
    )
  );
};
