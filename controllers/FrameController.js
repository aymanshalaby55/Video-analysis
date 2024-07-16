const fs = require("fs");
const path = require("path");
const CatchAsync = require("express-async-handler");

const Frame = require("../models/frameModel");
const APIFeatures = require("../utils/apiFeatures");

exports.getAllFrames = CatchAsync(async (req, res, next) => {
  const imagesDir = `./public/Frames`; // Replace with the actual path to your images directory
  const allFrames = await Frame.find().populate("video");
  console.log(allFrames);

  const imageFiles = allFrames.map((frame) => frame.framePath);

  const validExtensions = [".jpg", ".jpeg", ".png", ".gif"];
  const validImageFiles = imageFiles.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return validExtensions.includes(ext);
  });
  console.log(imageFiles);

  const images = await Promise.all(
    validImageFiles.map(async (file) => {
      const filePath = path.join(imagesDir, file);
      const fileData = await fs.promises.readFile(filePath, "base64");
      return {
        name: file,
        data: `data:image/${path.extname(file).slice(1)};base64,${fileData}`,
      };
    }),
  );
  console.log(images);
  res.json(images);
});

exports.getFrame = CatchAsync(async (req, res, next) => {
  const frame = await Frame.findById(req.params.id);
  if (!frame) {
    return res.status(404).json({
      status: "fail",
      message: "No frame found with that ID",
    });
  }
  res.status(200).json({
    status: "success",
    data: {
      frame,
    },
  });
});

exports.deleteFrame = CatchAsync(async (req, res, next) => {
  const frame = await Frame.findByIdAndDelete(req.params.id);
  if (!frame) {
    return res.status(404).json({
      status: "fail",
      message: "No frame found with that ID",
    });
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
