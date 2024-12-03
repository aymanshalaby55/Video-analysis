const CatchAsync = require("express-async-handler");

const AiModel = require("../models/AiModel");

exports.getUserAllAiModels = CatchAsync(async (req, res, next) => {
  const aiModels = await AiModel.find({ isActive: true });
  res.status(200).json({
    status: "success",
    results: aiModels.length,
    data: {
      aiModels,
    },
  });
});

exports.getAdminAllAiModels = CatchAsync(async (req, res, next) => {
  const aiModels = await AiModel.find();
  res.status(200).json({
    status: "success",
    results: aiModels.length,
    data: {
      aiModels,
    },
  });
});

exports.getAiModel = CatchAsync(async (req, res, next) => {
  const { id } = req.params;
  const aiModel = await AiModel.findById(id);
  if (!aiModel) {
    return res.status(404).json({
      status: "fail",
      message: "No AI model found with that ID",
    });
  }
  res.status(200).json({
    status: "success",
    data: {
      aiModel,
    },
  });
});

exports.createAiModel = CatchAsync(async (req, res, next) => {
  const newAiModel = await AiModel.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      aiModel: newAiModel,
    },
  });
});

exports.updateAiModel = CatchAsync(async (req, res, next) => {
  const aiModel = await AiModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!aiModel) {
    return res.status(404).json({
      status: "fail",
      message: "No AI model found with that ID",
    });
  }
  res.status(200).json({
    status: "success",
    data: {
      aiModel,
    },
  });
});

exports.deleteAiModel = CatchAsync(async (req, res, next) => {
  const aiModel = await AiModel.findByIdAndDelete(req.params.id);
  if (!aiModel) {
    return res.status(404).json({
      status: "fail",
      message: "No AI model found with that ID",
    });
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
