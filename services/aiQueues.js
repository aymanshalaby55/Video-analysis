const Queue = require("bull");
const { getSocketIO } = require("../utils/socket");
const { default: axios } = require("axios");
const path = require("path");
const fs = require("fs");

const aiProcessingQueue = new Queue("ai-processing", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

aiProcessingQueue.process(async (job) => {
  try {
    const io = getSocketIO();

    console.log(
      `Started processing job: ${job.id}, video: ${job.data.videoPath}`,
    );

    io.emit("analysisStarted", {
      jobId: job.id,
      videoPath: job.data.videoPath,
    });

    // logic to pass the videos from the queue to the ai model

    const videoPath = path.resolve(
      __dirname,
      "..",
      "public",
      "AllVideos",
      job.data.videoPath,
    );

    const { data } = await axios.post(`http://127.0.0.1:5000/detect`, {
      videoPath: "C:/Users/ahrom/Downloads/test.mp4",
    });

    console.log(data);

    job.progress(50);
    io.emit("analysisProgress", {
      jobId: job.id,
      progress: 50,
      status: `Processing video: ${job.data.videoPath}`,
    });

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
    try {
      const io = getSocketIO();
      io.emit("analysisError", { jobId: job.id, error: error.message });
    } catch (err) {
      console.error("Failed to emit error event:", err.message);
    }
    throw error;
  }
});

module.exports = aiProcessingQueue;
