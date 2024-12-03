const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  videoPath: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  videoSize: {
    type: Number,
    required: true,
  },
  aiModel: {
    type: mongoose.Schema.ObjectId,
    ref: "aiModel",
  },
});

const Video = mongoose.model("Video", videoSchema);

module.exports = Video;
