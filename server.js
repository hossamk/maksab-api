const express = require('express');
const dotenv = require('dotenv');
const {CAMPAIGNS_ROUTE} = require('./constants');
// Route files
const campaigns = require('./routes/campaigns');

// Load env variables
dotenv.config({path: './config/config.env'});

const app = express();

// Mount routes
app.use(CAMPAIGNS_ROUTE, campaigns);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`));
