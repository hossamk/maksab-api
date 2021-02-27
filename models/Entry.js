const mongoose = require('mongoose');

const EntrySchema = mongoose.Schema({
  campaign: {
    type: mongoose.Schema.ObjectId,
    ref: 'Campaign',
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Entry', EntrySchema);
