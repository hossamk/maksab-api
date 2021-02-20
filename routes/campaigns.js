const express = require('express');
const {getCampaigns} = require('../controllers/campaigns');

const router = express.Router();

router.route('/').get(getCampaigns);

module.exports = router;
