const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Load models
const Campaign = require('./models/Campaign');
const User = require('./models/User');
const Entry = require('./models/Entry');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// Read json file
const campaigns = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/campaigns.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8')
);
const entries = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/entries.json`, 'utf-8')
);

// Import into DB
const importData = async () => {
  try {
    await Campaign.create(campaigns);
    await User.create(users);
    await Entry.create(entries);

    console.log('Data imported...'.green.inverse);
  } catch (err) {
    console.error(err);
  }
};

// Delete Data
const deleteData = async () => {
  try {
    await Campaign.deleteMany();
    await User.deleteMany();
    await Entry.deleteMany();

    console.log('Data Destroyed...'.red.inverse);
  } catch (err) {
    console.error(err);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
