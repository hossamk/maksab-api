const express = require('express');
const { getEntries, createEntry } = require('../controllers/entries');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router
  .route('/:campaignId/entries')
  .get(protect, authorize('ADMIN'), getEntries)
  .post(protect, authorize('USER'), createEntry);

module.exports = router;
