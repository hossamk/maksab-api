// @desc    Get all campaigns
// @route   GET /api/v1/campaigns
// @access  Public
exports.getCampaigns = (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Show all campaigns',
  });
};
