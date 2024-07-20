const mongoose = require("mongoose");
const validate = require("validator");

const AiSchema = new mongoose.Schema({
  modelName: {
    type: String,
    required: true,
    trim: true,
  },
  modelUrl: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  UsingNumber: {
    type: Number,
    default: 0,
  },
  version: {
    type: String,
    trim: true,
  },
  accuracy: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
    trim: true,
  },
});

const AiModel = mongoose.model("AiModels", AiSchema);

module.exports = AiModel;
