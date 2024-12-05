const axios = require("axios");
const Queue = require("bull");
const { createServer } = require("http");

const { io } = require("../utils/socket");

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

    // Get the io instance from the socket initialization

    io.emit("analysisStarted", {
      jobId: job.id,
      videoPath: job.data.videoPath,
    });

    job.progress(50);
    io.emit("analysisProgress", {
      jobId: job.id,
      progress: 50,
      status: `Processing video: ${job.data.videoPath}`,
    });

    // Return results
    const result = {
      videoPath: job.data.videoPath,
      status: "Completed",
    };
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

module.exports = aiProcessingQueue;
