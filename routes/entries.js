const express = require('express');
const { getEntries, createEntry } = require('../controllers/entries');

const router = express.Router({ mergeParams: true });

const { protect, authorize, authorizeStatus } = require('../middleware/auth');

router
  .route('/')
  .get(protect, authorize('ADMIN'), getEntries)
  .post(protect, authorize('USER'), authorizeStatus('ACTIVE'), createEntry);

module.exports = router;
