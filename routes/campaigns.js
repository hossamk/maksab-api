const express = require('express');
const {
  getCampaigns,
  createCampaign,
  getCampaign,
  updateCampaign,
  campaignPhotoUpload,
} = require('../controllers/campaigns');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/').get(getCampaigns).post(protect, createCampaign);
router.route('/:id').get(getCampaign).put(protect, updateCampaign);
router.route('/:id/photo').put(protect, campaignPhotoUpload);

module.exports = router;
