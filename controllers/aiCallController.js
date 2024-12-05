/* eslint-disable no-promise-executor-return */
const catchAsync = require("express-async-handler");
const aiProcessingQueue = require("../services/aiQueues");
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

    await Promise.all(
      videos.map((video) =>
        aiProcessingQueue
          .add({ videoPath: video })
          .then((job) =>
            console.log(`Video added to queue: ${video}, jobId: ${job.id}`),
          ),
      ),
    );

    res.json({
      status: "success",
      message: "Videos added to the queue",
    });
  } catch (error) {
    next(error);
  }
});
