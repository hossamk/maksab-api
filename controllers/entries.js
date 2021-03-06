const { asyncHandler } = require('../middleware/async');
const Campaign = require('../models/Campaign');
const ErrorResponse = require('../utils/errorResponse');
const Entry = require('../models/Entry');

// @desc    Get Entries for a campaign
// @route   GET /api/v1/campaigns/:campaignId/entries
// @access  private
exports.getEntries = asyncHandler(async (req, res, next) => {
  const campaign = await Campaign.findById(req.params.campaignId);

  // Check if campaign exist
  if (!campaign) {
    return next(
      new ErrorResponse(
        `Campaign not found with id: ${req.params.campaignId}`,
        404
      )
    );
  }
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

// @desc    Add Entry for a campaign
// @route   POST /api/v1/campaigns/:campaignId/entries
// @access  private
exports.createEntry = asyncHandler(async (req, res, next) => {
  const campaign = await Campaign.findById(req.params.campaignId);

  // Check if campaign exist
  if (!campaign) {
    return next(
      new ErrorResponse(
        `Campaign not found with id: ${req.params.campaignId}`,
        404
      )
    );
  }

  // Check if campaign is not expired
  if (campaign.completionDate <= Date.now()) {
    return next(
      new ErrorResponse(
        `Campaign with id ${req.params.campaignId} has expired`,
        404
      )
    );
  }

  //Check if user hasn't create an entry before
  const existingEntry = await Entry.findOne({
    campaign: req.params.campaignId,
    user: req.user.id,
  });

  if (existingEntry) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} already has entry for campaign ${req.params.campaignId}`,
        400
      )
    );
  }

  const entry = await Entry.create({
    campaign: req.params.campaignId,
    user: req.user.id,
  });

  res.status(201).json({
    success: true,
    data: entry,
  });
});
