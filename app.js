require('dotenv').config({path: '.env'});

const express = require('express');
const mongoose = require('mongoose');

const videoRouts = require('./routers/videoRouts')
const app = express();


const PORT = process.env.PORT || 4040;

mongoose.connect(process.env.MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error('MongoDB connection error:', error));

app.use('/api/v1/video', videoRouts);

app.listen(PORT, () => {
  console.log('Server is running on ');
});
