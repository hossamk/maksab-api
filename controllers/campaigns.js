const Campaign = require('../models/Campaign');

// @desc    Create a campaign
// @route   POST /api/v1/campaigns
// @access  Public TODO: change access
exports.createCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.create(req.body);

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch {
    res.status(400).json({
      success: false,
    });
  }
};

// @desc    Get all campaigns
// @route   GET /api/v1/campaigns
// @access  Public
exports.getCampaigns = async (req, res, next) => {
  try {
    const campaigns = await Campaign.find();

    res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch {
    res.status(400).json({
      success: false,
    });
  }
};

// @desc    Get a campaign by id
// @route   GET /api/v1/campaign/:id
// @access  Public
exports.getCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({success: false});
    }

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch {
    res.status(400).json({
      success: false,
    });
  }
};
