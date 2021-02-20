const mongoose = require('mongoose');

const CampaignSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [50, 'Title can not be more than 50 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Title can not be more than 500 characters'],
  },
  numberOfWinners: {
    type: Number,
    required: [true, 'Number of winners is required'],
    min: [1, 'Minimum number of winner is 1'],
  },
  photo: {
    type: String,
    default: 'no-photo.jpg',
  },
  completionDate: {
    type: Date,
    required: [true, 'Completion date is required.'],
  },
  createdAt: {
    type: Date,
    defaults: Date.now,
  },
  slug: String,
});

module.exports = mongoose.model('Campaign', CampaignSchema);
