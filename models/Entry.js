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

// Prevent user from having multiple entry for the same campaign
EntrySchema.index({ campaign: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Entry', EntrySchema);
