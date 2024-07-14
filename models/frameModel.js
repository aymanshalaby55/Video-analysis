const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the first frame of a video
const frameSchema = new Schema({
  video: {
    type: Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  framePath: {
    type: String,
    required: true
  }
});

const Frame = mongoose.model('Frame', frameSchema);

module.exports = Frame;
