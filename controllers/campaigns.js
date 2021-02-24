const asyncHandler = require('../middleware/async');
const Campaign = require('../models/Campaign');
const ErrorResponse = require('../utils/errorResponse');
const path = require('path');

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
  let query = {};

  // Filter campigns based on date
  if (req.query.active === 'true') {
    query.completionDate = { $gte: Date.now() };
  } else if (req.query.active === 'false') {
    query.completionDate = { $lt: Date.now() };
  }

  // Filter campaigns based on country
  if (req.query.country) {
    query.country = req.query.country.toUpperCase();
  }

  // Pagination param
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Campaign.countDocuments(query);

  // Excute the query
  const campaigns = await Campaign.find(query)
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit);

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

// @desc    Upload photo for a campaigns
// @route   PUT /api/v1/campaigns/:id/photo
// @access  Private
exports.campaignPhotoUpload = asyncHandler(async (req, res, next) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    return next(
      new ErrorResponse(`Campaign not found with id: ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const file = req.files.file;

  // Make sure the file is an image
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check file size
  if (file.size > process.env.MAX_FILE_UPLOAD_SIZE) {
    return next(
      new ErrorResponse(
        `Please upload an image file less than ${process.env.MAX_FILE_UPLOAD_SIZE}`,
        400
      )
    );
  }

  // Create custome file name
  file.name = `photo_${campaign._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Upload file failed`, 500));
    }

    await Campaign.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({ succes: true, data: file.name });
  });
});
