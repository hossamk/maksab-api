const express = require('express');
const {
  getCampaigns,
  createCampaign,
  getCampaign,
  updateCampaign,
  campaignPhotoUpload,
} = require('../controllers/campaigns');

// Include other resource routers
const entriesRouter = require('./entries');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:campaignId/entries', entriesRouter);

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
