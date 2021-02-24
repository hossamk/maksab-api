const express = require('express');
const {
  getCampaigns,
  createCampaign,
  getCampaign,
  updateCampaign,
  campaignPhotoUpload,
} = require('../controllers/campaigns');

const router = express.Router();

router.route('/').get(getCampaigns).post(createCampaign);
router.route('/:id').get(getCampaign).put(updateCampaign);
router.route('/:id/photo').put(campaignPhotoUpload);

module.exports = router;
