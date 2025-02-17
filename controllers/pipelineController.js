const Pipeline = require("../models/PipleModel");

async function getAllPipelines(req, res) {
  try {
    const pipelines = await Pipeline.find();
    const { user } = req;
    res.status(200).json({ pipelines, user: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createPipeline(req, res) {
  try {
    const { user } = req;
    const userId = user._id;
    const pipeline = await Pipeline.create({ ...req.body, user: userId });
    res.status(201).json(pipeline);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getPipeline(req, res) {
  try {
    const pipeline = await Pipeline.findById(req.params.id);
    if (!pipeline) {
      res.status(404).json({ message: "Pipeline not found" });
    } else {
      res.status(200).json(pipeline);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updatePipeline(req, res) {
  try {
    const pipeline = await Pipeline.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!pipeline) {
      res.status(404).json({ message: "Pipeline not found" });
    } else {
      res.status(200).json(pipeline);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deletePipeline(req, res) {
  try {
    await Pipeline.findByIdAndDelete(req.params.id);
    res.status(204).json({ message: "Pipeline deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getAllPipelines,
  createPipeline,
  getPipeline,
  updatePipeline,
  deletePipeline,
};
