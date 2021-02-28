const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileupload = require('express-fileupload');
const path = require('path');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { CAMPAIGNS_ROUTE, AUTH_ROUTE } = require('./constants');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');

// Route files
const campaigns = require('./routes/campaigns');
const auth = require('./routes/auth');

// Load env variables
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Morgan logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Fileupload
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use(CAMPAIGNS_ROUTE, campaigns);
app.use(AUTH_ROUTE, auth);

// Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
      .yellow.bold
  )
);

// Handle unhandled promise exceptions
process.on('unhandledRejection', (error, promise) => {
  console.log(`Error: ${error.message}`.red);
  // Close server and exist process
  server.close(() => process.exit(1));
});
