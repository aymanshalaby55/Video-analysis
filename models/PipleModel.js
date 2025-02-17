const mongoose = require("mongoose");

const pipelineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "pipeline must have a username"],
  },
  flowData: {
    type: String,
    required: [true, "schem is required"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

const Pipeline = mongoose.model("Pipeline", pipelineSchema);

module.exports = Pipeline;
