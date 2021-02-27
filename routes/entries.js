const express = require('express');
const { getEntries } = require('../controllers/entries');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router
  .route('/:campaignId/entries')
  .get(protect, authorize('ADMIN'), getEntries);

module.exports = router;
