const fs = require("fs");
const FormData = require("form-data");
const catchAsync = require("express-async-handler");
const axios = require("axios");
const Queue = require("bull");
const socketIO = require("socket.io");

const AiModel = require("../models/AiModel");

let io;

// Initialize Socket.IO
exports.initializeSocket = (server) => {
  io = socketIO(server);
  return io;
};

// Create processing queue
const aiProcessingQueue = new Queue("ai-processing", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

// Process jobs in the queue
aiProcessingQueue.process(async (job) => {
  try {
    // Emit job started event
    io.emit("analysisStarted", { jobId: job.id });

    // const response = await axios.post("http://ai-models:6000/detect", job.data);
    let response;
    // Emit progress events during processing
    job.progress(50);
    io.emit("analysisProgress", {
      jobId: job.id,
      progress: 50,
      status: "Processing video...",
    });

    // Emit completion event
    io.emit("analysisComplete", {
      jobId: job.id,
      result: response.data,
    });

    return response.data;
  } catch (error) {
    // Emit error event
    io.emit("analysisError", {
      jobId: job.id,
      error: error.message,
    });
    throw error;
  }
});

exports.analyzeVideo = catchAsync(async (req, res, next) => {
  try {
    // Add job to queue
    const job = await aiProcessingQueue.add({
      // Add job data here when uncommented
      // modelId: req.params.modelId,
      // videoPath: req.body.videoPath
    });

    // Set up job event handlers
    job.on("progress", (progress) => {
      io.emit("analysisProgress", {
        jobId: job.id,
        progress,
        status: "Processing...",
      });
    });

    // Return job ID for status checking
    res.json({
      status: "success",
      message: "Video analysis job queued",
      jobId: job.id,
    });
  } catch (error) {
    next(error);
  }
});

// Add endpoint to check job status
exports.checkJobStatus = catchAsync(async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await aiProcessingQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        status: "error",
        message: "Job not found",
      });
    }

    const state = await job.getState();
    const result = job.returnvalue;
    const progress = await job.progress();

    res.json({
      status: "success",
      data: {
        jobId,
        state,
        progress,
        result,
      },
    });
  } catch (error) {
    next(error);
  }
});
