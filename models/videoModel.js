const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  videoPath: {
    type: String,
    required: true,
  },
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;
