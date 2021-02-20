const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const {CAMPAIGNS_ROUTE} = require('./constants');
const connectDB = require('./config/db');
// Route files
const campaigns = require('./routes/campaigns');

// Load env variables
dotenv.config({path: './config/config.env'});

// Connect to database
connectDB();

const app = express();

// middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routes
app.use(CAMPAIGNS_ROUTE, campaigns);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`));

// Handle unhandled promise exceptions
process.on('unhandledRejection', (error, promise) => {
  console.log(`Error: ${error.message}`);
  // Close server and exist process
  server.close(() => process.exit(1));
});
