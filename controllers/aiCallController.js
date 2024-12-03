/* eslint-disable no-promise-executor-return */
const fs = require("fs");
const FormData = require("form-data");
const catchAsync = require("express-async-handler");
const axios = require("axios");
const Queue = require("bull");
const socketIO = require("socket.io");

// Initialize Socket.IO
let io;
exports.initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

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
    console.log(
      `Started processing job: ${job.id}, video: ${job.data.videoPath}`,
    );
    io.emit("analysisStarted", {
      jobId: job.id,
      videoPath: job.data.videoPath,
    });

    // Simulate video processing (replace with actual AI logic)
    // await new Promise((resolve) => setTimeout(resolve, 5000)); // Simulated delay

    const { data } = await axios.post(`http://127.0.0.1:5000/detect`, {
      videoPath: "C:/Users/ahrom/Downloads/Video/test.mp4",
    });

    console.log(data);

    job.progress(50);
    io.emit("analysisProgress", {
      jobId: job.id,
      progress: 50,
      status: `Processing video: ${job.data.videoPath}`,
    });

    // Simulate completion
    const result = { videoPath: job.data.videoPath, status: "Completed" };
    console.log(
      `Completed processing job: ${job.id}, video: ${job.data.videoPath}`,
    );
    io.emit("analysisComplete", {
      jobId: job.id,
      result,
    });

    return result;
  } catch (error) {
    console.error(`Error processing job: ${job.id}`, error.message);
    io.emit("analysisError", { jobId: job.id, error: error.message });
    throw error;
  }
});

// Add videos to the queue
exports.addVideosToQueue = catchAsync(async (req, res, next) => {
  try {
    const { videos } = req.body;

    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid video array provided",
      });
    }

    for (const video of videos) {
      const job = await aiProcessingQueue.add({ videoId: video });
      console.log(`Video added to queue: ${video}, jobId: ${job.id}`);
    }

    // const queueState = await aiProcessingQueue.getJobs();
    // const jobs = queueState.filter((job) => job instanceof Queue.Job); // Filter only jobs

    // console.log("Current jobs in the queue:");
    // jobs.forEach((job) => {
    //   console.log(
    //     `Job ID: ${job.id}, Job Data: ${JSON.stringify(job.data)}, Job State: ${job._status}`,
    //   );
    // });

    res.json({
      status: "success",
      message: "Videos added to the queue",
      // jobs: jobs,
    });
  } catch (error) {
    next(error);
  }
});

// Endpoint to check job status
// exports.checkJobStatus = catchAsync(async (req, res, next) => {
//   try {
//     const { jobId } = req.params;
//     const job = await aiProcessingQueue.getJob(jobId);

//     if (!job) {
//       return res.status(404).json({
//         status: "error",
//         message: "Job not found",
//       });
//     }

//     const state = await job.getState();
//     const result = job.returnvalue;
//     const progress = await job.progress();

//     res.json({
//       status: "success",
//       data: {
//         jobId,
//         state,
//         progress,
//         result,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// });
