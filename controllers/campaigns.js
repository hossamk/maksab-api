const asyncHandler = require('../middleware/async');
const Campaign = require('../models/Campaign');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a campaign
// @route   POST /api/v1/campaigns
// @access  Public TODO: change access
exports.createCampaign = asyncHandler(async (req, res, next) => {
  const campaign = await Campaign.create(req.body);

  res.status(201).json({
    success: true,
    data: campaign,
  });
});

// @desc    Get all campaigns
// @route   GET /api/v1/campaigns
// @access  Public
exports.getCampaigns = asyncHandler(async (req, res, next) => {
  const campaigns = await Campaign.find();

  res.status(200).json({
    success: true,
    data: campaigns,
  });
});

// @desc    Get a campaign by id
// @route   GET /api/v1/campaigns/:id
// @access  Public
exports.getCampaign = asyncHandler(async (req, res, next) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    return next(
      new ErrorResponse(`Campaign not found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: campaign,
  });
});

// @desc    Update a campaign with id
// @route   PUT /api/v1/campaigns/:id
// @access  Public
exports.updateCampaign = asyncHandler(async (req, res, next) => {
  const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidator: true,
  });

  if (!campaign) {
    return next(
      new ErrorResponse(`Campaign not found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ succes: true, data: campaign });
});
