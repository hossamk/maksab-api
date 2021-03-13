const express = require('express');
const passport = require('passport');
const { configureGoogle, configureFacebook } = require('../config/passport');
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  generateSocialLoginToken,
  sendConfrimEmail,
  confirmEmail,
} = require('../controllers/auth');

const router = express.Router();

// Pass the global passport object into the configuration function
configureGoogle(passport);
configureFacebook(passport);

const { protect } = require('../middleware/auth');

router.route('/register').post(register);
router.route('/confirmemail').post(sendConfrimEmail);
router.route('/confirmemail/:confirmtoken').get(confirmEmail);
router.route('/login').post(login);
router.route('/facebook').get(
  passport.authenticate('facebook', {
    session: false,
  })
);
router.route('/google').get(
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.route('/googlecallback').get(
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  }),
  generateSocialLoginToken
);

router.route('/facebookcallback').get(
  passport.authenticate('facebook', {
    session: false,
  }),
  generateSocialLoginToken
);

router.route('/logout').get(logout);
router.route('/me').get(protect, getMe);
router.route('/updatedetails').put(protect, updateDetails);
router.route('/updatepassword').put(protect, updatePassword);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);

module.exports = router;
