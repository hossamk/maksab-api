const express = require('express');
const {
  getCampaigns,
  createCampaign,
  getCampaign,
  updateCampaign,
  campaignPhotoUpload,
} = require('../controllers/campaigns');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(getCampaigns)
  .post(protect, authorize('ADMIN'), createCampaign);
router
  .route('/:id')
  .get(getCampaign)
  .put(protect, authorize('ADMIN'), updateCampaign);
router
  .route('/:id/photo')
  .put(protect, authorize('ADMIN'), campaignPhotoUpload);

module.exports = router;
