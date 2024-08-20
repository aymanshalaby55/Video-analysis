const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Video = require('./models/videoModel');

dotenv.config({ path: './.env' });

const DB = process.env.MONGO_URL;

mongoose
  .connect(DB, {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Video.deleteMany();
    // await user.deleteMany();
    // await review.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
