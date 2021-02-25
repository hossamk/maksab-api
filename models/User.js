const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  restPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bycrypt
UserSchema.pre('save', async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);
