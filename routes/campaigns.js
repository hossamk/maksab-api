const express = require('express');
const {getCampaigns, createCampaign, getCampaign} = require('../controllers/campaigns');

const router = express.Router();

router.route('/').get(getCampaigns).post(createCampaign);
router.route('/:id').get(getCampaign);

module.exports = router;
