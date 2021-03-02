const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const pathToKey = `${__dirname}/../id_rsa_priv.pem`;
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name can not be more than 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Invalid email formate',
    ],
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    match: [/^\d*$/, 'Invalid phone formate'],
    maxlength: [20, 'Invalid phone more than 20'],
    minlength: [5, 'Invalid phone less than 5 digits'],
  },
  country: {
    type: String,
    enum: ['EGYPT'],
    required: [true, 'Country is required'],
    default: 'EGYPT',
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address can not be more than 200 characters'],
  },
  birthDate: {
    type: Date,
    required: [true, 'Birth Date is required'],
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['FEMALE', 'MALE', 'OTHER'],
    default: 'OTHER',
  },
  role: {
    type: String,
    enum: ['USER'],
    default: 'USER',
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Minimum password lenth is 6'],
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

// Encrypt password using bycrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, PRIV_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  //Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
module.exports = mongoose.model('User', UserSchema);
