const asyncHandler = require('../middleware/async');
const Campaign = require('../models/Campaign');
const ErrorResponse = require('../utils/errorResponse');
const Entry = require('../models/Entry');

// @desc    Get Entries for a campaign
// @route   GET /api/v1/campaigns/:campaignId/entries
// @access  private
exports.getEntries = asyncHandler(async (req, res, next) => {
  const query = { campaign: req.params.campaignId };
  // Pagination param
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Campaign.countDocuments(query);

  // Excute the query
  const entries = await Entry.find(query).skip(startIndex).limit(limit);

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    pagination,
    data: entries,
  });
});
